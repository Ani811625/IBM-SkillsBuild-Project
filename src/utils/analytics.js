// Analytics and User Behavior Tracking System
// Privacy-focused analytics for recipe finder app

class AnalyticsManager {
  constructor() {
    this.storageKey = 'recipe_analytics';
    this.sessionKey = 'session_analytics';
    this.isEnabled = true;
    this.session = this.initializeSession();
  }

  // Initialize session data
  initializeSession() {
    const session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: [],
      events: [],
      searchQueries: [],
      recipeViews: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  }

  // Generate unique session ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get stored analytics data
  getStoredData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        sessions: [],
        totalPageViews: 0,
        totalEvents: 0,
        popularRecipes: {},
        searchPatterns: {},
        userPreferences: {},
        performanceMetrics: {},
        errorLogs: [],
        createdAt: Date.now()
      };
    } catch (error) {
      console.error('Error loading analytics data:', error);
      return {};
    }
  }

  // Save analytics data
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving analytics data:', error);
      return false;
    }
  }

  // Track page view
  trackPageView(page, title = '', additionalData = {}) {
    if (!this.isEnabled) return;

    const pageView = {
      page,
      title,
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.session.id,
      ...additionalData
    };

    this.session.pageViews.push(pageView);
    this.session.lastActivity = Date.now();
    
    const data = this.getStoredData();
    data.totalPageViews = (data.totalPageViews || 0) + 1;
    
    this.saveData(data);
    this.updateSession();
    
    console.log('📊 Page view tracked:', page);
  }

  // Track custom event
  trackEvent(category, action, label = '', value = null, additionalData = {}) {
    if (!this.isEnabled) return;

    const event = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.session.id,
      page: window.location.pathname,
      ...additionalData
    };

    this.session.events.push(event);
    this.session.lastActivity = Date.now();
    
    const data = this.getStoredData();
    data.totalEvents = (data.totalEvents || 0) + 1;
    
    this.saveData(data);
    this.updateSession();
    
    console.log('📊 Event tracked:', { category, action, label });
  }

  // Track recipe view
  trackRecipeView(recipeId, recipeName, source = 'unknown', timeSpent = null) {
    if (!this.isEnabled) return;

    const recipeView = {
      recipeId,
      recipeName,
      source,
      timeSpent,
      timestamp: Date.now(),
      sessionId: this.session.id
    };

    this.session.recipeViews.push(recipeView);
    
    const data = this.getStoredData();
    
    // Update popular recipes
    if (!data.popularRecipes[recipeId]) {
      data.popularRecipes[recipeId] = {
        name: recipeName,
        views: 0,
        totalTimeSpent: 0,
        sources: {}
      };
    }
    
    data.popularRecipes[recipeId].views++;
    if (timeSpent) {
      data.popularRecipes[recipeId].totalTimeSpent += timeSpent;
    }
    
    data.popularRecipes[recipeId].sources[source] = 
      (data.popularRecipes[recipeId].sources[source] || 0) + 1;
    
    this.saveData(data);
    this.updateSession();
    
    this.trackEvent('Recipe', 'View', recipeName, null, { recipeId, source });
  }

  // Track search query
  trackSearch(query, resultsCount = 0, filters = {}, source = 'search') {
    if (!this.isEnabled) return;

    const searchData = {
      query: query.toLowerCase().trim(),
      resultsCount,
      filters,
      source,
      timestamp: Date.now(),
      sessionId: this.session.id
    };

    this.session.searchQueries.push(searchData);
    
    const data = this.getStoredData();
    
    // Update search patterns
    const normalizedQuery = query.toLowerCase().trim();
    if (!data.searchPatterns[normalizedQuery]) {
      data.searchPatterns[normalizedQuery] = {
        count: 0,
        totalResults: 0,
        avgResults: 0,
        firstSearched: Date.now(),
        lastSearched: Date.now()
      };
    }
    
    const pattern = data.searchPatterns[normalizedQuery];
    pattern.count++;
    pattern.totalResults += resultsCount;
    pattern.avgResults = pattern.totalResults / pattern.count;
    pattern.lastSearched = Date.now();
    
    this.saveData(data);
    this.updateSession();
    
    this.trackEvent('Search', 'Query', query, resultsCount, { filters, source });
  }

  // Track user interaction
  trackInteraction(type, target, details = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('Interaction', type, target, null, details);
  }

  // Track performance metrics
  trackPerformance(metric, value, context = {}) {
    if (!this.isEnabled) return;

    const data = this.getStoredData();
    
    if (!data.performanceMetrics[metric]) {
      data.performanceMetrics[metric] = {
        values: [],
        average: 0,
        min: value,
        max: value,
        count: 0
      };
    }
    
    const perfData = data.performanceMetrics[metric];
    perfData.values.push({ value, timestamp: Date.now(), context });
    perfData.count++;
    perfData.min = Math.min(perfData.min, value);
    perfData.max = Math.max(perfData.max, value);
    perfData.average = perfData.values.reduce((sum, v) => sum + v.value, 0) / perfData.count;
    
    // Keep only last 100 values to prevent storage bloat
    if (perfData.values.length > 100) {
      perfData.values = perfData.values.slice(-100);
    }
    
    this.saveData(data);
    
    console.log(`⚡ Performance tracked: ${metric} = ${value}ms`);
  }

  // Track errors
  trackError(error, context = {}) {
    if (!this.isEnabled) return;

    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      context,
      timestamp: Date.now(),
      sessionId: this.session.id,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const data = this.getStoredData();
    data.errorLogs = data.errorLogs || [];
    data.errorLogs.push(errorData);
    
    // Keep only last 50 errors
    if (data.errorLogs.length > 50) {
      data.errorLogs = data.errorLogs.slice(-50);
    }
    
    this.saveData(data);
    
    this.trackEvent('Error', 'JavaScript', error.message, null, context);
    
    console.error('❌ Error tracked:', error);
  }

  // Update session in storage
  updateSession() {
    sessionStorage.setItem(this.sessionKey, JSON.stringify(this.session));
  }

  // End current session
  endSession() {
    if (!this.session) return;

    const sessionDuration = Date.now() - this.session.startTime;
    
    const sessionSummary = {
      ...this.session,
      endTime: Date.now(),
      duration: sessionDuration,
      totalPageViews: this.session.pageViews.length,
      totalEvents: this.session.events.length,
      totalSearches: this.session.searchQueries.length,
      totalRecipeViews: this.session.recipeViews.length
    };

    const data = this.getStoredData();
    data.sessions = data.sessions || [];
    data.sessions.push(sessionSummary);
    
    // Keep only last 30 sessions
    if (data.sessions.length > 30) {
      data.sessions = data.sessions.slice(-30);
    }
    
    this.saveData(data);
    
    console.log('📊 Session ended:', sessionSummary);
  }

  // Get analytics insights
  getInsights() {
    const data = this.getStoredData();
    
    // Most popular recipes
    const popularRecipes = Object.entries(data.popularRecipes || {})
      .map(([id, recipe]) => ({ id, ...recipe }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Most searched terms
    const popularSearches = Object.entries(data.searchPatterns || {})
      .map(([query, pattern]) => ({ query, ...pattern }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Session statistics
    const sessions = data.sessions || [];
    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
      : 0;
    
    // Performance insights
    const performance = {};
    Object.entries(data.performanceMetrics || {}).forEach(([metric, data]) => {
      performance[metric] = {
        average: Math.round(data.average),
        min: data.min,
        max: data.max,
        count: data.count
      };
    });
    
    return {
      totalSessions: sessions.length,
      totalPageViews: data.totalPageViews || 0,
      totalEvents: data.totalEvents || 0,
      avgSessionDuration: Math.round(avgSessionDuration / 1000), // seconds
      popularRecipes,
      popularSearches,
      performance,
      errorCount: (data.errorLogs || []).length,
      dataCollectedSince: data.createdAt
    };
  }

  // Enable/disable analytics
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`📊 Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Clear all analytics data
  clearData() {
    try {
      localStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.sessionKey);
      this.session = this.initializeSession();
      console.log('📊 Analytics data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing analytics data:', error);
      return false;
    }
  }

  // Export analytics data
  exportData() {
    const data = this.getStoredData();
    return {
      ...data,
      currentSession: this.session,
      exportedAt: Date.now(),
      version: '1.0'
    };
  }
}

// Initialize analytics when page loads
const initializeAnalytics = () => {
  window.addEventListener('beforeunload', () => {
    analyticsManager.endSession();
  });
  
  // Track page load performance
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    analyticsManager.trackPerformance('pageLoad', loadTime);
  });
  
  // Track errors globally
  window.addEventListener('error', (event) => {
    analyticsManager.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  console.log('📊 Analytics initialized');
};

// Create singleton instance
export const analyticsManager = new AnalyticsManager();

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeAnalytics();
}

export default AnalyticsManager;