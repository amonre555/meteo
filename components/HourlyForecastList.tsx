import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HourlyForecast } from '@/services/weather-api';

interface HourlyForecastListProps {
  hourlyList: HourlyForecast[];
}

export function HourlyForecastList({ hourlyList }: HourlyForecastListProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Prévisions horaires (24h)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScroll}>
        {hourlyList.map((item, index) => (
          <View key={index} style={styles.hourlyCard}>
            <Text style={styles.hourlyTime}>{item.time}</Text>
            <MaterialCommunityIcons name={item.icon} size={26} color="#fff" style={styles.hourlyIcon} />
            <Text style={styles.hourlyTemp}>{item.temp}°</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  hourlyScroll: {
    paddingRight: 20,
  },
  hourlyCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 10,
    width: 65,
  },
  hourlyTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  hourlyIcon: {
    marginVertical: 8,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
