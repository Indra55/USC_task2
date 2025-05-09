import React from 'react';
import { AQI_CATEGORIES } from '../services/DataService';

const AQI_COLORS = {
  GOOD: '#00e400',
  MODERATE: '#ffff00',
  UNHEALTHY_SENSITIVE: '#ff7e00',
  UNHEALTHY: '#ff0000',
  VERY_UNHEALTHY: '#99004c',
  HAZARDOUS: '#7e0023'
};

export default function StatsDashboard({ 
  schoolName, 
  yearRange, 
  analyticsData, 
  loading 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }
  
  if (!analyticsData || !schoolName) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">
          Select a school and year range to view pollution statistics
        </p>
      </div>
    );
  }
  
  const {
    averagePM25,
    averagePM10,
    maxPM25,
    maxPM10,
    minPM25,
    minPM10,
    daysInCategories,
    highestPollutionDays
  } = analyticsData;

  const totalDays = Object.values(daysInCategories).reduce((acc, count) => acc + count, 0);
  
  const categoryPercentages = {};
  Object.keys(daysInCategories).forEach(category => {
    categoryPercentages[category] = totalDays > 0 
      ? ((daysInCategories[category] / totalDays) * 100).toFixed(1) 
      : 0;
  });
  
  let mostCommonCategory = null;
  let highestDayCount = 0;
  
  Object.keys(daysInCategories).forEach(category => {
    if (daysInCategories[category] > highestDayCount) {
      mostCommonCategory = category;
      highestDayCount = daysInCategories[category];
    }
  });
  
  const getAveragePM25Category = () => {
    for (const category in AQI_CATEGORIES) {
      const { min, max } = AQI_CATEGORIES[category];
      if (averagePM25 >= min && averagePM25 <= max) {
        return category;
      }
    }
    return null;
  };
  
  const averagePM25Category = getAveragePM25Category();
  
  const getAirQualityAssessment = () => {
    if (
      mostCommonCategory === 'GOOD' ||
      (mostCommonCategory === 'MODERATE' && 
       categoryPercentages['UNHEALTHY'] < 10 &&
       categoryPercentages['VERY_UNHEALTHY'] < 5)
    ) {
      return {
        level: 'Good',
        message: 'Air quality is generally good.',
        color: 'text-green-600 dark:text-green-400'
      };
    }
    else if (
      mostCommonCategory === 'MODERATE' || 
      (mostCommonCategory === 'UNHEALTHY_SENSITIVE' && 
       categoryPercentages['UNHEALTHY'] < 15 &&
       categoryPercentages['VERY_UNHEALTHY'] < 10)
    ) {
      return {
        level: 'Moderate',
        message: 'Air quality is acceptable but may be a concern for sensitive individuals.',
        color: 'text-yellow-600 dark:text-yellow-400'
      };
    }
    else if (
      mostCommonCategory === 'UNHEALTHY_SENSITIVE' ||
      (mostCommonCategory === 'UNHEALTHY' && 
       categoryPercentages['VERY_UNHEALTHY'] < 15)
    ) {
      return {
        level: 'Concern',
        message: 'Air quality may be unhealthy for sensitive groups and occasionally for the general public.',
        color: 'text-orange-600 dark:text-orange-400'
      };
    }
    else {
      return {
        level: 'Poor',
        message: 'Air quality is frequently unhealthy for all individuals.',
        color: 'text-red-600 dark:text-red-400'
      };
    }
  };
  
  const airQualityAssessment = getAirQualityAssessment();
  
  const formatNumber = (num, decimals = 1) => {
    return Number.isFinite(num) ? num.toFixed(decimals) : 'N/A';
  };

  const determineTextColor = (category) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (!isDarkMode && (category === 'GOOD' || category === 'MODERATE')) {
      return '#333'; 
    }
    return '#fff';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Air Quality Summary for {schoolName}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Years: {yearRange.startYear} - {yearRange.endYear} | Total Days Analyzed: {totalDays}
        </p>
      </div>
      
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
          Overall Assessment
        </h3>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
          <div className="flex items-center">
            <div className={`text-2xl font-bold ${airQualityAssessment.color}`}>
              {airQualityAssessment.level}
            </div>
            <div className="ml-auto flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Most Common: {AQI_CATEGORIES[mostCommonCategory]?.label || 'N/A'} ({categoryPercentages[mostCommonCategory]}%)
              </span>
              <div 
                className="ml-2 w-4 h-4 rounded-full" 
                style={{ backgroundColor: AQI_COLORS[mostCommonCategory] }}
              ></div>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {airQualityAssessment.message}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average PM2.5</h4>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatNumber(averagePM25)}
            </p>
            <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">µg/m³</p>
          </div>
          <div 
            className="mt-1 text-xs inline-flex items-center px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${AQI_COLORS[averagePM25Category]}40`,
              color: determineTextColor(averagePM25Category)
            }}
          >
            {AQI_CATEGORIES[averagePM25Category]?.label || 'N/A'}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average PM10</h4>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatNumber(averagePM10)}
            </p>
            <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">µg/m³</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Max PM2.5</h4>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatNumber(maxPM25)}
            </p>
            <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">µg/m³</p>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Recorded on {highestPollutionDays[0]?.date || 'N/A'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Max PM10</h4>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatNumber(maxPM10)}
            </p>
            <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">µg/m³</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
          AQI Category Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(daysInCategories).map(category => (
            <div key={category} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: AQI_COLORS[category] }}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {AQI_CATEGORIES[category].label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {daysInCategories[category]} days ({categoryPercentages[category]}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${categoryPercentages[category]}%`,
                      backgroundColor: AQI_COLORS[category]
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 