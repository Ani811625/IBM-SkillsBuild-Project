import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ChevronDown,
  X,
  Clock,
  Users,
  Star,
  TrendingUp,
  Sparkles,
  ChefHat
} from 'lucide-react';
import AnimatedSearchBar from '../components/ui/AnimatedSearchBar';
import RecipeCard from '../components/recipe/RecipeCard';
import { useRecipes, useSearch } from '../hooks/useApp';
import RecipeService from '../services/recipeService';

const SearchResultsPage = ({ onRecipeSelect, initialQuery = '', showAll = false }) => {
  const { 
    searchResults, 
    loading, 
    error, 
    searchRecipes 
  } = useRecipes();
  const { 
    searchQuery, 
    searchFilters, 
    updateSearchFilter, 
    clearFilters 
  } = useSearch();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currentQuery, setCurrentQuery] = useState(initialQuery || searchQuery);

  // Filter options - Updated for Spoonacular API
  const filterOptions = {
    type: [
      'main course',
      'side dish', 
      'dessert',
      'appetizer',
      'salad',
      'bread',
      'breakfast',
      'soup',
      'beverage',
      'sauce',
      'marinade',
      'fingerfood',
      'snack',
      'drink'
    ],
    diet: [
      'vegetarian',
      'vegan',
      'gluten free',
      'ketogenic',
      'paleo',
      'primal',
      'whole30'
    ],
    cuisine: [
      'african',
      'american',
      'british',
      'cajun',
      'caribbean',
      'chinese',
      'eastern european',
      'european',
      'french',
      'german',
      'greek',
      'indian',
      'irish',
      'italian',
      'japanese',
      'jewish',
      'korean',
      'latin american',
      'mediterranean',
      'mexican',
      'middle eastern',
      'nordic',
      'southern',
      'spanish',
      'thai',
      'vietnamese'
    ],
    cookingTime: [
      { label: 'Under 30 minutes', value: '0-30' },
      { label: '30-60 minutes', value: '30-60' },
      { label: '1-2 hours', value: '60-120' },
      { label: 'Over 2 hours', value: '120+' }
    ]
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'time', label: 'Cooking Time' },
    { value: 'healthScore', label: 'Health Score' },
    { value: 'rating', label: 'Rating' }
  ];

  // Load initial results: show all recipes when no query
  useEffect(() => {
    const bootstrap = async () => {
      if (initialQuery) {
        await handleSearch(initialQuery);
      } else if (showAll) {
        // Show all recipes with a large number to get all available recipes
        await searchRecipes('', { number: 100 });
        setCurrentQuery('');
      } else {
        await handleSearch('');
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, showAll]);

  const handleSearch = async (query) => {
    // Don't redirect when showing all recipes or when query is empty
    if (!query || showAll) {
      setCurrentQuery(query);
      const searchOptions = {
        sort: sortBy,
        number: showAll ? 100 : 12,
        addRecipeInformation: true,
        fillIngredients: true,
        ...searchFilters
      };
      await searchRecipes(query, searchOptions);
      return;
    }

    // For specific search queries with API, don't use exact local matching
    setCurrentQuery(query);
    const searchOptions = {
      sort: sortBy,
      addRecipeInformation: true,
      fillIngredients: true,
      ...searchFilters
    };
    await searchRecipes(query, searchOptions);
  };

  const handleFilterChange = (filterType, value) => {
    updateSearchFilter(filterType, value);
    // Re-search with new filters even when query is empty
    const newFilters = { ...searchFilters, [filterType]: value };
    const q = currentQuery ?? '';
    const searchOptions = {
      sort: sortBy,
      number: showAll ? 100 : 12,
      addRecipeInformation: true,
      fillIngredients: true,
      ...newFilters
    };
    searchRecipes(q, searchOptions);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const q = currentQuery ?? '';
    const searchOptions = {
      sort: newSortBy,
      number: showAll ? 100 : 12,
      addRecipeInformation: true,
      fillIngredients: true,
      ...searchFilters
    };
    searchRecipes(q, searchOptions);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSortBy('relevance');
    const q = currentQuery ?? '';
    const searchOptions = {
      sort: 'relevance',
      number: showAll ? 100 : 12,
      addRecipeInformation: true,
      fillIngredients: true
    };
    searchRecipes(q, searchOptions);
  };

  const getActiveFilterCount = () => {
    return Object.values(searchFilters).filter(value => value && value !== '').length;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6 text-center">
              {showAll ? (
                'All Recipes'
              ) : currentQuery ? (
                <>
                  Results for <span className="text-gradient">"{currentQuery}"</span>
                </>
              ) : (
                'Search Recipes'
              )}
            </h1>
            
            <div className="max-w-2xl mx-auto">
              <AnimatedSearchBar 
                onSearch={handleSearch}
                onRecipeSelect={onRecipeSelect}
                placeholder="Search for recipes, ingredients, or cuisines..."
                autoFocus={!currentQuery}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sort Bar */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            {/* Filter Button */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center space-x-2 relative ${
                getActiveFilterCount() > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : ''
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </motion.button>

            {/* Clear Filters */}
            {getActiveFilterCount() > 0 && (
              <motion.button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <X className="w-4 h-4" />
                <span>Clear filters</span>
              </motion.button>
            )}

            {/* Results Count */}
            {searchResults.length > 0 && (
              <span className="text-gray-600 dark:text-gray-400">
                {searchResults.length} recipes found
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3X3 className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="glass-card p-6 mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Recipe Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipe Type
                  </label>
                  <select
                    value={searchFilters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">All Types</option>
                    {filterOptions.type.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Diet Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diet
                  </label>
                  <select
                    value={searchFilters.diet || ''}
                    onChange={(e) => handleFilterChange('diet', e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">All Diets</option>
                    {filterOptions.diet.map(diet => (
                      <option key={diet} value={diet}>
                        {diet.charAt(0).toUpperCase() + diet.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cuisine Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cuisine
                  </label>
                  <select
                    value={searchFilters.cuisine || ''}
                    onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">All Cuisines</option>
                    {filterOptions.cuisine.map(cuisine => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cooking Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cooking Time
                  </label>
                  <select
                    value={searchFilters.cookingTime || ''}
                    onChange={(e) => handleFilterChange('cookingTime', e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">Any time</option>
                    {filterOptions.cookingTime.map(time => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <motion.div variants={itemVariants}>
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <Search className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Search Error
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <motion.button
                onClick={() => currentQuery && handleSearch(currentQuery)}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          )}

          {!loading && !error && searchResults.length === 0 && currentQuery && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <ChefHat className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No recipes found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search terms or filters
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={handleClearFilters}
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Filters
                </motion.button>
                <motion.button
                  onClick={() => handleSearch('')}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse All Recipes
                </motion.button>
              </div>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}>
              {searchResults.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => onRecipeSelect(recipe)}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  index={index}
                />
              ))}
            </div>
          )}

          {!loading && !error && !currentQuery && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready to discover amazing recipes?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Search for recipes by ingredients, cuisine, or dish name
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchResultsPage;