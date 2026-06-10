import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DailyForecast } from '@/services/weather-api';

interface DailyForecastListProps {
  dailyList: DailyForecast[];
}

export function DailyForecastList({ dailyList }: DailyForecastListProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Prévisions sur 7 jours</Text>
      <View style={styles.dailyCardContainer}>
        {dailyList.map((item, index) => (
          <View key={index} style={[styles.dailyRow, index === dailyList.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.dailyDayCol}>
              <Text style={styles.dailyDayName}>{item.day}</Text>
              <Text style={styles.dailyDate}>{item.date}</Text>
            </View>
            <View style={styles.dailyIconCol}>
              <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
            </View>
            <View style={styles.dailyTempCol}>
              <Text style={styles.tempMinText}>{item.tempMin}°</Text>
              <View style={styles.tempBarBackground}>
                <LinearGradient
                  colors={['#81d4fa', '#ffb74d']}
                  style={styles.tempBarFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.tempMaxText}>{item.tempMax}°</Text>
            </View>
          </View>
        ))}
      </View>
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
  dailyCardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 15,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dailyDayCol: {
    width: 90,
  },
  dailyDayName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  dailyDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 1,
  },
  dailyIconCol: {
    width: 40,
    alignItems: 'center',
  },
  dailyTempCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  tempMinText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    width: 25,
    textAlign: 'right',
  },
  tempMaxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    width: 25,
    textAlign: 'right',
  },
  tempBarBackground: {
    height: 4,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  tempBarFill: {
    height: '100%',
    width: '100%',
  },
});
