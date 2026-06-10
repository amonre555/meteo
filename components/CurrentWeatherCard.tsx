import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWeatherCondition } from '@/constants/weather';

interface CurrentWeatherCardProps {
  cityName: string;
  temp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  onPress: () => void;
}

export function CurrentWeatherCard({
  cityName,
  temp,
  apparentTemp,
  humidity,
  windSpeed,
  weatherCode,
  isDay,
  onPress,
}: CurrentWeatherCardProps) {
  const weatherCondition = getWeatherCondition(weatherCode, isDay);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.touchableCard}>
      <LinearGradient
        colors={weatherCondition.gradient}
        style={styles.weatherCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.myLocationText}>Ma Position</Text>
            <Text style={styles.cityNameText}>{cityName}</Text>
          </View>
          <MaterialCommunityIcons name={weatherCondition.icon} size={64} color="#fff" />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.tempText}>{temp}°C</Text>
          <Text style={styles.conditionText}>{weatherCondition.label}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.infoCol}>
            <MaterialCommunityIcons name="thermometer" size={16} color="#fff" />
            <Text style={styles.infoLabel}>Ressenti</Text>
            <Text style={styles.infoVal}>{apparentTemp}°C</Text>
          </View>
          <View style={styles.infoCol}>
            <MaterialCommunityIcons name="water-percent" size={16} color="#fff" />
            <Text style={styles.infoLabel}>Humidité</Text>
            <Text style={styles.infoVal}>{humidity}%</Text>
          </View>
          <View style={styles.infoCol}>
            <MaterialCommunityIcons name="weather-windy" size={16} color="#fff" />
            <Text style={styles.infoLabel}>Vent</Text>
            <Text style={styles.infoVal}>{windSpeed} km/h</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchableCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  weatherCard: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  myLocationText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cityNameText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardBody: {
    marginTop: 20,
    marginBottom: 24,
  },
  tempText: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '300',
  },
  conditionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  infoCol: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  infoVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
