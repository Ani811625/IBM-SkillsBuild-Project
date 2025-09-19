import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  Utensils, 
  Users, 
  Heart, 
  Award,
  TrendingUp,
  Clock,
  Star,
  ChefHat,
  Calendar,
  Bookmark,
  Share2
} from 'lucide-react';

const StatsPage = () => {
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

  const stats = [
    {
      category: "Recipe Collection",
      items: [
        { icon: Utensils, label: 'Total Recipes', value: '10,000+', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/20' },
        { icon: ChefHat, label: 'Cuisines', value: '25+', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
        { icon: Clock, label: 'Quick Recipes', value: '2,500+', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
        { icon: Star, label: 'Premium Recipes', value: '500+', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' }
      ]
    },
    {
      category: "Community",
      items: [
        { icon: Users, label: 'Active Users', value: '150,000+', color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/20' },
        { icon: Heart, label: 'Recipe Favorites', value: '2.5M+', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20' },
        { icon: Share2, label: 'Recipes Shared', value: '500K+', color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/20' },
        { icon: Award, label: 'Top Rated', value: '4.9/5', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' }
      ]
    },
    {
      category: "User Engagement",
      items: [
        { icon: TrendingUp, label: 'Daily Searches', value: '25,000+', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
        { icon: Calendar, label: 'Meal Plans Created', value: '100K+', color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/20' },
        { icon: Bookmark, label: 'Saved Collections', value: '750K+', color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/20' },
        { icon: Clock, label: 'Cooking Time Saved', value: '500+ hrs', color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/20' }
      ]
    }
  ];

  return (
    <motion.div
      className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full mb-6 shadow-glow">
            <Target className="w-6 h-6" />
            <span className="font-semibold text-lg">Platform Statistics</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6">
            Recipe Finder
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Statistics
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Discover the impressive numbers behind our culinary community and platform growth
          </p>
        </motion.div>

        {/* Stats Sections */}
        <div className="space-y-20">
          {stats.map((section, sectionIndex) => (
            <motion.div key={section.category} variants={itemVariants}>
              <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200 mb-12 text-center">
                {section.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.items.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="glass-card p-8 text-center hover:shadow-2xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sectionIndex * 0.2) + (index * 0.1) }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                      {stat.value}
                    </div>
                    <div className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Growth Chart Section */}
        <motion.div 
          className="mt-20 glass-card p-12 text-center"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6">
            Platform Growth
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Our recipe platform continues to grow every day, bringing more delicious possibilities to food enthusiasts worldwide
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">200%</div>
              <div className="text-slate-600 dark:text-slate-400">User Growth</div>
              <div className="text-sm text-slate-500 dark:text-slate-500">Last 12 months</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">350%</div>
              <div className="text-slate-600 dark:text-slate-400">Recipe Additions</div>
              <div className="text-sm text-slate-500 dark:text-slate-500">Last 12 months</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">180%</div>
              <div className="text-slate-600 dark:text-slate-400">Engagement Rate</div>
              <div className="text-sm text-slate-500 dark:text-slate-500">Last 12 months</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-20 text-center"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6">
            Be Part of Our Growing Community
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of passionate cooks discovering new recipes and sharing their culinary adventures
          </p>
          <motion.button
            className="btn-primary text-lg px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Cooking Today
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsPage;