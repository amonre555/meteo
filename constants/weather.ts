import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface WeatherCondition {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient: [string, string]; // [Start Color, End Color]
}

export const getWeatherCondition = (code: number, isDay: boolean = true): WeatherCondition => {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  switch (code) {
    case 0: // Clear sky
      return {
        label: 'Ciel dégagé',
        icon: isDay ? 'weather-sunny' : 'weather-night',
        gradient: isDay ? ['#29b6f6', '#0288d1'] : ['#1a237e', '#121858'],
      };
    case 1: // Mainly clear
    case 2: // Partly cloudy
      return {
        label: 'Partiellement nuageux',
        icon: isDay ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy',
        gradient: isDay ? ['#4fc3f7', '#0288d1'] : ['#263238', '#1a237e'],
      };
    case 3: // Overcast
      return {
        label: 'Couvert',
        icon: 'weather-cloudy',
        gradient: isDay ? ['#90a4ae', '#455a64'] : ['#37474f', '#212121'],
      };
    case 45: // Fog
    case 48: // Depositing rime fog
      return {
        label: 'Brouillard',
        icon: 'weather-fog',
        gradient: ['#cfd8dc', '#78909c'],
      };
    case 51: // Drizzle: Light
    case 53: // Drizzle: Moderate
    case 55: // Drizzle: Dense intensity
      return {
        label: 'Bruine',
        icon: 'weather-hail',
        gradient: ['#81d4fa', '#4fc3f7'],
      };
    case 61: // Rain: Slight
    case 63: // Rain: Moderate
    case 65: // Rain: Heavy intensity
      return {
        label: 'Pluie',
        icon: 'weather-rainy',
        gradient: ['#4fc3f7', '#1565c0'],
      };
    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy intensity
    case 77: // Snow grains
      return {
        label: 'Neige',
        icon: 'weather-snowy',
        gradient: ['#e0f7fa', '#80deea'],
      };
    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return {
        label: 'Averses de pluie',
        icon: 'weather-pouring',
        gradient: ['#4fc3f7', '#0d47a1'],
      };
    case 85: // Snow showers slight
    case 86: // Snow showers heavy
      return {
        label: 'Averses de neige',
        icon: 'weather-snowy-rainy',
        gradient: ['#b2ebf2', '#0097a7'],
      };
    case 95: // Thunderstorm: Slight or moderate
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return {
        label: 'Orageux',
        icon: 'weather-lightning-rainy',
        gradient: ['#37474f', '#0d47a1'],
      };
    default:
      return {
        label: 'Inconnu',
        icon: 'weather-cloudy',
        gradient: ['#78909c', '#37474f'],
      };
  }
};
