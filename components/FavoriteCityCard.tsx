import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWeatherCondition } from '@/constants/weather';
import { Colors } from '@/constants/theme';

interface FavoriteCityCardProps {
  name: string;
  country: string;
  temp?: number;
  weatherCode?: number;
  isDay?: boolean;
  onPress: () => void;
  colorScheme: 'light' | 'dark';
}

export function FavoriteCityCard({
  name,
  country,
  temp,
  weatherCode,
  isDay = true,
  onPress,
  colorScheme,
}: FavoriteCityCardProps) {
  const isDark = colorScheme === 'dark';
  
  // Use a fallback gradient if temperature weather is not loaded yet
  const fallbackGradient: [string, string] = isDark
    ? ['#2c2c2e', '#1c1c1e']
    : ['#f2f2f7', '#e5e5ea'];

  const weatherCondition =
    weatherCode !== undefined
      ? getWeatherCondition(weatherCode, isDay)
      : {
          label: 'Chargement...',
          icon: 'clock-outline' as const,
          gradient: fallbackGradient,
        };

  const textColor = weatherCode !== undefined ? '#fff' : Colors[colorScheme].text;
  const subtextColor = weatherCode !== undefined ? 'rgba(255, 255, 255, 0.7)' : '#8e8e93';

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.touchable}>
      <LinearGradient
        colors={weatherCondition.gradient}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
      >
        <View style={styles.leftCol}>
          <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.countryText, { color: subtextColor }]} numberOfLines={1}>
            {country}
          </Text>
        </View>

        <View style={styles.rightCol}>
          {temp !== undefined ? (
            <>
              <Text style={styles.tempText}>{temp}°</Text>
              <MaterialCommunityIcons name={weatherCondition.icon} size={30} color="#fff" />
            </>
          ) : (
            <MaterialCommunityIcons name="loading" size={24} color={isDark ? '#fff' : '#0a7ea4'} style={styles.loadingSpinner} />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
  },
  leftCol: {
    flex: 1,
    paddingRight: 15,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  countryText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    marginRight: 12,
  },
  loadingSpinner: {
    alignSelf: 'center',
  },
});
