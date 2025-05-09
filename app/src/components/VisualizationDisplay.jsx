import React, { useState, useEffect, useRef } from 'react';
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
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Radar, Scatter } from 'react-chartjs-2';
import { AQI_CATEGORIES } from '../services/DataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

const AQI_COLORS = {
  GOOD: '#00c000',           
  MODERATE: '#d6c000',       
  UNHEALTHY_SENSITIVE: '#ff7e00', 
  UNHEALTHY: '#ff0000',      
  VERY_UNHEALTHY: '#99004c', 
  HAZARDOUS: '#7e0023'      
};

function getCategoryTextColor(category) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  if (!isDarkMode && (category === 'GOOD' || category === 'MODERATE')) {
    return '#333'; 
  }
  
  return '#fff';
}

export default function VisualizationDisplay({ 
  schoolName, 
  yearRange, 
  analyticsData, 
  pollutionData,
  loading 
}) {
  const [activeVisType, setActiveVisType] = useState('barchart');
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const chartTheme = {
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    background: isDarkMode ? '#374151' : '#ffffff',
    tooltipBackground: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
    tooltipText: isDarkMode ? '#1f2937' : '#ffffff',
  };
  
  const observer = useRef(null);
  
  useEffect(() => {
    if (!observer.current) {
      observer.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 10);
          }
        });
      });

      observer.current.observe(document.documentElement, { attributes: true });
    }
    
    return () => {
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
    daysInCategories,
    highestPollutionDays
  } = analyticsData;
  
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

  const getHeatMapData = () => {
    if (!pollutionData) return null;
    
    const groupedData = {};
    
    pollutionData.forEach(record => {
      if (!record.Datetime) return;
      
      const date = new Date(record.Datetime);
      const year = date.getFullYear();
      const month = date.getMonth(); 
      
      const key = `${year}-${month}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          count: 0,
          sum: 0,
          year,
          month
        };
      }
      
      const pm25 = record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
      if (pm25 > 0) {
        groupedData[key].count++;
        groupedData[key].sum += pm25;
      }
    });
    
    Object.keys(groupedData).forEach(key => {
      const group = groupedData[key];
      group.average = group.count > 0 ? group.sum / group.count : 0;
    });
    
    return Object.values(groupedData)
      .filter(item => item.count > 0)
      .map(item => ({
        x: item.month,
        y: item.year,
        value: item.average
      }));
  };
  
  const radarChartData = {
    labels: ['Average', 'Maximum', 'Minimum', 'Median', '90th Percentile'],
    datasets: [
      {
        label: 'PM2.5',
        data: [
          analyticsData.averagePM25, 
          analyticsData.maxPM25, 
          analyticsData.minPM25,
          calculateMedian(pollutionData, 'PM2.5'),
          calculatePercentile(pollutionData, 'PM2.5', 0.9)
        ],
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 2,
      },
      {
        label: 'PM10',
        data: [
          analyticsData.averagePM10, 
          analyticsData.maxPM10, 
          analyticsData.minPM10,
          calculateMedian(pollutionData, 'PM10'),
          calculatePercentile(pollutionData, 'PM10', 0.9)
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      }
    ]
  };
  
  const getTrendLineData = () => {
    if (!pollutionData) return null;
    
    const dailyData = {};
    
    pollutionData.forEach(record => {
      if (!record.Datetime) return;
      
      const dateStr = record.Datetime.split(' ')[0]; 
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          date: dateStr,
          pm25Sum: 0,
          pm10Sum: 0,
          count: 0
        };
      }
      
      const pm25 = record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
      const pm10 = record.PM10 || 0;
      
      dailyData[dateStr].pm25Sum += pm25;
      dailyData[dateStr].pm10Sum += pm10;
      dailyData[dateStr].count++;
    });
    
    return Object.values(dailyData)
      .map(day => ({
        date: day.date,
        pm25Avg: day.count > 0 ? day.pm25Sum / day.count : 0,
        pm10Avg: day.count > 0 ? day.pm10Sum / day.count : 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  const trendData = getTrendLineData();
  const lineChartData = {
    labels: trendData ? trendData.map(item => item.date) : [],
    datasets: [
      {
        label: 'PM2.5 Daily Average',
        data: trendData ? trendData.map(item => item.pm25Avg) : [],
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.1)',
        tension: 0.3,
        fill: false,
        pointRadius: 2,
      },
      {
        label: 'PM10 Daily Average',
        data: trendData ? trendData.map(item => item.pm10Avg) : [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.3,
        fill: false,
        pointRadius: 2,
      }
    ]
  };
  
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
        text: 'Days with Highest Pollution',
        font: { size: 14, weight: 'bold' },
        color: chartTheme.text
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBackground,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        padding: 10,
        cornerRadius: 4,
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
          text: 'Concentration (µg/m³)',
          font: { size: 12 },
          color: chartTheme.text
        },
        grid: { color: chartTheme.grid }
      }
    }
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 11 },
          color: chartTheme.text,
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'AQI Category Distribution',
        font: { size: 14, weight: 'bold' },
        color: chartTheme.text
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBackground,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        padding: 10,
        cornerRadius: 4,
      }
    }
  };
  
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: chartTheme.grid
        },
        grid: {
          color: chartTheme.grid
        },
        pointLabels: {
          color: chartTheme.text,
          font: { size: 11 }
        },
        ticks: {
          color: chartTheme.text,
          backdropColor: 'transparent'
        }
      }
    },
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
        text: 'Pollution Measurements Comparison',
        font: { size: 14, weight: 'bold' },
        color: chartTheme.text
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBackground,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText
      }
    }
  };
  
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
        text: 'Pollution Trend Over Time',
        font: { size: 14, weight: 'bold' },
        color: chartTheme.text
      }
    },
    scales: {
      x: {
        ticks: {
          color: chartTheme.text,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 10 },
          maxTicksLimit: 15,
          callback: function(value, index, values) {
            return index % 5 === 0 ? this.getLabelForValue(value) : '';
          }
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTheme.text },
        title: {
          display: true,
          text: 'Concentration (µg/m³)',
          color: chartTheme.text
        },
        grid: { color: chartTheme.grid }
      }
    }
  };
  
  function calculateMedian(data, pollutantType) {
    if (!data || data.length === 0) return 0;
    
    const values = data
      .map(record => {
        if (pollutantType === 'PM2.5') {
          return record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
        } else {
          return record.PM10 || 0;
        }
      })
      .filter(val => val > 0)
      .sort((a, b) => a - b);
    
    if (values.length === 0) return 0;
    
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];
  }
  
  function calculatePercentile(data, pollutantType, percentile) {
    if (!data || data.length === 0) return 0;
    
    const values = data
      .map(record => {
        if (pollutantType === 'PM2.5') {
          return record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
        } else {
          return record.PM10 || 0;
        }
      })
      .filter(val => val > 0)
      .sort((a, b) => a - b);
    
    if (values.length === 0) return 0;
    
    const index = Math.floor(percentile * values.length);
    return values[Math.min(index, values.length - 1)];
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Pollution Visualizations for {schoolName}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Years: {yearRange.startYear} - {yearRange.endYear}
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveVisType('barchart')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeVisType === 'barchart'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setActiveVisType('piechart')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeVisType === 'piechart'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setActiveVisType('radarchart')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeVisType === 'radarchart'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Radar Chart
          </button>
          <button
            onClick={() => setActiveVisType('linechart')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeVisType === 'linechart'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Trend Line
          </button>
        </div>
      </div>
      
      <div className="h-80 md:h-96">
        {activeVisType === 'barchart' && (
          <Bar data={highestPollutionChartData} options={barOptions} />
        )}
        
        {activeVisType === 'piechart' && (
          <Pie data={categoryChartData} options={pieOptions} />
        )}
        
        {activeVisType === 'radarchart' && (
          <Radar data={radarChartData} options={radarOptions} />
        )}
        
        {activeVisType === 'linechart' && (
          <Line data={lineChartData} options={lineOptions} />
        )}
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select different visualization types to explore the pollution data in various formats.
        </p>
      </div>
    </div>
  );
} 