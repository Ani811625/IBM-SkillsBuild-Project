import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppState, actions } from './context/AppContext';
import SplashScreen from './components/common/SplashScreen';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import StatsPage from './pages/StatsPage';
import SurprisePage from './pages/SurprisePage';
import { useRecipes } from './hooks/useApp';

// Main App Content
function AppContent() {
  const { showSplash, currentPage } = useAppState();
  const { getRecipeDetails } = useRecipes();
  const [currentPageState, setCurrentPageState] = useState('home');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllRecipes, setShowAllRecipes] = useState(false);

  const handleNavigation = (page, data = {}) => {
    setCurrentPageState(page);
    if (data.query) {
      setSearchQuery(data.query);
    }
    if (data.showAll) {
      setShowAllRecipes(data.showAll);
    } else {
      setShowAllRecipes(false);
    }
  };

  const handleRecipeSelect = async (recipe) => {
    try {
      const detailedRecipe = await getRecipeDetails(recipe.id);
      setSelectedRecipe(detailedRecipe || recipe);
      setCurrentPageState('recipe-details');
    } catch (error) {
      console.error('Error loading recipe details:', error);
      setSelectedRecipe(recipe);
      setCurrentPageState('recipe-details');
    }
  };

  const handleBackFromRecipe = () => {
    setSelectedRecipe(null);
    setCurrentPageState('home');
  };

  const handleSplashComplete = () => {
    // The splash screen completion is handled by the context
  };

  const renderCurrentPage = () => {
    switch (currentPageState) {
      case 'home':
        return (
          <HomePage 
            onNavigate={handleNavigation}
            onRecipeSelect={handleRecipeSelect}
          />
        );
      case 'recipes':
        return (
          <SearchResultsPage 
            onRecipeSelect={handleRecipeSelect}
            initialQuery={''}
            showAll={true}
          />
        );
      case 'search':
        return (
          <SearchResultsPage 
            onRecipeSelect={handleRecipeSelect}
            initialQuery={searchQuery}
            showAll={showAllRecipes}
          />
        );
      case 'favorites':
        return (
          <FavoritesPage 
            onRecipeSelect={handleRecipeSelect}
          />
        );
      case 'meal-planner':
        return (
          <MealPlannerPage 
            onRecipeSelect={handleRecipeSelect}
          />
        );
      case 'stats':
        return (
          <StatsPage />
        );
      case 'surprise':
        return (
          <SurprisePage 
            onRecipeSelect={handleRecipeSelect}
          />
        );
      case 'recipe-details':
        return (
          <RecipeDetailsPage 
            recipe={selectedRecipe}
            onBack={handleBackFromRecipe}
          />
        );
      case 'shopping':
        return (
          <div className="pt-16 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Shopping List
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Shopping list page coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return (
          <HomePage 
            onNavigate={handleNavigation}
            onRecipeSelect={handleRecipeSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        ) : (
          <>
            <Header 
              currentPage={currentPageState}
              onNavigate={handleNavigation}
            />
            <AnimatePresence mode="wait">
              {renderCurrentPage()}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main App Component with Provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
