// Add this to your JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  const notificationBell = document.getElementById('notification-bell');
  const notificationsModal = document.getElementById('notifications-modal');
  const closeModal = document.getElementById('close-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const notificationsList = document.getElementById('notifications-list');

  // Open modal when bell is clicked
  notificationBell.addEventListener('click', function(e) {
    e.preventDefault();
    fetchNotifications();
    notificationsModal.classList.remove('hidden');
  });

  // Close modal functions
  closeModal.addEventListener('click', closeNotificationsModal);
  modalOverlay.addEventListener('click', closeNotificationsModal);

  function closeNotificationsModal() {
    notificationsModal.classList.add('hidden');
  }

  // Fetch notifications from server
  async function fetchNotifications() {
    try {
      const response = await fetch('/notifications.json');
      const data = await response.json();
      renderNotifications(data.notifications, data.unread_count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      notificationsList.innerHTML = '<p class="text-red-500 text-center">Error loading notifications</p>';
    }
  }

  // Render notifications in the modal
  function renderNotifications(notifications, unreadCount) {
    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p class="mt-1 text-sm text-gray-500">You don't have any notifications yet.</p>
        </div>
      `;
      return;
    }

    let notificationsHTML = '<div class="space-y-4">';
    
    notifications.forEach(notification => {
      const isUnread = !notification.read_at;
      const notificationClass = isUnread ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50';
      
      notificationsHTML += `
        <div class="p-4 rounded-lg ${notificationClass} notification-item" data-notification-id="${notification.id}">
          <div class="flex justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium ${isUnread ? 'text-blue-800' : 'text-gray-800'}">
                ${notification.message}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                ${notification.created_at} ago
              </p>
            </div>
            ${isUnread ? 
              `<button class="mark-as-read-btn ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                       data-notification-id="${notification.id}">
                 Mark as read
               </button>` : 
              '<span class="text-xs text-gray-500 ml-2">Read</span>'
            }
          </div>
          ${notification.url ? 
            `<div class="mt-2">
               <a href="${notification.url}" class="text-sm text-indigo-600 hover:text-indigo-800">
                 View details
               </a>
             </div>` : ''
          }
        </div>
      `;
    });

    notificationsHTML += '</div>';

    // Add mark all as read button if there are unread notifications
    if (unreadCount > 0) {
      notificationsHTML += `
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button id="mark-all-read-btn" class="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Mark all as read
          </button>
        </div>
      `;
    }

    notificationsList.innerHTML = notificationsHTML;

    // Add event listeners for mark as read buttons
    document.querySelectorAll('.mark-as-read-btn').forEach(button => {
      button.addEventListener('click', function() {
        const notificationId = this.getAttribute('data-notification-id');
        markNotificationAsRead(notificationId);
      });
    });

    // Add event listener for mark all as read
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', function() {
        markAllNotificationsAsRead();
      });
    }
  }

  // Mark single notification as read
  async function markNotificationAsRead(notificationId) {
    try {
      const response = await fetch('/notifications/mark_as_read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ id: notificationId })
      });

      if (response.ok) {
        // Remove the mark as read button and add "Read" text
        const notificationItem = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationItem) {
          const button = notificationItem.querySelector('.mark-as-read-btn');
          if (button) {
            button.remove();
          }
          const readSpan = document.createElement('span');
          readSpan.className = 'text-xs text-gray-500 ml-2';
          readSpan.textContent = 'Read';
          notificationItem.querySelector('div').appendChild(readSpan);
          notificationItem.classList.remove('bg-blue-50', 'border-blue-400');
          notificationItem.classList.add('bg-gray-50');
          notificationItem.querySelector('.text-blue-800')?.classList.add('text-gray-800');
        }
        
        // Update notification badge
        updateNotificationBadge();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async function markAllNotificationsAsRead() {
    try {
      const response = await fetch('/notifications/mark_as_read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      });

      if (response.ok) {
        // Reload notifications to show all as read
        fetchNotifications();
        updateNotificationBadge();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Update notification badge count
  async function updateNotificationBadge() {
    try {
      const response = await fetch('/notifications.json');
      const data = await response.json();
      
      const badge = document.querySelector('#notification-bell .absolute');
      if (data.unread_count > 0) {
        if (badge) {
          badge.textContent = data.unread_count;
        } else {
          const bell = document.querySelector('#notification-bell');
          bell.insertAdjacentHTML('beforeend', 
            `<span class="absolute right-0 block h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 ring-2 ring-white bottom-[3rem]"></span>`
          );
        }
      } else {
        if (badge) {
          badge.remove();
        }
      }
    } catch (error) {
      console.error('Error updating notification badge:', error);
    }
  }
});