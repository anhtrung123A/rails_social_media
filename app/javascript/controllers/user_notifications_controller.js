import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// ===== SINGLETON CHANNEL MANAGER =====
class UserNotificationsChannelManager {
  constructor() {
    if (UserNotificationsChannelManager.instance) {
      return UserNotificationsChannelManager.instance;
    }

    this.consumer = null;
    this.channels = new Map(); // user_id => channel
    UserNotificationsChannelManager.instance = this;
    return this;
  }

  static getInstance() {
    if (!UserNotificationsChannelManager.instance) {
      UserNotificationsChannelManager.instance = new UserNotificationsChannelManager();
    }
    return UserNotificationsChannelManager.instance;
  }

  getConsumer() {
    if (!this.consumer) {
      this.consumer = createConsumer();
    }
    return this.consumer;
  }

  subscribe(userId, callbacks) {
    const key = `user_notifications_${userId}`;
    if (this.channels.has(key)) {
      return this.channels.get(key);
    }

    const channel = this.getConsumer().subscriptions.create(
      { channel: "UserMessagesChannel", user_id: userId },
      callbacks
    );

    this.channels.set(key, channel);
    return channel;
  }

  unsubscribe(userId) {
    const key = `user_notifications_${userId}`;
    if (this.channels.has(key)) {
      this.channels.get(key).unsubscribe();
      this.channels.delete(key);
    }
  }

  isSubscribed(userId) {
    return this.channels.has(`user_notifications_${userId}`);
  }
}

// ===== STIMULUS CONTROLLER =====
export default class extends Controller {
  static values = { 
    userId: Number 
  }

  connect() {
    if (!this.userIdValue) return;

    this.channelManager = UserNotificationsChannelManager.getInstance();

    // Avoid duplicate subscriptions
    if (this.channelManager.isSubscribed(this.userIdValue)) {
      console.log("Already subscribed to user notifications for user:", this.userIdValue);
      return;
    }

    this.channel = this.channelManager.subscribe(
      this.userIdValue,
      {
        connected: () => console.log("Connected to user messages channel"),
        disconnected: () => console.log("Disconnected from user messages channel"),
        received: (data) => {
          console.log("Received user message notification:", data);
          
          // Ensure counter element exists
          if (!document.getElementById("unread_messages_count")) {
            this.createUnreadCounter();
          }

          this.handleNewMessageNotification(data);
          this.updateUnreadCount();
        }
      }
    );
  }

  disconnect() {
    // Do NOT unsubscribe here — let the singleton manage lifecycle
    // (unless you want per-controller unsubscription, which breaks singleton)
  }

  createUnreadCounter() {
    const container = document.getElementById("unread_message_notifications_container");
    if (!container) return;

    const counter = document.createElement("span");
    counter.id = "unread_messages_count";
    counter.className = "absolute right-0 block h-[12px] w-[12px] font-bold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 ring-2 ring-white bottom-[3rem] text-white text-[9px] flex justify-center items-center";
    container.appendChild(counter);
  }

  handleNewMessageNotification(data) {
    // Optional: Increment locally for instant feedback (before API response)
    const badge = document.getElementById("unread_messages_count");
    if (badge) {
      const currentCount = parseInt(badge.textContent) || 0;
      badge.textContent = currentCount + 1;
      badge.classList.remove("hidden");
    }

    // Show browser notification
    if (Notification.permission === "granted") {
      new Notification("New Message", {
        body: `${data.sender_name}: ${data.message_preview}`,
      });
    }
  }

  async updateUnreadCount() {
    try {
      const response = await fetch('/notifications/get_number_of_unread_messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const counter = document.getElementById("unread_messages_count");
      if (counter) {
        counter.textContent = data.number_of_unread_messages;
        counter.classList.toggle("hidden", data.number_of_unread_messages === 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }
}