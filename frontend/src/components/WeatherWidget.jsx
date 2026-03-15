import { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudSun, Drop, Thermometer, MapPin } from '@phosphor-icons/react';

const WeatherWidget = () => {
  const [state, setState] = useState({
    weather: null,
    loading: !!navigator.geolocation,
    error: navigator.geolocation ? null : "Geolocation not supported"
  });

  const { weather, loading, error } = state;

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m`
            );
            setState({
              weather: response.data.current,
              loading: false,
              error: null
            });
          } catch {
            setState(s => ({ ...s, error: "Failed to fetch weather", loading: false }));
          }
        },
        () => {
          setState(s => ({ ...s, error: "Location access denied", loading: false }));
        }
      );
  }, [setState]);

  if (loading) return <div className="weather-skeleton animate-pulse">Loading weather...</div>;
  if (error) return <div className="weather-error"><MapPin size={18} /> {error}</div>;

  return (
    <div className="weather-widget glass-panel p-4 flex items-center justify-between gap-6 animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem'
    }}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <CloudSun size={32} weight="duotone" />
        </div>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            Local Weather
          </h3>
          <p className="text-sm text-gray-500">Live farming conditions</p>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-orange-500 font-bold text-lg">
            <Thermometer size={20} />
            {weather.temperature_2m}°C
          </div>
          <span className="text-xs text-gray-400">Temp</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-blue-500 font-bold text-lg">
            <Drop size={20} />
            {weather.relative_humidity_2m}%
          </div>
          <span className="text-xs text-gray-400">Humidity</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
