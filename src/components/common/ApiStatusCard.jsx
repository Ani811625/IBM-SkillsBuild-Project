import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Globe, Key, Info, Clock, BarChart3, TrendingUp } from 'lucide-react';
import RecipeService from '../../services/recipeService';
import { apiUsageManager } from '../../utils/apiUsageManager';

const ApiStatusCard = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [connectionTest, setConnectionTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [usageStats, setUsageStats] = useState(null);

  useEffect(() => {
    // Check API status on component mount
    const status = RecipeService.getApiStatus();
    setApiStatus(status);
    
    // Get usage statistics
    const stats = apiUsageManager.getUsageStats();
    setUsageStats(stats);
    
    // Update usage stats every 30 seconds
    const interval = setInterval(() => {
      const updatedStats = apiUsageManager.getUsageStats();
      setUsageStats(updatedStats);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setConnectionTest(null);
    
    try {
      const result = await RecipeService.testConnection();
      setConnectionTest(result);
      
      // Update usage stats after test
      const updatedStats = apiUsageManager.getUsageStats();
      setUsageStats(updatedStats);
    } catch (error) {
      setConnectionTest({
        success: false,
        message: 'Connection test failed',
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const StatusIcon = ({ success, warning }) => {
    if (success) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (warning) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  if (!apiStatus) return null;

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Globe className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          API Status
        </h3>
      </div>

      <div className="space-y-4">
        {/* API Usage Statistics */}
        {usageStats && apiStatus.configured && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                Today's API Usage
              </h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Calls Used: {usageStats.calls} / {usageStats.limit}
                </span>
                <span className={`text-sm font-medium ${
                  usageStats.status === 'critical' ? 'text-red-600 dark:text-red-400' :
                  usageStats.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {usageStats.remaining} remaining
                </span>
              </div>
              
              {/* Usage Progress Bar */}
              <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usageStats.status === 'critical' ? 'bg-red-500' :
                    usageStats.status === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usageStats.usagePercent, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                <span>Cache hits: {usageStats.cached}</span>
                <span>Errors: {usageStats.errors}</span>
              </div>
              
              {/* Usage Warning */}
              {usageStats.status !== 'normal' && (
                <div className={`p-2 rounded text-xs ${
                  usageStats.status === 'critical' ? 
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {usageStats.status === 'critical' ? 
                    '⚠️ Critical: Very close to daily limit!' :
                    '⚠️ Warning: High API usage detected'
                  }
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* API Configuration Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <StatusIcon success={apiStatus.configured} warning={!apiStatus.configured} />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {apiStatus.configured ? 'API Configured' : 'Using Local Data'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {apiStatus.message}
              </p>
            </div>
          </div>
          {apiStatus.configured && (
            <motion.button
              onClick={testConnection}
              disabled={testing}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {testing ? 'Testing...' : 'Test API'}
            </motion.button>
          )}
        </div>

        {/* Connection Test Result */}
        {connectionTest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-3 rounded-lg ${
              connectionTest.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <StatusIcon success={connectionTest.success} />
              <div>
                <p className={`font-medium ${
                  connectionTest.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {connectionTest.message}
                </p>
                {connectionTest.remainingCalls && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    API calls remaining: {connectionTest.remainingCalls}
                  </p>
                )}
                {connectionTest.usageStats && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Daily usage: {connectionTest.usageStats.calls}/{connectionTest.usageStats.limit}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Setup Instructions */}
        {!apiStatus.configured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Spoonacular API Required
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  This app requires a Spoonacular API key to function. No recipes will be available without it.
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>1. Visit <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">spoonacular.com/food-api</a></li>
                  <li>2. Sign up for a free account (150 calls/day)</li>
                  <li>3. Copy your API key</li>
                  <li>4. Add it to your .env file: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">VITE_SPOONACULAR_API_KEY=your_key</code></li>
                  <li>5. Restart the development server</li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}

        {/* API Limit Information */}
        {connectionTest && !connectionTest.success && connectionTest.message.includes('402') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Daily API Limit Reached
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  You've used all 150 free API calls for today. The limit resets at midnight UTC.
                </p>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <p><strong>Options:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Wait until tomorrow for the limit to reset</li>
                    <li>Upgrade to a paid plan for more calls</li>
                    <li>Check your <a href="https://spoonacular.com/food-api/console#Dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-600">API dashboard</a> for usage details</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Data Source */}
        <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {apiStatus.configured ? (
              <>
                <Key className="w-4 h-4 inline mr-1" />
                Using live Spoonacular API data (500k+ recipes)
                {usageStats && (
                  <span className="block mt-1 text-xs">
                    Smart caching enabled • Local fallback available
                  </span>
                )}
              </>
            ) : (
              <>
                <Info className="w-4 h-4 inline mr-1" />
                API key required - Local recipes (60 available) used as fallback
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ApiStatusCard;