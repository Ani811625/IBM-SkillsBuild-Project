import axios from 'axios';
import { recipeCache, searchCache, featuredCache, CACHE_TTL } from '../utils/cacheManager';
import { apiUsageManager } from '../utils/apiUsageManager';

// Spoonacular API configuration
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'YOUR_SPOONACULAR_API_KEY';
const BASE_URL = 'https://api.spoonacular.com/recipes';

// Check if API key is configured
const isApiConfigured = () => {
  return API_KEY && API_KEY !== 'YOUR_SPOONACULAR_API_KEY' && API_KEY.length > 10;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
});

// Types for TypeScript-like documentation
/**
 * @typedef {Object} Recipe
 * @property {number} id - Recipe ID
 * @property {string} title - Recipe title
 * @property {string} image - Recipe image URL
 * @property {number} readyInMinutes - Cooking time in minutes
 * @property {number} servings - Number of servings
 * @property {string} summary - Recipe summary
 */

/**
 * @typedef {Object} RecipeDetails
 * @property {number} id - Recipe ID
 * @property {string} title - Recipe title
 * @property {string} image - Recipe image URL
 * @property {number} readyInMinutes - Cooking time
 * @property {number} servings - Number of servings
 * @property {string} summary - Recipe summary
 * @property {Array} extendedIngredients - List of ingredients
 * @property {Array} analyzedInstructions - Cooking instructions
 * @property {Object} nutrition - Nutritional information
 */

class RecipeService {
  /**
   * Check API configuration status
   * @returns {Object} API status information
   */
  static getApiStatus() {
    const configured = isApiConfigured();
    return {
      configured,
      hasApiKey: !!API_KEY && API_KEY !== 'YOUR_SPOONACULAR_API_KEY',
      usingLocalData: false, // Always false now - we only use API
      message: configured ? 
        '✅ API configured - Using Spoonacular API' : 
        '❌ API not configured - Please add your API key'
    };
  }

  /**
   * Test API connection
   * @returns {Promise<Object>} Connection test result
   */
  static async testConnection() {
    if (!isApiConfigured()) {
      return {
        success: false,
        message: 'API key not configured',
        usingLocalData: true
      };
    }

    try {
      const response = await api.get('/random', {
        params: { number: 1 }
      });
      
      return {
        success: true,
        message: 'API connection successful',
        remainingCalls: response.headers['x-api-quota-left'] || 'Unknown'
      };
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error.response?.data?.message || error.message}`,
        error: error.response?.data || error.message
      };
    }
  }
  /**
   * Search recipes by ingredients or query
   * @param {string} query - Search query (ingredients or dish name)
   * @param {Object} options - Additional search options
   * @returns {Promise<Array<Recipe>>} Array of recipes
   */
  static async searchRecipes(query, options = {}) {
    // Generate cache key
    const cacheKey = searchCache.generateKey('complexSearch', { query, ...options });
    
    // Try cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log('🎯 Using cached search results');
      apiUsageManager.recordCacheHit();
      return cached;
    }

    // Check API configuration
    if (!isApiConfigured()) {
      console.log('🔄 API not configured, using local recipes');
      return this.getLocalRecipes(query, options);
    }

    // Check API usage limits
    if (!apiUsageManager.canMakeCall()) {
      console.log('⚠️ API limit reached, using local recipes');
      return this.getLocalRecipes(query, options);
    }

    try {
      const {
        number = 12,
        offset = 0,
        type = '',
        diet = '',
        cuisine = '',
        intolerances = '',
        equipment = '',
        includeIngredients = '',
        excludeIngredients = '',
        fillIngredients = true,
        addRecipeInformation = true,
        addRecipeNutrition = false,
        instructionsRequired = true,
        sort = 'popularity',
        sortDirection = 'desc'
      } = options;

      console.log('🌐 Fetching recipes from Spoonacular API...');
      const response = await api.get('/complexSearch', {
        params: {
          query: query || undefined,
          number,
          offset,
          type,
          diet,
          cuisine,
          intolerances,
          equipment,
          includeIngredients,
          excludeIngredients,
          fillIngredients,
          addRecipeInformation,
          addRecipeNutrition,
          instructionsRequired,
          sort,
          sortDirection
        }
      });

      const results = response.data.results || [];
      
      // Record successful API call
      apiUsageManager.recordCall('/complexSearch', true);
      
      // Cache the results
      searchCache.set(cacheKey, results, CACHE_TTL.SEARCH_RESULTS);
      
      console.log(`✅ Found ${results.length} recipes from API`);
      return results;
    } catch (error) {
      console.error('❌ Error searching recipes via API:', error.response?.data || error.message);
      
      // Record failed API call
      apiUsageManager.recordCall('/complexSearch', false);
      
      // If API fails or limit reached, fallback to local recipes
      if (error.response?.status === 402 || error.response?.status === 429) {
        console.log('🔄 API limit reached, falling back to local recipes');
        return this.getLocalRecipes(query, options);
      }
      
      throw error;
    }
  }

  /**
   * Get detailed information about a specific recipe
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<RecipeDetails>} Detailed recipe information
   */
  static async getRecipeDetails(recipeId) {
    if (!isApiConfigured()) {
      throw new Error('API key not configured. Please add your Spoonacular API key to use this feature.');
    }

    try {
      console.log(`🌐 Fetching recipe details for ID: ${recipeId}`);
      const response = await api.get(`/${recipeId}/information`, {
        params: {
          includeNutrition: true,
        }
      });

      console.log(`✅ Successfully fetched details for: ${response.data.title}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching recipe details via API:', error.response?.data || error.message);
      throw error; // Don't fallback, throw error instead
    }
  }

  /**
   * Get random recipes
   * @param {number} number - Number of random recipes to fetch
   * @returns {Promise<Array<Recipe>>} Array of random recipes
   */
  static async getRandomRecipes(number = 1) {
    if (!isApiConfigured()) {
      throw new Error('API key not configured. Please add your Spoonacular API key to use this feature.');
    }

    try {
      console.log(`🌐 Fetching ${number} random recipes from Spoonacular API...`);
      const response = await api.get('/random', {
        params: {
          number,
          tags: 'main course,side dish,dessert,appetizer,breakfast'
        }
      });

      console.log(`✅ Found ${response.data.recipes?.length || 0} random recipes from API`);
      return response.data.recipes || [];
    } catch (error) {
      console.error('❌ Error fetching random recipes via API:', error.response?.data || error.message);
      throw error; // Don't fallback, throw error instead
    }
  }

  /**
   * Search recipes by ingredients
   * @param {Array<string>} ingredients - List of ingredients
   * @param {Object} options - Additional options
   * @returns {Promise<Array<Recipe>>} Array of recipes
   */
  static async findRecipesByIngredients(ingredients, options = {}) {
    if (!isApiConfigured()) {
      throw new Error('API key not configured. Please add your Spoonacular API key to use this feature.');
    }

    try {
      const {
        number = 12,
        limitLicense = true,
        ranking = 1,
        ignorePantry = true,
        maxReadyTime,
        minReadyTime
      } = options;

      console.log(`🌐 Searching recipes by ingredients: ${ingredients.join(', ')}`);
      
      const params = {
        ingredients: ingredients.join(','),
        number,
        limitLicense,
        ranking,
        ignorePantry
      };

      // Add time constraints if specified
      if (maxReadyTime) params.maxReadyTime = maxReadyTime;
      if (minReadyTime) params.minReadyTime = minReadyTime;

      const response = await api.get('/findByIngredients', {
        params
      });

      console.log(`✅ Found ${response.data?.length || 0} recipes matching ingredients`);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error finding recipes by ingredients via API:', error.response?.data || error.message);
      throw error; // Don't fallback, throw error instead
    }
  }

  /**
   * Get recipe nutrition information
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<Object>} Nutrition information
   */
  static async getRecipeNutrition(recipeId) {
    try {
      const response = await api.get(`/${recipeId}/nutritionWidget.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipe nutrition:', error);
      return this.getRecipeNutrition();
    }
  }

  /**
   * Get similar recipes
   * @param {number} recipeId - Recipe ID
   * @param {number} number - Number of similar recipes
   * @returns {Promise<Array<Recipe>>} Array of similar recipes
   */
  static async getSimilarRecipes(recipeId, number = 3) {
    try {
      const response = await api.get(`/${recipeId}/similar`, {
        params: { number }
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching similar recipes:', error);
      return this.getLocalRecipes('similar');
    }
  }

  /**
   * Get random recipes from local database
   * @param {number} number - Number of recipes to return
   * @returns {Array<Recipe>} Array of random local recipes
   */
  static getLocalRandomRecipes(number = 1) {
    const allRecipes = this.getLocalRecipes();
    const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, number);
  }

  /**
   * Find local recipes by ingredients
   * @param {Array<string>} ingredients - List of ingredients
   * @param {Object} options - Search options
   * @returns {Array<Recipe>} Array of matching recipes
   */
  static findLocalRecipesByIngredients(ingredients, options = {}) {
    const allRecipes = this.getLocalRecipes();
    const lowerIngredients = ingredients.map(ing => ing.toLowerCase());
    
    // Score recipes based on ingredient matches
    const scoredRecipes = allRecipes.map(recipe => {
      const recipeText = `${recipe.title} ${recipe.summary} ${recipe.category}`.toLowerCase();
      const matches = lowerIngredients.filter(ing => recipeText.includes(ing));
      
      return {
        ...recipe,
        score: matches.length,
        matchedIngredients: matches,
        matchPercentage: Math.round((matches.length / lowerIngredients.length) * 100)
      };
    });
    
    // Filter and sort by score
    const filtered = scoredRecipes
      .filter(recipe => recipe.score > 0)
      .sort((a, b) => b.score - a.score);
    
    // Apply time constraints if specified
    let results = filtered;
    if (options.maxReadyTime) {
      results = results.filter(recipe => recipe.readyInMinutes <= options.maxReadyTime);
    }
    if (options.minReadyTime) {
      results = results.filter(recipe => recipe.readyInMinutes >= options.minReadyTime);
    }
    
    return results.slice(0, options.number || 12);
  }
  static getLocalRecipes(query, options = {}) {
    const recipeDatabase = [
      // 🥗 Main Course - Vegetarian (10 total)
      {
        id: 1,
        title: "Paneer Butter Masala",
        image: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 45,
        servings: 4,
        summary: "Rich and creamy tomato-based curry with soft paneer cubes, perfect with naan or rice.",
        healthScore: 72,
        spoonacularScore: 88,
        pricePerServing: 3.80,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 2,
        title: "Palak Paneer",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 40,
        servings: 4,
        summary: "Creamy spinach curry with paneer cubes, packed with iron and flavor.",
        healthScore: 85,
        spoonacularScore: 90,
        pricePerServing: 3.50,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 3,
        title: "Dal Makhani",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 90,
        servings: 6,
        summary: "Slow-cooked black lentils in rich, creamy tomato gravy - a North Indian classic.",
        healthScore: 78,
        spoonacularScore: 92,
        pricePerServing: 2.80,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 4,
        title: "Veg Biryani",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 60,
        servings: 6,
        summary: "Aromatic basmati rice layered with spiced vegetables and herbs.",
        healthScore: 75,
        spoonacularScore: 89,
        pricePerServing: 4.20,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 5,
        title: "Chana Masala",
        image: "https://images.unsplash.com/photo-1626132647523-66b2bfbe8c80?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 35,
        servings: 4,
        summary: "Spiced chickpea curry in tomato and onion gravy, a popular North Indian dish.",
        healthScore: 82,
        spoonacularScore: 87,
        pricePerServing: 2.50,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 6,
        title: "Rajma",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 60,
        servings: 4,
        summary: "Kidney beans cooked in spiced tomato gravy, perfect with rice.",
        healthScore: 80,
        spoonacularScore: 85,
        pricePerServing: 2.80,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 7,
        title: "Baingan Bharta",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 45,
        servings: 4,
        summary: "Smoky roasted eggplant cooked with onions, tomatoes, and spices.",
        healthScore: 75,
        spoonacularScore: 83,
        pricePerServing: 2.20,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 8,
        title: "Aloo Gobi",
        image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 30,
        servings: 4,
        summary: "Dry curry of potatoes and cauliflower with aromatic spices.",
        healthScore: 78,
        spoonacularScore: 84,
        pricePerServing: 2.00,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 9,
        title: "Kadai Paneer",
        image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 40,
        servings: 4,
        summary: "Paneer cooked with bell peppers and onions in spicy tomato gravy.",
        healthScore: 73,
        spoonacularScore: 86,
        pricePerServing: 3.60,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 10,
        title: "Malai Kofta",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 50,
        servings: 4,
        summary: "Deep-fried cottage cheese and potato balls in rich creamy tomato gravy.",
        healthScore: 68,
        spoonacularScore: 90,
        pricePerServing: 4.20,
        category: "Main Course - Vegetarian",
        cuisine: "Indian",
        vegetarian: true
      },
      
      // Additional Popular International Dishes
      {
        id: 61,
        title: "Classic Margherita Pizza",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop&auto=format",
        readyInMinutes: 25,
        servings: 4,
        summary: "Traditional Italian pizza with fresh mozzarella, tomatoes, and basil.",
        healthScore: 65,
        spoonacularScore: 89,
        pricePerServing: 3.50,
        category: "Main Course",
        cuisine: "Italian",
        vegetarian: true
      },
      {
        id: 62,
        title: "Spaghetti Carbonara",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop&auto=format",
        readyInMinutes: 20,
        servings: 4,
        summary: "Creamy Italian pasta with eggs, cheese, and pancetta.",
        healthScore: 68,
        spoonacularScore: 92,
        pricePerServing: 4.20,
        category: "Main Course",
        cuisine: "Italian",
        vegetarian: false
      },
      {
        id: 63,
        title: "Chicken Stir Fry",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop&auto=format",
        readyInMinutes: 15,
        servings: 4,
        summary: "Quick and healthy stir-fried chicken with mixed vegetables.",
        healthScore: 82,
        spoonacularScore: 85,
        pricePerServing: 5.00,
        category: "Main Course",
        cuisine: "Asian",
        vegetarian: false
      },
      {
        id: 64,
        title: "Caesar Salad",
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop&auto=format",
        readyInMinutes: 10,
        servings: 2,
        summary: "Fresh romaine lettuce with parmesan cheese and classic caesar dressing.",
        healthScore: 75,
        spoonacularScore: 80,
        pricePerServing: 3.00,
        category: "Appetizer",
        cuisine: "American",
        vegetarian: true
      },
      {
        id: 65,
        title: "Chocolate Chip Cookies",
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format",
        readyInMinutes: 25,
        servings: 24,
        summary: "Classic homemade chocolate chip cookies, crispy outside and chewy inside.",
        healthScore: 45,
        spoonacularScore: 95,
        pricePerServing: 0.75,
        category: "Dessert",
        cuisine: "American",
        vegetarian: true
      },
      
      // 🍗 Main Course - Non-Vegetarian (10 total)
      {
        id: 11,
        title: "Chicken Biryani",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 75,
        servings: 6,
        summary: "Fragrant basmati rice layered with marinated chicken and aromatic spices.",
        healthScore: 70,
        spoonacularScore: 95,
        pricePerServing: 5.50,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 12,
        title: "Butter Chicken",
        image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 50,
        servings: 4,
        summary: "Tender chicken in rich, creamy tomato-based sauce with butter and cream.",
        healthScore: 68,
        spoonacularScore: 94,
        pricePerServing: 6.20,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 13,
        title: "Chicken Tikka Masala",
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 45,
        servings: 4,
        summary: "Grilled chicken tikka in spiced curry sauce with onions and peppers.",
        healthScore: 72,
        spoonacularScore: 91,
        pricePerServing: 5.80,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 14,
        title: "Rogan Josh",
        image: "https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 90,
        servings: 6,
        summary: "Aromatic Kashmiri mutton curry with rich red gravy and traditional spices.",
        healthScore: 75,
        spoonacularScore: 88,
        pricePerServing: 7.20,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 15,
        title: "Chicken Curry",
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 40,
        servings: 4,
        summary: "Traditional chicken curry with onions, tomatoes, and aromatic spices.",
        healthScore: 74,
        spoonacularScore: 87,
        pricePerServing: 5.20,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 16,
        title: "Fish Curry",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 35,
        servings: 4,
        summary: "Fresh fish cooked in coconut milk and spices, a coastal Indian delicacy.",
        healthScore: 78,
        spoonacularScore: 89,
        pricePerServing: 6.80,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 17,
        title: "Mutton Biryani",
        image: "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 120,
        servings: 8,
        summary: "Royal mutton biryani with aromatic basmati rice and tender meat pieces.",
        healthScore: 72,
        spoonacularScore: 93,
        pricePerServing: 8.50,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 18,
        title: "Chicken Korma",
        image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 55,
        servings: 4,
        summary: "Mild and creamy chicken curry with yogurt, nuts, and aromatic spices.",
        healthScore: 70,
        spoonacularScore: 88,
        pricePerServing: 6.00,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 19,
        title: "Tandoori Chicken",
        image: "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 60,
        servings: 4,
        summary: "Marinated chicken roasted in tandoor oven with yogurt and spices.",
        healthScore: 76,
        spoonacularScore: 90,
        pricePerServing: 5.80,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      {
        id: 20,
        title: "Keema Curry",
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 45,
        servings: 4,
        summary: "Spiced minced meat curry with peas and aromatic Indian spices.",
        healthScore: 73,
        spoonacularScore: 86,
        pricePerServing: 5.50,
        category: "Main Course - Non-Vegetarian",
        cuisine: "Indian",
        vegetarian: false
      },
      
      // 🥪 Street Food & Snacks (10 total)
      {
        id: 21,
        title: "Pani Puri",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 30,
        servings: 4,
        summary: "Crispy hollow puris filled with spicy, tangy water and chutneys.",
        healthScore: 60,
        spoonacularScore: 85,
        pricePerServing: 1.50,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 22,
        title: "Pav Bhaji",
        image: "https://images.unsplash.com/photo-1626132647523-66b2bfbe8c80?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 40,
        servings: 4,
        summary: "Thick vegetable curry served with buttered bread rolls - Mumbai street food favorite.",
        healthScore: 65,
        spoonacularScore: 87,
        pricePerServing: 2.80,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 23,
        title: "Samosa",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 45,
        servings: 6,
        summary: "Crispy triangular pastries stuffed with spiced potatoes and peas.",
        healthScore: 58,
        spoonacularScore: 89,
        pricePerServing: 1.20,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 24,
        title: "Dhokla",
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 25,
        servings: 4,
        summary: "Steamed savory cake made from fermented gram flour batter - Gujarati specialty.",
        healthScore: 80,
        spoonacularScore: 82,
        pricePerServing: 2.00,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 25,
        title: "Chaat",
        image: "https://images.unsplash.com/photo-1626132647523-66b2bfbe8c80?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 20,
        servings: 2,
        summary: "Mixed street food snack with chutneys, yogurt, and crispy sev.",
        healthScore: 62,
        spoonacularScore: 84,
        pricePerServing: 1.80,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 26,
        title: "Vada Pav",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 30,
        servings: 4,
        summary: "Deep-fried potato dumpling served in bread bun with chutneys - Mumbai's burger.",
        healthScore: 55,
        spoonacularScore: 88,
        pricePerServing: 1.50,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 27,
        title: "Bhel Puri",
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 15,
        servings: 2,
        summary: "Crunchy puffed rice mixed with vegetables, chutneys, and sev.",
        healthScore: 58,
        spoonacularScore: 83,
        pricePerServing: 1.20,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 28,
        title: "Dahi Puri",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 20,
        servings: 4,
        summary: "Crispy puris topped with yogurt, chutneys, and spiced water.",
        healthScore: 60,
        spoonacularScore: 85,
        pricePerServing: 1.60,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 29,
        title: "Aloo Tikki",
        image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 25,
        servings: 4,
        summary: "Crispy potato patties served with chutneys and yogurt.",
        healthScore: 56,
        spoonacularScore: 86,
        pricePerServing: 1.40,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 30,
        title: "Kachori",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 35,
        servings: 6,
        summary: "Deep-fried bread stuffed with spiced lentils or onions.",
        healthScore: 54,
        spoonacularScore: 87,
        pricePerServing: 1.30,
        category: "Street Food & Snacks",
        cuisine: "Indian",
        vegetarian: true
      },
      
      // 🍞 Breads & Rice (10 total)
      {
        id: 31,
        title: "Garlic Naan",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 30,
        servings: 4,
        summary: "Soft, pillowy bread topped with garlic and cilantro, baked in tandoor.",
        healthScore: 62,
        spoonacularScore: 86,
        pricePerServing: 1.80,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 32,
        title: "Aloo Paratha",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 35,
        servings: 4,
        summary: "Stuffed flatbread with spiced potato filling, served with butter and yogurt.",
        healthScore: 68,
        spoonacularScore: 88,
        pricePerServing: 2.20,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 33,
        title: "Jeera Rice",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 20,
        servings: 4,
        summary: "Fragrant basmati rice tempered with cumin seeds and ghee.",
        healthScore: 70,
        spoonacularScore: 80,
        pricePerServing: 1.50,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 34,
        title: "Butter Naan",
        image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 25,
        servings: 4,
        summary: "Classic tandoor bread brushed with butter, perfect with curries.",
        healthScore: 60,
        spoonacularScore: 85,
        pricePerServing: 1.60,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 35,
        title: "Roti",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 20,
        servings: 6,
        summary: "Traditional whole wheat flatbread, a staple of Indian cuisine.",
        healthScore: 75,
        spoonacularScore: 82,
        pricePerServing: 0.80,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 36,
        title: "Pulao",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 30,
        servings: 4,
        summary: "Aromatic rice dish cooked with whole spices and vegetables.",
        healthScore: 72,
        spoonacularScore: 84,
        pricePerServing: 2.50,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 37,
        title: "Lemon Rice",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 15,
        servings: 4,
        summary: "Tangy South Indian rice dish with lemon juice and curry leaves.",
        healthScore: 68,
        spoonacularScore: 81,
        pricePerServing: 1.20,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 38,
        title: "Stuffed Kulcha",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 40,
        servings: 4,
        summary: "Leavened bread stuffed with spiced onions or paneer.",
        healthScore: 63,
        spoonacularScore: 87,
        pricePerServing: 2.00,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 39,
        title: "Coconut Rice",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 25,
        servings: 4,
        summary: "Fragrant rice cooked with coconut milk and South Indian spices.",
        healthScore: 70,
        spoonacularScore: 83,
        pricePerServing: 1.80,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 40,
        title: "Chapati",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 15,
        servings: 6,
        summary: "Thin unleavened flatbread made from whole wheat flour.",
        healthScore: 78,
        spoonacularScore: 80,
        pricePerServing: 0.60,
        category: "Breads & Rice",
        cuisine: "Indian",
        vegetarian: true
      },
      
      // 🍰 Desserts & Sweets (10 total)
      {
        id: 41,
        title: "Gulab Jamun",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 45,
        servings: 8,
        summary: "Deep-fried milk dumplings soaked in rose-flavored sugar syrup.",
        healthScore: 45,
        spoonacularScore: 92,
        pricePerServing: 1.80,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 42,
        title: "Kheer",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 60,
        servings: 6,
        summary: "Creamy rice pudding flavored with cardamom, nuts, and saffron.",
        healthScore: 55,
        spoonacularScore: 85,
        pricePerServing: 2.20,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 43,
        title: "Jalebi",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 30,
        servings: 6,
        summary: "Spiral-shaped deep-fried sweet soaked in saffron sugar syrup.",
        healthScore: 40,
        spoonacularScore: 88,
        pricePerServing: 1.50,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 44,
        title: "Rasgulla",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 40,
        servings: 8,
        summary: "Spongy cottage cheese balls cooked in light sugar syrup.",
        healthScore: 50,
        spoonacularScore: 89,
        pricePerServing: 1.40,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 45,
        title: "Kulfi",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 240,
        servings: 6,
        summary: "Traditional Indian ice cream made with reduced milk and cardamom.",
        healthScore: 48,
        spoonacularScore: 90,
        pricePerServing: 2.00,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 46,
        title: "Laddu",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 25,
        servings: 10,
        summary: "Sweet ball-shaped treats made from flour, ghee, and sugar.",
        healthScore: 42,
        spoonacularScore: 87,
        pricePerServing: 1.20,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 47,
        title: "Halwa",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 35,
        servings: 6,
        summary: "Dense sweet made from semolina, ghee, sugar, and nuts.",
        healthScore: 44,
        spoonacularScore: 86,
        pricePerServing: 1.80,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 48,
        title: "Barfi",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 30,
        servings: 12,
        summary: "Diamond-shaped milk fudge sweet flavored with cardamom and nuts.",
        healthScore: 46,
        spoonacularScore: 88,
        pricePerServing: 1.60,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 49,
        title: "Payasam",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 45,
        servings: 6,
        summary: "South Indian sweet pudding made with vermicelli and milk.",
        healthScore: 52,
        spoonacularScore: 84,
        pricePerServing: 2.00,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      },
      {
        id: 50,
        title: "Mysore Pak",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop&auto=format",
        fallbackImages: [
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop&auto=format"
        ],
        readyInMinutes: 20,
        servings: 8,
        summary: "Traditional Karnataka sweet made from gram flour, ghee, and sugar.",
        healthScore: 43,
        spoonacularScore: 89,
        pricePerServing: 1.70,
        category: "Desserts & Sweets",
        cuisine: "Indian",
        vegetarian: true
      }
    ];

    // Filter based on query if provided
    let filteredRecipes = recipeDatabase;
    
    if (query && query !== 'random' && query !== 'similar') {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.summary.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (options.category && options.category !== 'all') {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.category === options.category);
    }
    
    // Apply vegetarian filter
    if (options.vegetarian !== null && options.vegetarian !== undefined) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.vegetarian === options.vegetarian);
    }

    return filteredRecipes;
  }

  /**
   * Filter recipes by category
   * @param {string} category - Recipe category
   * @returns {Array<Recipe>} Filtered recipes
   */
  static getRecipesByCategory(category) {
    const allRecipes = this.getLocalRecipes();
    
    if (category === 'all' || !category) {
      return allRecipes;
    }
    
    return allRecipes.filter(recipe => recipe.category === category);
  }

  /**
   * Find recipes by ingredients with advanced matching
   * @param {Array<string>} userIngredients - User's available ingredients
   * @param {Object} options - Search options (difficulty, time, etc.)
   * @returns {Array<Recipe>} Recipes with match scores
   */
  static findRecipesByIngredientsAdvanced(userIngredients, options = {}) {
    const allRecipes = this.getLocalRecipes();
    
    // Score recipes based on ingredient matches
    const scoredRecipes = allRecipes.map(recipe => {
      const recipeIngredients = this.getRecipeIngredients(recipe.id);
      const ingredientNames = recipeIngredients.map(ing => 
        ing.name.toLowerCase().replace(/\s+/g, '')
      );
      
      let score = 0;
      let matchedIngredients = [];
      let essentialMissing = [];
      
      // Check each user ingredient against recipe ingredients
      userIngredients.forEach(userIngredient => {
        const normalizedUserIngredient = userIngredient.toLowerCase().replace(/\s+/g, '');
        const found = ingredientNames.find(recipeIng => 
          recipeIng.includes(normalizedUserIngredient) || 
          normalizedUserIngredient.includes(recipeIng) ||
          this.areIngredientsRelated(userIngredient, recipeIng)
        );
        
        if (found) {
          score += 2; // Base points for ingredient match
          matchedIngredients.push(userIngredient);
        }
      });
      
      // Check for missing essential ingredients
      const essentialIngredients = ['salt', 'oil', 'water', 'onion', 'garlic', 'ginger'];
      recipeIngredients.forEach(recipeIng => {
        const ingredientName = recipeIng.name.toLowerCase();
        const isEssential = essentialIngredients.some(essential => 
          ingredientName.includes(essential)
        );
        
        if (!isEssential) {
          const userHasIngredient = userIngredients.some(userIng => 
            this.areIngredientsRelated(userIng, ingredientName)
          );
          
          if (!userHasIngredient) {
            essentialMissing.push(recipeIng.name);
            score -= 1; // Penalty for missing non-essential ingredients
          }
        }
      });
      
      // Bonus for high match percentage
      const matchPercentage = matchedIngredients.length / userIngredients.length;
      score += matchPercentage * 5;
      
      // Bonus for recipes with fewer total ingredients (easier to make)
      if (recipeIngredients.length <= 8) {
        score += 2;
      }
      
      return {
        ...recipe,
        matchScore: Math.max(0, score),
        matchedIngredients,
        matchPercentage: Math.round(matchPercentage * 100),
        missingIngredients: essentialMissing.slice(0, 5), // Limit to 5 missing ingredients
        totalIngredients: recipeIngredients.length
      };
    });
    
    return scoredRecipes
      .filter(recipe => recipe.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Check if two ingredients are related (similar or substitutable)
   * @param {string} ingredient1 
   * @param {string} ingredient2 
   * @returns {boolean}
   */
  static areIngredientsRelated(ingredient1, ingredient2) {
    const ing1 = ingredient1.toLowerCase();
    const ing2 = ingredient2.toLowerCase();
    
    // Direct match
    if (ing1.includes(ing2) || ing2.includes(ing1)) {
      return true;
    }
    
    // Common substitutions and variations
    const relatedGroups = [
      ['tomato', 'tomatoes'],
      ['onion', 'onions'],
      ['potato', 'potatoes'],
      ['chicken', 'poultry'],
      ['oil', 'ghee', 'butter'],
      ['yogurt', 'curd', 'dahi'],
      ['cilantro', 'coriander', 'dhania'],
      ['green chili', 'green chilies', 'chili'],
      ['garam masala', 'spice', 'spices'],
      ['rice', 'basmati rice'],
      ['flour', 'wheat flour', 'maida'],
      ['paneer', 'cottage cheese'],
      ['coconut', 'coconut milk'],
      ['ginger garlic', 'ginger', 'garlic']
    ];
    
    return relatedGroups.some(group => 
      group.some(item => ing1.includes(item)) && 
      group.some(item => ing2.includes(item))
    );
  }

  /**
   * Find recipe by exact title match
   * @param {string} title - Recipe title to search for
   * @returns {Recipe|null} Matching recipe or null
   */
  static findRecipeByTitle(title) {
    const allRecipes = this.getLocalRecipes();
    const normalizedSearchTitle = title.toLowerCase().trim();
    
    // First try exact match
    let match = allRecipes.find(recipe => 
      recipe.title.toLowerCase() === normalizedSearchTitle
    );
    
    // If no exact match, try partial match
    if (!match) {
      match = allRecipes.find(recipe => 
        recipe.title.toLowerCase().includes(normalizedSearchTitle) ||
        normalizedSearchTitle.includes(recipe.title.toLowerCase())
      );
    }
    
    return match || null;
  }

  static getLocalRecipeDetails(recipeId) {
    // Get the recipe from local database based on ID
    const recipeDatabase = this.getLocalRecipes();
    const recipe = recipeDatabase.find(r => r.id === recipeId) || recipeDatabase[0];
    
    // Create detailed recipe data based on the recipe
    const recipeDetails = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image.replace('w=300&h=200', 'w=500&h=300'),
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      summary: recipe.summary,
      extendedIngredients: this.getRecipeIngredients(recipe.id),
      analyzedInstructions: this.getRecipeInstructions(recipe.id),
      nutrition: this.getRecipeNutrition()
    };
    
    return recipeDetails;
  }

  static getRecipeIngredients(recipeId) {
    const ingredients = {
      1: [ // Paneer Butter Masala
        { id: 1, name: "paneer", original: "400g paneer, cubed", amount: 400, unit: "g" },
        { id: 2, name: "tomatoes", original: "4 large tomatoes, chopped", amount: 4, unit: "large" },
        { id: 3, name: "onion", original: "2 medium onions, sliced", amount: 2, unit: "medium" },
        { id: 4, name: "heavy cream", original: "200ml heavy cream", amount: 200, unit: "ml" },
        { id: 5, name: "butter", original: "3 tbsp butter", amount: 3, unit: "tbsp" },
        { id: 6, name: "garam masala", original: "2 tsp garam masala", amount: 2, unit: "tsp" },
        { id: 7, name: "ginger-garlic paste", original: "2 tbsp ginger-garlic paste", amount: 2, unit: "tbsp" }
      ],
      2: [ // Palak Paneer
        { id: 1, name: "spinach", original: "500g fresh spinach leaves", amount: 500, unit: "g" },
        { id: 2, name: "paneer", original: "300g paneer, cubed", amount: 300, unit: "g" },
        { id: 3, name: "onion", original: "1 large onion, chopped", amount: 1, unit: "large" },
        { id: 4, name: "tomatoes", original: "2 medium tomatoes", amount: 2, unit: "medium" },
        { id: 5, name: "ginger-garlic paste", original: "2 tbsp ginger-garlic paste", amount: 2, unit: "tbsp" },
        { id: 6, name: "green chilies", original: "2 green chilies", amount: 2, unit: "chilies" },
        { id: 7, name: "cumin seeds", original: "1 tsp cumin seeds", amount: 1, unit: "tsp" }
      ],
      3: [ // Dal Makhani
        { id: 1, name: "black lentils", original: "200g black lentils (urad dal)", amount: 200, unit: "g" },
        { id: 2, name: "kidney beans", original: "50g kidney beans (rajma)", amount: 50, unit: "g" },
        { id: 3, name: "tomatoes", original: "3 large tomatoes, pureed", amount: 3, unit: "large" },
        { id: 4, name: "heavy cream", original: "150ml heavy cream", amount: 150, unit: "ml" },
        { id: 5, name: "butter", original: "4 tbsp butter", amount: 4, unit: "tbsp" },
        { id: 6, name: "garam masala", original: "2 tsp garam masala", amount: 2, unit: "tsp" }
      ],
      11: [ // Chicken Biryani
        { id: 1, name: "basmati rice", original: "500g basmati rice", amount: 500, unit: "g" },
        { id: 2, name: "chicken", original: "750g chicken, cut into pieces", amount: 750, unit: "g" },
        { id: 3, name: "yogurt", original: "200ml plain yogurt", amount: 200, unit: "ml" },
        { id: 4, name: "onions", original: "3 large onions, thinly sliced", amount: 3, unit: "large" },
        { id: 5, name: "saffron", original: "1/2 tsp saffron strands", amount: 0.5, unit: "tsp" },
        { id: 6, name: "biryani masala", original: "3 tbsp biryani masala", amount: 3, unit: "tbsp" },
        { id: 7, name: "mint leaves", original: "1/2 cup fresh mint leaves", amount: 0.5, unit: "cup" }
      ],
      12: [ // Butter Chicken
        { id: 1, name: "chicken", original: "600g boneless chicken, cubed", amount: 600, unit: "g" },
        { id: 2, name: "tomatoes", original: "4 large tomatoes, pureed", amount: 4, unit: "large" },
        { id: 3, name: "heavy cream", original: "200ml heavy cream", amount: 200, unit: "ml" },
        { id: 4, name: "butter", original: "4 tbsp butter", amount: 4, unit: "tbsp" },
        { id: 5, name: "yogurt", original: "100ml plain yogurt", amount: 100, unit: "ml" },
        { id: 6, name: "garam masala", original: "2 tsp garam masala", amount: 2, unit: "tsp" }
      ],
      21: [ // Pani Puri
        { id: 1, name: "puri shells", original: "30 ready-made puri shells", amount: 30, unit: "shells" },
        { id: 2, name: "tamarind", original: "2 tbsp tamarind paste", amount: 2, unit: "tbsp" },
        { id: 3, name: "mint leaves", original: "1 cup fresh mint leaves", amount: 1, unit: "cup" },
        { id: 4, name: "coriander leaves", original: "1/2 cup coriander leaves", amount: 0.5, unit: "cup" },
        { id: 5, name: "black salt", original: "1 tsp black salt", amount: 1, unit: "tsp" },
        { id: 6, name: "potatoes", original: "2 boiled potatoes, diced", amount: 2, unit: "potatoes" }
      ],
      31: [ // Garlic Naan
        { id: 1, name: "all-purpose flour", original: "2 cups all-purpose flour", amount: 2, unit: "cups" },
        { id: 2, name: "yogurt", original: "1/2 cup plain yogurt", amount: 0.5, unit: "cup" },
        { id: 3, name: "garlic", original: "6 cloves garlic, minced", amount: 6, unit: "cloves" },
        { id: 4, name: "butter", original: "3 tbsp melted butter", amount: 3, unit: "tbsp" },
        { id: 5, name: "baking powder", original: "1 tsp baking powder", amount: 1, unit: "tsp" },
        { id: 6, name: "cilantro", original: "2 tbsp chopped cilantro", amount: 2, unit: "tbsp" }
      ],
      41: [ // Gulab Jamun
        { id: 1, name: "milk powder", original: "200g milk powder", amount: 200, unit: "g" },
        { id: 2, name: "plain flour", original: "50g plain flour", amount: 50, unit: "g" },
        { id: 3, name: "sugar", original: "400g sugar", amount: 400, unit: "g" },
        { id: 4, name: "cardamom", original: "4 green cardamom pods", amount: 4, unit: "pods" },
        { id: 5, name: "rose water", original: "1 tsp rose water", amount: 1, unit: "tsp" },
        { id: 6, name: "ghee", original: "For deep frying", amount: 1, unit: "cup" }
      ]
    };
    
    return ingredients[recipeId] || ingredients[1];
  }

  static getRecipeInstructions(recipeId) {
    const instructions = {
      1: [ // Paneer Butter Masala
        { steps: [
          { number: 1, step: "Heat butter in a heavy-bottomed pan and sauté onions until golden brown." },
          { number: 2, step: "Add ginger-garlic paste and cook for 2 minutes until fragrant." },
          { number: 3, step: "Add chopped tomatoes and cook until they break down completely." },
          { number: 4, step: "Blend the mixture into a smooth puree and return to pan." },
          { number: 5, step: "Add garam masala and cook for 2 minutes." },
          { number: 6, step: "Pour in heavy cream and simmer for 5 minutes." },
          { number: 7, step: "Add paneer cubes gently and simmer for 3-4 minutes." },
          { number: 8, step: "Garnish with cilantro and serve hot with naan or rice." }
        ]}
      ],
      2: [ // Palak Paneer
        { steps: [
          { number: 1, step: "Blanch spinach leaves in boiling water for 2 minutes, then plunge in ice water." },
          { number: 2, step: "Blend blanched spinach with green chilies to make a smooth puree." },
          { number: 3, step: "Heat oil in a pan and add cumin seeds." },
          { number: 4, step: "Add chopped onions and sauté until golden." },
          { number: 5, step: "Add ginger-garlic paste and cook for 2 minutes." },
          { number: 6, step: "Add tomatoes and cook until soft." },
          { number: 7, step: "Pour in spinach puree and simmer for 10 minutes." },
          { number: 8, step: "Add paneer cubes and cook for 5 minutes. Serve hot." }
        ]}
      ],
      3: [ // Dal Makhani
        { steps: [
          { number: 1, step: "Soak black lentils and kidney beans overnight, then pressure cook until soft." },
          { number: 2, step: "In a heavy-bottomed pot, heat butter and add tomato puree." },
          { number: 3, step: "Cook tomato puree until it reduces and becomes thick." },
          { number: 4, step: "Add cooked lentils and beans with their cooking liquid." },
          { number: 5, step: "Simmer on low heat for 45 minutes, stirring occasionally." },
          { number: 6, step: "Add cream and garam masala in the last 10 minutes." },
          { number: 7, step: "Garnish with butter and cilantro before serving." }
        ]}
      ],
      11: [ // Chicken Biryani
        { steps: [
          { number: 1, step: "Marinate chicken with yogurt, biryani masala, and salt for 30 minutes." },
          { number: 2, step: "Soak basmati rice for 30 minutes, then boil with whole spices until 70% cooked." },
          { number: 3, step: "Deep fry sliced onions until golden and crispy." },
          { number: 4, step: "Cook marinated chicken in a heavy-bottomed pot until tender." },
          { number: 5, step: "Layer the partially cooked rice over chicken." },
          { number: 6, step: "Sprinkle fried onions, mint leaves, and saffron soaked in warm milk." },
          { number: 7, step: "Cover with aluminum foil, then place lid and cook on high heat for 3 minutes." },
          { number: 8, step: "Reduce heat to low and cook for 45 minutes. Let it rest for 10 minutes before serving." }
        ]}
      ],
      12: [ // Butter Chicken
        { steps: [
          { number: 1, step: "Marinate chicken with yogurt, ginger-garlic paste, and spices for 30 minutes." },
          { number: 2, step: "Grill or pan-fry marinated chicken until cooked through." },
          { number: 3, step: "In a pan, heat butter and add tomato puree." },
          { number: 4, step: "Cook tomato puree until it reduces and becomes thick." },
          { number: 5, step: "Add grilled chicken and simmer for 10 minutes." },
          { number: 6, step: "Pour in heavy cream and add garam masala." },
          { number: 7, step: "Simmer for 5 more minutes and garnish with cilantro." }
        ]}
      ],
      21: [ // Pani Puri
        { steps: [
          { number: 1, step: "Blend mint leaves, coriander, green chilies, and ginger to make green chutney." },
          { number: 2, step: "Mix tamarind paste with water, black salt, and spices to make tangy water." },
          { number: 3, step: "Boil potatoes and chickpeas, then dice them finely." },
          { number: 4, step: "Carefully make a small hole in each puri shell." },
          { number: 5, step: "Fill each puri with potato-chickpea mixture and green chutney." },
          { number: 6, step: "Pour flavored water into each puri just before eating." },
          { number: 7, step: "Serve immediately and eat in one bite for the best experience." }
        ]}
      ],
      31: [ // Garlic Naan
        { steps: [
          { number: 1, step: "Mix flour, baking powder, salt, and sugar in a bowl." },
          { number: 2, step: "Add yogurt and knead into a soft dough. Let it rest for 2 hours." },
          { number: 3, step: "Divide dough into portions and roll into oval shapes." },
          { number: 4, step: "Sprinkle minced garlic and cilantro on one side." },
          { number: 5, step: "Heat a tawa or skillet over medium-high heat." },
          { number: 6, step: "Cook naan with garlic side down first, then flip." },
          { number: 7, step: "Brush with melted butter and serve hot." }
        ]}
      ],
      41: [ // Gulab Jamun
        { steps: [
          { number: 1, step: "Mix milk powder and flour in a bowl." },
          { number: 2, step: "Add a little milk to form a soft dough. Let it rest for 15 minutes." },
          { number: 3, step: "Make sugar syrup with sugar, water, and cardamom. Keep it warm." },
          { number: 4, step: "Heat ghee for deep frying on medium heat." },
          { number: 5, step: "Shape dough into small balls without cracks." },
          { number: 6, step: "Fry the balls on low heat until golden brown all over." },
          { number: 7, step: "Immediately drop hot gulab jamuns into warm sugar syrup." },
          { number: 8, step: "Let them soak for at least 30 minutes before serving." }
        ]}
      ]
    };
    
    return instructions[recipeId] || instructions[1];
  }

  static getRecipeNutrition() {
    return {
      calories: 520,
      carbs: "65g",
      fat: "18g",
      protein: "28g",
      fiber: "3g",
      sugar: "3g",
      good: [
        {
          title: "Protein",
          amount: "28g",
          percentOfDailyNeeds: 56
        }
      ],
      bad: [
        {
          title: "Calories",
          amount: "520",
          percentOfDailyNeeds: 26
        }
      ]
    };
  }
}

export default RecipeService;