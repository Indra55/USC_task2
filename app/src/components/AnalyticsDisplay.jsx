import React, { useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { AQI_CATEGORIES, findClosestPollutionCenter } from '../services/DataService';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Colors for AQI categories - improved contrast for light mode
const AQI_COLORS = {
  GOOD: '#00c000',           // Darker green
  MODERATE: '#d6c000',       // Darker yellow
  UNHEALTHY_SENSITIVE: '#ff7e00', // Orange
  UNHEALTHY: '#ff0000',      // Red
  VERY_UNHEALTHY: '#99004c', // Purple
  HAZARDOUS: '#7e0023'       // Dark red
};

export default function AnalyticsDisplay({ 
  schoolName, 
  yearRange, 
  analyticsData, 
  loading,
  selectedSchool 
}) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const chartTheme = {
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', // Darker grid lines for light mode
    background: isDarkMode ? '#374151' : '#ffffff',
    tooltipBackground: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
    tooltipText: isDarkMode ? '#1f2937' : '#ffffff',
  };
  
  // Observe theme changes
  const observer = useRef(null);
  
  useEffect(() => {
    // Set up observer to detect dark mode changes
    if (!observer.current) {
      observer.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            // Force chart rerender by setting a small timeout
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 10);
          }
        });
      });

      // Start observing the document element for class changes (dark mode)
      observer.current.observe(document.documentElement, { attributes: true });
    }
    
    return () => {
      // Clean up
      observer.current?.disconnect();
    };
  }, []);

  // Get closest pollution center if a school is selected
  const closestCenter = selectedSchool ? findClosestPollutionCenter(
    parseFloat(selectedSchool.Latitude),
    parseFloat(selectedSchool.Longitude)
  ) : null;

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
          Select a school and year range to view pollution analytics
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
  
  // Prepare data for AQI category chart
  const categoryChartData = {
    labels: Object.keys(daysInCategories).map(key => AQI_CATEGORIES[key].label),
    datasets: [
      {
        label: 'Days in Each AQI Category',
        data: Object.keys(daysInCategories).map(key => daysInCategories[key]),
        backgroundColor: Object.keys(daysInCategories).map(key => AQI_COLORS[key]),
        borderWidth: 1,
        borderColor: isDarkMode ? '#fff' : '#000', // Dark borders in light mode for better contrast
      }
    ]
  };
  
  // Prepare data for highest pollution days chart
  const highestPollutionChartData = {
    labels: highestPollutionDays.map(day => day.date),
    datasets: [
      {
        label: 'PM2.5',
        data: highestPollutionDays.map(day => day.pm25),
        backgroundColor: 'rgba(53, 162, 235, 0.8)', // More opaque blue
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'PM10',
        data: highestPollutionDays.map(day => day.pm10),
        backgroundColor: 'rgba(255, 99, 132, 0.8)', // More opaque red
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ]
  };
  
  // Options for bar chart
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          color: chartTheme.text
        }
      },
      title: {
        display: true,
        text: 'Days with Highest Pollution',
        font: {
          size: 14,
          weight: 'bold'
        },
        color: chartTheme.text
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBackground,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        cornerRadius: 4,
        displayColors: true
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          },
          color: chartTheme.text,
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: true,
          color: chartTheme.grid
        }
      },
      y: {
        ticks: {
          font: {
            size: 12
          },
          color: chartTheme.text
        },
        grid: {
          display: true,
          color: chartTheme.grid
        },
        beginAtZero: true
      }
    }
  };
  
  // Options for pie chart
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          },
          color: chartTheme.text,
          // Add padding and spacing for better readability
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Air Quality Categories Distribution',
        font: {
          size: 14,
          weight: 'bold'
        },
        color: chartTheme.text
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBackground,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        cornerRadius: 4,
        displayColors: true
      }
    },
  };
  
  // Determine overall AQI category for the average PM2.5
  const getAQICategoryForValue = (pm25) => {
    if (pm25 <= AQI_CATEGORIES.GOOD.max) return AQI_CATEGORIES.GOOD;
    if (pm25 <= AQI_CATEGORIES.MODERATE.max) return AQI_CATEGORIES.MODERATE;
    if (pm25 <= AQI_CATEGORIES.UNHEALTHY_SENSITIVE.max) return AQI_CATEGORIES.UNHEALTHY_SENSITIVE;
    if (pm25 <= AQI_CATEGORIES.UNHEALTHY.max) return AQI_CATEGORIES.UNHEALTHY;
    if (pm25 <= AQI_CATEGORIES.VERY_UNHEALTHY.max) return AQI_CATEGORIES.VERY_UNHEALTHY;
    return AQI_CATEGORIES.HAZARDOUS;
  };
  
  const averageAQI = getAQICategoryForValue(averagePM25);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        Pollution Analytics for {schoolName}
      </h2>
      
      {closestCenter && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Closest Pollution Data Center
          </h3>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">{closestCenter.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Location: {closestCenter.latitude.toFixed(4)}, {closestCenter.longitude.toFixed(4)}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 transition-colors">
          <h3 className="text-indigo-800 dark:text-indigo-300 font-medium mb-2">Average PM2.5</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{averagePM25.toFixed(2)} µg/m³</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getAQICategoryForValue(averagePM25).label}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800 transition-colors">
          <h3 className="text-purple-800 dark:text-purple-300 font-medium mb-2">Average PM10</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{averagePM10.toFixed(2)} µg/m³</p>
        </div>
        
        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-100 dark:border-teal-800 transition-colors">
          <h3 className="text-teal-800 dark:text-teal-300 font-medium mb-2">Year Range</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{yearRange.startYear} - {yearRange.endYear}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Time period analyzed</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-4">Days in Each AQI Category</h3>
          <div className="h-64">
            <Pie data={categoryChartData} options={pieOptions} />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-4">PM2.5 vs PM10 Trends</h3>
          <div className="h-64">
            <Bar data={highestPollutionChartData} options={barOptions} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 transition-colors">
          <h3 className="text-green-800 dark:text-green-300 font-medium mb-2">Min PM2.5</h3>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{minPM25.toFixed(2)} µg/m³</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 transition-colors">
          <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">Max PM2.5</h3>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{maxPM25.toFixed(2)} µg/m³</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 transition-colors">
          <h3 className="text-green-800 dark:text-green-300 font-medium mb-2">Min PM10</h3>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{minPM10.toFixed(2)} µg/m³</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 transition-colors">
          <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">Max PM10</h3>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{maxPM10.toFixed(2)} µg/m³</p>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-4">Days with Highest PM2.5 Levels</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Date</th>
                <th className="px-4 py-2">PM2.5 (µg/m³)</th>
                <th className="px-4 py-2">PM10 (µg/m³)</th>
                <th className="px-4 py-2 rounded-tr-lg">AQI Category</th>
              </tr>
            </thead>
            <tbody>
              {highestPollutionDays.slice(0, 5).map((day, index) => (
                <tr 
                  key={index} 
                  className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-50 dark:bg-gray-800/30'} transition-colors`}
                >
                  <td className="px-4 py-2">{day.date}</td>
                  <td className="px-4 py-2 font-medium">{day.pm25.toFixed(2)}</td>
                  <td className="px-4 py-2">{day.pm10.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: getAQICategoryColor(day.pm25, 0.2),
                        color: getAQICategoryTextColor(day.pm25)
                      }}
                    >
                      {getAQICategoryForValue(day.pm25).label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getAQICategoryTextColor(pm25) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  if (!isDarkMode && (pm25 <= AQI_CATEGORIES.GOOD.max || pm25 <= AQI_CATEGORIES.MODERATE.max)) {
    return '#333'; 
  }
  
  return '#fff';
}

function getAQICategoryColor(pm25, opacity = 1) {
  if (pm25 <= AQI_CATEGORIES.GOOD.max) return opacity === 1 ? AQI_COLORS.GOOD : `${AQI_COLORS.GOOD}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  if (pm25 <= AQI_CATEGORIES.MODERATE.max) return opacity === 1 ? AQI_COLORS.MODERATE : `${AQI_COLORS.MODERATE}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  if (pm25 <= AQI_CATEGORIES.UNHEALTHY_SENSITIVE.max) return opacity === 1 ? AQI_COLORS.UNHEALTHY_SENSITIVE : `${AQI_COLORS.UNHEALTHY_SENSITIVE}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  if (pm25 <= AQI_CATEGORIES.UNHEALTHY.max) return opacity === 1 ? AQI_COLORS.UNHEALTHY : `${AQI_COLORS.UNHEALTHY}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  if (pm25 <= AQI_CATEGORIES.VERY_UNHEALTHY.max) return opacity === 1 ? AQI_COLORS.VERY_UNHEALTHY : `${AQI_COLORS.VERY_UNHEALTHY}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  return opacity === 1 ? AQI_COLORS.HAZARDOUS : `${AQI_COLORS.HAZARDOUS}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
} 