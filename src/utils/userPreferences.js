/**
 * UserPreferencesManager - Manage user preferences and personalization
 * Handles cuisines, dietary preferences, and custom collections
 */

import LocalStorageManager from './localStorage';

class UserPreferencesManager {
  constructor() {
    this.storageKey = 'user_preferences';
    this.defaultPreferences = {
      // Cuisine preferences
      favoriteCuisines: [],
      
      // Dietary preferences
      dietaryRestrictions: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        nutFree: false,
        lowCarb: false,
        keto: false,
        paleo: false
      },
      
      // Nutrition preferences
      nutritionTargets: {
        maxCalories: null,
        minProtein: null,
        maxCarbs: null,
        maxFat: null,
        maxSodium: null
      },
      
      // Cooking preferences
      cookingPreferences: {
        maxCookingTime: null, // in minutes
        preferredDifficulty: 'all', // easy, medium, hard, all
        availableEquipment: [],
        experienceLevel: 'intermediate' // beginner, intermediate, expert
      },
      
      // Custom collections
      customCollections: [
        {
          id: 'quick-meals',
          name: 'Quick Meals',
          description: 'Recipes that can be made in 30 minutes or less',
          recipes: [],
          color: 'orange',
          icon: 'zap'
        },
        {
          id: 'comfort-food',
          name: 'Comfort Food',
          description: 'Hearty, satisfying dishes for cozy nights',
          recipes: [],
          color: 'amber',
          icon: 'heart'
        }
      ],
      
      // App settings
      appSettings: {
        theme: 'system', // light, dark, system
        notifications: true,
        autoSaveSearches: true,
        offlineMode: true,
        measurementUnit: 'metric', // metric, imperial
        language: 'en'
      },
      
      // Personalization data
      personalData: {
        name: '',
        cookingExperience: '',
        allergies: [],
        dislikedIngredients: []
      },
      
      // Statistics and insights
      stats: {
        recipesViewed: 0,
        recipesCooked: 0,
        favoritesAdded: 0,
        searchesPerformed: 0,
        mostViewedCategory: '',
        cookingStreak: 0,
        lastActivity: null
      }
    };
  }

  /**
   * Get all user preferences
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return { ...this.defaultPreferences };
      
      const preferences = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return this.mergeWithDefaults(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return { ...this.defaultPreferences };
    }
  }

  /**
   * Save user preferences
   */
  savePreferences(preferences) {
    try {
      const merged = this.mergeWithDefaults(preferences);
      localStorage.setItem(this.storageKey, JSON.stringify(merged));
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  /**
   * Merge preferences with defaults
   */
  mergeWithDefaults(preferences) {
    return {
      ...this.defaultPreferences,
      ...preferences,
      dietaryRestrictions: {
        ...this.defaultPreferences.dietaryRestrictions,
        ...preferences.dietaryRestrictions
      },
      nutritionTargets: {
        ...this.defaultPreferences.nutritionTargets,
        ...preferences.nutritionTargets
      },
      cookingPreferences: {
        ...this.defaultPreferences.cookingPreferences,
        ...preferences.cookingPreferences
      },
      appSettings: {
        ...this.defaultPreferences.appSettings,
        ...preferences.appSettings
      },
      personalData: {
        ...this.defaultPreferences.personalData,
        ...preferences.personalData
      },
      stats: {
        ...this.defaultPreferences.stats,
        ...preferences.stats
      }
    };
  }

  /**
   * Update specific preference section
   */
  updatePreference(section, data) {
    const preferences = this.getPreferences();
    preferences[section] = { ...preferences[section], ...data };
    return this.savePreferences(preferences);
  }

  /**
   * Add favorite cuisine
   */
  addFavoriteCuisine(cuisine) {
    const preferences = this.getPreferences();
    if (!preferences.favoriteCuisines.includes(cuisine)) {
      preferences.favoriteCuisines.push(cuisine);
      return this.savePreferences(preferences);
    }
    return true;
  }

  /**
   * Remove favorite cuisine
   */
  removeFavoriteCuisine(cuisine) {
    const preferences = this.getPreferences();
    preferences.favoriteCuisines = preferences.favoriteCuisines.filter(c => c !== cuisine);
    return this.savePreferences(preferences);
  }

  /**
   * Update dietary restrictions
   */
  updateDietaryRestrictions(restrictions) {
    return this.updatePreference('dietaryRestrictions', restrictions);
  }

  /**
   * Create custom collection
   */
  createCustomCollection(collection) {
    const preferences = this.getPreferences();
    const newCollection = {
      id: this.generateCollectionId(collection.name),
      name: collection.name,
      description: collection.description || '',
      recipes: [],
      color: collection.color || 'blue',
      icon: collection.icon || 'bookmark',
      createdAt: Date.now()
    };
    
    preferences.customCollections.push(newCollection);
    this.savePreferences(preferences);
    return newCollection;
  }

  /**
   * Add recipe to custom collection
   */
  addToCustomCollection(collectionId, recipe) {
    const preferences = this.getPreferences();
    const collection = preferences.customCollections.find(c => c.id === collectionId);
    
    if (collection && !collection.recipes.find(r => r.id === recipe.id)) {
      collection.recipes.push({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        addedAt: Date.now()
      });
      return this.savePreferences(preferences);
    }
    return false;
  }

  /**
   * Remove recipe from custom collection
   */
  removeFromCustomCollection(collectionId, recipeId) {
    const preferences = this.getPreferences();
    const collection = preferences.customCollections.find(c => c.id === collectionId);
    
    if (collection) {
      collection.recipes = collection.recipes.filter(r => r.id !== recipeId);
      return this.savePreferences(preferences);
    }
    return false;
  }

  /**
   * Delete custom collection
   */
  deleteCustomCollection(collectionId) {
    const preferences = this.getPreferences();
    preferences.customCollections = preferences.customCollections.filter(c => c.id !== collectionId);
    return this.savePreferences(preferences);
  }

  /**
   * Update statistics
   */
  updateStats(statKey, value = 1) {
    const preferences = this.getPreferences();
    
    if (typeof value === 'number') {
      preferences.stats[statKey] = (preferences.stats[statKey] || 0) + value;
    } else {
      preferences.stats[statKey] = value;
    }
    
    preferences.stats.lastActivity = Date.now();
    return this.savePreferences(preferences);
  }

  /**
   * Get personalized recipe recommendations
   */
  getRecommendationFilters() {
    const preferences = this.getPreferences();
    const filters = {};

    // Apply dietary restrictions
    const activeRestrictions = Object.entries(preferences.dietaryRestrictions)
      .filter(([_, active]) => active)
      .map(([restriction]) => restriction);
    
    if (activeRestrictions.length > 0) {
      // Map dietary restrictions to API parameters
      const dietMap = {
        vegetarian: 'vegetarian',
        vegan: 'vegan',
        glutenFree: 'gluten free',
        dairyFree: 'dairy free',
        nutFree: 'tree nut free',
        lowCarb: 'low carb',
        keto: 'ketogenic',
        paleo: 'paleo'
      };
      
      filters.diet = activeRestrictions
        .map(restriction => dietMap[restriction])
        .filter(Boolean)
        .join(',');
    }

    // Apply cuisine preferences
    if (preferences.favoriteCuisines.length > 0) {
      filters.cuisine = preferences.favoriteCuisines.join(',');
    }

    // Apply cooking time preference
    if (preferences.cookingPreferences.maxCookingTime) {
      filters.maxReadyTime = preferences.cookingPreferences.maxCookingTime;
    }

    // Apply nutrition targets
    if (preferences.nutritionTargets.maxCalories) {
      filters.maxCalories = preferences.nutritionTargets.maxCalories;
    }

    return filters;
  }

  /**
   * Generate unique collection ID
   */
  generateCollectionId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\\s-]/g, '')
      .replace(/\\s+/g, '-')
      + '-' + Date.now().toString(36);
  }

  /**
   * Export preferences for backup
   */
  exportPreferences() {
    const preferences = this.getPreferences();
    const exportData = {
      ...preferences,
      exportedAt: Date.now(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import preferences from backup
   */
  importPreferences(jsonData) {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validate structure
      if (!importedData.version) {
        throw new Error('Invalid preferences file');
      }
      
      // Remove metadata
      delete importedData.exportedAt;
      delete importedData.version;
      
      return this.savePreferences(importedData);
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }

  /**
   * Reset preferences to default
   */
  resetPreferences() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }

  /**
   * Get cuisine recommendations based on user history
   */
  getCuisineRecommendations() {
    const preferences = this.getPreferences();
    const favorites = LocalStorageManager.getFavorites();
    
    // Analyze favorite recipes for cuisine patterns
    const cuisineCount = {};
    favorites.forEach(recipe => {
      if (recipe.cuisine) {
        cuisineCount[recipe.cuisine] = (cuisineCount[recipe.cuisine] || 0) + 1;
      }
    });
    
    // Sort by frequency
    const recommendations = Object.entries(cuisineCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([cuisine, count]) => ({ cuisine, count }));
    
    return recommendations;
  }
}

// Create singleton instance
export const userPreferencesManager = new UserPreferencesManager();

export default UserPreferencesManager;