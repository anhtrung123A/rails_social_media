import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// Simple ChannelManager (no need for complex singleton unless scaling)
class ChannelManager {
  static instance = null

  static getInstance() {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager()
    }
    return ChannelManager.instance
  }

  constructor() {
    this.consumer = null
    this.channels = new Map()
  }

  getConsumer() {
    if (!this.consumer) {
      this.consumer = createConsumer()
    }
    return this.consumer
  }

  subscribe(userId, callbacks) {
    const key = `notifications_${userId}`
    if (this.channels.has(key)) return this.channels.get(key)

    const channel = this.getConsumer().subscriptions.create(
      { channel: "NotificationsChannel", user_id: userId },
      callbacks
    )

    this.channels.set(key, channel)
    return channel
  }

  unsubscribe(userId) {
    const key = `notifications_${userId}`
    if (this.channels.has(key)) {
      this.channels.get(key).unsubscribe()
      this.channels.delete(key)
    }
  }
}

export default class extends Controller {
  static values = { 
    userId: Number,
    action: String,
    subjectId: Number,
    directObjectId: Number,
    indirectObjectId: Number  // Add current user ID as a value
  }

  connect() {
    if (!this.userIdValue) return

    this.channel = ChannelManager.getInstance().subscribe(
      this.userIdValue,
      {
        connected: () => console.log("🔔 Notifications connected"),
        disconnected: () => console.log("🔕 Notifications disconnected"),
        received: (data) => this.showNotification(data)
      }
    )
  }

  disconnect() {
    if (this.userIdValue) {
      ChannelManager.getInstance().unsubscribe(this.userIdValue)
    }
  }

  showNotification(data) {
    // Example: show browser notification or update UI
    console.log("New notification:", data)

    // Optional: Update a badge counter
    const badge = document.querySelector("[data-notification-badge]")
    if (badge) {
      const count = parseInt(badge.textContent) || 0
      badge.textContent = count + 1
      badge.classList.remove("hidden")
    }

    // Optional: Show toast
    // You can integrate with a toast library here
  }

  // Handle message form submission
  sendNotification(event) {
  
    console.log("Action:", this.actionValue)
    console.log(this.subjectIdValue)
    console.log(this.directObjectIdValue)
    console.log(this.indirectObjectIdValue)
    // if (this.channel) {
    //   this.channel.perform('speak', {
    //     action: this.actionValue || "test",
    //     direct_object_id: "1",
    //     indirect_object_id: "1",
    //     subject_id: this.currentUserIdValue
    //   })
    // }
    // console.log(this.channel)
  }

  getCurrentUserId() {
    // You can remove this method and use the static value instead
    return this.currentUserIdValue
  }
}