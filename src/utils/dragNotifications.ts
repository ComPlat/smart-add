// Global notification system for drag-drop operations
// Since antd messages don't work during drag operations, we use a different approach

class DragNotificationSystem {
  private notifications: Array<{
    id: string
    message: string
    type: 'error' | 'warning' | 'info' | 'success'
    timestamp: number
  }> = []
  private container: HTMLDivElement | null = null
  private lastMessages: Map<string, number> = new Map() // Track last time each message was shown
  private readonly THROTTLE_DELAY = 2000 // 2 seconds between same messages
  private readonly MAX_NOTIFICATIONS = 3 // Maximum visible notifications at once
  private queue: Array<{
    message: string
    type: 'error' | 'warning' | 'info' | 'success'
  }> = []
  private isProcessingQueue = false

  constructor() {
    this.createContainer()
  }

  private createContainer() {
    if (typeof window === 'undefined') return

    this.container = document.createElement('div')
    this.container.id = 'drag-notifications'
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    document.body.appendChild(this.container)
  }

  showError(message: string, delay = 800) {
    setTimeout(() => {
      this.queueNotification(message, 'error')
    }, delay)
  }

  showWarning(message: string, delay = 800) {
    setTimeout(() => {
      this.queueNotification(message, 'warning')
    }, delay)
  }

  showSuccess(message: string, delay = 800) {
    setTimeout(() => {
      this.clearAllNotifications() // Clear existing messages before showing success
      this.queueNotification(message, 'success')
    }, delay)
  }

  private queueNotification(
    message: string,
    type: 'error' | 'warning' | 'info' | 'success',
  ) {
    // Check if already in queue to prevent duplicates
    const alreadyQueued = this.queue.some(
      (n) => n.message === message && n.type === type,
    )
    if (alreadyQueued) return

    // Add to queue
    this.queue.push({ message, type })

    // Process queue
    this.processQueue()
  }

  private async processQueue() {
    if (this.isProcessingQueue) return
    this.isProcessingQueue = true

    while (this.queue.length > 0) {
      // Wait if we have too many notifications showing
      while (this.notifications.length >= this.MAX_NOTIFICATIONS) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const next = this.queue.shift()
      if (next) {
        this.addNotification(next.message, next.type)
      }

      // Small delay between showing notifications
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.isProcessingQueue = false
  }

  private clearAllNotifications() {
    // Clear all existing notifications
    this.notifications.forEach((notification) => {
      this.removeNotification(notification.id)
    })
    this.notifications = []
    // Also clear the queue
    this.queue = []
  }

  private addNotification(
    message: string,
    type: 'error' | 'warning' | 'info' | 'success',
  ) {
    // Throttle duplicate messages
    const now = Date.now()
    const lastTime = this.lastMessages.get(message) || 0

    if (now - lastTime < this.THROTTLE_DELAY) {
      return // Skip this notification - too recent
    }

    this.lastMessages.set(message, now)

    const id = Date.now().toString()
    const notification = { id, message, type, timestamp: Date.now() }

    this.notifications.push(notification)
    this.renderNotification(notification)

    // Auto remove after 4 seconds
    setTimeout(() => {
      this.removeNotification(id)
    }, 4000)
  }

  private renderNotification(notification: {
    id: string
    message: string
    type: string
  }) {
    if (!this.container) return

    const element = document.createElement('div')
    element.id = `notification-${notification.id}`
    element.style.cssText = `
      margin-bottom: 8px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 350px;
      background-color: ${
        notification.type === 'error'
          ? '#ff4d4f'
          : notification.type === 'success'
          ? 'var(--kit-primary-full, #4678B2)'
          : '#faad14'
      };
    `
    element.textContent = notification.message

    // Add slide-in animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    if (!document.head.querySelector('style[data-drag-notifications]')) {
      style.setAttribute('data-drag-notifications', 'true')
      document.head.appendChild(style)
    }

    this.container.appendChild(element)
  }

  private removeNotification(id: string) {
    const element = document.getElementById(`notification-${id}`)
    if (element) {
      element.style.animation = 'slideOut 0.3s ease-out'
      setTimeout(() => {
        element.remove()
      }, 300)
    }

    this.notifications = this.notifications.filter((n) => n.id !== id)
  }
}

export const dragNotifications = new DragNotificationSystem()
