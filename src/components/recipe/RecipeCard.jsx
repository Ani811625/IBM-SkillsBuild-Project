import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Clock, 
  Users, 
  Star, 
  Plus, 
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useFavorites, useMealPlanner } from '../../hooks/useApp';

const RecipeCard = ({ 
  recipe, 
  onClick, 
  variant = 'default', // 'default', 'featured', 'compact', 'surprise'
  showAddToMeal = true,
  index = 0,
  showMatchInfo = false,
  matchPercentage = null,
  matchedIngredients = []
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecipeToMealPlan } = useMealPlanner();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(recipe);
  };

  const handleImageError = () => {
    if (recipe.fallbackImages && currentImageIndex < recipe.fallbackImages.length) {
      setCurrentImageIndex(prev => prev + 1);
      setImageLoaded(false);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  const getCurrentImage = () => {
    if (recipe.fallbackImages && currentImageIndex > 0 && currentImageIndex <= recipe.fallbackImages.length) {
      return recipe.fallbackImages[currentImageIndex - 1];
    }
    return recipe.image || 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop';
  };

  const handleAddToMeal = (e) => {
    e.stopPropagation();
    setShowMealModal(true);
  };

  const handleMealPlanAdd = (day, mealType) => {
    addRecipeToMealPlan(day, recipe, mealType);
    setShowMealModal(false);
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.03,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    loading: {
      scale: 1.1,
      opacity: 0
    },
    loaded: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const getHealthScore = () => {
    const score = recipe.healthScore || recipe.spoonacularScore || 75;
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Excellent' };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Good' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Fair' };
  };

  const healthScore = getHealthScore();

  if (variant === 'compact') {
    return (
      <motion.div
        className="recipe-card cursor-pointer relative overflow-hidden h-32"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onClick={onClick}
      >
        <div className="flex h-full">
          <div className="relative w-32 h-32 flex-shrink-0">
            <img
              src={getCurrentImage()}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            {imageError && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 text-xs">No Image</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white mb-1">
                {recipe.title}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{recipe.readyInMinutes || 30}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{recipe.servings || 4}</span>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={handleFavoriteClick}
              className={`self-start p-1 rounded-full transition-colors duration-200 ${
                isFavorite(recipe.id)
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-4 h-4 ${isFavorite(recipe.id) ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="recipe-card cursor-pointer relative overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onClick}
    >
      {/* Recipe Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={getCurrentImage()}
          alt={recipe.title}
          className="w-full h-full object-cover"
          variants={imageVariants}
          initial="loading"
          animate={imageLoaded ? "loaded" : "loading"}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
        )}
        
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Recipe Image</span>
          </div>
        )}

        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="flex space-x-2">
              {recipe.vegetarian && (
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                  Vegetarian
                </span>
              )}
              {recipe.glutenFree && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                  Gluten Free
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Health Score Badge */}
        {recipe.healthScore && (
          <div className={`absolute top-3 left-3 px-2 py-1 ${healthScore.bg} ${healthScore.color} text-xs font-semibold rounded-full flex items-center space-x-1`}>
            <TrendingUp className="w-3 h-3" />
            <span>{recipe.healthScore}</span>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <motion.button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
              isFavorite(recipe.id)
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className={`w-4 h-4 ${isFavorite(recipe.id) ? 'fill-current' : ''}`} />
          </motion.button>
          
          {showAddToMeal && (
            <motion.button
              onClick={handleAddToMeal}
              className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white backdrop-blur-md transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Recipe Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white mb-2">
          {recipe.title}
        </h3>
        
        {recipe.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {recipe.summary.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Match Information for Surprise Feature */}
        {showMatchInfo && matchPercentage !== null && (
          <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Ingredient Match
              </span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {matchPercentage}%
              </span>
            </div>
            {matchedIngredients.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {matchedIngredients.slice(0, 3).map((ingredient, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs rounded-full"
                  >
                    {ingredient}
                  </span>
                ))}
                {matchedIngredients.length > 3 && (
                  <span className="px-2 py-1 bg-orange-200 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                    +{matchedIngredients.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recipe Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.readyInMinutes || 30} min</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings || 4} servings</span>
          </div>
          
          {recipe.pricePerServing && (
            <div className="flex items-center space-x-1">
              <span className="text-green-600 font-medium">
                ${(recipe.pricePerServing / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Rating or difficulty */}
        {variant === 'featured' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < (recipe.rating || 4) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                ({recipe.rating || 4.0})
              </span>
            </div>
            
            {recipe.readyInMinutes <= 30 && (
              <div className="flex items-center space-x-1 text-orange-500">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Quick</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meal Planner Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMealModal(false)}>
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Add to Meal Plan
            </h3>
            
            <div className="space-y-4">
              {days.map(day => (
                <div key={day} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{day}</h4>
                  <div className="flex flex-wrap gap-2">
                    {mealTypes.map(mealType => (
                      <motion.button
                        key={mealType}
                        onClick={() => handleMealPlanAdd(day, mealType)}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors duration-200 capitalize"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {mealType}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default RecipeCard;