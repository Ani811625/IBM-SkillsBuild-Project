import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  Trash2,
  Edit3,
  ChefHat,
  Coffee,
  Sun,
  Sunset,
  Moon,
  X,
  ShoppingCart,
  Download,
  RefreshCw
} from 'lucide-react';
import { useMealPlanner, useFavorites, useShoppingList } from '../hooks/useApp';

const MealPlannerPage = ({ onRecipeSelect }) => {
  const { 
    mealPlanner, 
    getMealsForDay, 
    removeRecipeFromMealPlan, 
    getWeeklyMealSummary,
    clearMealPlan 
  } = useMealPlanner();
  const { favorites } = useFavorites();
  const { addToShoppingList } = useShoppingList();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('dinner');
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: Coffee, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'lunch', name: 'Lunch', icon: Sun, color: 'bg-orange-100 text-orange-700' },
    { id: 'dinner', name: 'Dinner', icon: Sunset, color: 'bg-blue-100 text-blue-700' },
    { id: 'snack', name: 'Snack', icon: Moon, color: 'bg-purple-100 text-purple-700' }
  ];

  // Get current week dates
  const getWeekDates = (startDate) => {
    const week = [];
    const start = new Date(startDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(start.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const weekSummary = getWeeklyMealSummary();

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const handleAddMeal = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setShowAddMealModal(true);
  };

  const handleRemoveMeal = (day, recipeId) => {
    removeRecipeFromMealPlan(day, recipeId);
  };

  const addIngredientsToShoppingList = (day) => {
    const meals = getMealsForDay(day);
    meals.forEach(meal => {
      if (meal.extendedIngredients) {
        meal.extendedIngredients.forEach(ingredient => {
          addToShoppingList({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            recipeId: meal.id,
            recipeName: meal.title
          });
        });
      }
    });
  };

  const exportMealPlan = () => {
    const dataStr = JSON.stringify(mealPlanner, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meal-plan-${weekDates[0].toISOString().split('T')[0]}.json`;
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

  const getMealTypeIcon = (mealType) => {
    const meal = mealTypes.find(m => m.id === mealType);
    return meal ? meal.icon : ChefHat;
  };

  const getMealTypeColor = (mealType) => {
    const meal = mealTypes.find(m => m.id === mealType);
    return meal ? meal.color : 'bg-gray-100 text-gray-700';
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Meal Planner
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Plan your weekly meals and never wonder "what's for dinner?" again
            </p>
          </motion.div>

          {/* Week Navigation */}
          <motion.div 
            className="flex items-center justify-between mb-6"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => navigateWeek(-1)}
              className="btn-secondary flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous Week</span>
            </motion.button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
                {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {weekSummary.totalMeals} meals planned this week
              </p>
            </div>
            
            <motion.button
              onClick={() => navigateWeek(1)}
              className="btn-secondary flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next Week</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-4"
            variants={itemVariants}
          >
            <motion.button
              onClick={exportMealPlan}
              className="btn-secondary flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              <span>Export Plan</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowClearConfirm(true)}
              className="btn-secondary flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Week</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Weekly Meal Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          {mealTypes.map(mealType => (
            <div key={mealType.id} className="glass-card p-4 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${mealType.color}`}>
                <mealType.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {weekSummary.mealTypes[mealType.id] || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {mealType.name}{weekSummary.mealTypes[mealType.id] !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Weekly Calendar */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-7 gap-6"
          variants={itemVariants}
        >
          {days.map((day, dayIndex) => {
            const dayMeals = getMealsForDay(day);
            const date = weekDates[dayIndex];
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <motion.div
                key={day}
                className={`glass-card p-4 min-h-[400px] ${
                  isToday ? 'ring-2 ring-primary-500' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
              >
                {/* Day Header */}
                <div className="text-center mb-4">
                  <h3 className={`font-semibold ${
                    isToday ? 'text-primary-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {day}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  {isToday && (
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mt-1">
                      Today
                    </span>
                  )}
                </div>

                {/* Meal Types */}
                <div className="space-y-4">
                  {mealTypes.map(mealType => {
                    const mealsForType = dayMeals.filter(meal => meal.mealType === mealType.id);
                    
                    return (
                      <div key={mealType.id} className="">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <mealType.icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {mealType.name}
                            </span>
                          </div>
                          <motion.button
                            onClick={() => handleAddMeal(day, mealType.id)}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                        
                        <div className="space-y-2">
                          {mealsForType.map((meal, mealIndex) => (
                            <motion.div
                              key={meal.id}
                              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => onRecipeSelect(meal)}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: mealIndex * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                    {meal.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{meal.readyInMinutes || 30}m</span>
                                    <Users className="w-3 h-3" />
                                    <span>{meal.servings || 4}</span>
                                  </div>
                                </div>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMeal(day, meal.id);
                                  }}
                                  className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                          
                          {mealsForType.length === 0 && (
                            <div className="text-center py-4 text-gray-400 dark:text-gray-600">
                              <ChefHat className="w-6 h-6 mx-auto mb-1 opacity-50" />
                              <p className="text-xs">No {mealType.name.toLowerCase()} planned</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Day Actions */}
                {dayMeals.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      onClick={() => addIngredientsToShoppingList(day)}
                      className="w-full btn-secondary text-sm py-2 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Shopping List</span>
                    </motion.button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {showAddMealModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add {selectedMealType} for {selectedDay}
                </h3>
                <motion.button
                  onClick={() => setShowAddMealModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Choose from your favorites:
                </h4>
                
                {favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No favorite recipes yet. Save some recipes first!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {favorites.map((recipe, index) => (
                      <motion.button
                        key={recipe.id}
                        onClick={() => {
                          // Add recipe to meal plan logic would go here
                          setShowAddMealModal(false);
                        }}
                        className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={recipe.image || 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=100&h=100&fit=crop'}
                            alt={recipe.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {recipe.title}
                            </h5>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{recipe.readyInMinutes || 30}m</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Meal Plan Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                  <RefreshCw className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Clear Meal Plan?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will remove all planned meals from your meal planner.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      clearMealPlan();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear All
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

export default MealPlannerPage;