/**
 * Local Storage utility for managing app data
 */

class LocalStorageManager {
  // Keys for different data types
  static KEYS = {
    FAVORITES: 'recipe_finder_favorites',
    RECENT_SEARCHES: 'recipe_finder_recent_searches',
    MEAL_PLANNER: 'recipe_finder_meal_planner',
    DARK_MODE: 'recipe_finder_dark_mode',
    USER_PREFERENCES: 'recipe_finder_user_preferences',
    SHOPPING_LIST: 'recipe_finder_shopping_list'
  };

  /**
   * Generic method to save data to localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  static setItem(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage with key ${key}:`, error);
      return false;
    }
  }

  /**
   * Generic method to get data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed data or default value
   */
  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage with key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage with key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app data from localStorage
   */
  static clearAll() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Favorites Management
  static getFavorites() {
    return this.getItem(this.KEYS.FAVORITES, []);
  }

  static addToFavorites(recipe) {
    const favorites = this.getFavorites();
    const isAlreadyFavorite = favorites.some(fav => fav.id === recipe.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favorites, { ...recipe, addedAt: new Date().toISOString() }];
      return this.setItem(this.KEYS.FAVORITES, updatedFavorites);
    }
    
    return false; // Already in favorites
  }

  static removeFromFavorites(recipeId) {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
    return this.setItem(this.KEYS.FAVORITES, updatedFavorites);
  }

  static isFavorite(recipeId) {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === recipeId);
  }

  // Recent Searches Management
  static getRecentSearches() {
    return this.getItem(this.KEYS.RECENT_SEARCHES, []);
  }

  static addRecentSearch(searchTerm) {
    if (!searchTerm.trim()) return false;
    
    const recentSearches = this.getRecentSearches();
    const filteredSearches = recentSearches.filter(search => 
      search.term.toLowerCase() !== searchTerm.toLowerCase()
    );
    
    const updatedSearches = [
      { term: searchTerm, timestamp: new Date().toISOString() },
      ...filteredSearches
    ].slice(0, 10); // Keep only last 10 searches
    
    return this.setItem(this.KEYS.RECENT_SEARCHES, updatedSearches);
  }

  static clearRecentSearches() {
    return this.removeItem(this.KEYS.RECENT_SEARCHES);
  }

  // Meal Planner Management
  static getMealPlanner() {
    const defaultPlanner = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };
    return this.getItem(this.KEYS.MEAL_PLANNER, defaultPlanner);
  }

  static addRecipeToMealPlan(day, recipe, mealType = 'dinner') {
    const mealPlanner = this.getMealPlanner();
    
    if (!mealPlanner[day]) {
      mealPlanner[day] = [];
    }
    
    const mealEntry = {
      ...recipe,
      mealType,
      addedAt: new Date().toISOString()
    };
    
    mealPlanner[day].push(mealEntry);
    return this.setItem(this.KEYS.MEAL_PLANNER, mealPlanner);
  }

  static removeRecipeFromMealPlan(day, recipeId) {
    const mealPlanner = this.getMealPlanner();
    
    if (mealPlanner[day]) {
      mealPlanner[day] = mealPlanner[day].filter(meal => meal.id !== recipeId);
      return this.setItem(this.KEYS.MEAL_PLANNER, mealPlanner);
    }
    
    return false;
  }

  static clearMealPlan() {
    return this.removeItem(this.KEYS.MEAL_PLANNER);
  }

  // Dark Mode Management
  static getDarkMode() {
    return this.getItem(this.KEYS.DARK_MODE, false);
  }

  static setDarkMode(isDark) {
    return this.setItem(this.KEYS.DARK_MODE, isDark);
  }

  // User Preferences Management
  static getUserPreferences() {
    const defaultPreferences = {
      language: 'en',
      measurements: 'metric', // or 'imperial'
      dietaryRestrictions: [],
      allergens: [],
      defaultServings: 4,
      autoSaveSearches: true,
      showNutritionInfo: true,
      defaultMealType: 'dinner'
    };
    return this.getItem(this.KEYS.USER_PREFERENCES, defaultPreferences);
  }

  static updateUserPreferences(preferences) {
    const currentPrefs = this.getUserPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };
    return this.setItem(this.KEYS.USER_PREFERENCES, updatedPrefs);
  }

  // Shopping List Management
  static getShoppingList() {
    return this.getItem(this.KEYS.SHOPPING_LIST, []);
  }

  static addToShoppingList(ingredient) {
    const shoppingList = this.getShoppingList();
    const existingItem = shoppingList.find(item => 
      item.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    
    if (existingItem) {
      existingItem.amount += ingredient.amount;
      existingItem.recipes = [...new Set([...existingItem.recipes, ingredient.recipeId])];
    } else {
      shoppingList.push({
        ...ingredient,
        id: Date.now(),
        checked: false,
        addedAt: new Date().toISOString(),
        recipes: [ingredient.recipeId]
      });
    }
    
    return this.setItem(this.KEYS.SHOPPING_LIST, shoppingList);
  }

  static removeFromShoppingList(ingredientId) {
    const shoppingList = this.getShoppingList();
    const updatedList = shoppingList.filter(item => item.id !== ingredientId);
    return this.setItem(this.KEYS.SHOPPING_LIST, updatedList);
  }

  static toggleShoppingListItem(ingredientId) {
    const shoppingList = this.getShoppingList();
    const item = shoppingList.find(item => item.id === ingredientId);
    
    if (item) {
      item.checked = !item.checked;
      return this.setItem(this.KEYS.SHOPPING_LIST, shoppingList);
    }
    
    return false;
  }

  static clearShoppingList() {
    return this.removeItem(this.KEYS.SHOPPING_LIST);
  }

  // Export/Import Data
  static exportData() {
    try {
      const data = {};
      Object.entries(this.KEYS).forEach(([key, storageKey]) => {
        data[key] = this.getItem(storageKey);
      });
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  static importData(data) {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (this.KEYS[key] && value !== null) {
          this.setItem(this.KEYS[key], value);
        }
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Utility methods
  static getStorageSize() {
    try {
      let total = 0;
      Object.values(this.KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          total += item.length;
        }
      });
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  static isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default LocalStorageManager;