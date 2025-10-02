import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// Proper Singleton ChannelManager
class ChannelManager {
  constructor() {
    if (ChannelManager.instance) {
      return ChannelManager.instance;
    }

    this.consumer = null;
    this.channels = new Map();
    ChannelManager.instance = this;
    return this;
  }

  static getInstance() {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager();
    }
    return ChannelManager.instance;
  }

  getConsumer() {
    if (!this.consumer) {
      this.consumer = createConsumer();
    }
    return this.consumer;
  }

  subscribe(userId, callbacks) {
    const key = `notifications_${userId}`;
    if (this.channels.has(key)) return this.channels.get(key);

    const channel = this.getConsumer().subscriptions.create(
      { channel: "NotificationsChannel", user_id: userId },
      callbacks
    );

    this.channels.set(key, channel);
    return channel;
  }

  unsubscribe(userId) {
    const key = `notifications_${userId}`;
    if (this.channels.has(key)) {
      this.channels.get(key).unsubscribe();
      this.channels.delete(key);
    }
  }

  // Method to check if already subscribed
  isSubscribed(userId) {
    const key = `notifications_${userId}`;
    return this.channels.has(key);
  }

  // Method to get all active channels for debugging
  getActiveChannels() {
    return Array.from(this.channels.keys());
  }

  // Method to unsubscribe from all channels
  unsubscribeAll() {
    for (const [key, channel] of this.channels) {
      channel.unsubscribe();
    }
    this.channels.clear();
  }
}

export default class extends Controller {
  static values = { 
    userId: Number,
    action: String,
    subjectId: Number,
    directObjectId: Number,
    indirectObjectId: Number
  }

  connect() {
    if (!this.userIdValue) return

    // Get singleton instance
    this.channelManager = ChannelManager.getInstance();
    
    // Check if already subscribed to avoid duplicate subscriptions
    if (this.channelManager.isSubscribed(this.userIdValue)) {
      console.log("Already subscribed to notifications for user:", this.userIdValue);
      return;
    }

    this.channel = this.channelManager.subscribe(
      this.userIdValue,
      {
        connected: () => console.log("Notifications connected"),
        disconnected: () => {
          console.log("Notifications disconnected");
          // Optionally handle reconnection logic here
        },
        received: (data) => {
          console.log("New notification received:", data);
          this.handleNotification(data);
          // Call the endpoint to get updated unread count
          this.updateUnreadCount();
        }
      }
    );
  }

  disconnect() {
    if (this.userIdValue && this.channelManager) {
      this.channelManager.unsubscribe(this.userIdValue);
    }
  }

  // NEW METHOD: Fetch and update unread notification count
  async updateUnreadCount() {
    try {
      const response = await fetch('/notifications/get_number_of_unread_notifications', {
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
      console.log("Unread notification count:", data.number_of_unread_notifications);
      document.getElementById("unread_notifications_count").innerText = data.number_of_unread_notifications
      // Update the badge with the new count
      this.updateNotificationBadgeWithCount(data.number_of_unread_notifications);

    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      // Fallback: If the API call fails, increment the current count by 1
      // This is already handled in handleNotification, so we don't need to do it again here
    }
  }

  // Update the badge with a specific count instead of incrementing
  updateNotificationBadgeWithCount(count) {
    const badge = document.querySelector("[data-notification-badge]");
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove("hidden");
      } else {
        badge.textContent = '';
        badge.classList.add("hidden");
      }
    }
  }

  handleNotification(data) {
    // Create push notification
    this.createPushNotification(data);
    
    // Optionally update the notification list in real-time
    this.updateNotificationList(data);
    // Note: We no longer increment the badge here because updateUnreadCount()
    // will update it with the actual server value
  }

  // Keep the original increment method for fallback or other uses if needed
  updateNotificationBadge() {
    const badge = document.querySelector("[data-notification-badge]");
    if (badge) {
      const currentCount = parseInt(badge.textContent) || 0;
      badge.textContent = currentCount + 1;
      badge.classList.remove("hidden");
    }
  }

  createPushNotification(data) {
    // Check if browser supports notifications
    if ("Notification" in window) {
      // Request permission if not already granted
      if (Notification.permission === "granted") {
        this.showBrowserNotification(data);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            this.showBrowserNotification(data);
          }
        });
      }
    }
    
    // Also show a visual notification in the page (like Facebook)
    this.showVisualNotification(data);
  }

  showBrowserNotification(data) {
    const options = {
      body: data.message || `New ${data.action} notification`,
      icon: this.getAvatarUrl(data.subject),
      badge: "/favicon.ico", // Path to your app's icon
      tag: `notification-${data.id}`,
      requireInteraction: false, // Auto-dismiss after timeout
      silent: false
    };

    // Create browser notification
    const notification = new Notification(
      data.subject?.full_name || data.subject?.username || "New Notification", 
      options
    );

    // Optional: Add click handler
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      // Navigate to notification URL if available
      if (data.url && data.url !== '#') {
        window.location.href = data.url;
      } else {
        // Fallback to notifications page
        window.location.href = '/notifications';
      }
    };

    // Auto close after 5 seconds
    setTimeout(notification.close.bind(notification), 5000);
  }

  showVisualNotification(data) {
    // Create a Facebook-like notification at the bottom
    const notificationContainer = this.getOrCreateNotificationContainer();
    
    const toast = document.createElement('div');
    toast.className = 'facebook-notification fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 max-w-md p-4 transition-all duration-300';
    toast.style.animation = 'slideInRight 0.3s ease-out';
    toast.setAttribute('data-notification-id', data.id);
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <img class="h-10 w-10 rounded-full" 
               src="${this.getAvatarUrl(data.subject)}" 
               alt="${data.subject?.full_name || data.subject?.username || 'User'}" 
               onerror="this.src='/default-avatar.png'">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center">
            <p class="text-sm font-semibold text-gray-900 truncate">
              ${data.subject?.full_name || data.subject?.username || 'Someone'}
            </p>
            <span class="ml-2 text-xs text-gray-500">
              ${data.created_at}
            </span>
          </div>
          <p class="text-sm text-gray-700 mt-1">
            ${data.message}
          </p>
          <div class="mt-3 flex space-x-2">
            <a href="posts/${data.indirect_object.id}/comments" 
               class="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded hover:bg-gray-100 transition-colors">
              View
            </a>
            <button class="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                    onclick="this.closest('.facebook-notification').remove()">
              Dismiss
            </button>
          </div>
        </div>
        <button class="ml-2 text-gray-400 hover:text-gray-600" 
                onclick="this.closest('.facebook-notification').remove()">
          ×
        </button>
      </div>
    `;

    // Add to the container
    notificationContainer.appendChild(toast);

    // Auto remove after 8 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
        this.cleanupNotificationContainer(notificationContainer);
      }
    }, 8000);
  }

  getOrCreateNotificationContainer() {
    let container = document.getElementById('facebook-notifications-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'facebook-notifications-container';
      container.className = 'fixed bottom-0 right-4 space-y-3 z-50 max-w-md';
      document.body.appendChild(container);
    }
    
    return container;
  }

  cleanupNotificationContainer(container) {
    // Remove container if no notifications left
    if (container.children.length === 0) {
      container.remove();
    }
  }

  getAvatarUrl(user) {
    // Return a default avatar if user doesn't have one
    // This should match your avatar_for helper logic
    if (!user) return '/default-avatar.png';
    
    // If your user has an avatar URL field, use that
    // Otherwise, you might need to generate a gravatar URL or return a default
    return user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=0D8ABC&color=fff`;
  }

  updateNotificationList(data) {
    // If there's a notifications list on the current page, append the new notification
    const notificationsList = document.getElementById('notifications-list');
    if (notificationsList) {
      // Create a temporary element to render the notification partial
      // This would require server-side rendering, so you might want to
      // create the notification element client-side instead
      
      const notificationElement = document.createElement('div');
      notificationElement.className = 'p-3 rounded-lg bg-blue-50 border-l-4 border-blue-400 flex items-start space-x-3';
      notificationElement.id = `notification_${data.id}`;
      
      notificationElement.innerHTML = `
        <img class="h-10 w-10 rounded-full flex-shrink-0" 
             src="${this.getAvatarUrl(data.subject)}" 
             alt="User">
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-blue-800">
              ${data.message}
            </p>
            <span class="text-xs text-gray-500 whitespace-nowrap">
              ${data.created_at} ago
            </span>
          </div>
          <div class="mt-2 flex space-x-2">
            <a href="${data.url || '#'}" 
               class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View
            </a>
            <span class="text-xs text-gray-500">Unread</span>
          </div>
        </div>
      `;
      
      // Add to the top of the list
      notificationsList.insertBefore(notificationElement, notificationsList.firstChild);
    }
  }

  // Handle message form submission
  sendNotification(event) {
    console.log("Action:", this.actionValue);
    console.log(this.subjectIdValue);
    console.log(this.directObjectIdValue);
    console.log(this.indirectObjectIdValue);
    
    // Uncomment when ready to send notifications
    // if (this.channel) {
    //   this.channel.perform('speak', {
    //     action: this.actionValue || "test",
    //     direct_object_id: this.directObjectIdValue || "1",
    //     indirect_object_id: this.indirectObjectIdValue || "1",
    //     subject_id: this.userIdValue
    //   });
    // }
  }

  // Method to manually trigger a notification (for testing)
  testNotification() {
    if (this.channel) {
      this.channel.perform('speak', {
        action: 'test_action',
        direct_object_id: '1',
        indirect_object_id: '1',
        subject_id: this.userIdValue
      });
    }
  }
}