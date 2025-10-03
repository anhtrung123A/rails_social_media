import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// ===== SINGLETON CHANNEL MANAGER FOR ACTIVITY STATUS =====
class ActivityStatusChannelManager {
  constructor() {
    if (ActivityStatusChannelManager.instance) {
      return ActivityStatusChannelManager.instance;
    }

    this.consumer = null;
    this.channels = new Map(); // user_id => channel
    this.heartbeatIntervals = new Map(); // user_id => intervalId
    ActivityStatusChannelManager.instance = this;
    return this;
  }

  static getInstance() {
    if (!ActivityStatusChannelManager.instance) {
      ActivityStatusChannelManager.instance = new ActivityStatusChannelManager();
    }
    return ActivityStatusChannelManager.instance;
  }

  getConsumer() {
    if (!this.consumer) {
      this.consumer = createConsumer();
    }
    return this.consumer;
  }

  subscribe(userId, callbacks) {
    const key = `user_activity_status_${userId}`;
    if (this.channels.has(key)) {
      return this.channels.get(key);
    }

    const channel = this.getConsumer().subscriptions.create(
      { channel: "ActivityStatusChannel", user_id: userId },
      {
        connected: () => {
          console.log(`✅ ActivityStatusChannel connected for user ${userId}`);
          this.startHeartbeat(userId, channel);
          if (callbacks.connected) callbacks.connected();
        },
        disconnected: () => {
          console.log(`⚠️ ActivityStatusChannel disconnected for user ${userId}`);
          this.stopHeartbeat(userId);
          if (callbacks.disconnected) callbacks.disconnected();
        },
        rejected: () => {
          console.error(`❌ ActivityStatusChannel rejected for user ${userId}`);
          this.stopHeartbeat(userId);
          this.channels.delete(key);
          if (callbacks.rejected) callbacks.rejected();
        },
        received: (data) => {
          if (callbacks.received) callbacks.received(data);
        }
      }
    );

    this.channels.set(key, channel);
    return channel;
  }

  startHeartbeat(userId, channel) {
    // Clear any existing interval for this user
    this.stopHeartbeat(userId);

    // Send heartbeat every 60 seconds
    const intervalId = setInterval(() => {
      if (channel && typeof channel.perform === 'function') {
        channel.perform('heartbeat', {
          user_id: userId,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        });
      }
    }, 60_000);

    this.heartbeatIntervals.set(userId, intervalId);
  }

  stopHeartbeat(userId) {
    const intervalId = this.heartbeatIntervals.get(userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.heartbeatIntervals.delete(userId);
    }
  }

  unsubscribe(userId) {
    const key = `user_activity_status_${userId}`;
    if (this.channels.has(key)) {
      this.stopHeartbeat(userId);
      this.channels.get(key).unsubscribe();
      this.channels.delete(key);
    }
  }

  isSubscribed(userId) {
    return this.channels.has(`user_activity_status_${userId}`);
  }

  unsubscribeAll() {
    for (const userId of this.channels.keys()) {
      this.unsubscribe(userId);
    }
    if (this.consumer) {
      this.consumer.disconnect();
      this.consumer = null;
    }
  }
}

// ===== STIMULUS CONTROLLER =====
export default class extends Controller {
  static values = { 
    userId: Number 
  }

  connect() {
    if (!this.userIdValue) {
      console.warn("ActivityStatusController: No userId provided");
      return;
    }

    this.channelManager = ActivityStatusChannelManager.getInstance();

    if (this.channelManager.isSubscribed(this.userIdValue)) {
      console.log("Already subscribed to activity status for user:", this.userIdValue);
      return;
    }

    this.channel = this.channelManager.subscribe(
      this.userIdValue,
      {
        connected: () => {
          console.log("Connected to user activity status channel");
        },
        disconnected: () => {
          console.log("Disconnected from user activity status channel");
        },
        received: (data) => {
          console.log("Received activity status:", data);
          this.handleActivityUpdate(data);
        }
      }
    );
  }

  disconnect() {
    // Do NOT unsubscribe here — singleton manages lifecycle
    // This allows multiple controller instances to share one connection
  }

  handleActivityUpdate(data) {
    // Example: Update online status indicator in UI
    const statusElements = document.querySelectorAll(`[data-user-status="${data.user_id}"]`);
    statusElements.forEach(el => {
      el.textContent = data.status; // e.g., "online", "away"
      el.className = data.status === "online" 
        ? "text-green-500 font-semibold" 
        : "text-gray-400";
    });
  }

  // Call this method when user logs out (e.g., from a logout button stimulus action)
  logout() {
    if (this.userIdValue) {
      this.channelManager.unsubscribe(this.userIdValue);
    }
  }
}
