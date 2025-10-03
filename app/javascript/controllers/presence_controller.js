// app/javascript/controllers/presence_controller.js
import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

class PresenceChannelManager {
  constructor() {
    if (PresenceChannelManager.instance) return PresenceChannelManager.instance;
    this.consumer = null;
    this.channel = null;
    PresenceChannelManager.instance = this;
  }

  static getInstance() {
    if (!PresenceChannelManager.instance) {
      PresenceChannelManager.instance = new PresenceChannelManager();
    }
    return PresenceChannelManager.instance;
  }

  subscribe(callbacks) {
    if (this.channel) return this.channel;

    this.consumer = createConsumer();
    this.channel = this.consumer.subscriptions.create("PresenceChannel", {
      connected: () => console.log("✅ Connected to global presence channel"),
      disconnected: () => console.log("⚠️ Disconnected from presence channel"),
      received: (data) => {
        if (callbacks?.received) callbacks.received(data);
      }
    });
    return this.channel;
  }

  unsubscribe() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}

export default class extends Controller {
  static values = { userId: Number }

  connect() {
    const manager = PresenceChannelManager.getInstance();
    this.channel = manager.subscribe({
      received: (data) => this.handlePresenceUpdate(data)
    });
  }

  handlePresenceUpdate(data) {
    console.log(data)
    // Only handle updates for the user this controller watches
    if (data.user_id == this.userIdValue) return;

    const element = document.getElementById(`activity_status_${data.user_id}`);
    if (!element) return;

    if (data.status === "online") {
      element.innerHTML = '<span class="h-2 w-2 bg-green-500 rounded-full"></span>';
    } else {
      const lastSeenText = this.formatLastSeen(data.last_seen);
      element.innerHTML = `
        <span class="text-[8px] font-bold text-green-500 px-[3px] py-[2px] rounded-full whitespace-nowrap bg-gray-100">
          ${lastSeenText}
        </span>
      `;
    }
  }

  formatLastSeen(lastSeenStr) {
    if (!lastSeenStr) return "Recently";
    const diffInSeconds = Math.floor(((new Date()) - (new Date(lastSeenStr))) / 1000);
    console.log(diffInSeconds)
    if (diffInSeconds < 60) return "Less than a minute";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  }
}