import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Sparkles, Heart, Star, Zap, Code, Coffee, Award, Target } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Professional loading messages
  const loadingMessages = [
    "Initializing Flavory...",
    "Loading Recipe Database...",
    "Preparing User Interface...",
    "Setting up Features...",
    "Almost Ready...",
    "Welcome to Flavory!"
  ];

  // Professional brand messages
  const brandMessages = [
    "Discover Authentic Indian Cuisine",
    "50+ Traditional Recipes",
    "From Street Food to Royal Delicacies",
    "Your Culinary Journey Starts Here"
  ];

  useEffect(() => {
    // Professional timing sequence
    const timer1 = setTimeout(() => setAnimationStage(1), 800);
    const timer2 = setTimeout(() => setAnimationStage(2), 2000);
    const timer3 = setTimeout(() => setAnimationStage(3), 3500);
    const timer4 = setTimeout(() => setAnimationStage(4), 5500);
    const timer5 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, 7000);

    // Loading progress simulation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    // Brand message carousel
    const messageInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % brandMessages.length);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  // Professional animation variants
  const logoVariants = {
    initial: { 
      scale: 0,
      opacity: 0,
      rotateY: 180
    },
    animate: { 
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        scale: {
          type: "spring",
          stiffness: 200,
          damping: 20
        }
      }
    }
  };

  const textSlideVariants = {
    initial: { 
      opacity: 0, 
      y: 30,
      filter: "blur(10px)"
    },
    animate: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    initial: { scaleX: 0 },
    animate: { 
      scaleX: 1,
      transition: {
        duration: 6,
        ease: "easeOut"
      }
    }
  };

  const particleVariants = {
    animate: {
      y: [-20, -100],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)"
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Professional dark background with subtle patterns */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated grid pattern */}
            <motion.div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px'
              }}
              animate={{
                backgroundPosition: ['0 0', '100px 100px']
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            {/* Floating particles - minimal and elegant */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                variants={particleVariants}
                animate="animate"
                transition={{
                  delay: Math.random() * 5,
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity
                }}
              />
            ))}
            
            {/* Subtle gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/5 via-transparent to-teal-900/5" />
          </div>

          <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
            {/* Professional logo with sophisticated animation */}
            <div className="relative mb-16">
              <motion.div
                variants={logoVariants}
                initial="initial"
                animate={animationStage >= 0 ? "animate" : "initial"}
                className="relative"
              >
                <div className="relative">
                  {/* Main logo with professional styling */}
                  <motion.div
                    className="relative"
                    animate={{
                      rotateY: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ChefHat className="w-24 h-24 mx-auto text-emerald-400 drop-shadow-2xl" />
                  </motion.div>
                  
                  {/* Sophisticated glow effect */}
                  <motion.div
                    className="absolute inset-0 w-24 h-24 mx-auto bg-emerald-400/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                  
                  {/* Rotating rings */}
                  <motion.div
                    className="absolute inset-0 w-32 h-32 mx-auto border border-emerald-400/30 rounded-full"
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: {
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear'
                      },
                      scale: {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    }}
                  />
                  
                  <motion.div
                    className="absolute inset-0 w-40 h-40 mx-auto border border-teal-400/20 rounded-full"
                    animate={{
                      rotate: -360,
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      rotate: {
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear'
                      },
                      scale: {
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Professional brand title */}
            {animationStage >= 1 && (
              <motion.div
                variants={textSlideVariants}
                initial="initial"
                animate="animate"
                className="mb-12"
              >
                <motion.h1 
                  className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 tracking-tight"
                  animate={{
                    textShadow: [
                      '0 0 30px rgba(16, 185, 129, 0.3)',
                      '0 0 60px rgba(16, 185, 129, 0.5)',
                      '0 0 30px rgba(16, 185, 129, 0.3)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Flavory
                  </span>
                </motion.h1>
                
                <div className="space-y-4">
                  <motion.p 
                    className="text-lg text-gray-300 font-medium tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Authentic Indian Cuisine Platform
                  </motion.p>
                  
                  <motion.div 
                    className="text-sm text-gray-400 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p>Created with ❤️ by</p>
                    <p className="text-emerald-400 font-semibold text-base">Aniruddha Sarkar</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Professional brand messages carousel */}
            {animationStage >= 2 && (
              <motion.div
                className="mt-8 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl max-w-lg mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTip}
                      className="text-center"
                      initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-lg text-gray-300 font-medium tracking-wide">
                        {brandMessages[currentTip]}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Professional loading progress */}
            {animationStage >= 3 && (
              <motion.div
                className="mt-12 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-center space-y-3">
                  <motion.h3 
                    className="text-lg text-gray-400 font-medium"
                    animate={{ 
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {loadingMessages[Math.min(animationStage - 3, loadingMessages.length - 1)]}
                  </motion.h3>
                </div>
                
                {/* Elegant progress bar */}
                <div className="w-80 mx-auto">
                  <div className="bg-white/10 rounded-full h-1 overflow-hidden backdrop-blur-xl">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full"
                      variants={progressVariants}
                      initial="initial"
                      animate="animate"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Initializing</span>
                    <span>{Math.round(Math.min(loadingProgress, 100))}%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Professional ready status */}
            {animationStage >= 4 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/30 text-emerald-400 px-8 py-4 rounded-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-center space-x-3">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                    <span className="text-lg font-semibold tracking-wide">Ready to explore amazing recipes!</span>
                    <motion.div
                      animate={{ 
                        rotate: -360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-96">
            <motion.p 
              className="text-center text-gray-400 text-sm font-medium"
              animate={{ 
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              © 2024 Flavory - Crafted with passion for authentic flavors
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;