import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { CitySuggestion } from '@/services/weather-api';

interface SearchBarProps {
  query: string;
  onChangeQuery: (q: string) => void;
  suggestions: CitySuggestion[];
  loading: boolean;
  error: string | null;
  onSelectCity: (city: CitySuggestion) => void;
  colorScheme: 'light' | 'dark';
}

export function SearchBar({
  query,
  onChangeQuery,
  suggestions,
  loading,
  error,
  onSelectCity,
  colorScheme,
}: SearchBarProps) {
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0' }]}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={isDark ? '#aeaeb2' : '#8e8e93'}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme].text }]}
          placeholder="Rechercher une ville..."
          placeholderTextColor={isDark ? '#aeaeb2' : '#8e8e93'}
          value={query}
          onChangeText={onChangeQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => onChangeQuery('')}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={isDark ? '#aeaeb2' : '#8e8e93'}
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown overlay */}
      {query.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
              borderColor: isDark ? '#38383a' : '#e5e5ea',
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0a7ea4" style={{ padding: 15 }} />
          ) : error ? (
            <Text style={[styles.noResultText, { color: isDark ? '#ff453a' : '#ff3b30', fontWeight: '500' }]}>
              {error}
            </Text>
          ) : suggestions.length === 0 ? (
            <Text style={[styles.noResultText, { color: isDark ? '#aeaeb2' : '#8e8e93' }]}>
              Aucun résultat
            </Text>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.suggestionItem, { borderBottomColor: isDark ? '#2c2c2e' : '#f2f2f7' }]}
                  onPress={() => onSelectCity(item)}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color="#0a7ea4"
                    style={{ marginRight: 8 }}
                  />
                  <View>
                    <Text style={[styles.suggestionName, { color: Colors[colorScheme].text }]}>
                      {item.name}
                    </Text>
                    <Text style={styles.suggestionSubtext}>
                      {item.admin1 ? `${item.admin1}, ` : ''}
                      {item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
  },
  clearIcon: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionSubtext: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },
  noResultText: {
    textAlign: 'center',
    padding: 15,
    fontSize: 15,
  },
});
