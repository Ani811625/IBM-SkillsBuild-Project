/**
 * Service Worker utilities for offline functionality
 * Handles registration, messaging, and cache management
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.isOnline = navigator.onLine;
    this.listeners = new Map();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online', true);
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('online', false);
    });
  }

  /**
   * Register the service worker
   */
  async register() {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      
      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available
              this.notifyListeners('update', newWorker);
            } else {
              // Content cached for first time
              this.notifyListeners('ready', newWorker);
            }
          }
        });
      });

      console.log('✅ Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Send message to service worker
   */
  async sendMessage(type, data = {}) {
    if (!this.registration || !this.registration.active) {
      throw new Error('Service Worker not available');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      this.registration.active.postMessage(
        { type, ...data },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    try {
      await this.sendMessage('CLEAR_CACHE');
      console.log('🗑️ All caches cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Cache a recipe for offline access
   */
  async cacheRecipe(recipe) {
    try {
      await this.sendMessage('CACHE_RECIPE', { recipe });
      console.log(`📦 Recipe "${recipe.title}" cached for offline access`);
      return true;
    } catch (error) {
      console.error('Failed to cache recipe:', error);
      return false;
    }
  }

  /**
   * Get cache information
   */
  async getCacheInfo() {
    try {
      return await this.sendMessage('GET_CACHE_INFO');
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return {};
    }
  }

  /**
   * Check if app is running offline
   */
  isOffline() {
    return !this.isOnline;
  }

  /**
   * Add event listener
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Notify listeners of events
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Listener error:', error);
        }
      });
    }
  }

  /**
   * Update service worker
   */
  async updateServiceWorker() {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('🔄 Service Worker update check completed');
      } catch (error) {
        console.error('Service Worker update failed:', error);
      }
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * Initialize service worker with error handling
 */
export async function initServiceWorker() {
  try {
    const registered = await serviceWorkerManager.register();
    if (registered) {
      console.log('🚀 Offline support enabled');
    }
    return registered;
  } catch (error) {
    console.error('Service Worker initialization failed:', error);
    return false;
  }
}

/**
 * Cache management utilities
 */
export const cacheUtils = {
  /**
   * Preload critical recipes for offline access
   */
  async preloadCriticalRecipes(recipes) {
    const results = [];
    for (const recipe of recipes.slice(0, 10)) { // Limit to first 10
      try {
        const success = await serviceWorkerManager.cacheRecipe(recipe);
        results.push({ recipe: recipe.title, success });
      } catch (error) {
        results.push({ recipe: recipe.title, success: false, error: error.message });
      }
    }
    return results;
  },

  /**
   * Get storage usage information
   */
  async getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          usedPercentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        console.error('Failed to get storage info:', error);
      }
    }
    return null;
  },

  /**
   * Check if sufficient storage is available
   */
  async hasStorageSpace(requiredBytes = 50 * 1024 * 1024) { // 50MB default
    const info = await this.getStorageInfo();
    if (!info) return true; // Assume space available if can't check
    
    const availableSpace = info.available - info.used;
    return availableSpace > requiredBytes;
  }
};

export default serviceWorkerManager;