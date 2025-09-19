import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  X, 
  ChefHat, 
  Clock, 
  Users, 
  Star,
  Shuffle,
  ArrowRight,
  Lightbulb,
  Utensils,
  Heart,
  Search,
  Filter
} from 'lucide-react';
import RecipeCard from '../components/recipe/RecipeCard';
import RecipeService from '../services/recipeService';

const SurprisePage = ({ onRecipeSelect }) => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');
  const [animationStep, setAnimationStep] = useState(0);

  // Popular ingredients for suggestions - Updated for global cuisine
  const popularIngredients = [
    'Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Eggs', 'Milk', 'Cheese',
    'Tomatoes', 'Onions', 'Garlic', 'Carrots', 'Bell Peppers', 'Mushrooms', 'Spinach', 'Potatoes',
    'Rice', 'Pasta', 'Bread', 'Flour', 'Butter', 'Olive Oil', 'Salt', 'Pepper',
    'Basil', 'Oregano', 'Thyme', 'Rosemary', 'Parsley', 'Cilantro', 'Ginger', 'Lemon',
    'Broccoli', 'Zucchini', 'Corn', 'Beans', 'Avocado', 'Cucumber', 'Lettuce', 'Cauliflower'
  ];

  const difficultyLevels = [
    { value: 'all', label: 'Any Difficulty', icon: ChefHat },
    { value: 'easy', label: 'Easy (< 30 min)', icon: Clock },
    { value: 'medium', label: 'Medium (30-60 min)', icon: Utensils },
    { value: 'hard', label: 'Challenge (60+ min)', icon: Star }
  ];

  const timeFilters = [
    { value: 'all', label: 'Any Time' },
    { value: 'quick', label: 'Quick (< 30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Slow Cook (60+ min)' }
  ];

  useEffect(() => {
    // Animation sequence for the sparkles
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const addIngredient = (ingredient) => {
    const trimmedIngredient = ingredient.trim();
    if (trimmedIngredient && !ingredients.includes(trimmedIngredient)) {
      setIngredients([...ingredients, trimmedIngredient]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient(currentIngredient);
    }
  };

  const findRecipesByIngredients = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    setShowResults(true);

    try {
      // Simulate AI thinking time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Use the Spoonacular API to find recipes by ingredients
      const searchOptions = {
        number: 12,
        ranking: 1,
        ignorePantry: true
      };

      // Apply difficulty filter to time constraints if needed
      if (selectedDifficulty !== 'all') {
        if (selectedDifficulty === 'easy') {
          searchOptions.maxReadyTime = 30;
        } else if (selectedDifficulty === 'medium') {
          searchOptions.maxReadyTime = 60;
        }
        // For hard, no time limit
      }

      // Apply time filter
      if (selectedTime !== 'all') {
        if (selectedTime === 'quick') {
          searchOptions.maxReadyTime = 30;
        } else if (selectedTime === 'medium') {
          searchOptions.maxReadyTime = 60;
        } else if (selectedTime === 'long') {
          searchOptions.minReadyTime = 60;
        }
      }

      let matchedRecipes = await RecipeService.findRecipesByIngredients(ingredients, searchOptions);
      
      // Get detailed information for each recipe from Spoonacular API
      if (matchedRecipes.length > 0 && matchedRecipes[0].id) {
        const detailedRecipes = await Promise.all(
          matchedRecipes.slice(0, 12).map(async (recipe) => {
            try {
              const details = await RecipeService.getRecipeDetails(recipe.id);
              return {
                ...details,
                matchedIngredients: recipe.usedIngredients?.map(ing => ing.name) || [],
                missingIngredients: recipe.missedIngredients?.map(ing => ing.name) || [],
                matchPercentage: Math.round((recipe.usedIngredientCount || 0) / (recipe.usedIngredientCount + recipe.missedIngredientCount || 1) * 100)
              };
            } catch (error) {
              console.error('Error getting recipe details:', error);
              return {
                ...recipe,
                matchedIngredients: recipe.usedIngredients?.map(ing => ing.name) || [],
                missingIngredients: recipe.missedIngredients?.map(ing => ing.name) || [],
                matchPercentage: Math.round((recipe.usedIngredientCount || 0) / (recipe.usedIngredientCount + recipe.missedIngredientCount || 1) * 100)
              };
            }
          })
        );
        setSuggestedRecipes(detailedRecipes);
      } else {
        setSuggestedRecipes([]);
      }
    } catch (error) {
      console.error('Error finding recipes:', error);
      // Show user-friendly error message
      setSuggestedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setIngredients([]);
    setSuggestedRecipes([]);
    setShowResults(false);
    setCurrentIngredient('');
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
      className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-slate-900 dark:via-orange-900/20 dark:to-amber-900/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full mb-6 shadow-glow">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <span className="font-semibold text-lg">Surprise Me</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6">
            What's in Your
            <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Kitchen?
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Tell us what ingredients you have, and we'll surprise you with amazing recipes you can make right now!
          </p>
        </motion.div>

        {!showResults ? (
          <>
            {/* Ingredient Input Section */}
            <motion.div 
              className="max-w-4xl mx-auto mb-12"
              variants={itemVariants}
            >
              <div className="glass-card p-8">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 text-center">
                  Add Your Ingredients
                </h2>
                
                {/* Input Field */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type an ingredient (e.g., tomatoes, onions, chicken)..."
                    className="w-full pl-12 pr-16 py-4 bg-white/90 dark:bg-gray-800/90 border-2 border-transparent rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-300 text-lg placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <motion.button
                    onClick={() => addIngredient(currentIngredient)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-2 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Popular Ingredients */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                    Popular Ingredients
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularIngredients.map((ingredient, index) => (
                      <motion.button
                        key={ingredient}
                        onClick={() => addIngredient(ingredient)}
                        className="px-4 py-2 bg-white/70 dark:bg-gray-700/70 text-slate-700 dark:text-slate-300 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-300 transition-all duration-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {ingredient}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Added Ingredients */}
                {ingredients.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                      Your Ingredients ({ingredients.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {ingredients.map((ingredient, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full shadow-soft"
                          initial={{ opacity: 0, scale: 0, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="font-medium">{ingredient}</span>
                          <motion.button
                            onClick={() => removeIngredient(index)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters */}
                {ingredients.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                      Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Difficulty Level */}
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                          Difficulty Level
                        </label>
                        <div className="space-y-2">
                          {difficultyLevels.map((level) => (
                            <motion.button
                              key={level.value}
                              onClick={() => setSelectedDifficulty(level.value)}
                              className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
                                selectedDifficulty === level.value
                                  ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 text-orange-700 dark:text-orange-300'
                                  : 'bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <level.icon className="w-5 h-5" />
                              <span>{level.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Cooking Time */}
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                          Cooking Time
                        </label>
                        <div className="space-y-2">
                          {timeFilters.map((time) => (
                            <motion.button
                              key={time.value}
                              onClick={() => setSelectedTime(time.value)}
                              className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
                                selectedTime === time.value
                                  ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 text-orange-700 dark:text-orange-300'
                                  : 'bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Clock className="w-5 h-5" />
                              <span>{time.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Button */}
                {ingredients.length > 0 && (
                  <motion.button
                    onClick={findRecipesByIngredients}
                    disabled={loading}
                    className="w-full btn-primary text-lg py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <motion.div
                            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Finding Amazing Recipes...</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-6 h-6" />
                          <span>Surprise Me with Recipes!</span>
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Quick Ideas Section */}
            {ingredients.length === 0 && (
              <motion.div 
                className="max-w-4xl mx-auto mb-12"
                variants={itemVariants}
              >
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 text-center">
                    🚀 Quick Recipe Ideas
                  </h2>
                  <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
                    Not sure what to cook? Try these popular ingredient combinations!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl">
                      <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Got Chicken + Vegetables?</h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">Perfect for Chicken Stir Fry or Pasta!</p>
                      <button 
                        onClick={() => {
                          setIngredients(['Chicken', 'Bell Peppers', 'Onions', 'Garlic']);
                        }}
                        className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors"
                      >
                        Try This Combo
                      </button>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                      <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Have Pasta + Tomatoes?</h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">Make delicious Pasta Marinara!</p>
                      <button 
                        onClick={() => {
                          setIngredients(['Pasta', 'Tomatoes', 'Garlic', 'Basil']);
                        }}
                        className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full hover:bg-green-300 dark:hover:bg-green-700 transition-colors"
                      >
                        Try This Combo
                      </button>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                      <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Sweet Tooth? Got Eggs?</h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">Time for some Pancakes or French Toast!</p>
                      <button 
                        onClick={() => {
                          setIngredients(['Eggs', 'Milk', 'Flour', 'Sugar']);
                        }}
                        className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors"
                      >
                        Try This Combo
                      </button>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl">
                      <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Ground Beef + Onions?</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">Perfect for Tacos or Pasta Sauce!</p>
                      <button 
                        onClick={() => {
                          setIngredients(['Ground Beef', 'Onions', 'Tomatoes', 'Cheese']);
                        }}
                        className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors"
                      >
                        Try This Combo
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <>
            {/* Results Section */}
            <motion.div
              className="mb-8"
              variants={itemVariants}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Recipe Suggestions
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Found {suggestedRecipes.length} recipe{suggestedRecipes.length !== 1 ? 's' : ''} using your ingredients
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                  <motion.button
                    onClick={resetSearch}
                    className="btn-secondary flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Shuffle className="w-5 h-5" />
                    <span>Try Again</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowResults(false)}
                    className="btn-secondary flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Filter className="w-5 h-5" />
                    <span>Modify Search</span>
                  </motion.button>
                </div>
              </div>

              {/* Ingredients Used */}
              <div className="glass-card p-6 mb-8">
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Your Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recipe Results */}
            <motion.div variants={itemVariants}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-2xl mb-6" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : suggestedRecipes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {suggestedRecipes.map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <RecipeCard
                          recipe={recipe}
                          onClick={() => onRecipeSelect(recipe)}
                          variant="surprise"
                          index={index}
                          showMatchInfo={true}
                          matchPercentage={recipe.matchPercentage}
                          matchedIngredients={recipe.matchedIngredients}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Recipe Tips */}
                  <motion.div
                    className="mt-12 glass-card p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">
                      Cooking Tips & Suggestions
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lightbulb className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          Ingredient Substitutions
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Don't have an exact ingredient? Try similar alternatives like yogurt for curd or cilantro for coriander.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ChefHat className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          Prep Smart
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Prepare all ingredients before cooking. This makes the process smoother and more enjoyable.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          Taste & Adjust
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Always taste as you cook and adjust spices according to your preference. Cooking is an art!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
                    <ChefHat className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    No Recipes Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    We couldn't find any recipes with your current ingredients. Try adding more ingredients or adjusting your filters.
                  </p>
                  <motion.button
                    onClick={() => setShowResults(false)}
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Different Ingredients
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SurprisePage;