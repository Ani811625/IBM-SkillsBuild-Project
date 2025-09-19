import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Star,
  Clock,
  Users,
  Heart,
  Bookmark,
  Share2,
  Zap,
  Award,
  Flame,
  Leaf,
  Coffee,
  Utensils,
  Lightbulb,
  Search
} from 'lucide-react';
import AnimatedSearchBar from '../components/ui/AnimatedSearchBar';
import RecipeCard from '../components/recipe/RecipeCard';
import ApiStatusCard from '../components/common/ApiStatusCard';
import { useRecipes } from '../hooks/useApp';
import RecipeService from '../services/recipeService';

const HomePage = ({ onNavigate, onRecipeSelect }) => {
  const { 
    featuredRecipes, 
    loading, 
    error, 
    getFeaturedRecipes, 
    searchRecipes 
  } = useRecipes();
  
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [imageLoadError, setImageLoadError] = useState(false);

  // Hero background images with fallbacks
  const heroImages = [
    {
      primary: 'https://images.unsplash.com/photo-1556909074-f9ae4c0a7d8c?w=1920&h=1080&fit=crop&auto=format',
      fallback: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop&auto=format',
      alt: 'Delicious pizza with fresh ingredients'
    },
    {
      primary: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop&auto=format',
      fallback: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1920&h=1080&fit=crop&auto=format',
      alt: 'Fresh pasta with vegetables'
    },
    {
      primary: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1920&h=1080&fit=crop&auto=format',
      fallback: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1920&h=1080&fit=crop&auto=format',
      alt: 'Gourmet burger with fresh toppings'
    },
    {
      primary: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1920&h=1080&fit=crop&auto=format',
      fallback: 'https://images.unsplash.com/photo-1556909074-f9ae4c0a7d8c?w=1920&h=1080&fit=crop&auto=format',
      alt: 'Colorful fresh salad bowl'
    }
  ];

  // Recipe categories with enhanced styling - Updated for Spoonacular API
  const categories = [
    { id: 'all', name: 'All Recipes', icon: ChefHat, color: 'from-emerald-500 to-teal-500', count: '500k+' },
    { id: 'main course', name: 'Main Course', icon: Utensils, color: 'from-red-500 to-rose-500', count: '50k+' },
    { id: 'side dish', name: 'Side Dishes', icon: Coffee, color: 'from-blue-500 to-cyan-500', count: '25k+' },
    { id: 'dessert', name: 'Desserts', icon: Star, color: 'from-purple-500 to-pink-500', count: '30k+' },
    { id: 'appetizer', name: 'Appetizers', icon: Sparkles, color: 'from-orange-500 to-yellow-500', count: '20k+' },
    { id: 'breakfast', name: 'Breakfast', icon: Leaf, color: 'from-green-500 to-emerald-500', count: '15k+' }
  ];

  // Load initial data
  useEffect(() => {
    // Load featured recipes only once with caching
    const loadFeaturedRecipes = async () => {
      try {
        await getFeaturedRecipes(7); // Show only 7 recipes in featured section
      } catch (error) {
        console.error('Error loading featured recipes:', error);
      }
    };
    
    loadFeaturedRecipes();
  }, []); // Empty dependency array to run only once

  // Rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
      setImageLoadError(false); // Reset error state on image change
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (query) => {
    // First, try to find an exact recipe match
    const exactMatch = RecipeService.findRecipeByTitle(query);
    
    if (exactMatch) {
      // If exact match found, navigate directly to recipe details
      onRecipeSelect(exactMatch);
    } else {
      // If no exact match, perform regular search
      searchRecipes(query);
      onNavigate('search', { query });
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  const getCurrentImage = () => {
    const currentImageData = heroImages[heroImageIndex];
    return imageLoadError ? currentImageData.fallback : currentImageData.primary;
  };

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId);
    
    try {
      // Always show only 7 items in featured section
      if (categoryId === 'all') {
        await getFeaturedRecipes(7); // Show only 7 recipes
      } else {
        // For API categories, use type parameter instead of category
        const filterOptions = { type: categoryId, number: 7 };
        await getFeaturedRecipes(7, filterOptions);
      }
    } catch (error) {
      console.error('Error filtering recipes:', error);
      // Error handling is done in getFeaturedRecipes
    }
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

  const heroVariants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 1.5,
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
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${heroImageIndex}-${imageLoadError}`}
            className="absolute inset-0"
            variants={heroVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
          >
            <img
              src={getCurrentImage()}
              alt={heroImages[heroImageIndex].alt}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8">
              Discover Amazing
              <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Recipes
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-2xl md:text-3xl mb-10 text-gray-200 font-light"
            variants={itemVariants}
          >
            Find the perfect recipe for any occasion, ingredient, or craving
          </motion.p>
          
          <motion.div variants={itemVariants} className="mb-10">
            <AnimatedSearchBar 
              onSearch={handleSearch}
              onRecipeSelect={onRecipeSelect}
              placeholder="Search thousands of recipes..." 
              autoFocus={false}
            />
          </motion.div>


        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-2 h-4 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Surprise Me Feature Promotion */}
      <motion.section 
        className="py-20 px-4 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full mb-6 shadow-glow"
              whileHover={{ scale: 1.05 }}
              animate={{
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
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
              <span className="font-semibold text-lg">✨ NEW FEATURE ✨</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-800 dark:text-slate-200 mb-4">
              Surprise Me with
              <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Your Ingredients!
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Tell us what you have in your kitchen, and we'll find the perfect recipe for you with smart ingredient matching!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 p-1"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 h-full">
                <div className="space-y-6">
                  {/* Mock Ingredient Input */}
                  <div className="relative">
                    <div className="flex items-center space-x-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-600">
                      <Search className="w-5 h-5 text-orange-500" />
                      <span className="text-orange-700 dark:text-orange-300 font-medium">
                        Type ingredients: tomatoes, onions...
                      </span>
                    </div>
                  </div>
                  
                  {/* Mock Ingredient Tags */}
                  <div className="flex flex-wrap gap-3">
                    {['Tomatoes', 'Onions', 'Paneer', 'Spices'].map((ingredient, idx) => (
                      <motion.div
                        key={ingredient}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full shadow-soft"
                        initial={{ opacity: 0, scale: 0, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: idx * 0.2 + 0.5, duration: 0.3 }}
                      >
                        <span className="font-medium text-sm">{ingredient}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Mock Recipe Results */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <span>Perfect Match Found!</span>
                    </h3>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800 dark:text-green-200">Paneer Butter Masala</span>
                        <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                          95% Match
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Using: Tomatoes, Onions, Paneer + 2 more ingredients
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div>
              <div className="space-y-8">
                {/* Feature Highlights */}
                <div className="space-y-6">
                  <motion.div 
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Search className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">
                        Smart Ingredient Matching
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Our AI understands ingredient relationships and finds recipes that work with what you have.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">
                        Reduce Food Waste
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Transform leftover ingredients into delicious meals instead of throwing them away.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">
                        Complete Recipe Details
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Get full recipes with ingredients, instructions, and cooking tips - just like our regular recipes.
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    onClick={() => onNavigate('surprise')}
                    className="btn-primary bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex items-center space-x-3 text-lg px-8 py-4"
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6" />
                    <span>Try Surprise Me!</span>
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>
                  
                  <motion.button
                    className="btn-secondary flex items-center space-x-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Scroll to categories section
                      document.querySelector('[data-section="categories"]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <ChefHat className="w-5 h-5" />
                    <span>Browse Recipes</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Recipe Categories */}
      <motion.section 
        className="py-20 px-4"
        variants={itemVariants}
        data-section="categories"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6">
              Browse by Category
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Find exactly what you're looking for with our carefully curated recipe categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {categories.map(({ id, name, icon: Icon, color, count }, index) => (
              <motion.button
                key={id}
                onClick={() => handleCategoryFilter(id)}
                className={`p-6 rounded-3xl text-center transition-all duration-500 ${
                  selectedCategory === id
                    ? `bg-gradient-to-r ${color} text-white shadow-glow transform scale-105`
                    : 'glass-card hover:shadow-2xl hover:scale-105'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: selectedCategory === id ? 1.05 : 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-10 h-10 mx-auto mb-4 ${
                  selectedCategory === id ? 'text-white' : 'text-emerald-500'
                }`} />
                <h3 className={`font-semibold text-lg mb-2 ${
                  selectedCategory === id ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {name}
                </h3>
                <p className={`text-sm ${
                  selectedCategory === id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {count}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Recipes */}
      <motion.section 
        className="py-20 px-4 bg-gradient-cool"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-800 dark:text-slate-200 mb-4">
                Featured Recipes
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Handpicked recipes you'll absolutely love
              </p>
            </div>
            
            <motion.button
              onClick={() => onNavigate('search', { showAll: true })}
              className="btn-primary hidden md:flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-2xl mb-6" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {featuredRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => onRecipeSelect(recipe)}
                  variant="featured"
                  index={index}
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-red-500 mb-6 text-lg">{error}</p>
              <motion.button
                onClick={() => getFeaturedRecipes(7)}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          )}
        </div>
      </motion.section>

      {/* API Status Section */}
      <motion.section 
        className="py-16 px-4"
        variants={itemVariants}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-slate-200 mb-4">
              Recipe Data Source
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Monitor your API connection and data source status
            </p>
          </div>
          <ApiStatusCard />
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-24 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white"
        variants={itemVariants}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">
            Ready to Start Cooking?
          </h2>
          <p className="text-2xl mb-12 text-white/90 max-w-3xl mx-auto">
            Join thousands of home cooks discovering new flavors and creating amazing meals every day
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              onClick={() => onNavigate('search')}
              className="btn-secondary bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore All Recipes
            </motion.button>
            
            <motion.button
              onClick={() => onNavigate('favorites')}
              className="btn-secondary border-white text-white hover:bg-white hover:text-emerald-600 text-lg px-8 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Favorites
            </motion.button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;