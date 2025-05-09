import Papa from 'papaparse';

export const AQI_CATEGORIES = {
  GOOD: { min: 0, max: 12, label: 'Good' },
  MODERATE: { min: 12.1, max: 35.4, label: 'Moderate' },
  UNHEALTHY_SENSITIVE: { min: 35.5, max: 55.4, label: 'Unhealthy for Sensitive Groups' },
  UNHEALTHY: { min: 55.5, max: 150.4, label: 'Unhealthy' },
  VERY_UNHEALTHY: { min: 150.5, max: 250.4, label: 'Very Unhealthy' },
  HAZARDOUS: { min: 250.5, max: 999, label: 'Hazardous' }
};

const SCHOOL_HOURS = { start: 8, end: 15 };


export const POLLUTION_CENTERS = [
  {
    name: 'Los Angeles - N. Mai',
    latitude: 34.0655,
    longitude: -118.2356,
    siteCode: '60371103',
    locationKeywords: ['Los Angeles', 'N. Mai']
  },
  {
    name: 'South Long Beach',
    latitude: 33.7701,
    longitude: -118.1937,
    siteCode: '60374004',
    locationKeywords: ['Long Beach', 'South Long Beach']
  }
];

export const loadSchools = async () => {
  const response = await fetch('/los_angeles_schools_with_lat_long.csv');
  const csvText = await response.text();
  
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });
  
  return data;
};

export const loadPollutionData = async () => {
  const response = await fetch('/pollution_data.csv');
  const csvText = await response.text();
  
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });
  
  return data;
};

export const loadWeatherData = async () => {
  try {
    const response = await fetch('/weather_data_hourly.csv');
    const csvText = await response.text();
    
    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    const processedData = data.map(record => {
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

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  
  const R = 6371; 
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

export const findClosestPollutionCenter = (schoolLatitude, schoolLongitude) => {
  if (!schoolLatitude || !schoolLongitude) {
    return POLLUTION_CENTERS[0]; 
  }
  
  let closestCenter = null;
  let shortestDistance = Infinity;
  
  POLLUTION_CENTERS.forEach(center => {
    const distance = calculateDistance(
      schoolLatitude, 
      schoolLongitude, 
      center.latitude, 
      center.longitude
    );
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestCenter = center;
    }
  });
  
  return {
    ...closestCenter,
    distance: shortestDistance
  };
};

export const filterPollutionDataForSchool = (pollutionData, schoolLocation, startYear, endYear) => {
  const closestCenter = findClosestPollutionCenter(
    parseFloat(schoolLocation.latitude),
    parseFloat(schoolLocation.longitude)
  );
  
  console.log('Closest center:', closestCenter);
  console.log('School coordinates:', schoolLocation.latitude, schoolLocation.longitude);
  
  if (pollutionData && pollutionData.length > 0) {
    console.log('Sample pollution record:', pollutionData[0]);
    const siteCodes = new Set();
    const locations = new Set();
    pollutionData.forEach(record => {
      if (record.SiteCode) siteCodes.add(record.SiteCode);
      if (record.Location) locations.add(record.Location);
    });
    console.log('Unique SiteCodes in data:', Array.from(siteCodes));
    console.log('Unique Locations in data:', Array.from(locations));
  }
  
  const filterWithApproach = (approach) => {
    let filtered = [];
    
    if (approach === 'coordinates') {
      const MAX_DISTANCE_KM = 5; 
      filtered = pollutionData.filter(record => {
        if (!record.Datetime) return false;
        
        const recordDate = new Date(record.Datetime);
        const year = recordDate.getFullYear();
        const hour = recordDate.getHours();
        
        if (!(year >= startYear && year <= endYear && 
             hour >= SCHOOL_HOURS.start && hour <= SCHOOL_HOURS.end)) {
          return false;
        }
        
        if (record.Latitude && record.Longitude) {
          const distance = calculateDistance(
            parseFloat(record.Latitude),
            parseFloat(record.Longitude),
            closestCenter.latitude,
            closestCenter.longitude
          );
          
          return distance <= MAX_DISTANCE_KM;
        }
        
        return false;
      });
    } else if (approach === 'identifiers') {
      filtered = pollutionData.filter(record => {
        if (!record.Datetime) return false;
        
        const recordDate = new Date(record.Datetime);
        const year = recordDate.getFullYear();
        const hour = recordDate.getHours();
        
        if (!(year >= startYear && year <= endYear && 
             hour >= SCHOOL_HOURS.start && hour <= SCHOOL_HOURS.end)) {
          return false;
        }
        
        const siteCodeMatches = 
          String(record.SiteCode) === String(closestCenter.siteCode) || 
          String(record.SiteCode).includes(String(closestCenter.siteCode)) ||
          String(closestCenter.siteCode).includes(String(record.SiteCode));
        
        let locationMatches = false;
        if (record.Location && closestCenter.locationKeywords) {
          locationMatches = closestCenter.locationKeywords.some(keyword => 
            record.Location.includes(keyword)
          );
        }
        
        return (siteCodeMatches || locationMatches);
      });
    } else if (approach === 'timeFiltersOnly') {
      filtered = pollutionData.filter(record => {
        if (!record.Datetime) return false;
        
        const recordDate = new Date(record.Datetime);
        const year = recordDate.getFullYear();
        const hour = recordDate.getHours();
        
        return year >= startYear && 
               year <= endYear && 
               hour >= SCHOOL_HOURS.start && 
               hour <= SCHOOL_HOURS.end;
      });
    } else if (approach === 'noFilters') {
      filtered = pollutionData.slice(0, 100); 
    }
    
    return filtered;
  };
  
  let finalFilteredData = [];
  const approaches = ['coordinates', 'identifiers', 'timeFiltersOnly', 'noFilters'];
  
  for (const approach of approaches) {
    finalFilteredData = filterWithApproach(approach);
    console.log(`Filtered data count (${approach}):`, finalFilteredData.length);
    
    if (finalFilteredData.length > 0) {
      console.log(`Using approach: ${approach}`);
      console.log('First filtered record:', finalFilteredData[0]);
      break;
    }
  }
  
  return finalFilteredData;
};

export const filterWeatherData = (weatherData, startYear, endYear) => {
  return weatherData.filter(record => {
    if (!record.year) return false;
    return record.year >= startYear && record.year <= endYear;
  });
};

export const getAQICategory = (pm25) => {
  if (pm25 <= AQI_CATEGORIES.GOOD.max) return AQI_CATEGORIES.GOOD;
  if (pm25 <= AQI_CATEGORIES.MODERATE.max) return AQI_CATEGORIES.MODERATE;
  if (pm25 <= AQI_CATEGORIES.UNHEALTHY_SENSITIVE.max) return AQI_CATEGORIES.UNHEALTHY_SENSITIVE;
  if (pm25 <= AQI_CATEGORIES.UNHEALTHY.max) return AQI_CATEGORIES.UNHEALTHY;
  if (pm25 <= AQI_CATEGORIES.VERY_UNHEALTHY.max) return AQI_CATEGORIES.VERY_UNHEALTHY;
  return AQI_CATEGORIES.HAZARDOUS;
};

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

  const pm25Sum = filteredData.reduce((sum, record) => sum + (record['PM2.5'] || 0), 0);
  const pm10Sum = filteredData.reduce((sum, record) => sum + (record.PM10 || 0), 0);
  
  const pm25Values = filteredData.map(record => record['PM2.5'] || 0);
  const pm10Values = filteredData.map(record => record.PM10 || 0);
  
  const maxPM25 = Math.max(...pm25Values);
  const maxPM10 = Math.max(...pm10Values);
  const minPM25 = Math.min(...pm25Values.filter(val => val > 0));
  const minPM10 = Math.min(...pm10Values.filter(val => val > 0));
  
  const daysInCategories = {};
  Object.keys(AQI_CATEGORIES).forEach(category => {
    daysInCategories[category] = 0;
  });
  
  const countedDates = new Set();
  
  filteredData.forEach(record => {
    if (!record.Datetime) return;
    
    const pm25 = record['PM2.5'] || 0;
    const date = record.Datetime.split(' ')[0];  
    
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
  
   
  const dailyMaxPM25 = {};
  
  filteredData.forEach(record => {
    if (!record.Datetime) return;
    
    const date = record.Datetime.split(' ')[0];
    const pm25 = record['PM2.5'] || 0;
    
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

export const analyzeWeatherCorrelation = (pollutionData, weatherData) => {
  if (!pollutionData || !weatherData || pollutionData.length === 0 || weatherData.length === 0) {
    return {
      rainyDaysAvgPM25: 0,
      nonRainyDaysAvgPM25: 0,
      temperatureCorrelation: [],
      weatherConditionStats: {}
    };
  }

  const pollutionByDate = {};
  pollutionData.forEach(record => {
    if (!record.Datetime) return;
    
    const date = record.Datetime.split(' ')[0]; 
    const pm25 = record['PM2.5'] || 0;
    
    if (!pollutionByDate[date]) {
      pollutionByDate[date] = {
        pm25Values: [],
        date
      };
    }
    
    pollutionByDate[date].pm25Values.push(pm25);
  });
  
  Object.keys(pollutionByDate).forEach(date => {
    const values = pollutionByDate[date].pm25Values;
    pollutionByDate[date].avgPM25 = values.reduce((sum, val) => sum + val, 0) / values.length;
  });
  
  const rainyDaysPM25 = [];
  const nonRainyDaysPM25 = [];
  const weatherConditionStats = {};
  const temperatureRanges = [];
  
  weatherData.forEach(weatherRecord => {
    if (!weatherRecord.date) return;
    
    const dateString = weatherRecord.date.toISOString().split('T')[0];
    const pollutionForDate = pollutionByDate[dateString];
    
    if (pollutionForDate) {
      if (weatherRecord.isRainy) {
        rainyDaysPM25.push(pollutionForDate.avgPM25);
      } else {
        nonRainyDaysPM25.push(pollutionForDate.avgPM25);
      }
      
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
      
      const temp = weatherRecord.temperature;
      if (typeof temp === 'number') {
        temperatureRanges.push({
          temperature: temp,
          pm25: pollutionForDate.avgPM25
        });
      }
    }
  });
  
  Object.keys(weatherConditionStats).forEach(condition => {
    const stats = weatherConditionStats[condition];
    if (stats.days > 0) {
      stats.averagePM25 = stats.totalPM25 / stats.days;
    }
  });
  
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

export const analyzeYearlyTrends = (pollutionData, startYear, endYear) => {
  if (!pollutionData || pollutionData.length === 0) {
    return {
      yearlyAverages: [],
      yearlyUnhealthyDays: [],
      trend: 0
    };
  }

  const yearlyData = {};
  
  for (let year = startYear; year <= endYear; year++) {
    yearlyData[year] = {
      year,
      pm25Values: [],
      pm10Values: [],
      unhealthyDays: new Set() 
    };
  }
  
  pollutionData.forEach(record => {
    if (!record.Datetime) return;
    
    const recordDate = new Date(record.Datetime);
    const year = recordDate.getFullYear();
    
    if (year < startYear || year > endYear) return;
    
    const pm25 = record['PM2.5'] || 0;
    const pm10 = record.PM10 || 0;
    const date = record.Datetime.split(' ')[0]; 
    
    if (yearlyData[year]) {
      yearlyData[year].pm25Values.push(pm25);
      yearlyData[year].pm10Values.push(pm10);
      
      if (pm25 > AQI_CATEGORIES.UNHEALTHY_SENSITIVE.min) {
        yearlyData[year].unhealthyDays.add(date);
      }
    }
  });
  
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
  
  yearlyAverages.sort((a, b) => a.year - b.year);
  yearlyUnhealthyDays.sort((a, b) => a.year - b.year);
  
  let trend = 0;
  
  if (yearlyAverages.length > 1) {
    const n = yearlyAverages.length;
    const years = yearlyAverages.map(d => d.year);
    const pm25Values = yearlyAverages.map(d => d.avgPM25);
    
    const sumX = years.reduce((sum, x) => sum + x, 0);
    const sumY = pm25Values.reduce((sum, y) => sum + y, 0);
    const sumXY = years.reduce((sum, x, i) => sum + x * pm25Values[i], 0);
    const sumX2 = years.reduce((sum, x) => sum + x * x, 0);
    
    trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    trend = Math.round(trend * 1000) / 1000;
  }
  
  return {
    yearlyAverages,
    yearlyUnhealthyDays,
    trend
  };
}; 