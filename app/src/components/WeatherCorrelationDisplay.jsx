import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { analyzeWeatherCorrelation, filterWeatherData } from '../services/DataService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WeatherCorrelationDisplay({
  schoolName,
  yearRange,
  pollutionData,
  weatherData,
  loading
}) {
  const [correlationData, setCorrelationData] = useState(null);
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const chartTheme = {
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    background: isDarkMode ? '#374151' : '#ffffff',
    tooltipBackground: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
    tooltipText: isDarkMode ? '#1f2937' : '#ffffff',
  };

  useEffect(() => {
    if (!pollutionData || !weatherData || !schoolName) return;

    // Filter weather data by year range
    const filteredWeatherData = filterWeatherData(weatherData, yearRange.startYear, yearRange.endYear);
    
    // Generate correlation analysis
    const data = analyzeWeatherCorrelation(pollutionData, filteredWeatherData);
    setCorrelationData(data);
  }, [pollutionData, weatherData, yearRange, schoolName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }
  
  if (!correlationData || !schoolName) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">
          Select a school and year range to view weather correlation data
        </p>
      </div>
    );
  }

  // Prepare data for temperature correlation chart
  const tempData = {
    labels: correlationData.temperatureCorrelation.map(item => `${item.temperature}°F`),
    datasets: [
      {
        label: 'PM2.5 Level',
        data: correlationData.temperatureCorrelation.map(item => item.pm25),
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        pointRadius: 4,
        tension: 0.2
      }
    ]
  };
  
  // Prepare data for weather condition chart
  const conditionData = {
    labels: correlationData.weatherConditionStats.map(item => item.condition),
    datasets: [
      {
        label: 'Average PM2.5 Level',
        data: correlationData.weatherConditionStats.map(item => item.averagePM25),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Options for line chart
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: chartTheme.text
        }
      },
      title: {
        display: true,
        text: 'Temperature vs. PM2.5 Levels',
        font: { size: 14, weight: 'bold' },
        color: chartTheme.text
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBackground,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 4
      }
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          color: chartTheme.text,
          maxRotation: 45,
          minRotation: 45
        },
        grid: { display: false },
        title: {
          display: true,
          text: 'Temperature',
          color: chartTheme.text
        }
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTheme.text },
        title: {
          display: true,
          text: 'PM2.5 (µg/m³)',
          font: { size: 12 },
          color: chartTheme.text
        },
        grid: { color: chartTheme.grid }
      }
    }
  };

  // Options for bar chart
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: chartTheme.text
        }
      },
      title: {
        display: true,
        text: 'Weather Conditions vs. PM2.5 Levels',
        font: { size: 14, weight: 'bold' },
        color: chartTheme.text
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBackground,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 4
      }
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          color: chartTheme.text,
          maxRotation: 45,
          minRotation: 45
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTheme.text },
        title: {
          display: true,
          text: 'Average PM2.5 (µg/m³)',
          font: { size: 12 },
          color: chartTheme.text
        },
        grid: { color: chartTheme.grid }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
        </svg>
        Weather Correlation Analysis for {schoolName}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Showing how weather conditions correlate with pollution levels during school hours from {yearRange.startYear} to {yearRange.endYear}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rainy vs Non-Rainy Comparison */}
        <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
            Rainy vs Non-Rainy Days
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Rainy Days</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{correlationData.rainyDaysAvgPM25.toFixed(1)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">µg/m³ Average PM2.5</p>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Non-Rainy Days</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{correlationData.nonRainyDaysAvgPM25.toFixed(1)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">µg/m³ Average PM2.5</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {correlationData.rainyDaysAvgPM25 < correlationData.nonRainyDaysAvgPM25 ? (
                <>Rain tends to reduce PM2.5 pollution levels by {(correlationData.nonRainyDaysAvgPM25 - correlationData.rainyDaysAvgPM25).toFixed(1)} µg/m³ on average.</>
              ) : (
                <>Surprisingly, rain did not reduce PM2.5 pollution in the analyzed period.</>
              )}
            </p>
          </div>
        </div>

        {/* Temperature vs PM2.5 Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Temperature vs Pollution
          </h3>
          <div className="h-64">
            <Line data={tempData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Weather Condition Chart */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Weather Conditions Impact
          </h3>
          <div className="h-80">
            <Bar data={conditionData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Weather Condition Table */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Weather Conditions Detail
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Weather Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Days Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Average PM2.5 (µg/m³)</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {correlationData.weatherConditionStats.map((condition, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{condition.condition}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{condition.days}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{condition.averagePM25.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 