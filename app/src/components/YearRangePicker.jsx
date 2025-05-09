import { useState, useEffect } from 'react';

export default function YearRangePicker({ onYearRangeChange }) {
  const maxYear = 2024; 
  const earliestYear = 2014; 
  
  const [startYear, setStartYear] = useState(earliestYear);
  const [endYear, setEndYear] = useState(maxYear);
  const [errors, setErrors] = useState({});
  
  const years = Array.from(
    { length: maxYear - earliestYear + 1 },
    (_, i) => earliestYear + i
  );
  
  useEffect(() => {
    if (startYear > endYear) {
      setErrors({ range: 'Start year cannot be after end year' });
      return;
    }
    
    setErrors({});
    onYearRangeChange({ startYear, endYear });
  }, [startYear, endYear, onYearRangeChange]);
  
  const duration = endYear - startYear + 1;
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
        <svg className="w-4 h-4 mr-1 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        Years attended
      </label>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="startYear" className="block text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            From
          </label>
          <select
            id="startYear"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10 transition-colors"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-5 text-gray-400 dark:text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        <div className="relative">
          <label htmlFor="endYear" className="block text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            To
          </label>
          <select
            id="endYear"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10 transition-colors"
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-5 text-gray-400 dark:text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {errors.range ? (
        <div className="mt-2 text-red-500 dark:text-red-400 text-sm flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          {errors.range}
        </div>
      ) : (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <svg className="w-4 h-4 mr-1 text-indigo-400 dark:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Duration: {duration} {duration === 1 ? 'year' : 'years'} selected
        </div>
      )}
      
      <div className="mt-4 relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30">
              Year Range
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
              {startYear} - {endYear}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100 dark:bg-indigo-900/20">
          <div 
            style={{ width: `${Math.min(100, (duration/(years.length))*100)}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 dark:bg-indigo-400">
          </div>
        </div>
      </div>
    </div>
  );
} 