# Los Angeles School Pollution Analyzer

This application allows users to analyze pollution data for schools in Los Angeles over time. Users can select a school they attended and the years they were there to view detailed pollution analytics.

## Features

- Search or select a school from the database of Los Angeles schools
- Input the years you attended the school
- View detailed analytics including:
  - Average pollution levels during school hours
  - Days with the highest pollution
  - Number of days in each AQI category (Good, Moderate, Unhealthy, etc.)
  - Minimum and maximum pollution readings over the selected time period
- Weather correlation analysis:
  - Compare pollution levels on rainy vs non-rainy days
  - Analyze how temperature correlates with PM2.5 levels
  - See how different weather conditions affect air quality
- Yearly pollution trends:
  - Track how pollution levels have changed over the years
  - Identify increasing or decreasing trends in PM2.5 and PM10 levels
  - View the number of unhealthy air quality days per year
- Dark mode support with automatic theme detection
- Responsive design for all device sizes

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy data files to the public folder:
   - `Combined_Daily_Data.csv` (pollution data)
   - `los_angeles_schools_with_lat_long.csv` (school locations)
   - `weather_data_hourly.csv` (weather data)

4. Start the development server:
   ```
   npm run dev
   ```

## Data Sources

The application uses three main data sources:
1. **Pollution Data**: Includes PM2.5 and PM10 readings with timestamps
2. **School Location Data**: Contains information about Los Angeles schools including coordinates
3. **Weather Data**: Provides temperature and weather conditions for correlation analysis

## Technical Details

This application is built with:
- React (Vite)
- Tailwind CSS for styling
- Chart.js for data visualization
- PapaParse for CSV parsing

## License

MIT
