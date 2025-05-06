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
import { analyzeYearlyTrends } from '../services/DataService';

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

export default function YearlyTrendsDisplay({
  schoolName,
  yearRange,
  pollutionData,
  loading
}) {
  const [trendsData, setTrendsData] = useState(null);
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const chartTheme = {
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    background: isDarkMode ? '#374151' : '#ffffff',
    tooltipBackground: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
    tooltipText: isDarkMode ? '#1f2937' : '#ffffff',
  };

  useEffect(() => {
    if (!pollutionData || !schoolName) return;

    // Generate yearly trends analysis
    const data = analyzeYearlyTrends(pollutionData, yearRange.startYear, yearRange.endYear);
    setTrendsData(data);
  }, [pollutionData, yearRange, schoolName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }
  
  if (!trendsData || !schoolName) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">
          Select a school and year range to view yearly pollution trends
        </p>
      </div>
    );
  }

  // Prepare data for yearly PM2.5 trends chart
  const yearlyTrendsData = {
    labels: trendsData.yearlyAverages.map(item => item.year.toString()),
    datasets: [
      {
        label: 'Average PM2.5 Level',
        data: trendsData.yearlyAverages.map(item => item.avgPM25),
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        pointRadius: 5,
        tension: 0.2
      },
      {
        label: 'Average PM10 Level',
        data: trendsData.yearlyAverages.map(item => item.avgPM10),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointRadius: 5,
        tension: 0.2
      }
    ]
  };
  
  // Prepare data for yearly days in unhealthy categories chart
  const unhealthyDaysData = {
    labels: trendsData.yearlyUnhealthyDays.map(item => item.year.toString()),
    datasets: [
      {
        label: 'Unhealthy Days',
        data: trendsData.yearlyUnhealthyDays.map(item => item.unhealthyDays),
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
        text: 'Yearly Average Pollution Levels',
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
          font: { size: 12 },
          color: chartTheme.text
        },
        grid: { display: false },
        title: {
          display: true,
          text: 'Year',
          color: chartTheme.text
        }
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTheme.text },
        title: {
          display: true,
          text: 'Pollution Level (µg/m³)',
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
        text: 'Unhealthy Air Quality Days by Year',
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
          font: { size: 12 },
          color: chartTheme.text
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTheme.text },
        title: {
          display: true,
          text: 'Number of Days',
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        Yearly Pollution Trends for {schoolName}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Showing how pollution levels have changed from {yearRange.startYear} to {yearRange.endYear}
      </p>

      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Yearly Trends Line Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">
            Annual Average Pollution Levels
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Shows how PM2.5 and PM10 levels have changed over the years during school hours
          </p>
          <div className="h-80 mt-4">
            <Line data={yearlyTrendsData} options={lineOptions} />
          </div>
          
          {trendsData.trend > 0 ? (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                Increasing Trend: PM2.5 levels have increased by {trendsData.trend.toFixed(2)} µg/m³ per year on average
              </p>
            </div>
          ) : trendsData.trend < 0 ? (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path>
                </svg>
                Decreasing Trend: PM2.5 levels have decreased by {Math.abs(trendsData.trend).toFixed(2)} µg/m³ per year on average
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No significant trend detected in PM2.5 levels over this time period
              </p>
            </div>
          )}
        </div>
        
        {/* Unhealthy Days Bar Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">
            Unhealthy Air Quality Days by Year
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Number of school days each year with unhealthy air quality (PM2.5 > 35.5 µg/m³)
          </p>
          <div className="h-80 mt-4">
            <Bar data={unhealthyDaysData} options={barOptions} />
          </div>
        </div>
      </div>
      
      {/* Years Summary Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg PM2.5
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg PM10
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Unhealthy Days
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Max PM2.5
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {trendsData.yearlyAverages.map((yearData, index) => (
              <tr key={yearData.year} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {yearData.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {yearData.avgPM25.toFixed(2)} µg/m³
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {yearData.avgPM10.toFixed(2)} µg/m³
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {trendsData.yearlyUnhealthyDays.find(d => d.year === yearData.year)?.unhealthyDays || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {yearData.maxPM25.toFixed(2)} µg/m³
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 