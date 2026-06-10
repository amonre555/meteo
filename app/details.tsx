import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWeatherCondition } from '@/constants/weather';
import { HourlyForecastList } from '@/components/HourlyForecastList';
import { DailyForecastList } from '@/components/DailyForecastList';
import { WeatherDetailsGrid } from '@/components/WeatherDetailsGrid';
import { fetchFullForecast, FullForecastData } from '@/services/weather-api';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites';

export default function DetailsScreen() {
  const router = useRouter();
  const { name, lat, lon, country } = useLocalSearchParams<{
    name: string;
    lat: string;
    lon: string;
    country?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<FullForecastData | null>(null);
  const [isFav, setIsFav] = useState(false);

  // Check if city is in favorites on mount or parameters change
  useEffect(() => {
    if (lat && lon && name) {
      isFavorite(name, parseFloat(lat), parseFloat(lon)).then(setIsFav);
    }
  }, [name, lat, lon]);

  const handleToggleFavorite = async () => {
    if (!lat || !lon || !name) return;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isFav) {
      await removeFavorite(name, latitude, longitude);
      setIsFav(false);
    } else {
      await addFavorite({
        name,
        latitude,
        longitude,
        country: country || '',
      });
      setIsFav(true);
    }
  };

  useEffect(() => {
    if (!lat || !lon) {
      setError("Coordonnées de la ville manquantes.");
      setLoading(false);
      return;
    }

    const loadForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFullForecast(parseFloat(lat), parseFloat(lon));
        setForecast(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors de la récupération.");
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [lat, lon]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Chargement des détails météo...</Text>
      </View>
    );
  }

  if (error || !forecast) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#d32f2f" style={{ marginBottom: 15 }} />
        <Text style={styles.errorText}>{error || "Erreur de chargement."}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retourner à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { current, hourly, daily, extra } = forecast;
  const weatherCondition = getWeatherCondition(current.weatherCode, current.isDay);

  return (
    <LinearGradient
      colors={weatherCondition.gradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {name}
              </Text>
              {country ? (
                <Text style={styles.headerSubtitle}>{country}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
              <MaterialCommunityIcons
                name={isFav ? 'heart' : 'heart-outline'}
                size={26}
                color={isFav ? '#ff453a' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.heroSection}>
            <MaterialCommunityIcons name={weatherCondition.icon} size={100} color="#fff" style={styles.heroIcon} />
            <Text style={styles.tempText}>{current.temp}°C</Text>
            <Text style={styles.conditionText}>{weatherCondition.label}</Text>
            <Text style={styles.minMaxText}>
              Min. {current.tempMin}°C  |  Max. {current.tempMax}°C
            </Text>
            <Text style={styles.apparentText}>Ressenti : {current.apparentTemp}°C</Text>
            <Text style={styles.updateText}>Mise à jour : {current.lastUpdated}</Text>
          </View>

          <HourlyForecastList hourlyList={hourly} />

          <DailyForecastList dailyList={daily} />

          <WeatherDetailsGrid
            humidity={current.humidity}
            windSpeed={current.windSpeed}
            windDirection={current.windDirection}
            pressure={current.pressure}
            precipitation={current.precipitation}
            extra={extra}
          />

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151718',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    opacity: 0.8,
  },
  errorText: {
    color: '#ff8a80',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backIconButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  favoriteButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  heroIcon: {
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  tempText: {
    color: '#fff',
    fontSize: 76,
    fontWeight: '200',
  },
  conditionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  apparentText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    marginTop: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  minMaxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  updateText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 8,
  },
});
