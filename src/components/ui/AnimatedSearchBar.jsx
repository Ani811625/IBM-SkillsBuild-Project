import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, X } from 'lucide-react';
const AnimatedSearchBar = ({ onSearch, onRecipeSelect, placeholder = "Search recipes...", autoFocus = false }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Dynamic search suggestions
  const placeholders = [
    "Type ingredients... 🍅🥕🍗",
    "Search for pasta recipes...",
    "Find healthy meals...",
    "Discover dessert ideas...",
    "Quick dinner recipes...",
    "Vegetarian options..."
  ];

  // Typewriter effect for placeholder
  useEffect(() => {
    if (isFocused || query) return;

    const currentText = placeholders[placeholderIndex];
    
    const typeTimer = setTimeout(() => {
      if (charIndex < currentText.length) {
        setCurrentPlaceholder(currentText.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else {
        // Wait before starting to delete
        setTimeout(() => {
          const deleteTimer = setInterval(() => {
            setCharIndex(prev => {
              if (prev > 0) {
                setCurrentPlaceholder(currentText.slice(0, prev - 1));
                return prev - 1;
              } else {
                clearInterval(deleteTimer);
                setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
                return 0;
              }
            });
          }, 50);
        }, 2000);
      }
    }, 100);

    return () => clearTimeout(typeTimer);
  }, [placeholderIndex, charIndex, isFocused, query]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Voice search setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const startVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const searchBarVariants = {
    unfocused: {
      scale: 1,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    focused: {
      scale: 1.02,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        className="relative"
        variants={searchBarVariants}
        animate={isFocused ? 'focused' : 'unfocused'}
      >
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false);
              }, 200);
            }}
            placeholder={isFocused || query ? placeholder : currentPlaceholder}
            className="w-full pl-12 pr-20 py-4 bg-white/90 dark:bg-gray-800/90 border-2 border-transparent rounded-2xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-300 text-lg placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-lg"
          />
          
          {/* Search Icon */}
          <motion.div
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            animate={{
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? '#f97316' : '#6b7280'
            }}
          >
            <Search className="w-6 h-6" />
          </motion.div>

          {/* Right side controls */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Clear button */}
            <AnimatePresence>
              {query && (
                <motion.button
                  onClick={clearSearch}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Voice search button */}
            {recognitionRef.current && (
              <motion.button
                onClick={startVoiceSearch}
                disabled={isListening}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isListening ? {
                  scale: [1, 1.1, 1],
                  transition: {
                    duration: 1,
                    repeat: Infinity
                  }
                } : {}}
              >
                <Mic className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>


      </motion.div>

      {/* Voice search indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-red-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <motion.div
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity
              }}
            />
            <span className="text-sm font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedSearchBar;