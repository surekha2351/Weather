import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './WeatherPage.css'; // Import the CSS file

const WeatherPage: React.FC = () => {
  const { city } = useParams<{ city: string }>(); // Get city from route params
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = "b18a240f6b672c914d65eb9ea26c9ebb";

  useEffect(() => {
    const fetchWeather = async () => {
      if (!apiKey) {
        setError('API key is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city!)}&appid=${apiKey}&units=metric`
        );
        setWeatherData(response.data);
      } catch (err) {
        setError('Error fetching weather data');
        console.error('Error fetching weather data:', err);
      }

      setLoading(false);
    };

    fetchWeather();
  }, [city]); // Fetch weather data whenever city changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!weatherData) return <p>No data available</p>;

  return (
    <center>
    <div className="weather-container">
      <h2 className="weather-header">Weather in {city}</h2>
      <div className="weather-details">
        <div className="weather-data">
          <p><strong>Temperature:</strong> {weatherData.main.temp}°C</p>
          <p><strong>Min:</strong> {weatherData.main.temp_min}°C, <strong>Max:</strong> {weatherData.main.temp_max}°C</p>
          <p><strong>Humidity:</strong> {weatherData.main.humidity}%</p>
          <p><strong>Pressure:</strong> {weatherData.main.pressure} hPa</p>
          <p><strong>Wind Speed:</strong> {weatherData.wind.speed} m/s</p>
          <p><strong>Description:</strong> {weatherData.weather[0].description}</p>
        </div>
        <div className="weather-icon">
          <img
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
            alt="weather icon"
          />
        </div>
      </div>
    </div>
    </center>
  );
};

export default WeatherPage;
