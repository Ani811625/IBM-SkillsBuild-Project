import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Search, 
  Heart, 
  Calendar, 
  Home, 
  Menu, 
  X,
  ShoppingCart,
  Target,
  Sparkles
} from 'lucide-react';

const Header = ({ currentPage, onNavigate, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', icon: Home, key: 'home' },
    { name: 'Recipes', icon: Search, key: 'recipes' },
    { name: 'Surprise', icon: Sparkles, key: 'surprise' },
    { name: 'Favorites', icon: Heart, key: 'favorites' },
    { name: 'Meal Planner', icon: Calendar, key: 'meal-planner' },
    { name: 'Stats', icon: Target, key: 'stats' }
  ];

  const headerVariants = {
    scrolled: {
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderBottom: '1px solid rgba(75, 85, 99, 0.3)'
    },
    top: {
      backdropFilter: 'blur(0px)',
      backgroundColor: 'rgba(17, 24, 39, 0)',
      borderBottom: '1px solid transparent'
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const navItemVariants = {
    inactive: {
      scale: 1,
      color: 'var(--text-secondary)'
    },
    active: {
      scale: 1.05,
      color: 'var(--text-primary)'
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/30 shadow-lg' 
            : 'bg-transparent'
        }`}
        initial="top"
        animate={isScrolled ? 'scrolled' : 'top'}
        variants={headerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => onNavigate('home')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <ChefHat className="w-8 h-8 text-primary-600" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <span className="text-xl font-display font-bold text-gradient hidden sm:block">
                Flavory
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map(({ name, icon: Icon, key }) => (
                <motion.button
                  key={key}
                  onClick={() => onNavigate(key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === key
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                  variants={navItemVariants}
                  initial="inactive"
                  animate={currentPage === key ? 'active' : 'inactive'}
                  whileHover="hover"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{name}</span>
                </motion.button>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 bg-gray-900 shadow-2xl z-50 md:hidden"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <ChefHat className="w-8 h-8 text-primary-600" />
                    <span className="text-xl font-display font-bold text-gradient">
                      Flavory
                    </span>
                  </div>
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg bg-gray-800 text-gray-300"
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <nav className="space-y-4">
                  {navigation.map(({ name, icon: Icon, key }, index) => (
                    <motion.button
                      key={key}
                      onClick={() => {
                        onNavigate(key);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        currentPage === key
                          ? 'text-primary-600 bg-primary-900/20'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{name}</span>
                    </motion.button>
                  ))}
                </nav>


              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;