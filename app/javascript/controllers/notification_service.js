import { createConsumer } from "@rails/actioncable"

class NotificationService {
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

  sendNotification(targetUserId, data) {
    const notificationChannel = this.getConsumer().subscriptions.create(
      { channel: "NotificationsChannel", user_id: targetUserId },
      {
        connected: () => console.log("Connected to notification channel for sending"),
        disconnected: () => console.log("Disconnected from notification channel")
      }
    )
    
    notificationChannel.perform('speak', data)
    
    // Clean up after sending
    setTimeout(() => {
      notificationChannel.unsubscribe()
    }, 100)
  }
}

// Create a singleton instance
window.NotificationService = window.NotificationService || new NotificationService()
export default window.NotificationService