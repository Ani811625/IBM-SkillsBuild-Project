# Flavory - Netlify Deployment Guide

## 🚀 Netlify Deployment Steps

### Method 1: Git-based Deployment (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit - Flavory Recipe Finder"
git branch -M main
git remote add origin https://github.com/aniruddhasarkar/recipe-finder.git
git push -u origin main
```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your `recipe-finder` repository
   - Build settings will be auto-detected from `netlify.toml`

3. **Deploy Settings** (auto-configured):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20

### Method 2: Manual Deployment

1. **Build the project**:
```bash
npm run build
```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder to the deploy area

### Method 3: Netlify CLI

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login and deploy**:
```bash
netlify login
npm run build
netlify deploy --prod --dir=dist
```

## ⚙️ Configuration Applied

### ✅ Netlify Optimizations:
- **Base URL**: Updated to `/` (root domain)
- **SPA Routing**: Redirects configured for React Router
- **Performance Headers**: Caching and security headers
- **Build Environment**: Node.js 20 specified
- **Asset Optimization**: Immutable caching for static assets

### ✅ Updated Files:
- `vite.config.js` - Base URL changed from `/recipe-finder/` to `/`
- `package.json` - Homepage updated to Netlify URL
- `netlify.toml` - Complete Netlify configuration
- `index.html` - Updated meta tags for Netlify domain
- `performance.js` - Updated base URL configuration

## 🌐 Live URL
Your app will be available at:
`https://flavory-recipes.netlify.app`

(Or your custom domain if configured)

## 🎯 Features Optimized for Netlify:

- ✅ **12.5-second Splash Screen** with Aniruddha's name
- ✅ **All Framer Motion Animations** work perfectly
- ✅ **50+ Indian Recipes** with authentic images
- ✅ **SPA Routing** - All page navigation works
- ✅ **Service Worker** - Offline functionality
- ✅ **Performance Headers** - Fast loading
- ✅ **SEO Optimization** - Search engine friendly

## 🔧 Netlify-Specific Features:

- **Instant Cache Invalidation**: Updates deploy immediately
- **Branch Previews**: Test changes before going live
- **Form Handling**: Ready for contact forms (if added)
- **Edge Functions**: Serverless functions support
- **Analytics**: Built-in performance monitoring

## 🚀 Ready to Deploy!
Your Flavory app is now optimized for Netlify with all animations and features working smoothly!