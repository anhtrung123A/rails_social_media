// app/javascript/controllers/user_notifications_controller.js
import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  static values = { 
    userId: Number 
  }

  connect() {
    if (!this.userIdValue) return

    this.consumer = createConsumer()
    
    this.channel = this.consumer.subscriptions.create(
      { 
        channel: "UserMessagesChannel", 
        user_id: this.userIdValue 
      },
      {
        connected: () => console.log("Connected to user messages channel"),
        disconnected: () => console.log("Disconnected from user messages channel"),
        received: (data) => {
            console.log(123456)
            if (document.getElementById("unread_messages_count") == null)
            {
                const counter = document.createElement("span")
                counter.id = "unread_messages_count"
                counter.className = "absolute right-0 block h-[12px] w-[12px] font-bold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 ring-2 ring-white bottom-[3rem] text-white text-[9px] flex justify-center items-center"
                document.getElementById("unread_message_notifications_container").appendChild(counter)
            }
            this.handleNewMessageNotification(data)
            this.updateUnreadCount()
        }
      }
    )

    // Optionally call updateUnreadCount on connect to get initial count
    // this.updateUnreadCount()
  }

  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe()
    }
  }

  handleNewMessageNotification(data) {
    // Update unread count badge
    const badge = document.querySelector("[data-unread-messages-badge]")
    if (badge) {
      const currentCount = parseInt(badge.textContent) || 0
      badge.textContent = currentCount + 1
      badge.classList.remove("hidden")
    }

    // Optional: Show browser notification
    if (Notification.permission === "granted") {
      new Notification("New Message", {
        body: `${data.sender_name}: ${data.message_preview}`,
      })
    }

    // Optional: Play sound
    // const audio = new Audio("/message-sound.mp3")
    // audio.play().catch(e => console.log("Audio play failed:", e))
  }

  async updateUnreadCount() {
    try {
      console.log(111111)
      const response = await fetch('/notifications/get_number_of_unread_messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // Rails often expects this
          // Add CSRF token if needed
          // 'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        },
        credentials: 'same-origin' // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Unread message count:", data.number_of_unread_messages);
      document.getElementById("unread_messages_count").innerText = data.number_of_unread_messages
      // Update the badge with the new count

    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      // Fallback: If the API call fails, increment the current count by 1
      // This is already handled in handleNotification, so we don't need to do it again here
    }
  }
}