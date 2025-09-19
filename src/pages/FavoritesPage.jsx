import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Calendar,
  Clock,
  Star,
  Trash2,
  Share2,
  Download
} from 'lucide-react';
import RecipeCard from '../components/recipe/RecipeCard';
import { useFavorites } from '../hooks/useApp';

const FavoritesPage = ({ onRecipeSelect }) => {
  const { favorites, removeFromFavorites } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Filter and sort favorites
  const filteredFavorites = favorites
    .filter(recipe => {
      if (searchQuery) {
        return recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (recipe.summary && recipe.summary.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return true;
    })
    .filter(recipe => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'quick') return recipe.readyInMinutes <= 30;
      if (selectedCategory === 'healthy') return recipe.healthScore >= 70;
      if (selectedCategory === 'recent') {
        const addedDate = new Date(recipe.addedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return addedDate >= weekAgo;
      }
      return true;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'dateAdded':
          aVal = new Date(a.addedAt || 0);
          bVal = new Date(b.addedAt || 0);
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'cookingTime':
          aVal = a.readyInMinutes || 0;
          bVal = b.readyInMinutes || 0;
          break;
        case 'healthScore':
          aVal = a.healthScore || 0;
          bVal = b.healthScore || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const categories = [
    { id: 'all', name: 'All Favorites', count: favorites.length },
    { id: 'recent', name: 'Recently Added', count: favorites.filter(r => {
      const addedDate = new Date(r.addedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return addedDate >= weekAgo;
    }).length },
    { id: 'quick', name: 'Quick & Easy', count: favorites.filter(r => r.readyInMinutes <= 30).length },
    { id: 'healthy', name: 'Healthy Options', count: favorites.filter(r => r.healthScore >= 70).length }
  ];

  const handleRemoveFavorite = (recipeId) => {
    removeFromFavorites(recipeId);
    setShowDeleteConfirm(null);
  };

  const handleExportFavorites = () => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-favorite-recipes.json';
    link.click();
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              My Favorite Recipes
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {favorites.length} recipe{favorites.length !== 1 ? 's' : ''} saved for later
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your favorite recipes..."
                className="w-full pl-12 pr-4 py-3 input-field"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          {categories.map(category => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl text-center transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow'
                  : 'glass-card hover:shadow-soft-lg'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`text-2xl font-bold ${
                selectedCategory === category.id ? 'text-white' : 'text-primary-600'
              }`}>
                {category.count}
              </div>
              <div className={`text-sm font-medium ${
                selectedCategory === category.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {category.name}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Controls Bar */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2 text-sm"
              >
                <option value="dateAdded">Date Added</option>
                <option value="title">Recipe Name</option>
                <option value="cookingTime">Cooking Time</option>
                <option value="healthScore">Health Score</option>
              </select>
              
              <motion.button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </motion.button>
            </div>

            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {filteredFavorites.length} recipe{filteredFavorites.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Export Button */}
            {favorites.length > 0 && (
              <motion.button
                onClick={handleExportFavorites}
                className="btn-secondary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
            )}

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

        {/* Favorites Grid/List */}
        <motion.div variants={itemVariants}>
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-16">
              {favorites.length === 0 ? (
                // No favorites at all
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No favorite recipes yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Start exploring recipes and save your favorites by clicking the heart icon on any recipe.
                  </p>
                  <motion.button
                    onClick={() => window.history.back()}
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Discover Recipes
                  </motion.button>
                </>
              ) : (
                // No results for current filter/search
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No recipes found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Try adjusting your search or filter criteria.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="btn-secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear Filters
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}>
              {filteredFavorites.map((recipe, index) => (
                <div key={recipe.id} className="relative group">
                  <RecipeCard
                    recipe={recipe}
                    onClick={() => onRecipeSelect(recipe)}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                    index={index}
                  />
                  
                  {/* Remove from favorites button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(recipe.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                  
                  {/* Date added overlay */}
                  {recipe.addedAt && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Added {new Date(recipe.addedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Remove from Favorites?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This recipe will be removed from your favorites list.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => handleRemoveFavorite(showDeleteConfirm)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FavoritesPage;