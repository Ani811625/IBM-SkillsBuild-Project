import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Clock, 
  Users, 
  Star, 
  ChefHat,
  Plus, 
  Minus,
  Check,
  Calendar,
  ShoppingCart,
  Share2,
  BookOpen,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Timer,
  Bell
} from 'lucide-react';
import { useFavorites, useMealPlanner, useShoppingList } from '../hooks/useApp';
import { RecipeRating, RecipeStats, RecipeTags, RecipeNutrition } from '../components/recipe/RecipeEnhancements';
import CookingTimer from '../components/recipe/CookingTimer';
import ShoppingList from '../components/recipe/ShoppingList';

const RecipeDetailsPage = ({ recipe, onBack }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecipeToMealPlan } = useMealPlanner();
  const { addRecipeIngredientsToShoppingList } = useShoppingList();
  
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [activeStep, setActiveStep] = useState(0);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (!recipe) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading recipe...</p>
        </div>
      </div>
    );
  }

  const originalServings = recipe.servings || 4;
  const servingMultiplier = servings / originalServings;

  const adjustIngredientAmount = (amount) => {
    const adjusted = amount * servingMultiplier;
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
  };

  const toggleIngredientCheck = (ingredientId) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientId)) {
      newChecked.delete(ingredientId);
    } else {
      newChecked.add(ingredientId);
    }
    setCheckedIngredients(newChecked);
  };

  const handleMealPlanAdd = (day, mealType) => {
    addRecipeToMealPlan(day, recipe, mealType);
    setShowMealModal(false);
  };

  const handleAddToShoppingList = () => {
    addRecipeIngredientsToShoppingList(recipe);
    setShowShoppingList(true);
  };

  const handleRate = (rating) => {
    console.log('Recipe rated:', rating);
    // Here you would typically save the rating to your backend
  };

  const handleReview = (review, rating) => {
    console.log('Review submitted:', { review, rating });
    // Here you would typically save the review to your backend
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
      className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1551892374-ecf8df7181ac?w=1920&h=1080&fit=crop&auto=format'}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            if (recipe.fallbackImages && recipe.fallbackImages.length > 0) {
              e.target.src = recipe.fallbackImages[0].replace('w=300&h=200', 'w=1920&h=1080');
            } else {
              e.target.src = 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=1920&h=1080&fit=crop';
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="absolute top-6 left-6 p-4 bg-white/90 dark:bg-slate-800/90 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 backdrop-blur-xl shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        {/* Recipe Title and Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 text-shadow">
                {recipe.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 text-white/90 mb-8">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6" />
                  <span className="text-lg">{recipe.readyInMinutes || 30} minutes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6" />
                  <span className="text-lg">{recipe.servings || 4} servings</span>
                </div>
                {recipe.healthScore && (
                  <div className="flex items-center space-x-3">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <span className="text-lg">Health Score: {recipe.healthScore}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  onClick={() => toggleFavorite(recipe)}
                  className={`btn-primary flex items-center space-x-3 backdrop-blur-xl border-white/30 text-white hover:bg-white/20 ${
                    isFavorite(recipe.id) ? 'bg-red-500/20 shadow-glow-pink' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(recipe.id) ? 'fill-current text-red-400' : ''}`} />
                  <span>{isFavorite(recipe.id) ? 'Favorited' : 'Add to Favorites'}</span>
                </motion.button>
                
                <motion.button
                  onClick={() => setShowMealModal(true)}
                  className="btn-secondary flex items-center space-x-3 backdrop-blur-xl border-white/30 text-white hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Add to Meal Plan</span>
                </motion.button>
                
                <motion.button
                  onClick={handleAddToShoppingList}
                  className="btn-secondary flex items-center space-x-3 backdrop-blur-xl border-white/30 text-white hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Shopping List</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Ingredients & Tools */}
          <div className="lg:col-span-1 space-y-8">
            {/* Recipe Stats */}
            <RecipeStats recipe={recipe} />

            {/* Recipe Tags */}
            <RecipeTags recipe={recipe} />

            {/* Servings Adjuster */}
            <motion.div className="glass-card p-6" variants={itemVariants}>
              <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-200 mb-6">
                Adjust Servings
              </h3>
              <div className="flex items-center justify-center space-x-6">
                <motion.button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus className="w-5 h-5" />
                </motion.button>
                <span className="text-4xl font-bold text-slate-800 dark:text-slate-200 px-6">
                  {servings}
                </span>
                <motion.button
                  onClick={() => setServings(servings + 1)}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Cooking Timer */}
            <CookingTimer recipe={recipe} />

            {/* Shopping List */}
            <ShoppingList recipe={recipe} />

            {/* Ingredients */}
            <motion.div className="glass-card p-6" variants={itemVariants}>
              <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                <ChefHat className="w-6 h-6 mr-3 text-emerald-500" />
                Ingredients
              </h3>
              <div className="space-y-4">
                {recipe.extendedIngredients?.map((ingredient, index) => (
                  <motion.div
                    key={ingredient.id || index}
                    className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                      checkedIngredients.has(ingredient.id || index)
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white/50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                    onClick={() => toggleIngredientCheck(ingredient.id || index)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      checkedIngredients.has(ingredient.id || index)
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}>
                      {checkedIngredients.has(ingredient.id || index) && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`flex-1 transition-all duration-300 ${
                      checkedIngredients.has(ingredient.id || index)
                        ? 'line-through text-slate-500 dark:text-slate-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {ingredient.amount && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {adjustIngredientAmount(ingredient.amount)} {ingredient.unit} 
                        </span>
                      )}
                      <span className="ml-2">{ingredient.name}</span>
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Nutrition Info */}
            <RecipeNutrition nutrition={recipe.nutrition} />
          </div>

          {/* Right Column - Instructions */}
          <div className="lg:col-span-2">
            <motion.div className="glass-card p-8" variants={itemVariants}>
              <h3 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center">
                <BookOpen className="w-8 h-8 mr-4 text-emerald-500" />
                Instructions
              </h3>
              
              <div className="space-y-8">
                {recipe.analyzedInstructions?.[0]?.steps?.map((step, index) => (
                  <motion.div
                    key={step.number || index}
                    className={`relative p-8 rounded-3xl border-2 transition-all duration-500 cursor-pointer ${
                      activeStep === index
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-glow'
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                    onClick={() => setActiveStep(index)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-6">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        activeStep === index
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {step.number || index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-lg">
                          {step.step}
                        </p>
                        
                        {step.ingredients && step.ingredients.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {step.ingredients.map((ingredient, i) => (
                              <span 
                                key={i}
                                className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full font-medium"
                              >
                                {ingredient.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {!recipe.analyzedInstructions?.[0]?.steps && (
                <div className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Detailed instructions not available for this recipe.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Recipe Rating */}
            <RecipeRating recipe={recipe} onRate={handleRate} onReview={handleReview} />
          </div>
        </div>
      </div>

      {/* Meal Planner Modal */}
      <AnimatePresence>
        {showMealModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMealModal(false)}>
            <motion.div
              className="glass-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-display font-bold mb-6 text-slate-800 dark:text-slate-200">
                Add "{recipe.title}" to Meal Plan
              </h3>
              
              <div className="space-y-6">
                {days.map(day => (
                  <div key={day} className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-lg">{day}</h4>
                    <div className="flex flex-wrap gap-3">
                      {mealTypes.map(mealType => (
                        <motion.button
                          key={mealType}
                          onClick={() => handleMealPlanAdd(day, mealType)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 transition-all duration-300 capitalize font-medium"
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
              
              <motion.button
                onClick={() => setShowMealModal(false)}
                className="w-full mt-8 btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecipeDetailsPage;