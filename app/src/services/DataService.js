import Papa from 'papaparse';

// AQI categories based on PM2.5 levels (in µg/m³)
export const AQI_CATEGORIES = {
  GOOD: { min: 0, max: 12, label: 'Good' },
  MODERATE: { min: 12.1, max: 35.4, label: 'Moderate' },
  UNHEALTHY_SENSITIVE: { min: 35.5, max: 55.4, label: 'Unhealthy for Sensitive Groups' },
  UNHEALTHY: { min: 55.5, max: 150.4, label: 'Unhealthy' },
  VERY_UNHEALTHY: { min: 150.5, max: 250.4, label: 'Very Unhealthy' },
  HAZARDOUS: { min: 250.5, max: 999, label: 'Hazardous' }
};

// Typical school hours (8am-3pm)
const SCHOOL_HOURS = { start: 8, end: 15 };

// Load schools data
export const loadSchools = async () => {
  const response = await fetch('/los_angeles_schools_with_lat_long.csv');
  const csvText = await response.text();
  
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });
  
  return data;
};

// Load pollution data
export const loadPollutionData = async () => {
  const response = await fetch('/Combined_Daily_Data.csv');
  const csvText = await response.text();
  
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });
  
  return data;
};

// Load weather data
export const loadWeatherData = async () => {
  try {
    const response = await fetch('/weather_data_hourly.csv');
    const csvText = await response.text();
    
    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    // Process the weather data to make it more usable
    const processedData = data.map(record => {
      // Parse the date
      const date = record.Date ? new Date(record.Date) : null;
      
      return {
        ...record,
        date,
        year: date ? date.getFullYear() : null,
        month: date ? date.getMonth() + 1 : null, // 1-12
        temperature: parseFloat(record.Temperature) || 0,
        condition: record.Condition || '',
        isRainy: record['Rain (yes/no)']?.toLowerCase() === 'yes'
      };
    });
    
    return processedData.filter(record => record.date !== null);
  } catch (error) {
    console.error('Error loading weather data:', error);
    return [];
  }
};

// Filter pollution data for school hours and date range
export const filterPollutionDataForSchool = (pollutionData, schoolLocation, startYear, endYear) => {
  // Get nearest monitoring location based on school coordinates
  // For simplicity, we'll use the default location in the data
  // In a real app, you would calculate the nearest monitoring station to the school
  
  // Filter by year range and school hours
  return pollutionData.filter(record => {
    // Check if data has a valid datetime
    if (!record.Datetime) return false;
    
    const recordDate = new Date(record.Datetime);
    const year = recordDate.getFullYear();
    const hour = recordDate.getHours();
    
    // Filter by year and school hours
    return year >= startYear && 
           year <= endYear && 
           hour >= SCHOOL_HOURS.start && 
           hour <= SCHOOL_HOURS.end;
  });
};

// Filter weather data for date range
export const filterWeatherData = (weatherData, startYear, endYear) => {
  return weatherData.filter(record => {
    if (!record.year) return false;
    return record.year >= startYear && record.year <= endYear;
  });
};

// Calculate AQI category for a PM2.5 value
export const getAQICategory = (pm25) => {
  if (pm25 <= AQI_CATEGORIES.GOOD.max) return AQI_CATEGORIES.GOOD;
  if (pm25 <= AQI_CATEGORIES.MODERATE.max) return AQI_CATEGORIES.MODERATE;
  if (pm25 <= AQI_CATEGORIES.UNHEALTHY_SENSITIVE.max) return AQI_CATEGORIES.UNHEALTHY_SENSITIVE;
  if (pm25 <= AQI_CATEGORIES.UNHEALTHY.max) return AQI_CATEGORIES.UNHEALTHY;
  if (pm25 <= AQI_CATEGORIES.VERY_UNHEALTHY.max) return AQI_CATEGORIES.VERY_UNHEALTHY;
  return AQI_CATEGORIES.HAZARDOUS;
};

// Analyze pollution data for a school
export const analyzePollutionData = (filteredData) => {
  if (!filteredData || filteredData.length === 0) {
    return {
      averagePM25: 0,
      averagePM10: 0,
      maxPM25: 0,
      maxPM10: 0,
      minPM25: 0,
      minPM10: 0,
      daysInCategories: Object.keys(AQI_CATEGORIES).reduce((acc, category) => {
        acc[category] = 0;
        return acc;
      }, {}),
      highestPollutionDays: []
    };
  }

  // Calculate averages
  const pm25Sum = filteredData.reduce((sum, record) => sum + (record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0), 0);
  const pm10Sum = filteredData.reduce((sum, record) => sum + (record.PM10 || 0), 0);
  
  // Find min and max
  const pm25Values = filteredData.map(record => record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0);
  const pm10Values = filteredData.map(record => record.PM10 || 0);
  
  const maxPM25 = Math.max(...pm25Values);
  const maxPM10 = Math.max(...pm10Values);
  const minPM25 = Math.min(...pm25Values.filter(val => val > 0));
  const minPM10 = Math.min(...pm10Values.filter(val => val > 0));
  
  // Count days in each AQI category
  const daysInCategories = {};
  Object.keys(AQI_CATEGORIES).forEach(category => {
    daysInCategories[category] = 0;
  });
  
  // Track dates we've already counted to avoid counting the same day multiple times
  const countedDates = new Set();
  
  filteredData.forEach(record => {
    if (!record.Datetime) return;
    
    const pm25 = record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
    const date = record.Datetime.split(' ')[0]; // Get just the date part
    
    if (!countedDates.has(date)) {
      countedDates.add(date);
      
      const category = getAQICategory(pm25);
      for (const key in AQI_CATEGORIES) {
        if (AQI_CATEGORIES[key] === category) {
          daysInCategories[key]++;
          break;
        }
      }
    }
  });
  
  // Find days with highest pollution
  const dailyMaxPM25 = {};
  
  filteredData.forEach(record => {
    if (!record.Datetime) return;
    
    const date = record.Datetime.split(' ')[0];
    const pm25 = record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
    
    if (!dailyMaxPM25[date] || pm25 > dailyMaxPM25[date].pm25) {
      dailyMaxPM25[date] = {
        date,
        pm25,
        pm10: record.PM10 || 0
      };
    }
  });
  
  const highestPollutionDays = Object.values(dailyMaxPM25)
    .sort((a, b) => b.pm25 - a.pm25)
    .slice(0, 10);
  
  return {
    averagePM25: pm25Sum / filteredData.length,
    averagePM10: pm10Sum / filteredData.length,
    maxPM25,
    maxPM10,
    minPM25,
    minPM10,
    daysInCategories,
    highestPollutionDays
  };
};

// Analyze weather correlation with pollution data
export const analyzeWeatherCorrelation = (pollutionData, weatherData) => {
  if (!pollutionData || !weatherData || pollutionData.length === 0 || weatherData.length === 0) {
    return {
      rainyDaysAvgPM25: 0,
      nonRainyDaysAvgPM25: 0,
      temperatureCorrelation: [],
      weatherConditionStats: {}
    };
  }

  // Group pollution data by date
  const pollutionByDate = {};
  pollutionData.forEach(record => {
    if (!record.Datetime) return;
    
    const date = record.Datetime.split(' ')[0]; // Get just the date part
    const pm25 = record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
    
    if (!pollutionByDate[date]) {
      pollutionByDate[date] = {
        pm25Values: [],
        date
      };
    }
    
    pollutionByDate[date].pm25Values.push(pm25);
  });
  
  // Calculate average PM2.5 for each date
  Object.keys(pollutionByDate).forEach(date => {
    const values = pollutionByDate[date].pm25Values;
    pollutionByDate[date].avgPM25 = values.reduce((sum, val) => sum + val, 0) / values.length;
  });
  
  // Categorize by weather condition
  const rainyDaysPM25 = [];
  const nonRainyDaysPM25 = [];
  const weatherConditionStats = {};
  const temperatureRanges = [];
  
  // Process weather data
  weatherData.forEach(weatherRecord => {
    if (!weatherRecord.date) return;
    
    const dateString = weatherRecord.date.toISOString().split('T')[0];
    const pollutionForDate = pollutionByDate[dateString];
    
    if (pollutionForDate) {
      // Process rainy vs non-rainy days
      if (weatherRecord.isRainy) {
        rainyDaysPM25.push(pollutionForDate.avgPM25);
      } else {
        nonRainyDaysPM25.push(pollutionForDate.avgPM25);
      }
      
      // Process by weather condition
      const condition = weatherRecord.condition || 'Unknown';
      if (!weatherConditionStats[condition]) {
        weatherConditionStats[condition] = {
          condition,
          days: 0,
          totalPM25: 0,
          averagePM25: 0
        };
      }
      
      weatherConditionStats[condition].days++;
      weatherConditionStats[condition].totalPM25 += pollutionForDate.avgPM25;
      
      // Process by temperature range
      const temp = weatherRecord.temperature;
      if (typeof temp === 'number') {
        temperatureRanges.push({
          temperature: temp,
          pm25: pollutionForDate.avgPM25
        });
      }
    }
  });
  
  // Calculate averages for weather conditions
  Object.keys(weatherConditionStats).forEach(condition => {
    const stats = weatherConditionStats[condition];
    if (stats.days > 0) {
      stats.averagePM25 = stats.totalPM25 / stats.days;
    }
  });
  
  // Sort temperature data for correlation analysis
  temperatureRanges.sort((a, b) => a.temperature - b.temperature);
  
  return {
    rainyDaysAvgPM25: rainyDaysPM25.length ? 
      rainyDaysPM25.reduce((sum, val) => sum + val, 0) / rainyDaysPM25.length : 0,
    nonRainyDaysAvgPM25: nonRainyDaysPM25.length ?
      nonRainyDaysPM25.reduce((sum, val) => sum + val, 0) / nonRainyDaysPM25.length : 0,
    temperatureCorrelation: temperatureRanges,
    weatherConditionStats: Object.values(weatherConditionStats)
      .sort((a, b) => b.averagePM25 - a.averagePM25)
  };
};

// Analyze yearly pollution trends
export const analyzeYearlyTrends = (pollutionData, startYear, endYear) => {
  if (!pollutionData || pollutionData.length === 0) {
    return {
      yearlyAverages: [],
      yearlyUnhealthyDays: [],
      trend: 0
    };
  }

  // Group data by year
  const yearlyData = {};
  
  // Initialize data structure for each year in the range
  for (let year = startYear; year <= endYear; year++) {
    yearlyData[year] = {
      year,
      pm25Values: [],
      pm10Values: [],
      unhealthyDays: new Set() // Use Set to avoid counting the same day twice
    };
  }
  
  // Collect data for each year
  pollutionData.forEach(record => {
    if (!record.Datetime) return;
    
    const recordDate = new Date(record.Datetime);
    const year = recordDate.getFullYear();
    
    // Skip if outside our year range
    if (year < startYear || year > endYear) return;
    
    const pm25 = record.PM2_5 || record.PM2_5 || record['PM2.5'] || 0;
    const pm10 = record.PM10 || 0;
    const date = record.Datetime.split(' ')[0]; // Get just the date part
    
    // Add to yearly data
    if (yearlyData[year]) {
      yearlyData[year].pm25Values.push(pm25);
      yearlyData[year].pm10Values.push(pm10);
      
      // Check if unhealthy
      if (pm25 > AQI_CATEGORIES.UNHEALTHY_SENSITIVE.min) {
        yearlyData[year].unhealthyDays.add(date);
      }
    }
  });
  
  // Calculate yearly averages and unhealthy days count
  const yearlyAverages = [];
  const yearlyUnhealthyDays = [];
  
  Object.values(yearlyData).forEach(yearData => {
    if (yearData.pm25Values.length > 0) {
      const avgPM25 = yearData.pm25Values.reduce((sum, val) => sum + val, 0) / yearData.pm25Values.length;
      const avgPM10 = yearData.pm10Values.length > 0 ? 
        yearData.pm10Values.reduce((sum, val) => sum + val, 0) / yearData.pm10Values.length : 0;
      
      const maxPM25 = Math.max(...yearData.pm25Values);
      const maxPM10 = Math.max(...yearData.pm10Values);
      
      yearlyAverages.push({
        year: yearData.year,
        avgPM25,
        avgPM10,
        maxPM25,
        maxPM10,
        recordCount: yearData.pm25Values.length
      });
      
      yearlyUnhealthyDays.push({
        year: yearData.year,
        unhealthyDays: yearData.unhealthyDays.size
      });
    }
  });
  
  // Sort by year
  yearlyAverages.sort((a, b) => a.year - b.year);
  yearlyUnhealthyDays.sort((a, b) => a.year - b.year);
  
  // Calculate trend (simple linear regression)
  let trend = 0;
  
  if (yearlyAverages.length > 1) {
    // Simple linear regression to calculate trend
    const n = yearlyAverages.length;
    const years = yearlyAverages.map(d => d.year);
    const pm25Values = yearlyAverages.map(d => d.avgPM25);
    
    const sumX = years.reduce((sum, x) => sum + x, 0);
    const sumY = pm25Values.reduce((sum, y) => sum + y, 0);
    const sumXY = years.reduce((sum, x, i) => sum + x * pm25Values[i], 0);
    const sumX2 = years.reduce((sum, x) => sum + x * x, 0);
    
    // Slope calculation (change per year)
    trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Round to prevent floating point issues
    trend = Math.round(trend * 1000) / 1000;
  }
  
  return {
    yearlyAverages,
    yearlyUnhealthyDays,
    trend
  };
}; 