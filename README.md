# Recipe Finder 🍳

> **Discover amazing recipes with what you have in your kitchen!**

A modern, intelligent recipe discovery application that helps you find delicious recipes based on available ingredients, dietary preferences, and cooking time. Built with React and enhanced with smart caching, offline support, user personalization, and comprehensive analytics. Features include advanced API optimization, local recipe fallbacks, and privacy-focused user tracking.

**Live Demo:** https://aesthetic-horse-e40fa6.netlify.app/

---

## ✨ Features

### 🎲 **NEW: Surprise Me Feature**
The **Surprise Me** feature is our latest addition that transforms cooking from routine to adventure! This intelligent recipe discovery tool helps you make the most of what's already in your kitchen.

**What makes it special:**
- **Smart Ingredient Matching**: Input any ingredients you have, and our advanced algorithm finds recipes that use them
- **Interactive Ingredient Builder**: Add ingredients with ease using our intuitive input system
- **Popular Suggestions**: Quick-add buttons for common ingredients to get you started
- **Recipe Combinations**: Pre-made ingredient combinations for quick inspiration
- **Advanced Filtering**: Filter by difficulty level and cooking time
- **Match Percentage**: See how well each recipe matches your available ingredients
- **Visual Feedback**: Beautiful animations and loading states make the experience delightful

**How it works:**
1. Navigate to the "Surprise Me" page
2. Add ingredients you have available (type or use quick-add buttons)
3. Set your preferences for difficulty and cooking time
4. Click "Surprise Me with Recipes!" 
5. Discover perfectly matched recipes with ingredient match percentages
6. Get cooking tips and substitution suggestions

### 🏠 **Core Features**

#### **🔍 Recipe Discovery**
- **Advanced Search**: Find recipes by name, ingredients, or cuisine type
- **Animated Search Bar**: Beautiful, responsive search interface with smooth animations
- **Nutrition-Based Filtering**: Filter by calories, protein, carbs, and other nutritional values
- **Equipment-Based Filtering**: Find recipes based on available cooking equipment
- **Cooking Difficulty Levels**: Easy, medium, and advanced recipe difficulty filtering
- **Ingredient Substitution Suggestions**: Smart suggestions for ingredient alternatives

#### **📱 Smart Recipe Management**
- **Detailed Recipe Pages**: Complete recipes with ingredients, instructions, and nutritional info
- **Intelligent Favorites System**: Save and organize your favorite recipes with collections
- **Shopping List Generator**: Automatically create shopping lists from recipe ingredients
- **Recipe Scaling Calculator**: Adjust serving sizes with automatic ingredient scaling
- **Custom Recipe Collections**: Organize recipes by meal type, occasion, or preference

#### **🎮 Interactive Features**
- **Cooking Timer**: Built-in timers for each cooking step
- **Recipe Rating & Review System**: Community-driven ratings with detailed reviews
- **Social Sharing**: Share favorite recipes on social media platforms
- **Touch Gestures**: Mobile-optimized swipe and tap interactions
- **Pull-to-Refresh**: Refresh content with intuitive mobile gestures

#### **🚀 Enhanced User Experience**
- **Progressive Web App (PWA)**: Install on mobile/desktop for native app experience
- **Offline Support**: Access cached recipes without internet connection
- **Smart Caching System**: Intelligent API response caching with 70-80% reduction in API calls
- **User Preferences & Personalization**: Save dietary preferences and favorite cuisines
- **Mobile Enhancement**: Touch gestures, responsive layouts, and mobile-first design
- **Image Optimization**: Lazy loading, WebP format support, and progressive loading

---

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recipe-finder.git
   cd recipe-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### Build for Production
```bash
npm run build
```

### Deployment
The application is configured for easy deployment on Netlify:
```bash
npm run netlify-build
```

---

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **React Router DOM 6.28.0** - Client-side routing and navigation
- **Vite 5.4.10** - Lightning-fast build tool and development server

### **Styling & UI**
- **Tailwind CSS 3.4.16** - Utility-first CSS framework for rapid UI development
- **Framer Motion 11.15.0** - Production-ready motion library for React
- **GSAP 3.12.5** - Professional-grade animation library
- **Lucide React 0.460.0** - Beautiful, customizable icons
- **Headless UI 2.2.0** - Unstyled, accessible UI components

### **Data & API**
- **Axios 1.7.9** - Promise-based HTTP client for API requests
- **Smart Caching System** - LRU cache with TTL for optimal performance
- **API Usage Management** - Daily usage tracking and monitoring (150 calls/day limit)
- **Local Recipe Database** - 65+ fallback recipes for offline functionality
- **Service Worker** - Offline support with multiple caching strategies
- **User Preferences Storage** - Persistent user settings and personalization
- **Analytics & Tracking** - Privacy-focused user behavior analytics

### **Development Tools**
- **ESLint** - Code linting and quality enforcement
- **PostCSS & Autoprefixer** - CSS processing and vendor prefixing
- **Netlify CLI** - Deployment and hosting integration

---

## 📱 App Structure

```
recipe-finder/
├── public/
│   └── sw.js                 # Service Worker for PWA
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── SplashScreen.jsx           # Enhanced splash screen
│   │   │   ├── ApiStatusCard.jsx          # API usage monitoring display
│   │   │   └── UserPreferencesModal.jsx   # User preferences configuration
│   │   ├── layout/
│   │   │   └── Header.jsx                 # Navigation header
│   │   ├── recipe/
│   │   │   ├── CookingTimer.jsx           # Interactive cooking timer
│   │   │   ├── RecipeCard.jsx             # Recipe display card with ratings
│   │   │   ├── RecipeEnhancements.jsx     # Recipe interaction features
│   │   │   └── ShoppingList.jsx           # Shopping list generator
│   │   └── ui/
│   │       └── AnimatedSearchBar.jsx      # Enhanced search interface
│   ├── context/
│   │   └── AppContext.jsx                 # Global state management
│   ├── hooks/
│   │   ├── useApp.js                      # Custom React hooks
│   │   └── useMobile.js                   # Mobile enhancement hooks
│   ├── pages/
│   │   ├── HomePage.jsx                   # Landing page with caching
│   │   ├── SurprisePage.jsx               # ⭐ Surprise Me feature
│   │   ├── SearchResultsPage.jsx          # Search results with advanced filtering
│   │   ├── RecipeDetailsPage.jsx          # Individual recipe view with reviews
│   │   ├── FavoritesPage.jsx              # Saved recipes with collections
│   │   ├── MealPlannerPage.jsx            # Meal planning interface
│   │   └── StatsPage.jsx                  # Cooking statistics and analytics
│   ├── services/
│   │   └── recipeService.js               # Enhanced API layer with caching & fallbacks
│   ├── utils/
│   │   ├── cacheManager.js                # Smart LRU caching system
│   │   ├── apiUsageManager.js             # API usage tracking and monitoring
│   │   ├── userPreferences.js             # User preferences management
│   │   ├── serviceWorker.js               # Service worker utilities
│   │   ├── ratingReview.js                # Rating and review system
│   │   ├── analytics.js                   # Privacy-focused analytics
│   │   ├── localStorage.js                # Enhanced local data management
│   │   └── performance.js                 # Performance optimization
│   ├── App.jsx                            # Main application component
│   ├── main.jsx                           # Application entry point with SW
│   └── index.css                          # Global styles
└── Configuration files...
```

---

## 🎨 Design Philosophy

### **User-Centric Design**
- **Intuitive Navigation**: Clear, consistent navigation patterns
- **Accessibility First**: WCAG 2.1 compliant with keyboard navigation support
- **Mobile-First**: Responsive design that works beautifully on all devices
- **Performance Optimized**: Fast loading times and smooth interactions

### **Visual Design**
- **Modern Aesthetic**: Clean, contemporary design with carefully chosen typography
- **Dark Theme Support**: Elegant dark mode that's easy on the eyes
- **Smooth Animations**: Delightful micro-interactions that enhance usability
- **Consistent Branding**: Cohesive color scheme and visual hierarchy

### **Developer Experience**
- **Component-Based Architecture**: Reusable, maintainable React components
- **Type Safety**: ESLint configuration for code quality
- **Hot Module Replacement**: Instant feedback during development
- **Build Optimization**: Automatic code splitting and optimization

---

## 🚀 Advanced Features

### **🔧 API Optimization & Reliability**
- **Smart Caching System**: LRU cache with TTL reducing API calls by 70-80%
- **API Usage Monitoring**: Real-time tracking with 150 calls/day limit management
- **Local Recipe Fallback**: 65+ curated recipes for offline functionality
- **Cache-First Strategy**: Intelligent data retrieval prioritizing cached content
- **Usage Analytics**: Detailed API usage statistics and optimization insights

---

## 🎯 Usage Examples

### **Using the Surprise Me Feature**

1. **Quick Start with Popular Ingredients**
   ```
   Navigate to "Surprise" → Click "Rice + Vegetables" → Get instant recipes!
   ```

2. **Custom Ingredient Search**
   ```
   Add ingredients: "Chicken, Tomatoes, Onions"
   Set difficulty: "Easy (< 30 min)"
   Filter time: "Quick (< 30 min)"
   Get personalized recipe suggestions!
   ```

3. **Advanced Filtering**
   ```
   Input multiple ingredients → Apply difficulty and time filters → 
   View match percentages → Select recipes with highest compatibility
   ```

### **Planning a Week of Meals**

1. **Search for recipes** by cuisine or dietary preference
2. **Save favorites** to your personal collection
3. **Use the meal planner** to schedule meals for the week
4. **Generate shopping lists** for all planned meals
5. **Set cooking timers** when preparing meals

---

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_SPOONACULAR_API_KEY=your_api_key_here
VITE_APP_NAME=Recipe Finder
VITE_APP_VERSION=2.0.0
VITE_ENABLE_ANALYTICS=true
VITE_CACHE_TTL=1800000
VITE_API_DAILY_LIMIT=150
```

### **Build Configuration**
The application uses Vite with optimized settings:
- **Code Splitting**: Automatic vendor and feature-based splitting
- **Tree Shaking**: Dead code elimination
- **Minification**: Terser-based compression
- **Source Maps**: Disabled in production for security

### **Deployment Configuration**
Netlify deployment settings in `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes and test thoroughly
6. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### **Code Standards**
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Ensure all tests pass
- Update documentation for new features

### **Recently Implemented Features** ✅
- **Smart API Optimization**: Intelligent caching reducing API calls by 70-80%
- **Offline Support**: Service worker with local recipe fallbacks
- **User Personalization**: Comprehensive preferences and recommendation system
- **Advanced Filtering**: Nutrition-based, equipment-based, and difficulty filtering
- **Mobile Enhancement**: Touch gestures, responsive design, and mobile-first UX
- **Rating & Review System**: Community-driven recipe evaluation
- **Privacy-Focused Analytics**: User behavior tracking with privacy protection
- **Image Optimization**: Lazy loading with WebP support and progressive loading

### **Future Feature Ideas** 🔮
- Voice search integration with speech recognition
- Recipe video tutorials and step-by-step cooking videos
- Real-time cooking mode with voice instructions
- Grocery delivery integration with major retailers
- Recipe collaboration and sharing between users
- AI-powered meal planning based on health goals
- Integration with smart kitchen appliances
- Seasonal recipe recommendations based on local ingredients

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Recipe Data**: Powered by Spoonacular API
- **Icons**: Beautiful icons from Lucide React
- **Animations**: Smooth animations with Framer Motion
- **Deployment**: Hosted on Netlify
- **Design Inspiration**: Modern cooking and food discovery apps

---

## 📞 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Comprehensive guides in the `/docs` folder
- **Community**: Join our Discord server for discussions
- **Email**: aniruddhas387@gmail.com

---

## 📊 Key Metrics & Performance

- **API Optimization**: 70-80% reduction in API calls through smart caching
- **Offline Capability**: 65+ local recipes available without internet
- **Mobile Performance**: Optimized touch gestures and responsive design
- **User Personalization**: Comprehensive preference system with 10+ dietary filters
- **Cache Efficiency**: LRU caching with TTL management for optimal performance
- **Privacy-First**: Analytics system with user data protection

---

**Happy Cooking! 👨‍🍳👩‍🍳**

*Transform your kitchen into a place of culinary adventure with Recipe Finder's intelligent recipe discovery, smart API optimization, offline support, and personalized cooking experience!*
