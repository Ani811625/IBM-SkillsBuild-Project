import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, MessageCircle, Share2, Bookmark, Clock, Users, Zap } from 'lucide-react';

const RecipeRating = ({ recipe, onRate, onReview }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState('');

  const handleRating = (value) => {
    setRating(value);
    onRate && onRate(value);
  };

  const handleReviewSubmit = () => {
    if (review.trim()) {
      onReview && onReview(review, rating);
      setReview('');
      setShowReviewForm(false);
    }
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-200">
          Rate this Recipe
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {recipe.rating || 4.5}/5
          </span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <motion.button
                key={i}
                onClick={() => handleRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star
                  className={`w-6 h-6 ${
                    i < (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <motion.button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="btn-secondary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Write Review</span>
        </motion.button>

        <motion.button
          className="btn-accent flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </motion.button>

        <motion.button
          className="btn-secondary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bookmark className="w-4 h-4" />
          <span>Save</span>
        </motion.button>
      </div>

      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this recipe..."
            className="w-full p-4 bg-white/80 dark:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 placeholder-slate-500 dark:placeholder-slate-400 resize-none"
            rows={4}
          />
          <div className="flex justify-end mt-3">
            <motion.button
              onClick={handleReviewSubmit}
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Review
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const RecipeStats = ({ recipe }) => {
  const stats = [
    {
      icon: Clock,
      label: 'Prep Time',
      value: `${recipe.prepTime || 15} min`,
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      label: 'Cook Time',
      value: `${recipe.readyInMinutes || 30} min`,
      color: 'text-orange-500'
    },
    {
      icon: Users,
      label: 'Servings',
      value: recipe.servings || 4,
      color: 'text-green-500'
    },
    {
      icon: Zap,
      label: 'Difficulty',
      value: recipe.difficulty || 'Easy',
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="glass-card p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {stat.value}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const RecipeTags = ({ recipe }) => {
  const tags = [
    recipe.vegetarian && 'Vegetarian',
    recipe.glutenFree && 'Gluten Free',
    recipe.dairyFree && 'Dairy Free',
    recipe.vegan && 'Vegan',
    recipe.keto && 'Keto',
    recipe.lowCarb && 'Low Carb',
    recipe.highProtein && 'High Protein',
    recipe.quick && 'Quick & Easy'
  ].filter(Boolean);

  if (tags.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
        Dietary Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <motion.span
            key={tag}
            className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            {tag}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

const RecipeNutrition = ({ nutrition }) => {
  if (!nutrition) return null;

  const nutritionItems = [
    { label: 'Calories', value: nutrition.calories, color: 'text-red-500' },
    { label: 'Protein', value: nutrition.protein, color: 'text-blue-500' },
    { label: 'Carbs', value: nutrition.carbs, color: 'text-yellow-500' },
    { label: 'Fat', value: nutrition.fat, color: 'text-green-500' },
    { label: 'Fiber', value: nutrition.fiber, color: 'text-purple-500' },
    { label: 'Sugar', value: nutrition.sugar, color: 'text-pink-500' }
  ];

  return (
    <div className="glass-card p-6 mb-6">
      <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Nutrition Facts
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nutritionItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="text-center p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { RecipeRating, RecipeStats, RecipeTags, RecipeNutrition };
