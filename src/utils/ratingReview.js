// Rating and Review System for Recipes
// Provides star ratings, reviews, and user feedback functionality

import LocalStorageManager from './localStorage';

class RatingReviewManager {
  constructor() {
    this.storageKey = 'recipe_ratings_reviews';
    this.userStorageKey = 'user_recipe_interactions';
  }

  // Get all ratings and reviews
  getAllRatingsReviews() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading ratings and reviews:', error);
      return {};
    }
  }

  // Save ratings and reviews
  saveRatingsReviews(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving ratings and reviews:', error);
      return false;
    }
  }

  // Get user interactions
  getUserInteractions() {
    try {
      const stored = localStorage.getItem(this.userStorageKey);
      return stored ? JSON.parse(stored) : {
        ratings: {},
        reviews: {},
        helpful: {},
        cooked: {},
        lastActivity: null
      };
    } catch (error) {
      console.error('Error loading user interactions:', error);
      return { ratings: {}, reviews: {}, helpful: {}, cooked: {} };
    }
  }

  // Save user interactions
  saveUserInteractions(data) {
    try {
      data.lastActivity = Date.now();
      localStorage.setItem(this.userStorageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving user interactions:', error);
      return false;
    }
  }

  // Add or update a rating for a recipe
  addRating(recipeId, rating, userId = 'anonymous') {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const allData = this.getAllRatingsReviews();
    const userInteractions = this.getUserInteractions();
    
    if (!allData[recipeId]) {
      allData[recipeId] = {
        ratings: [],
        reviews: [],
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        createdAt: Date.now()
      };
    }

    const recipeData = allData[recipeId];
    
    // Check if user has already rated this recipe
    const existingRatingIndex = recipeData.ratings.findIndex(r => r.userId === userId);
    
    if (existingRatingIndex >= 0) {
      // Update existing rating
      const oldRating = recipeData.ratings[existingRatingIndex].rating;
      recipeData.ratings[existingRatingIndex] = {
        ...recipeData.ratings[existingRatingIndex],
        rating,
        updatedAt: Date.now()
      };
      
      // Update distribution
      recipeData.ratingDistribution[oldRating]--;
      recipeData.ratingDistribution[rating]++;
    } else {
      // Add new rating
      recipeData.ratings.push({
        userId,
        rating,
        createdAt: Date.now()
      });
      
      recipeData.totalRatings++;
      recipeData.ratingDistribution[rating]++;
    }

    // Recalculate average rating
    const totalScore = recipeData.ratings.reduce((sum, r) => sum + r.rating, 0);
    recipeData.averageRating = totalScore / recipeData.ratings.length;
    recipeData.updatedAt = Date.now();

    // Update user interactions
    userInteractions.ratings[recipeId] = {
      rating,
      ratedAt: Date.now()
    };

    this.saveRatingsReviews(allData);
    this.saveUserInteractions(userInteractions);

    return {
      averageRating: recipeData.averageRating,
      totalRatings: recipeData.totalRatings,
      userRating: rating
    };
  }

  // Add a review for a recipe
  addReview(recipeId, reviewData, userId = 'anonymous') {
    const { title, comment, rating, cookingNotes, difficulty, wouldRecommend = true } = reviewData;
    
    if (!title || !comment) {
      throw new Error('Review title and comment are required');
    }

    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const allData = this.getAllRatingsReviews();
    const userInteractions = this.getUserInteractions();
    
    if (!allData[recipeId]) {
      allData[recipeId] = {
        ratings: [],
        reviews: [],
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        createdAt: Date.now()
      };
    }

    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const review = {
      id: reviewId,
      userId,
      title,
      comment,
      rating: rating || null,
      cookingNotes: cookingNotes || '',
      difficulty: difficulty || null,
      wouldRecommend,
      helpful: 0,
      notHelpful: 0,
      helpfulUsers: [],
      createdAt: Date.now()
    };

    allData[recipeId].reviews.push(review);
    
    // If review includes rating, add it
    if (rating) {
      this.addRating(recipeId, rating, userId);
    }

    // Update user interactions
    userInteractions.reviews[recipeId] = {
      reviewId,
      reviewedAt: Date.now()
    };

    this.saveRatingsReviews(allData);
    this.saveUserInteractions(userInteractions);

    return review;
  }

  // Mark a review as helpful or not helpful
  markReviewHelpful(recipeId, reviewId, isHelpful, userId = 'anonymous') {
    const allData = this.getAllRatingsReviews();
    const userInteractions = this.getUserInteractions();
    
    if (!allData[recipeId] || !allData[recipeId].reviews) {
      throw new Error('Recipe or reviews not found');
    }

    const review = allData[recipeId].reviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Check if user has already marked this review
    const hasMarked = review.helpfulUsers.includes(userId);
    
    if (!hasMarked) {
      if (isHelpful) {
        review.helpful++;
      } else {
        review.notHelpful++;
      }
      review.helpfulUsers.push(userId);
      
      // Track user interaction
      if (!userInteractions.helpful[recipeId]) {
        userInteractions.helpful[recipeId] = {};
      }
      userInteractions.helpful[recipeId][reviewId] = {
        isHelpful,
        markedAt: Date.now()
      };
      
      this.saveRatingsReviews(allData);
      this.saveUserInteractions(userInteractions);
    }

    return {
      helpful: review.helpful,
      notHelpful: review.notHelpful,
      userMarked: hasMarked
    };
  }

  // Mark recipe as cooked
  markAsCooked(recipeId, userId = 'anonymous', notes = '') {
    const userInteractions = this.getUserInteractions();
    
    userInteractions.cooked[recipeId] = {
      cookedAt: Date.now(),
      notes,
      count: (userInteractions.cooked[recipeId]?.count || 0) + 1
    };
    
    this.saveUserInteractions(userInteractions);
    
    return userInteractions.cooked[recipeId];
  }

  // Get recipe ratings and reviews
  getRecipeData(recipeId) {
    const allData = this.getAllRatingsReviews();
    const userInteractions = this.getUserInteractions();
    
    const recipeData = allData[recipeId] || {
      ratings: [],
      reviews: [],
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    const userRating = userInteractions.ratings[recipeId]?.rating || null;
    const userReview = userInteractions.reviews[recipeId] || null;
    const userCooked = userInteractions.cooked[recipeId] || null;

    return {
      ...recipeData,
      userRating,
      userReview,
      userCooked,
      reviews: recipeData.reviews.sort((a, b) => b.helpful - a.helpful) // Sort by helpfulness
    };
  }

  // Get user's rating for a specific recipe
  getUserRating(recipeId, userId = 'anonymous') {
    const userInteractions = this.getUserInteractions();
    return userInteractions.ratings[recipeId]?.rating || null;
  }

  // Get recipe statistics
  getRecipeStats(recipeId) {
    const data = this.getRecipeData(recipeId);
    
    return {
      averageRating: Math.round(data.averageRating * 10) / 10,
      totalRatings: data.totalRatings,
      totalReviews: data.reviews.length,
      ratingDistribution: data.ratingDistribution,
      recommendationRate: data.reviews.length > 0 ? 
        Math.round((data.reviews.filter(r => r.wouldRecommend).length / data.reviews.length) * 100) : 0
    };
  }

  // Get trending recipes based on recent ratings
  getTrendingRecipes(limit = 10) {
    const allData = this.getAllRatingsReviews();
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const trending = Object.entries(allData)
      .map(([recipeId, data]) => {
        const recentRatings = data.ratings.filter(r => r.createdAt > thirtyDaysAgo);
        const recentReviews = data.reviews.filter(r => r.createdAt > thirtyDaysAgo);
        const recentActivity = recentRatings.length + recentReviews.length;
        
        return {
          recipeId,
          averageRating: data.averageRating,
          totalRatings: data.totalRatings,
          recentActivity,
          score: (data.averageRating * 0.6) + (recentActivity * 0.4)
        };
      })
      .filter(recipe => recipe.recentActivity > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return trending;
  }

  // Export user data
  exportUserData() {
    const userInteractions = this.getUserInteractions();
    return {
      ...userInteractions,
      exportedAt: Date.now(),
      version: '1.0'
    };
  }

  // Clear all user data
  clearUserData() {
    try {
      localStorage.removeItem(this.userStorageKey);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }
}

// Create singleton instance
export const ratingReviewManager = new RatingReviewManager();
export default RatingReviewManager;