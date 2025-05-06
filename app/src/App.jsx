import { useState, useCallback, useEffect } from 'react';
import SchoolSelector from './components/SchoolSelector';
import YearRangePicker from './components/YearRangePicker';
import AnalyticsDisplay from './components/AnalyticsDisplay';
import DarkModeToggle from './components/DarkModeToggle';
import WeatherCorrelationDisplay from './components/WeatherCorrelationDisplay';
import YearlyTrendsDisplay from './components/YearlyTrendsDisplay';
import VisualizationDisplay from './components/VisualizationDisplay';
import StatsDashboard from './components/StatsDashboard';
import { 
  loadPollutionData, 
  loadWeatherData,
  filterPollutionDataForSchool, 
  analyzePollutionData 
} from './services/DataService';
import './App.css';

function App() {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [yearRange, setYearRange] = useState({ startYear: 2014, endYear: new Date().getFullYear() });
  const [pollutionData, setPollutionData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('pollution');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load pollution data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const pollution = await loadPollutionData();
        const weather = await loadWeatherData();
        setPollutionData(pollution);
        setWeatherData(weather);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle school selection
  const handleSchoolSelect = useCallback((school) => {
    setSelectedSchool(school);
  }, []);

  // Handle year range changes
  const handleYearRangeChange = useCallback((range) => {
    setYearRange(range);
  }, []);

  // Generate analytics when school or year range changes
  useEffect(() => {
    if (!selectedSchool || !pollutionData) return;

    try {
      setLoading(true);
      
      // Filter data for the selected school and year range
      const schoolLocation = {
        latitude: parseFloat(selectedSchool.Latitude),
        longitude: parseFloat(selectedSchool.Longitude)
      };
      
      const filteredData = filterPollutionDataForSchool(
        pollutionData,
        schoolLocation,
        yearRange.startYear,
        yearRange.endYear
      );
      
      // Analyze the filtered data
      const analytics = analyzePollutionData(filteredData);
      setAnalyticsData({
        analytics,
        filteredData  // Store the filtered data for other components to use
      });
      setError(null);
    } catch (err) {
      console.error('Error generating analytics:', err);
      setError('Failed to generate analytics. Please try again.');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, yearRange, pollutionData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-purple-900 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            <path fill="white" d="M30,25 Q35,10 50,15 T70,25 T90,40 T80,60 T65,70 T40,80 T20,60 T30,25"></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg> */}
              <h1 className="ml-3 text-3xl font-bold text-white">
                Los Angeles School Pollution Analyzer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-white">
                Air Quality Insights
              </span>
            </div>
          </div>
        
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Select Your School and Years
          </h2>
          <SchoolSelector onSelectSchool={handleSchoolSelect} />
          <YearRangePicker onYearRangeChange={handleYearRangeChange} />
          
          {selectedSchool && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800 transition-colors duration-200">
              <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Selected School
              </h3>
              <p className="text-gray-800 dark:text-gray-200 font-semibold">{selectedSchool.School}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSchool['Street Address']}, {selectedSchool['Street Zip']}</p>
              <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Location: {selectedSchool.Latitude}, {selectedSchool.Longitude}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Analytics Tabs */}
        {selectedSchool && (
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('pollution')}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'pollution'
                      ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  Pollution Analysis
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'dashboard'
                      ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Stats Dashboard
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('visualizations')}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'visualizations'
                      ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                  </svg>
                  Visualizations
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'weather'
                      ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                  </svg>
                  Weather Correlation
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'trends'
                      ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  Yearly Trends
                </button>
              </li>
            </ul>
          </div>
        )}
        
        {/* Analytics Display based on activeTab */}
        {activeTab === 'pollution' && (
          <AnalyticsDisplay
            schoolName={selectedSchool?.School}
            yearRange={yearRange}
            analyticsData={analyticsData ? analyticsData.analytics : null}
            loading={loading}
          />
        )}
        
        {activeTab === 'dashboard' && (
          <StatsDashboard
            schoolName={selectedSchool?.School}
            yearRange={yearRange}
            analyticsData={analyticsData ? analyticsData.analytics : null}
            loading={loading}
          />
        )}
        
        {activeTab === 'visualizations' && (
          <VisualizationDisplay
            schoolName={selectedSchool?.School}
            yearRange={yearRange}
            analyticsData={analyticsData ? analyticsData.analytics : null}
            pollutionData={analyticsData ? analyticsData.filteredData : null}
            loading={loading}
          />
        )}
        
        {activeTab === 'weather' && selectedSchool && (
          <WeatherCorrelationDisplay
            schoolName={selectedSchool?.School}
            yearRange={yearRange}
            pollutionData={analyticsData ? analyticsData.filteredData : null}
            weatherData={weatherData}
            loading={loading}
          />
        )}
        
        {activeTab === 'trends' && selectedSchool && (
          <YearlyTrendsDisplay
            schoolName={selectedSchool?.School}
            yearRange={yearRange}
            pollutionData={analyticsData ? analyticsData.filteredData : null}
            loading={loading}
          />
        )}
      </main>
      
      {/* <footer className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white py-8 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                About This Project
              </h3>
              <p className="text-gray-300 text-sm">
                This application provides insights into historical air pollution data for schools in Los Angeles County.
                The analysis focuses on PM2.5 and PM10 pollutants during typical school hours.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
                Data Sources
              </h3>
              <p className="text-gray-300 text-sm">
                This application uses data from air quality monitoring stations operated by South Coast AQMD,
                combined with school location data and weather conditions.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Los Angeles School Pollution Analyzer. All rights reserved.
            </p>
            <div className="mt-4 sm:mt-0 text-gray-400 text-sm flex items-center">
              <span className="mr-2">Made with React, Tailwind CSS, and Chart.js</span>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default App;
