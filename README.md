# Los Angeles School Pollution Analyzer

A comprehensive web application for analyzing historical pollution data around Los Angeles schools, helping former students understand their exposure to air pollutants during their school years.

## Project Overview

This application provides an interactive interface for analyzing PM2.5 and PM10 pollution levels near Los Angeles schools over the past decade. It combines pollution data scraping, smart filtering, and data visualization to give users insights into air quality during their school years.

## Key Features

### 1. Data Collection & Processing
- Automated scraping of PM2.5 and PM10 data using Python
- Intelligent filtering for school hours (8 AM - 3 PM)
- Exclusion of non-school days (weekends, holidays, summer breaks)
- Data aggregation and cleaning for efficient analysis

### 2. Interactive User Interface
- School selection with searchable dropdown
- Year range picker for attendance period
- Multiple visualization tabs:
  - General Analytics
  - Yearly Trends
  - Data Visualizations
  - Weather Correlations

### 3. Analytics & Visualizations
- Real-time data analysis based on user selections
- Multiple chart types:
  - Bar charts for pollution trends
  - Pie charts for AQI category distribution
  - Line charts for temporal analysis
  - Radar charts for statistical comparisons
  - Heat maps for pollution patterns

### 4. Smart Data Filtering
- Location-based data filtering using school coordinates
- Time-based filtering for school hours
- Multiple fallback approaches for data matching
- Comprehensive error handling

## Technical Implementation

### Architecture
- Frontend: React with Vite
- Styling: Tailwind CSS
- Data Visualization: Chart.js
- Data Processing: Python (Jupyter Notebook)
- CSV Parsing: PapaParse

### Key Components
1. **Data Collection (`pollution_scrapper.ipynb`)**
   - Automated web scraping
   - Data cleaning and formatting
   - School day filtering

2. **Data Service (`DataService.js`)**
   - Data loading and filtering
   - Analytics calculations
   - School-pollution matching logic

3. **Visualization Components**
   - `AnalyticsDisplay`: Core metrics and statistics
   - `YearlyTrendsDisplay`: Long-term trend analysis
   - `VisualizationDisplay`: Interactive charts
   - `WeatherCorrelationDisplay`: Weather impact analysis

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Place required data files in the public directory:
   - Combined_Daily_Data.csv
   - los_angeles_schools_with_lat_long.csv
   - weather_data_hourly.csv

4. Start the development server:
```bash
npm run dev
```

## Data Sources
- Air quality data from AirNow API
- School location data from LA Unified School District
- Weather data from historical weather services

## Technical Highlights

1. **Smart Data Matching**
   - Multiple approaches for matching schools to pollution data
   - Coordinate-based proximity calculations
   - Site code and location keyword matching
   - Fallback strategies for maximum data coverage

2. **Efficient Data Processing**
   - Asynchronous data loading
   - Client-side filtering and caching
   - Optimized calculations for real-time analysis

3. **Responsive Visualizations**
   - Dynamic chart updates
   - Dark mode support
   - Mobile-friendly design

## Future Enhancements
- Additional weather correlation analysis
- Historical event overlay
- Traffic data integration
- Health impact estimations

