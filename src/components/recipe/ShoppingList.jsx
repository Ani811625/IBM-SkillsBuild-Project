import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Check, Download, Share2 } from 'lucide-react';

const ShoppingList = ({ recipe }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    // Load saved shopping list from localStorage
    const savedList = localStorage.getItem('shoppingList');
    if (savedList) {
      setItems(JSON.parse(savedList));
    }
  }, []);

  useEffect(() => {
    // Save shopping list to localStorage whenever it changes
    localStorage.setItem('shoppingList', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (newItem.trim()) {
      const newShoppingItem = {
        id: Date.now(),
        name: newItem.trim(),
        quantity: 1,
        checked: false,
        category: 'Other'
      };
      setItems([...items, newShoppingItem]);
      setNewItem('');
    }
  };

  const addRecipeIngredients = () => {
    if (recipe && recipe.extendedIngredients) {
      const recipeItems = recipe.extendedIngredients.map(ingredient => ({
        id: Date.now() + Math.random(),
        name: ingredient.original || ingredient.name,
        quantity: 1,
        checked: false,
        category: 'Recipe Ingredients'
      }));
      setItems([...items, ...recipeItems]);
    }
  };

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const updateQuantity = (id, change) => {
    setItems(items.map(item => 
      item.id === id ? { 
        ...item, 
        quantity: Math.max(1, item.quantity + change) 
      } : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(items.filter(item => !item.checked));
  };

  const clearAll = () => {
    setItems([]);
  };

  const exportList = () => {
    const listText = items.map(item => 
      `${item.checked ? '✓' : '○'} ${item.name} (${item.quantity})`
    ).join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareList = async () => {
    const listText = items.map(item => 
      `${item.checked ? '✓' : '○'} ${item.name} (${item.quantity})`
    ).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Shopping List',
          text: listText
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(listText);
      alert('Shopping list copied to clipboard!');
    }
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
          <ShoppingCart className="w-6 h-6 text-emerald-500" />
          <span>Shopping List</span>
          {totalCount > 0 && (
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-sm font-medium">
              {checkedCount}/{totalCount}
            </span>
          )}
        </h3>
        <motion.button
          onClick={() => setShowList(!showList)}
          className="btn-secondary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{showList ? 'Hide' : 'Show'} List</span>
        </motion.button>
      </div>

      {/* Add Recipe Ingredients Button */}
      {recipe && (
        <motion.button
          onClick={addRecipeIngredients}
          className="btn-primary w-full mb-4 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Recipe Ingredients</span>
        </motion.button>
      )}

      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Add New Item */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                placeholder="Add new item..."
                className="input-field flex-1"
              />
              <motion.button
                onClick={addItem}
                className="btn-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </motion.button>
            </div>

            {/* Shopping List Items */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                      item.checked 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <motion.button
                      onClick={() => toggleItem(item.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        item.checked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {item.checked && <Check className="w-4 h-4" />}
                    </motion.button>

                    <div className="flex-1">
                      <span className={`font-medium ${
                        item.checked 
                          ? 'line-through text-slate-500 dark:text-slate-400' 
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {item.name}
                      </span>
                      {item.category && (
                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                          ({item.category})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      
                      <span className="w-8 text-center font-medium text-slate-800 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      
                      <motion.button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <motion.button
                  onClick={clearCompleted}
                  className="btn-secondary text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Completed
                </motion.button>
                
                <motion.button
                  onClick={clearAll}
                  className="btn-secondary text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                </motion.button>
                
                <motion.button
                  onClick={exportList}
                  className="btn-secondary text-sm flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </motion.button>
                
                <motion.button
                  onClick={shareList}
                  className="btn-secondary text-sm flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShoppingList;
