import { getWeatherCondition } from '@/constants/weather';

export interface CitySuggestion {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeatherData {
  temp: number;
  apparentTemp: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  timezone?: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  icon: any; // Glyph name for MaterialCommunityIcons
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecast {
  day: string;
  date: string;
  tempMin: number;
  tempMax: number;
  icon: any; // Glyph name for MaterialCommunityIcons
  weatherCode: number;
}

export interface ExtraInfo {
  uvIndexMax?: number;
  sunrise?: string;
  sunset?: string;
}

export interface FullForecastData {
  current: {
    temp: number;
    apparentTemp: number;
    humidity: number;
    windSpeed: number;
    windDirection: string; // e.g. "NE", "SO", etc.
    pressure: number; // in hPa
    precipitation: number;
    weatherCode: number;
    isDay: boolean;
    tempMin: number;
    tempMax: number;
    lastUpdated: string;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  extra: ExtraInfo;
}

// Check if an error is a network error
const isNetworkError = (err: any): boolean => {
  return !!(
    err.message &&
    (err.message.includes('Network request failed') ||
      err.message.includes('Failed to fetch') ||
      err.message.toLowerCase().includes('network'))
  );
};

// Convert degree degrees to cardinal directions
const getWindDirectionLabel = (degree: number): string => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 
    'E', 'ESE', 'SE', 'SSE', 
    'S', 'SSW', 'SW', 'WSW', 
    'W', 'WNW', 'NW', 'NNW'
  ];
  const idx = Math.round((degree % 360) / 22.5) % 16;
  return directions[idx];
};

// Search cities by query (Geocoding API)
export const searchCities = async (query: string): Promise<CitySuggestion[]> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`
    );
    if (!response.ok) {
      throw new Error('Erreur lors du géocodage');
    }
    const data = await response.json();
    if (!data.results) return [];
    return data.results.map((item: any) => ({
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      admin1: item.admin1 || '',
    }));
  } catch (err: any) {
    if (isNetworkError(err)) {
      throw new Error('Connexion internet indisponible. Veuillez vérifier votre réseau.');
    }
    throw err;
  }
};

// Fetch current weather for home page card
export const fetchCurrentWeather = async (latitude: number, longitude: number): Promise<CurrentWeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`
    );
    if (!response.ok) {
      throw new Error('Erreur lors du chargement de la météo');
    }
    const data = await response.json();
    return {
      temp: Math.round(data.current.temperature_2m),
      apparentTemp: Math.round(data.current.apparent_temperature),
      weatherCode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      isDay: data.current.is_day === 1,
      timezone: data.timezone,
    };
  } catch (err: any) {
    if (isNetworkError(err)) {
      throw new Error('Connexion internet indisponible. Veuillez vérifier votre réseau.');
    }
    throw err;
  }
};

// Fetch full weather forecast for details screen
export const fetchFullForecast = async (latitude: number, longitude: number): Promise<FullForecastData> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des détails météo');
    }
    const data = await response.json();

    // Parse Hourly (next 24 hours)
    const currentHourStr = data.current.time;
    const startIndex = data.hourly.time.findIndex((t: string) => t >= currentHourStr);
    const resolvedStartIndex = startIndex !== -1 ? startIndex : 0;
    const hourlyList: HourlyForecast[] = [];

    for (let i = 0; i < 24; i++) {
      const idx = resolvedStartIndex + i;
      if (idx < data.hourly.time.length) {
        const timeVal = new Date(data.hourly.time[idx]);
        const hourLabel = timeVal.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const wCode = data.hourly.weather_code[idx];
        const isDayVal = data.hourly.is_day[idx] === 1;

        hourlyList.push({
          time: hourLabel,
          temp: Math.round(data.hourly.temperature_2m[idx]),
          weatherCode: wCode,
          icon: getWeatherCondition(wCode, isDayVal).icon,
          isDay: isDayVal,
        });
      }
    }

    // Parse Daily (7 days)
    const dailyList: DailyForecast[] = [];
    const daysOfWeek = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

    for (let i = 0; i < data.daily.time.length; i++) {
      const dateVal = new Date(data.daily.time[i]);
      const dayName = i === 0 ? "Aujourd'hui" : daysOfWeek[dateVal.getDay()];
      const wCode = data.daily.weather_code[i];

      dailyList.push({
        day: dayName,
        date: dateVal.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        weatherCode: wCode,
        icon: getWeatherCondition(wCode, true).icon,
      });
    }

    // Parse Sunrise/Sunset
    const formatTime = (isoString?: string) => {
      if (!isoString) return '';
      return new Date(isoString).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // Calculate Last Updated
    const now = new Date();
    const lastUpdatedStr = now.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    }) + ' à ' + now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      current: {
        temp: Math.round(data.current.temperature_2m),
        apparentTemp: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: getWindDirectionLabel(data.current.wind_direction_10m),
        pressure: Math.round(data.current.surface_pressure),
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        tempMin: data.daily.temperature_2m_min ? Math.round(data.daily.temperature_2m_min[0]) : Math.round(data.current.temperature_2m),
        tempMax: data.daily.temperature_2m_max ? Math.round(data.daily.temperature_2m_max[0]) : Math.round(data.current.temperature_2m),
        lastUpdated: lastUpdatedStr,
      },
      hourly: hourlyList,
      daily: dailyList,
      extra: {
        uvIndexMax: data.daily.uv_index_max ? Math.round(data.daily.uv_index_max[0]) : undefined,
        sunrise: formatTime(data.daily.sunrise?.[0]),
        sunset: formatTime(data.daily.sunset?.[0]),
      },
    };
  } catch (err: any) {
    if (isNetworkError(err)) {
      throw new Error('Connexion internet indisponible. Veuillez vérifier votre connexion réseau.');
    }
    throw err;
  }
};
