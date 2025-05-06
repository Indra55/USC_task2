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
import { AQI_CATEGORIES } from '../services/DataService';

// Register ChartJS components
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

// Colors for AQI categories
const AQI_COLORS = {
  GOOD: '#00e400',
  MODERATE: '#ffff00',
  UNHEALTHY_SENSITIVE: '#ff7e00',
  UNHEALTHY: '#ff0000',
  VERY_UNHEALTHY: '#99004c',
  HAZARDOUS: '#7e0023'
};

export default function AnalyticsDisplay({ 
  schoolName, 
  yearRange, 
  analyticsData, 
  loading 
}) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const chartTheme = {
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
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
        borderColor: '#fff',
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
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'PM10',
        data: highestPollutionDays.map(day => day.pm10),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
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
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: chartTheme.text
        },
        title: {
          display: true,
          text: 'Concentration (µg/m³)',
          font: {
            size: 12
          },
          color: chartTheme.text
        },
        grid: {
          color: chartTheme.grid
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 20
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
            size: 11
          },
          color: chartTheme.text,
          padding: 15
        }
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
        cornerRadius: 4
      }
    },
    layout: {
      padding: 10
    }
  };
  
  // Determine overall AQI category for the average PM2.5
  const getAQICategoryForValue = (pm25) => {
    if (pm25 <= 12) return { category: 'Good', color: AQI_COLORS.GOOD };
    if (pm25 <= 35.4) return { category: 'Moderate', color: AQI_COLORS.MODERATE };
    if (pm25 <= 55.4) return { category: 'Unhealthy for Sensitive Groups', color: AQI_COLORS.UNHEALTHY_SENSITIVE };
    if (pm25 <= 150.4) return { category: 'Unhealthy', color: AQI_COLORS.UNHEALTHY };
    if (pm25 <= 250.4) return { category: 'Very Unhealthy', color: AQI_COLORS.VERY_UNHEALTHY };
    return { category: 'Hazardous', color: AQI_COLORS.HAZARDOUS };
  };
  
  const averageAQI = getAQICategoryForValue(averagePM25);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
        <span className="mr-2">
          <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
          </svg>
        </span>
        Pollution Analysis for {schoolName}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 ml-8">
        During school hours from {yearRange.startYear} to {yearRange.endYear}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Average Pollution Card */}
        <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Average Pollution Levels
          </h3>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="text-gray-700 dark:text-gray-200 mb-2">PM2.5: <span className="font-bold text-xl">{averagePM25.toFixed(1)} µg/m³</span></p>
              <p className="text-gray-700 dark:text-gray-200">PM10: <span className="font-bold text-xl">{averagePM10.toFixed(1)} µg/m³</span></p>
            </div>
            <div 
              className="px-4 py-2 rounded-full text-white font-bold shadow-sm"
              style={{ backgroundColor: averageAQI.color }}
            >
              {averageAQI.category}
            </div>
          </div>
        </div>
        
        {/* Min/Max Pollution Card */}
        <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            Pollution Range
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">PM2.5 Range</p>
              <p className="text-gray-700 dark:text-gray-200">Min: <span className="font-bold">{minPM25.toFixed(1)} µg/m³</span></p>
              <p className="text-gray-700 dark:text-gray-200">Max: <span className="font-bold">{maxPM25.toFixed(1)} µg/m³</span></p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">PM10 Range</p>
              <p className="text-gray-700 dark:text-gray-200">Min: <span className="font-bold">{minPM10.toFixed(1)} µg/m³</span></p>
              <p className="text-gray-700 dark:text-gray-200">Max: <span className="font-bold">{maxPM10.toFixed(1)} µg/m³</span></p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AQI Categories Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
            </svg>
            Days in Each AQI Category
          </h3>
          <div className="h-80 w-full">
            <Pie data={categoryChartData} options={pieOptions} />
          </div>
        </div>
        
        {/* Highest Pollution Days Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Highest Pollution Days
          </h3>
          <div className="h-80 w-full">
            <Bar options={barOptions} data={highestPollutionChartData} />
          </div>
        </div>
      </div>
      
      {/* Highest Pollution Days Table */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Days with Highest Pollution
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">PM2.5 (µg/m³)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">PM10 (µg/m³)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">AQI Category</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {highestPollutionDays.map((day, index) => {
                const aqi = getAQICategoryForValue(day.pm25);
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{day.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{day.pm25.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{day.pm10.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white shadow-sm"
                        style={{ backgroundColor: aqi.color }}
                      >
                        {aqi.category}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 