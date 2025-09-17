// utils/socketService.js
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.notifications = [];
    this.listeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection with better error handling
  connect(token) {
    console.log("🔌 Attempting to connect with JWT token:", token ? "Present" : "Missing");
    
    if (this.socket?.connected) {
      console.log("✅ Socket already connected");
      return this.socket;
    }

    // Disconnect any existing connection
    if (this.socket) {
      console.log("🔄 Disconnecting existing socket");
      this.socket.disconnect();
    }

    // Check if backend server is running
    // this.checkServerHealth();

    // Socket configuration with improved settings
    const socketConfig = {
      auth: {
        token: token
      },
      // Start with polling only, then upgrade to websocket
      transports: ['polling'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: true,
      
      // Reconnection settings
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      
      // Additional config for stability
      autoConnect: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      
      // CORS and polling settings
      withCredentials: false,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*"
      }
    };

    console.log("🔧 Socket config:", socketConfig);

    try {
      this.socket = io('http://localhost:5000', socketConfig);
      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error("❌ Failed to create socket connection:", error);
      this.handleConnectionError(error);
      return null;
    }
  }

  // Check if backend server is reachable
  // async checkServerHealth() {
  //   try {
  //     const response = await fetch('http://localhost:5000/health', {
  //       method: 'GET',
  //       timeout: 5000
  //     });
      
  //     if (response.ok) {
  //       console.log("✅ Backend server is running");
  //     } else {
  //       console.warn("⚠️ Backend server responded with status:", response.status);
  //     }
  //   } catch (error) {
  //     console.error("❌ Backend server is not reachable:", error.message);
  //     toast.error("Cannot connect to server. Please ensure the backend is running on port 5000.");
  //   }
  // }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to server with ID:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0; // Reset counter on successful connection
      this.socket.emit('user_online');
      this.notifyListeners('connection', { status: 'connected' });
      toast.success("Connected to server!");
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server. Reason:', reason);
      this.isConnected = false;
      this.notifyListeners('connection', { status: 'disconnected', reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        console.log("🔄 Server disconnected, attempting manual reconnect...");
        setTimeout(() => this.reconnect(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      toast.success("Reconnected to server!");
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🚨 Reconnection error:', error);
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error("Failed to reconnect. Please refresh the page.");
      }
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🚨 All reconnection attempts failed');
      toast.error("Connection failed. Please check your internet and refresh the page.");
    });

    // Main notification handler
    this.socket.on('notification', (data) => {
      console.log('📢 Notification received:', data);
      this.handleNotification(data);
    });

    // Server error handling
    this.socket.on('error', (error) => {
      console.error('🚨 Server error:', error);
      toast.error(`Server error: ${error.message || 'Unknown error'}`);
    });
  }

  // Enhanced error handling
  handleConnectionError(error) {
    console.error("Connection error details:", {
      message: error.message,
      type: error.type,
      description: error.description,
      context: error.context,
      code: error.code
    });

    let errorMessage = "Connection failed. ";
    
    if (error.message?.includes('xhr poll error')) {
      errorMessage += "Server might be down or unreachable.";
    } else if (error.message?.includes('timeout')) {
      errorMessage += "Connection timeout. Check your internet.";
    } else if (error.message?.includes('CORS')) {
      errorMessage += "CORS error. Check server configuration.";
    } else {
      errorMessage += "Please check your connection and try again.";
    }

    toast.error(errorMessage);
  }

  // Manual reconnection method
  reconnect() {
    if (this.socket && !this.socket.connected) {
      console.log("🔄 Attempting manual reconnection...");
      this.socket.connect();
    }
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
      `${jobData?.deviceInfo?.brand} ${jobData?.deviceInfo?.model} - Budget: ${jobData.budget.min}-${jobData.budget.max} PKR`,
      '/job-icon.png'
    );

    // Toast notification
    toast.success(
      <div className="notification-content">
        <div className="font-bold">New Job Available!</div>
        <div className="text-sm">{jobData?.deviceInfo?.brand} {jobData?.deviceInfo?.model} - {jobData.services?.map((service) => service).join(', ')}</div>
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
      `Your offer for "${data?.deviceInfo?.brand} ${data?.deviceInfo?.model}" has been accepted!`,
      '/success-icon.png'
    );

    toast.success(
      <div>
        <div className="font-bold">Congratulations! 🎉</div>
        <div className="text-sm">Your offer has been accepted</div>
        <div className="text-xs">{data?.deviceInfo?.brand} {data?.deviceInfo?.model}</div>
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
        <div className="text-xs">{data?.deviceInfo?.brand} {data?.deviceInfo?.model}</div>
      </div>,
      { duration: 5000 }
    );
  }

  showJobCancelledNotification(data) {
    toast.error(
      <div>
        <div className="font-bold">Job Cancelled</div>
        <div className="text-sm">{data?.deviceInfo?.brand} {data?.deviceInfo?.model}</div>
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

  // Browser notification - Fixed version
  showBrowserNotification(title, body, icon) {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return;
    }

    if (Notification.permission === 'denied') {
      console.log('Notifications are blocked by the user');
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.createNotification(title, body, icon);
        }
      });
    } else if (Notification.permission === 'granted') {
      this.createNotification(title, body, icon);
    }
  }

  createNotification(title, body, icon) {
    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: '/notification-badge.png',
        tag: 'repair-job-notification',
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (typeof window !== 'undefined') {
          window.location.href = '/repair-man/job-board';
        }
      };

      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 10000);

    } catch (error) {
      console.error('Error creating notification:', error);
      toast.info(`${title}: ${body}`);
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

  async requestNotificationPermission() {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
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
      console.log("🔌 Manually disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isUserOnline() {
    return this.isConnected;
  }

  // Debug method to check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      socketConnected: this.socket?.connected,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;