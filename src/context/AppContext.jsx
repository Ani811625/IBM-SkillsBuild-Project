import React, { createContext, useContext, useReducer, useEffect } from 'react';
import LocalStorageManager from '../utils/localStorage';

// Initial state
const initialState = {
  // UI State
  darkMode: true,
  loading: false,
  error: null,
  
  // Recipe State
  recipes: [],
  currentRecipe: null,
  searchQuery: '',
  searchResults: [],
  featuredRecipes: [],
  randomRecipe: null,
  
  // User Data
  favorites: [],
  recentSearches: [],
  mealPlanner: {},
  shoppingList: [],
  userPreferences: {},
  
  // Search State
  searchFilters: {
    diet: '',
    cuisine: '',
    mealType: '',
    cookingTime: '',
    difficulty: ''
  },
  
  // Navigation
  currentPage: 'home',
  showSplash: true
};

// Action types
const actionTypes = {
  // UI Actions
  SET_DARK_MODE: 'SET_DARK_MODE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Recipe Actions
  SET_RECIPES: 'SET_RECIPES',
  SET_CURRENT_RECIPE: 'SET_CURRENT_RECIPE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_FEATURED_RECIPES: 'SET_FEATURED_RECIPES',
  SET_RANDOM_RECIPE: 'SET_RANDOM_RECIPE',
  ADD_RECIPE: 'ADD_RECIPE',
  
  // User Data Actions
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_RECENT_SEARCHES: 'SET_RECENT_SEARCHES',
  ADD_RECENT_SEARCH: 'ADD_RECENT_SEARCH',
  SET_MEAL_PLANNER: 'SET_MEAL_PLANNER',
  UPDATE_MEAL_PLANNER: 'UPDATE_MEAL_PLANNER',
  SET_SHOPPING_LIST: 'SET_SHOPPING_LIST',
  UPDATE_SHOPPING_LIST: 'UPDATE_SHOPPING_LIST',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES',
  
  // Search Actions
  SET_SEARCH_FILTERS: 'SET_SEARCH_FILTERS',
  UPDATE_SEARCH_FILTER: 'UPDATE_SEARCH_FILTER',
  CLEAR_SEARCH_FILTERS: 'CLEAR_SEARCH_FILTERS',
  
  // Navigation Actions
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  HIDE_SPLASH: 'HIDE_SPLASH',
  
  // Bulk Actions
  INITIALIZE_APP: 'INITIALIZE_APP',
  RESET_APP: 'RESET_APP'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    // UI Actions
    case actionTypes.SET_DARK_MODE:
      return { ...state, darkMode: action.payload };
      
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    // Recipe Actions
    case actionTypes.SET_RECIPES:
      return { ...state, recipes: action.payload };
      
    case actionTypes.SET_CURRENT_RECIPE:
      return { ...state, currentRecipe: action.payload };
      
    case actionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
      
    case actionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
      
    case actionTypes.SET_FEATURED_RECIPES:
      return { ...state, featuredRecipes: action.payload };
      
    case actionTypes.SET_RANDOM_RECIPE:
      return { ...state, randomRecipe: action.payload };
      
    case actionTypes.ADD_RECIPE:
      return { 
        ...state, 
        recipes: [...state.recipes, action.payload]
      };
    
    // User Data Actions
    case actionTypes.SET_FAVORITES:
      return { ...state, favorites: action.payload };
      
    case actionTypes.ADD_FAVORITE:
      if (!state.favorites.find(fav => fav.id === action.payload.id)) {
        return { 
          ...state, 
          favorites: [...state.favorites, action.payload]
        };
      }
      return state;
      
    case actionTypes.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.id !== action.payload)
      };
      
    case actionTypes.SET_RECENT_SEARCHES:
      return { ...state, recentSearches: action.payload };
      
    case actionTypes.ADD_RECENT_SEARCH:
      const filteredSearches = state.recentSearches.filter(
        search => search.term.toLowerCase() !== action.payload.toLowerCase()
      );
      return {
        ...state,
        recentSearches: [
          { term: action.payload, timestamp: new Date().toISOString() },
          ...filteredSearches
        ].slice(0, 10)
      };
      
    case actionTypes.SET_MEAL_PLANNER:
      return { ...state, mealPlanner: action.payload };
      
    case actionTypes.UPDATE_MEAL_PLANNER:
      return {
        ...state,
        mealPlanner: { ...state.mealPlanner, ...action.payload }
      };
      
    case actionTypes.SET_SHOPPING_LIST:
      return { ...state, shoppingList: action.payload };
      
    case actionTypes.UPDATE_SHOPPING_LIST:
      return { ...state, shoppingList: action.payload };
      
    case actionTypes.SET_USER_PREFERENCES:
      return { ...state, userPreferences: action.payload };
      
    case actionTypes.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload }
      };
    
    // Search Actions
    case actionTypes.SET_SEARCH_FILTERS:
      return { ...state, searchFilters: action.payload };
      
    case actionTypes.UPDATE_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: {
          ...state.searchFilters,
          [action.payload.key]: action.payload.value
        }
      };
      
    case actionTypes.CLEAR_SEARCH_FILTERS:
      return {
        ...state,
        searchFilters: {
          diet: '',
          cuisine: '',
          mealType: '',
          cookingTime: '',
          difficulty: ''
        }
      };
    
    // Navigation Actions
    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
      
    case actionTypes.HIDE_SPLASH:
      return { ...state, showSplash: false };
    
    // Bulk Actions
    case actionTypes.INITIALIZE_APP:
      return {
        ...state,
        ...action.payload,
        loading: false
      };
      
    case actionTypes.RESET_APP:
      return { ...initialState, showSplash: false };
    
    default:
      return state;
  }
}

// Create contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app data from localStorage on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        
        // Load data from localStorage
        const favorites = LocalStorageManager.getFavorites();
        const recentSearches = LocalStorageManager.getRecentSearches();
        const mealPlanner = LocalStorageManager.getMealPlanner();
        const shoppingList = LocalStorageManager.getShoppingList();
        const userPreferences = LocalStorageManager.getUserPreferences();
        
        // Always apply dark mode
        document.documentElement.classList.add('dark');
        
        // Initialize state
        dispatch({
          type: actionTypes.INITIALIZE_APP,
          payload: {
            darkMode: true,
            favorites,
            recentSearches,
            mealPlanner,
            shoppingList,
            userPreferences
          }
        });
        
        // Hide splash screen after initialization
        setTimeout(() => {
          dispatch({ type: actionTypes.HIDE_SPLASH });
        }, 4000); // 4 seconds to show splash
        
      } catch (error) {
        console.error('Error initializing app:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: 'Failed to initialize app' });
      }
    };
    
    initializeApp();
  }, []);

  // Auto-save to localStorage when relevant state changes
  useEffect(() => {
    if (state.favorites.length >= 0) {
      LocalStorageManager.setItem(LocalStorageManager.KEYS.FAVORITES, state.favorites);
    }
  }, [state.favorites]);

  useEffect(() => {
    if (state.recentSearches.length >= 0) {
      LocalStorageManager.setItem(LocalStorageManager.KEYS.RECENT_SEARCHES, state.recentSearches);
    }
  }, [state.recentSearches]);

  useEffect(() => {
    if (Object.keys(state.mealPlanner).length > 0) {
      LocalStorageManager.setItem(LocalStorageManager.KEYS.MEAL_PLANNER, state.mealPlanner);
    }
  }, [state.mealPlanner]);

  useEffect(() => {
    if (state.shoppingList.length >= 0) {
      LocalStorageManager.setItem(LocalStorageManager.KEYS.SHOPPING_LIST, state.shoppingList);
    }
  }, [state.shoppingList]);

  useEffect(() => {
    if (Object.keys(state.userPreferences).length > 0) {
      LocalStorageManager.setItem(LocalStorageManager.KEYS.USER_PREFERENCES, state.userPreferences);
    }
  }, [state.userPreferences]);

  useEffect(() => {
    // Always save dark mode as true and ensure dark class is applied
    LocalStorageManager.setDarkMode(true);
    document.documentElement.classList.add('dark');
  }, [state.darkMode]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// Custom hooks
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}

export function useApp() {
  return [useAppState(), useAppDispatch()];
}

// Action creators
export const actions = {
  // UI Actions
  setDarkMode: (isDark) => ({ type: actionTypes.SET_DARK_MODE, payload: isDark }),
  setLoading: (loading) => ({ type: actionTypes.SET_LOADING, payload: loading }),
  setError: (error) => ({ type: actionTypes.SET_ERROR, payload: error }),
  clearError: () => ({ type: actionTypes.CLEAR_ERROR }),
  
  // Recipe Actions
  setRecipes: (recipes) => ({ type: actionTypes.SET_RECIPES, payload: recipes }),
  setCurrentRecipe: (recipe) => ({ type: actionTypes.SET_CURRENT_RECIPE, payload: recipe }),
  setSearchQuery: (query) => ({ type: actionTypes.SET_SEARCH_QUERY, payload: query }),
  setSearchResults: (results) => ({ type: actionTypes.SET_SEARCH_RESULTS, payload: results }),
  setFeaturedRecipes: (recipes) => ({ type: actionTypes.SET_FEATURED_RECIPES, payload: recipes }),
  setRandomRecipe: (recipe) => ({ type: actionTypes.SET_RANDOM_RECIPE, payload: recipe }),
  addRecipe: (recipe) => ({ type: actionTypes.ADD_RECIPE, payload: recipe }),
  
  // User Data Actions
  setFavorites: (favorites) => ({ type: actionTypes.SET_FAVORITES, payload: favorites }),
  addFavorite: (recipe) => ({ type: actionTypes.ADD_FAVORITE, payload: recipe }),
  removeFavorite: (recipeId) => ({ type: actionTypes.REMOVE_FAVORITE, payload: recipeId }),
  addRecentSearch: (term) => ({ type: actionTypes.ADD_RECENT_SEARCH, payload: term }),
  updateMealPlanner: (update) => ({ type: actionTypes.UPDATE_MEAL_PLANNER, payload: update }),
  updateShoppingList: (list) => ({ type: actionTypes.UPDATE_SHOPPING_LIST, payload: list }),
  updateUserPreferences: (prefs) => ({ type: actionTypes.UPDATE_USER_PREFERENCES, payload: prefs }),
  
  // Search Actions
  updateSearchFilter: (key, value) => ({ 
    type: actionTypes.UPDATE_SEARCH_FILTER, 
    payload: { key, value } 
  }),
  clearSearchFilters: () => ({ type: actionTypes.CLEAR_SEARCH_FILTERS }),
  
  // Navigation Actions
  setCurrentPage: (page) => ({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
  hideSplash: () => ({ type: actionTypes.HIDE_SPLASH }),
  
  // Bulk Actions
  resetApp: () => ({ type: actionTypes.RESET_APP })
};

export { actionTypes };