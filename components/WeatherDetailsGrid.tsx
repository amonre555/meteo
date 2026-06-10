import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExtraInfo } from '@/services/weather-api';

const { width } = Dimensions.get('window');

interface WeatherDetailsGridProps {
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  precipitation: number;
  extra: ExtraInfo | null;
}

export function WeatherDetailsGrid({
  humidity,
  windSpeed,
  windDirection,
  pressure,
  precipitation,
  extra,
}: WeatherDetailsGridProps) {
  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridItem}>
        <MaterialCommunityIcons name="water-percent" size={24} color="#fff" />
        <Text style={styles.gridLabel}>Humidité</Text>
        <Text style={styles.gridValue}>{humidity}%</Text>
      </View>

      <View style={styles.gridItem}>
        <MaterialCommunityIcons name="weather-windy" size={24} color="#fff" />
        <Text style={styles.gridLabel}>Vent (Vitesse)</Text>
        <Text style={styles.gridValue}>{windSpeed} km/h</Text>
      </View>

      <View style={styles.gridItem}>
        <MaterialCommunityIcons name="compass-outline" size={24} color="#fff" />
        <Text style={styles.gridLabel}>Vent (Direction)</Text>
        <Text style={styles.gridValue}>{windDirection}</Text>
      </View>

      <View style={styles.gridItem}>
        <MaterialCommunityIcons name="gauge" size={24} color="#fff" />
        <Text style={styles.gridLabel}>Pression</Text>
        <Text style={styles.gridValue}>{pressure} hPa</Text>
      </View>

      <View style={styles.gridItem}>
        <MaterialCommunityIcons name="weather-pouring" size={24} color="#fff" />
        <Text style={styles.gridLabel}>Précipitations</Text>
        <Text style={styles.gridValue}>{precipitation} mm</Text>
      </View>

      <View style={styles.gridItem}>
        <MaterialCommunityIcons name="brightness-6" size={24} color="#fff" />
        <Text style={styles.gridLabel}>Index UV Max</Text>
        <Text style={styles.gridValue}>
          {extra?.uvIndexMax !== undefined ? `${extra.uvIndexMax}` : '--'}
        </Text>
      </View>

      {extra?.sunrise && (
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="weather-sunset-up" size={24} color="#fff" />
          <Text style={styles.gridLabel}>Lever du soleil</Text>
          <Text style={styles.gridValue}>{extra.sunrise}</Text>
        </View>
      )}

      {extra?.sunset && (
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="weather-sunset-down" size={24} color="#fff" />
          <Text style={styles.gridLabel}>Coucher du soleil</Text>
          <Text style={styles.gridValue}>{extra.sunset}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginTop: 25,
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    width: (width - 45) / 2,
    padding: 15,
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  gridLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  gridValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
