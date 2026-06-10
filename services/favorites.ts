import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteCity {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

const FAVORITES_KEY = '@meteo_app_favorites';

// Load all favorites
export const getFavorites = async (): Promise<FavoriteCity[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erreur lors du chargement de la liste des favoris', e);
    return [];
  }
};

// Check if a city is in favorites (using name and coordinates for uniqueness)
export const isFavorite = async (name: string, lat: number, lon: number): Promise<boolean> => {
  try {
    const list = await getFavorites();
    return list.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        Math.abs(item.latitude - lat) < 0.01 &&
        Math.abs(item.longitude - lon) < 0.01
    );
  } catch (e) {
    return false;
  }
};

// Add a city to favorites
export const addFavorite = async (city: FavoriteCity): Promise<void> => {
  try {
    const list = await getFavorites();
    // Prevent duplicates
    const exists = list.some(
      (item) =>
        item.name.toLowerCase() === city.name.toLowerCase() &&
        Math.abs(item.latitude - city.latitude) < 0.01 &&
        Math.abs(item.longitude - city.longitude) < 0.01
    );
    if (!exists) {
      list.push(city);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error('Erreur lors de l\'ajout aux favoris', e);
  }
};

// Remove a city from favorites
export const removeFavorite = async (name: string, lat: number, lon: number): Promise<void> => {
  try {
    const list = await getFavorites();
    const filteredList = list.filter(
      (item) =>
        !(
          item.name.toLowerCase() === name.toLowerCase() &&
          Math.abs(item.latitude - lat) < 0.01 &&
          Math.abs(item.longitude - lon) < 0.01
        )
    );
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filteredList));
  } catch (e) {
    console.error('Erreur lors de la suppression des favoris', e);
  }
};
