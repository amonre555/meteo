import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { CurrentWeatherCard } from '@/components/CurrentWeatherCard';
import { FavoriteCityCard } from '@/components/FavoriteCityCard';
import {
  searchCities,
  fetchCurrentWeather,
  CitySuggestion,
  CurrentWeatherData,
} from '@/services/weather-api';
import { getFavorites, FavoriteCity } from '@/services/favorites';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // State Management
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [currentCity, setCurrentCity] = useState<string>('');
  const [currentCountry, setCurrentCountry] = useState<string>('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySuggestion[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Favorites State
  interface FavoriteCityWithWeather extends FavoriteCity {
    temp?: number;
    weatherCode?: number;
    isDay?: boolean;
  }
  const [favorites, setFavorites] = useState<FavoriteCityWithWeather[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const loadFavoritesList = useCallback(async () => {
    try {
      setLoadingFavorites(true);
      const favList = await getFavorites();
      const listWithWeather = await Promise.all(
        favList.map(async (city) => {
          try {
            const weather = await fetchCurrentWeather(city.latitude, city.longitude);
            return {
              ...city,
              temp: weather.temp,
              weatherCode: weather.weatherCode,
              isDay: weather.isDay,
            };
          } catch (err) {
            return city;
          }
        })
      );
      setFavorites(listWithWeather);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavoritesList();
    }, [loadFavoritesList])
  );

  // Fetch Weather for current coordinates
  const loadWeather = async (latitude: number, longitude: number, geocodedCity?: string, geocodedCountry?: string) => {
    try {
      setLoadingWeather(true);
      setErrorMessage(null);
      const data = await fetchCurrentWeather(latitude, longitude);
      setCurrentWeather(data);

      let finalCity = geocodedCity;
      let finalCountry = geocodedCountry;

      // Fallback if reverse geocoding is unavailable (e.g. on Web platform)
      if ((!finalCity || finalCity === 'Ma Position') && data.timezone) {
        const parts = data.timezone.split('/');
        finalCity = parts[parts.length - 1].replace(/_/g, ' ');
        finalCountry = '';
      }

      setCurrentCity(finalCity || 'Ma Position');
      setCurrentCountry(finalCountry || '');
    } catch (err: any) {
      if (err.message && (err.message.includes('Network request failed') || err.message.includes('Failed to fetch') || err.message.includes('network'))) {
        setErrorMessage('Connexion internet indisponible. Veuillez vérifier votre réseau.');
      } else {
        setErrorMessage(err.message || 'Impossible de charger la météo.');
      }
    } finally {
      setLoadingWeather(false);
    }
  };

  // Obtain User Geolocation
  const getUserLocation = useCallback(async () => {
    try {
      setLoadingWeather(true);
      setErrorMessage(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setErrorMessage('Accès à la localisation refusé. Utilisez la recherche pour trouver une ville.');
        setLoadingWeather(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCurrentCoords({ lat: latitude, lon: longitude });

      let city = '';
      let country = '';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          city = geocode[0].city || geocode[0].district || geocode[0].subregion || '';
          country = geocode[0].country || '';
        }
      } catch (e) {
        // Safe to ignore geocode errors on Web
      }

      // If geocoding returned nothing (common on Web), try BigDataCloud's free reverse geocoding API
      if (!city) {
        try {
          const webGeocodeResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
          );
          if (webGeocodeResponse.ok) {
            const webGeocodeData = await webGeocodeResponse.json();
            city = webGeocodeData.city || webGeocodeData.locality || webGeocodeData.principalSubdivision || '';
            country = webGeocodeData.countryName || '';
          }
        } catch (e) {
          console.error('Erreur reverse geocoding web fallback', e);
        }
      }

      await loadWeather(latitude, longitude, city, country);
    } catch (err: any) {
      if (err.message && (err.message.includes('Network request failed') || err.message.includes('Failed to fetch') || err.message.includes('network'))) {
        setErrorMessage('Connexion internet indisponible. Veuillez vérifier votre réseau.');
      } else {
        setErrorMessage("Impossible d'obtenir votre position. Assurez-vous d'avoir activé la localisation GPS.");
      }
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Debounced search logic
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        setSearchError(null);
        const results = await searchCities(searchQuery);
        if (results.length > 0) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
          setSearchError("Aucune ville trouvée. Vérifiez l'orthographe.");
        }
      } catch (err: any) {
        setSearchError(err.message || 'Erreur lors de la recherche.');
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectCity = (city: CitySuggestion) => {
    setSearchQuery('');
    setSearchResults([]);
    router.push({
      pathname: '/details',
      params: {
        name: city.name,
        lat: city.latitude.toString(),
        lon: city.longitude.toString(),
        country: city.country,
      },
    });
  };

  const navigateToCurrentDetails = () => {
    if (currentCoords && currentCity) {
      router.push({
        pathname: '/details',
        params: {
          name: currentCity,
          lat: currentCoords.lat.toString(),
          lon: currentCoords.lon.toString(),
          country: currentCountry,
        },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: Colors[colorScheme].text }]}>Météo</Text>
        </View>

        {/* Modular Search Bar */}
        <SearchBar
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          suggestions={searchResults}
          loading={loadingSearch}
          error={searchError}
          onSelectCity={handleSelectCity}
          colorScheme={colorScheme}
        />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25 }}>
          {/* Main Weather Card (Current Location) */}
          <View style={styles.mainBlockContainer}>
            {loadingWeather ? (
              <View style={styles.centerBlock}>
                <ActivityIndicator size="large" color="#0a7ea4" />
                <Text style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
                  Récupération de la position...
                </Text>
              </View>
            ) : errorMessage ? (
              <View style={[styles.errorCard, { backgroundColor: isDark ? '#2c2c2e' : '#ffebee' }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#d32f2f" />
                <Text style={styles.errorText}>{errorMessage}</Text>
                {locationPermission !== Location.PermissionStatus.GRANTED && (
                  <TouchableOpacity style={styles.retryButton} onPress={getUserLocation}>
                    <Text style={styles.retryButtonText}>Réessayer la localisation</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : currentWeather ? (
              <CurrentWeatherCard
                cityName={currentCity}
                temp={currentWeather.temp}
                apparentTemp={currentWeather.apparentTemp}
                humidity={currentWeather.humidity}
                windSpeed={currentWeather.windSpeed}
                weatherCode={currentWeather.weatherCode}
                isDay={currentWeather.isDay}
                onPress={navigateToCurrentDetails}
              />
            ) : null}
          </View>

          {/* Favorites List */}
          <View style={styles.favoritesSection}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
              Mes Villes Favorites
            </Text>
            {loadingFavorites ? (
              <ActivityIndicator size="small" color="#0a7ea4" style={{ marginTop: 20, alignSelf: 'center' }} />
            ) : favorites.length === 0 ? (
              <Text style={[styles.emptyFavoritesText, { color: isDark ? '#8e8e93' : '#687076' }]}>
                Aucune ville favorite. Ajoutez-en depuis les détails météo d'une ville !
              </Text>
            ) : (
              favorites.map((city, index) => (
                <FavoriteCityCard
                  key={`${city.latitude}-${city.longitude}-${index}`}
                  name={city.name}
                  country={city.country}
                  temp={city.temp}
                  weatherCode={city.weatherCode}
                  isDay={city.isDay}
                  colorScheme={colorScheme}
                  onPress={() =>
                    router.push({
                      pathname: '/details',
                      params: {
                        name: city.name,
                        lat: city.latitude.toString(),
                        lon: city.longitude.toString(),
                        country: city.country,
                      },
                    })
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginVertical: 15,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  mainBlockContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.8,
  },
  errorCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  favoritesSection: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyFavoritesText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
