/**
 * APIUsageManager - Monitor and track Spoonacular API usage
 * Helps prevent hitting daily limits and provides usage insights
 */

import { CACHE_TTL } from './cacheManager';

class APIUsageManager {
  constructor() {
    this.storageKey = 'spoonacular_api_usage';
    this.dailyLimit = 150; // Free tier limit
    this.warningThreshold = 0.8; // Warn at 80% usage
    this.criticalThreshold = 0.95; // Critical at 95% usage
  }

  /**
   * Get current usage data from localStorage
   */
  getUsageData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return this.createNewUsageData();

      const data = JSON.parse(stored);
      
      // Check if it's a new day (reset usage)
      const today = new Date().toDateString();
      if (data.date !== today) {
        return this.createNewUsageData();
      }

      return data;
    } catch (error) {
      console.error('Error loading API usage data:', error);
      return this.createNewUsageData();
    }
  }

  /**
   * Create fresh usage data for new day
   */
  createNewUsageData() {
    return {
      date: new Date().toDateString(),
      calls: 0,
      endpoints: {},
      lastReset: Date.now(),
      errors: 0,
      cached: 0
    };
  }

  /**
   * Save usage data to localStorage
   */
  saveUsageData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving API usage data:', error);
    }
  }

  /**
   * Record an API call
   */
  recordCall(endpoint, success = true) {
    const data = this.getUsageData();
    
    if (success) {
      data.calls++;
      data.endpoints[endpoint] = (data.endpoints[endpoint] || 0) + 1;
    } else {
      data.errors++;
    }

    this.saveUsageData(data);
    return data;
  }

  /**
   * Record a cache hit (didn't need API call)
   */
  recordCacheHit() {
    const data = this.getUsageData();
    data.cached++;
    this.saveUsageData(data);
    return data;
  }

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    const data = this.getUsageData();
    const usagePercent = (data.calls / this.dailyLimit) * 100;
    const remaining = Math.max(0, this.dailyLimit - data.calls);

    return {
      calls: data.calls,
      remaining,
      limit: this.dailyLimit,
      usagePercent: Math.round(usagePercent * 100) / 100,
      date: data.date,
      endpoints: data.endpoints,
      errors: data.errors,
      cached: data.cached,
      status: this.getUsageStatus(usagePercent),
      canMakeCall: data.calls < this.dailyLimit
    };
  }

  /**
   * Determine usage status based on percentage
   */
  getUsageStatus(usagePercent) {
    if (usagePercent >= this.criticalThreshold * 100) return 'critical';
    if (usagePercent >= this.warningThreshold * 100) return 'warning';
    return 'normal';
  }

  /**
   * Check if we can make an API call
   */
  canMakeCall() {
    const data = this.getUsageData();
    return data.calls < this.dailyLimit;
  }

  /**
   * Get recommendation for API usage optimization
   */
  getRecommendations() {
    const stats = this.getUsageStats();
    const recommendations = [];

    if (stats.usagePercent > 70) {
      recommendations.push({
        type: 'high_usage',
        message: 'Consider using cached results or local fallback recipes',
        priority: 'high'
      });
    }

    if (stats.errors > 5) {
      recommendations.push({
        type: 'errors',
        message: 'Multiple API errors detected. Check your internet connection',
        priority: 'medium'
      });
    }

    if (stats.cached < stats.calls * 0.3) {
      recommendations.push({
        type: 'low_cache',
        message: 'Cache hit ratio is low. Consider increasing cache TTL',
        priority: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Estimate time until limit reset (midnight UTC)
   */
  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(now.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, milliseconds: msUntilReset };
  }

  /**
   * Get usage trends over time
   */
  getUsageTrends() {
    const data = this.getUsageData();
    const now = Date.now();
    const hoursSinceReset = (now - data.lastReset) / (1000 * 60 * 60);
    
    return {
      callsPerHour: hoursSinceReset > 0 ? Math.round(data.calls / hoursSinceReset * 100) / 100 : 0,
      projectedDailyUsage: hoursSinceReset > 0 ? Math.round((data.calls / hoursSinceReset) * 24) : 0,
      cacheEfficiency: data.calls + data.cached > 0 ? 
        Math.round((data.cached / (data.calls + data.cached)) * 100) : 0
    };
  }

  /**
   * Reset usage data (for testing or manual reset)
   */
  resetUsage() {
    const newData = this.createNewUsageData();
    this.saveUsageData(newData);
    return newData;
  }
}

// Singleton instance
export const apiUsageManager = new APIUsageManager();

export default APIUsageManager;