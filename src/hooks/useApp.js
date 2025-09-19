import { useApp, actions } from '../context/AppContext';
import { useCallback } from 'react';
import RecipeService from '../services/recipeService';
import LocalStorageManager from '../utils/localStorage';

/**
 * Custom hook for managing recipes
 */
export function useRecipes() {
  const [state, dispatch] = useApp();

  const searchRecipes = useCallback(async (query, options = {}) => {
    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));
      
      const results = await RecipeService.searchRecipes(query, options);
      
      dispatch(actions.setSearchResults(results));
      dispatch(actions.setSearchQuery(query));
      
      // Add to recent searches if enabled
      if (state.userPreferences.autoSaveSearches !== false) {
        dispatch(actions.addRecentSearch(query));
      }
      
      dispatch(actions.setLoading(false));
      return results;
    } catch (error) {
      let errorMessage;
      
      if (error.message.includes('API key not configured')) {
        errorMessage = 'Please configure your Spoonacular API key to search recipes';
      } else if (error.response?.status === 402) {
        errorMessage = 'Daily API limit reached (150 calls). Please try again tomorrow or upgrade your plan.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid API key. Please check your Spoonacular API key configuration.';
      } else {
        errorMessage = `Failed to search recipes: ${error.message}`;
      }
      
      dispatch(actions.setError(errorMessage));
      dispatch(actions.setLoading(false));
      return [];
    }
  }, [state.userPreferences.autoSaveSearches, dispatch]);

  const getRecipeDetails = useCallback(async (recipeId) => {
    try {
      dispatch(actions.setLoading(true));
      const recipe = await RecipeService.getRecipeDetails(recipeId);
      dispatch(actions.setCurrentRecipe(recipe));
      dispatch(actions.setLoading(false));
      return recipe;
    } catch (error) {
      const errorMessage = error.message.includes('API key not configured') 
        ? 'Please configure your Spoonacular API key to view recipe details'
        : `Failed to load recipe: ${error.message}`;
      dispatch(actions.setError(errorMessage));
      dispatch(actions.setLoading(false));
      return null;
    }
  }, [dispatch]);

  const getRandomRecipe = useCallback(async () => {
    try {
      dispatch(actions.setLoading(true));
      const recipes = await RecipeService.getRandomRecipes(1);
      const randomRecipe = recipes[0] || null;
      dispatch(actions.setRandomRecipe(randomRecipe));
      dispatch(actions.setLoading(false));
      return randomRecipe;
    } catch (error) {
      const errorMessage = error.message.includes('API key not configured') 
        ? 'Please configure your Spoonacular API key to get random recipes'
        : `Failed to load random recipe: ${error.message}`;
      dispatch(actions.setError(errorMessage));
      dispatch(actions.setLoading(false));
      return null;
    }
  }, [dispatch]);

  const getFeaturedRecipes = useCallback(async (count = 6, filterOptions = {}) => {
    try {
      dispatch(actions.setLoading(true));
      // Use searchRecipes with filter options to get featured results from API
      const recipes = await RecipeService.searchRecipes('', {
        number: count,
        sort: 'popularity',
        ...filterOptions
      });
      dispatch(actions.setFeaturedRecipes(recipes));
      dispatch(actions.setLoading(false));
      return recipes;
    } catch (error) {
      let errorMessage;
      
      if (error.message.includes('API key not configured')) {
        errorMessage = 'Please configure your Spoonacular API key to view featured recipes';
      } else if (error.response?.status === 402) {
        errorMessage = 'Daily API limit reached (150 calls). Featured recipes unavailable until tomorrow.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid API key. Please check your configuration.';
      } else {
        errorMessage = `Failed to load featured recipes: ${error.message}`;
      }
      
      dispatch(actions.setError(errorMessage));
      dispatch(actions.setLoading(false));
      return [];
    }
  }, [dispatch]);

  const findRecipesByIngredients = useCallback(async (ingredients, options = {}) => {
    try {
      dispatch(actions.setLoading(true));
      const results = await RecipeService.findRecipesByIngredients(ingredients, options);
      dispatch(actions.setSearchResults(results));
      dispatch(actions.setLoading(false));
      return results;
    } catch (error) {
      const errorMessage = error.message.includes('API key not configured') 
        ? 'Please configure your Spoonacular API key to find recipes by ingredients'
        : `Failed to find recipes: ${error.message}`;
      dispatch(actions.setError(errorMessage));
      dispatch(actions.setLoading(false));
      return [];
    }
  }, [dispatch]);

  return {
    recipes: state.recipes,
    searchResults: state.searchResults,
    currentRecipe: state.currentRecipe,
    featuredRecipes: state.featuredRecipes,
    randomRecipe: state.randomRecipe,
    searchQuery: state.searchQuery,
    loading: state.loading,
    error: state.error,
    searchRecipes,
    getRecipeDetails,
    getRandomRecipe,
    getFeaturedRecipes,
    findRecipesByIngredients
  };
}

/**
 * Custom hook for managing favorites
 */
export function useFavorites() {
  const [state, dispatch] = useApp();

  const addToFavorites = useCallback((recipe) => {
    const success = LocalStorageManager.addToFavorites(recipe);
    if (success) {
      dispatch(actions.addFavorite(recipe));
      return true;
    }
    return false;
  }, [dispatch]);

  const removeFromFavorites = useCallback((recipeId) => {
    const success = LocalStorageManager.removeFromFavorites(recipeId);
    if (success) {
      dispatch(actions.removeFavorite(recipeId));
      return true;
    }
    return false;
  }, [dispatch]);

  const isFavorite = useCallback((recipeId) => {
    return state.favorites.some(fav => fav.id === recipeId);
  }, [state.favorites]);

  const toggleFavorite = useCallback((recipe) => {
    if (isFavorite(recipe.id)) {
      return removeFromFavorites(recipe.id);
    } else {
      return addToFavorites(recipe);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  return {
    favorites: state.favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
}

/**
 * Custom hook for managing meal planner
 */
export function useMealPlanner() {
  const [state, dispatch] = useApp();

  const addRecipeToMealPlan = useCallback((day, recipe, mealType = 'dinner') => {
    const success = LocalStorageManager.addRecipeToMealPlan(day, recipe, mealType);
    if (success) {
      const updatedPlanner = LocalStorageManager.getMealPlanner();
      dispatch(actions.updateMealPlanner(updatedPlanner));
      return true;
    }
    return false;
  }, [dispatch]);

  const removeRecipeFromMealPlan = useCallback((day, recipeId) => {
    const success = LocalStorageManager.removeRecipeFromMealPlan(day, recipeId);
    if (success) {
      const updatedPlanner = LocalStorageManager.getMealPlanner();
      dispatch(actions.updateMealPlanner(updatedPlanner));
      return true;
    }
    return false;
  }, [dispatch]);

  const clearMealPlan = useCallback(() => {
    const success = LocalStorageManager.clearMealPlan();
    if (success) {
      const emptyPlanner = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      };
      dispatch(actions.updateMealPlanner(emptyPlanner));
      return true;
    }
    return false;
  }, [dispatch]);

  const getMealsForDay = useCallback((day) => {
    return state.mealPlanner[day] || [];
  }, [state.mealPlanner]);

  const getWeeklyMealSummary = useCallback(() => {
    const summary = {
      totalMeals: 0,
      mealTypes: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      days: []
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      const meals = getMealsForDay(day);
      summary.totalMeals += meals.length;
      
      meals.forEach(meal => {
        summary.mealTypes[meal.mealType] = (summary.mealTypes[meal.mealType] || 0) + 1;
      });
      
      summary.days.push({
        day,
        mealCount: meals.length,
        meals
      });
    });

    return summary;
  }, [getMealsForDay]);

  return {
    mealPlanner: state.mealPlanner,
    addRecipeToMealPlan,
    removeRecipeFromMealPlan,
    clearMealPlan,
    getMealsForDay,
    getWeeklyMealSummary
  };
}

/**
 * Custom hook for managing dark mode
 */
export function useDarkMode() {
  const [state, dispatch] = useApp();

  const toggleDarkMode = useCallback(() => {
    dispatch(actions.setDarkMode(!state.darkMode));
  }, [state.darkMode, dispatch]);

  const setDarkMode = useCallback((isDark) => {
    dispatch(actions.setDarkMode(isDark));
  }, [dispatch]);

  return {
    darkMode: state.darkMode,
    toggleDarkMode,
    setDarkMode
  };
}

/**
 * Custom hook for managing search functionality
 */
export function useSearch() {
  const [state, dispatch] = useApp();

  const updateSearchFilter = useCallback((key, value) => {
    dispatch(actions.updateSearchFilter(key, value));
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    dispatch(actions.clearSearchFilters());
  }, [dispatch]);

  const clearRecentSearches = useCallback(() => {
    LocalStorageManager.clearRecentSearches();
    dispatch(actions.setRecentSearches([]));
  }, [dispatch]);

  return {
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    searchFilters: state.searchFilters,
    recentSearches: state.recentSearches,
    updateSearchFilter,
    clearFilters,
    clearRecentSearches
  };
}

/**
 * Custom hook for managing user preferences
 */
export function usePreferences() {
  const [state, dispatch] = useApp();

  const updatePreferences = useCallback((newPreferences) => {
    const success = LocalStorageManager.updateUserPreferences(newPreferences);
    if (success) {
      dispatch(actions.updateUserPreferences(newPreferences));
      return true;
    }
    return false;
  }, [dispatch]);

  return {
    preferences: state.userPreferences,
    updatePreferences
  };
}

/**
 * Custom hook for managing shopping list
 */
export function useShoppingList() {
  const [state, dispatch] = useApp();

  const addToShoppingList = useCallback((ingredient) => {
    const success = LocalStorageManager.addToShoppingList(ingredient);
    if (success) {
      const updatedList = LocalStorageManager.getShoppingList();
      dispatch(actions.updateShoppingList(updatedList));
      return true;
    }
    return false;
  }, [dispatch]);

  const removeFromShoppingList = useCallback((ingredientId) => {
    const success = LocalStorageManager.removeFromShoppingList(ingredientId);
    if (success) {
      const updatedList = LocalStorageManager.getShoppingList();
      dispatch(actions.updateShoppingList(updatedList));
      return true;
    }
    return false;
  }, [dispatch]);

  const toggleShoppingListItem = useCallback((ingredientId) => {
    const success = LocalStorageManager.toggleShoppingListItem(ingredientId);
    if (success) {
      const updatedList = LocalStorageManager.getShoppingList();
      dispatch(actions.updateShoppingList(updatedList));
      return true;
    }
    return false;
  }, [dispatch]);

  const clearShoppingList = useCallback(() => {
    const success = LocalStorageManager.clearShoppingList();
    if (success) {
      dispatch(actions.updateShoppingList([]));
      return true;
    }
    return false;
  }, [dispatch]);

  const addRecipeIngredientsToShoppingList = useCallback((recipe) => {
    if (!recipe.extendedIngredients) return false;
    
    let successCount = 0;
    recipe.extendedIngredients.forEach(ingredient => {
      const success = addToShoppingList({
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        recipeId: recipe.id,
        recipeName: recipe.title
      });
      if (success) successCount++;
    });
    
    return successCount > 0;
  }, [addToShoppingList]);

  return {
    shoppingList: state.shoppingList,
    addToShoppingList,
    removeFromShoppingList,
    toggleShoppingListItem,
    clearShoppingList,
    addRecipeIngredientsToShoppingList
  };
}