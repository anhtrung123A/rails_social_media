// app/javascript/controllers/conversation_controller.js
import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// Global singleton to maintain single connection per session
class ChannelManager {
  constructor() {
    this.consumer = null;
    this.channels = new Map();
  }

  getConsumer() {
    if (!this.consumer) {
      this.consumer = createConsumer();
    }
    return this.consumer;
  }

  subscribe(conversationId, callbacks) {
    const key = `conversation_${conversationId}`;
    
    // If already subscribed to this conversation, return existing channel
    if (this.channels.has(key)) {
      return this.channels.get(key);
    }

    const channel = this.getConsumer().subscriptions.create(
      { 
        channel: "MessagesChannel",
        conversation_id: conversationId
      },
      callbacks
    );

    this.channels.set(key, channel);
    
    // Clean up when channel is unsubscribed
    const originalUnsubscribe = channel.unsubscribe;
    channel.unsubscribe = () => {
      this.channels.delete(key);
      return originalUnsubscribe.call(channel);
    };

    return channel;
  }

  disconnect() {
    if (this.channels.size > 0) {
      for (const [key, channel] of this.channels) {
        channel.unsubscribe();
      }
      this.channels.clear();
    }
    if (this.consumer) {
      this.consumer.disconnect();
      this.consumer = null;
    }
  }
}

const channelManager = new ChannelManager();

export default class extends Controller {
  static targets = [
    "messagesContainer", 
    "messageForm", 
    "messageInput", 
    "sendButton"
  ]
  
  static values = { 
    conversationId: Number 
  }

  connect() {
    if (!this.hasMessagesContainerTarget) {
      console.error("Messages container target not found for conversation controller")
      return
    }
    
    // Subscribe to the conversation channel
    this.channel = channelManager.subscribe(
      this.conversationIdValue,
      {
        connected: () => {
          console.log("Connected to messages channel for conversation", this.conversationIdValue)
        },

        disconnected: () => {
          console.log("Disconnected from messages channel")
        },

        received: (data) => {
          this.handleReceivedMessage(data)
        }
      }
    )
    
    // Auto-scroll to bottom when controller connects
    this.scrollToBottom()
    
    // Prevent the form from actually submitting via HTTP
    this.messageFormTarget.addEventListener('submit', (event) => {
      event.preventDefault()
    })
  }

  disconnect() {
    // Only unsubscribe this specific channel, don't disconnect the entire consumer
    if (this.channel) {
      this.channel.unsubscribe();
    }
  }
  // Handle message form submission
  sendMessage(event) {
    event.preventDefault()
    
    const content = this.messageInputTarget.value.trim()
    if (!content) return

    // Disable send button during submission
    this.sendButtonTarget.disabled = true
    this.sendButtonTarget.classList.add("opacity-50", "cursor-not-allowed")

    // Send message via ActionCable perform method
    if (this.channel) {
      this.channel.perform('speak', {
        message: content,
        conversation_id: this.conversationIdValue
      })
    }

    // Clear the input field immediately
    this.messageInputTarget.value = ""
    // Re-enable send button after a short delay to ensure message is sent
    setTimeout(() => {
      this.sendButtonTarget.disabled = false
      this.sendButtonTarget.classList.remove("opacity-50", "cursor-not-allowed")
      this.messageInputTarget.focus()
    }, 150)
  }

  // Handle messages received from ActionCable
  handleReceivedMessage(data) {
    if (data.message && data.sender && data.id) {
      // Create message element using the same format as your original view
      const messageElement = document.createElement('div')
      messageElement.className = `mb-4 ${data.sender === this.getCurrentUserName() ? 'text-right' : 'text-left'}`
      messageElement.id = `message_${data.id}`
      
      messageElement.innerHTML = `
        <div class="flex ${data.sender === this.getCurrentUserName() ? 'justify-end' : 'justify-start'}">
          ${data.sender !== this.getCurrentUserName() ? 
            `<img src="${this.getAvatarSrc()}" class="h-6 w-6 rounded-full mt-1 mr-2" alt="Avatar">` : 
            ''}
          
          <div class="${data.sender === this.getCurrentUserName() ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-900'} 
                     rounded-2xl px-4 py-2 max-w-xs lg:max-w-md inline-block">
            <p class="text-sm">${data.message}</p>
            <p class="text-xs opacity-70 mt-1 ${data.sender === this.getCurrentUserName() ? 'text-right text-white' : 'text-gray-500'}">
              ${data.created_at}
            </p>
          </div>
          
          ${data.sender === this.getCurrentUserName() ? 
            `<img src="${this.getAvatarSrc()}" class="h-6 w-6 rounded-full mt-1 ml-2" alt="Avatar">` : 
            ''}
        </div>
      `
      
      this.messagesContainerTarget.appendChild(messageElement)
      
      // Scroll to bottom with a small delay to ensure DOM is updated
      this.scrollToBottom()
    }
  }

  // Helper method to get current user's name
  getCurrentUserName() {
    return document.querySelector('[data-current-user-name]')?.dataset.currentUserName || 'You'
  }

  // Helper method to get avatar source
  getAvatarSrc() {
    return document.querySelector('[data-current-user-avatar]')?.dataset.currentUserAvatar || '/default-avatar.png'
  }

  // Improved scroll to bottom logic
  scrollToBottom() {
    // Use requestAnimationFrame to ensure DOM is fully updated before scrolling
    requestAnimationFrame(() => {
      if (this.hasMessagesContainerTarget) {
        const container = this.messagesContainerTarget
        // Scroll to the bottom
        container.scrollTop = container.scrollHeight
      }
    })
  }
}