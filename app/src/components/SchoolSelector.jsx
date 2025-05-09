import { useState, useEffect, useRef } from 'react';

export default function SchoolSelector({ onSelectSchool }) {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchSchools() {
      try {
        const response = await fetch('/los_angeles_schools_with_lat_long.csv');
        const data = await response.text();
        
        const rows = data.split('\n');
        const headers = rows[0].split(',');
        
        const parsedSchools = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i]) continue;
          
          const values = rows[i].split(',');
          const school = {};
          
          headers.forEach((header, index) => {
            school[header.trim()] = values[index]?.trim() || '';
          });
          
          parsedSchools.push(school);
        }
        
        setSchools(parsedSchools);
        setFilteredSchools(parsedSchools);
        setLoading(false);
      } catch (err) {
        console.error('Error loading schools:', err);
        setError('Failed to load schools data');
        setLoading(false);
      }
    }
    
    fetchSchools();
    
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSchools(schools);
      return;
    }
    
    const filtered = schools.filter(school => 
      school.School?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredSchools(filtered);
    
    if (searchTerm.trim() !== '') {
      setIsDropdownOpen(true);
    }
  }, [searchTerm, schools]);

  const handleSchoolSelect = (school) => {
    onSelectSchool(school);
    setSearchTerm(school.School);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mb-6 bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-200 dark:border-red-800">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="font-medium">{error}</span>
        </div>
        <p className="mt-2 text-sm text-red-500 dark:text-red-300">Please try refreshing the page or try again later.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label htmlFor="school-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
        <svg className="w-4 h-4 mr-1 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Search or select your school
      </label>
      
      <div className="relative">
        <input
          type="text"
          id="school-search"
          ref={searchInputRef}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          placeholder="Type to search for your school..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
        />
        
        {searchTerm && (
          <button
            className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            onClick={() => {
              setSearchTerm('');
              searchInputRef.current?.focus();
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
        
        {!searchTerm && (
          <div className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        )}
      </div>
      
      {isDropdownOpen && filteredSchools.length > 0 && (
        <div 
          ref={dropdownRef}
          className="mt-2 w-full max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md shadow-lg bg-white dark:bg-gray-700 z-10 transition-colors"
        >
          <ul className="py-1 divide-y divide-gray-100 dark:divide-gray-600">
            {filteredSchools.slice(0, 20).map((school, index) => (
              <li
                key={index}
                className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors"
                onClick={() => handleSchoolSelect(school)}
              >
                <div className="font-medium text-gray-800 dark:text-gray-100">{school.School}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {school['Street Address']}
                </div>
              </li>
            ))}
            {filteredSchools.length > 20 && (
              <li className="px-4 py-2 text-xs text-center text-gray-500 dark:text-gray-400 border-t dark:border-gray-600">
                Showing top 20 results. Continue typing to refine your search.
              </li>
            )}
          </ul>
        </div>
      )}
      
      {isDropdownOpen && searchTerm && filteredSchools.length === 0 && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 transition-colors">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No schools found matching <span className="font-medium">"{searchTerm}"</span></span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Try a different search term or select from the dropdown below.</p>
        </div>
      )}
      
      {!searchTerm && (
        <div className="mt-2">
          <select
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            onChange={(e) => {
              if (e.target.value) {
                const selectedSchool = schools.find((_, index) => index === parseInt(e.target.value));
                if (selectedSchool) handleSchoolSelect(selectedSchool);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Select a school from the list</option>
            {schools.map((school, index) => (
              <option key={index} value={index}>
                {school.School}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {schools.length} schools available. Type in the search box above for faster results.
          </p>
        </div>
      )}
    </div>
  );
} 