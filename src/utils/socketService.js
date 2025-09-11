// utils/socketService.js
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';


class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.notifications = [];
    this.listeners = [];
  }

  // Initialize socket connection
  connect(token) {
    console.log("jwt token", token);
    
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['polling', 'websocket'], // Try polling first
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      this.isConnected = true;
      this.socket.emit('user_online');
      this.notifyListeners('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      this.isConnected = false;
      this.notifyListeners('connection', { status: 'disconnected' });
    });

    // Main notification handler
    this.socket.on('notification', (data) => {
      console.log('📢 Notification received:', data);
      this.handleNotification(data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      toast.error('Connection failed. Please check your internet.');
    });
  }

  // Handle different types of notifications
  handleNotification(notification) {
    // Add to notifications array
    this.notifications.unshift(notification);
    
    // Limit notifications in memory
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Show appropriate notification based on type
    switch (notification.type) {
      case 'new_job':
        this.showNewJobNotification(notification.data);
        break;
      case 'offer_accepted':
        this.showOfferAcceptedNotification(notification.data);
        break;
      case 'offer_rejected':
        this.showOfferRejectedNotification(notification.data);
        break;
      case 'job_cancelled':
        this.showJobCancelledNotification(notification.data);
        break;
      default:
        this.showGenericNotification(notification);
    }

    // Notify all listeners
    this.notifyListeners('notification', notification);
  }

  // Show new job notification to repairman
  showNewJobNotification(jobData) {
    // Browser notification
    this.showBrowserNotification(
      '🔧 New Repair Job Available!',
      `${jobData.title} - Budget: ${jobData.budget.min}-${jobData.budget.max} PKR`,
      '/job-icon.png'
    );

    // Toast notification
    toast.success(
      <div className="notification-content">
        <div className="font-bold">New Job Available!</div>
        <div className="text-sm">{jobData.title}</div>
        <div className="text-xs text-gray-600">
          Budget: {jobData.budget.min}-{jobData.budget.max} PKR | {jobData.location.city}
        </div>
      </div>,
      {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: 'white',
        },
      }
    );

    // Play notification sound
    this.playNotificationSound();
  }

  showOfferAcceptedNotification(data) {
    this.showBrowserNotification(
      '✅ Offer Accepted!',
      `Your offer for "${data.jobTitle}" has been accepted!`,
      '/success-icon.png'
    );

    toast.success(
      <div>
        <div className="font-bold">Congratulations! 🎉</div>
        <div className="text-sm">Your offer has been accepted</div>
        <div className="text-xs">{data.jobTitle}</div>
      </div>,
      { duration: 8000 }
    );

    this.playSuccessSound();
  }

  showOfferRejectedNotification(data) {
    toast.error(
      <div>
        <div className="font-bold">Offer Update</div>
        <div className="text-sm">Job assigned to another repairman</div>
        <div className="text-xs">{data.jobTitle}</div>
      </div>,
      { duration: 5000 }
    );
  }

  showJobCancelledNotification(data) {
    toast.error(
      <div>
        <div className="font-bold">Job Cancelled</div>
        <div className="text-sm">{data.jobTitle}</div>
        <div className="text-xs">Reason: {data.cancellationReason}</div>
      </div>,
      { duration: 6000 }
    );
  }

  showGenericNotification(notification) {
    toast.info(
      <div>
        <div className="font-bold">Notification</div>
        <div className="text-sm">{notification.message || 'You have a new notification'}</div>
      </div>
    );
  }

  // Browser notification
  showBrowserNotification(title, body, icon) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon,
        badge: '/notification-badge.png',
        tag: 'repair-job-notification',
        requireInteraction: true, // Keep notification until user interacts
        actions: [
          {
            action: 'view',
            title: 'View Job'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navigate to jobs page
        window.location.href = '/repairman/jobs';
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  }

  // Sound notifications
  playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available');
    }
  }

  playSuccessSound() {
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.7;
      audio.play().catch(e => console.log('Could not play success sound:', e));
    } catch (error) {
      console.log('Success sound not available');
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in socket listener:', error);
      }
    });
  }

  // Utility methods
  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners('notification_read', notification);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners('all_notifications_read', {});
  }

  clearNotifications() {
    this.notifications = [];
    this.notifyListeners('notifications_cleared', {});
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if user is online
  isUserOnline() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;