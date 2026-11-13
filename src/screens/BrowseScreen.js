import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import apps from '../data/apps.json';
import { EmptyState } from '../components/EmptyState';
import { FilterChips } from '../components/FilterChips';
import { FilterSheet } from '../components/FilterSheet';
import { SearchBar } from '../components/SearchBar';
import { ShortcutCard } from '../components/ShortcutCard';
import { usePreferences } from '../context/PreferencesContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';
import { filterShortcuts } from '../utils/search';
import { spacing } from '../theme/spacing';

const initialFilters = { category: 'All', difficulty: 'Any', sort: 'A-Z', learnedOnly: false };
const categories = [...new Set([
  'Editing', 'Navigation', 'Selection', 'Tabs', 'Windows', 'Files', 'Formatting',
  'Search', 'Screenshots', 'System', 'Productivity', 'Cells & Sheets',
])];

export function BrowseScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { computerType } = usePreferences();
  const { shortcuts, favorites, learned, recentSearches, addRecentSearch, isLoading } = useShortcuts();
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState('All');
  const [filters, setFilters] = useState(initialFilters);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (route.params?.app) {
      setSelectedApp(route.params.app);
      navigation.setParams({ app: undefined });
    }
  }, [navigation, route.params?.app]);

  const options = useMemo(() => ({
    searchText: query.trim(),
    system: computerType,
    app: selectedApp,
    category: filters.category,
    difficulty: filters.difficulty,
    learnedOnly: filters.learnedOnly,
    learned,
    sort: filters.sort,
  }), [computerType, filters, learned, query, selectedApp]);
  const resultRows = useMemo(() => filterShortcuts(shortcuts, options), [shortcuts, options]);
  const draftCount = (draft) => filterShortcuts(shortcuts, { ...options, ...draft }).length;

  function submitSearch() {
    addRecentSearch(query);
    setSearchFocused(false);
  }

  function chooseRecentSearch(value) {
    setQuery(value);
    addRecentSearch(value);
    setSearchFocused(false);
  }

  const activeCount = (selectedApp !== 'All' ? 1 : 0)
    + (filters.category !== 'All' ? 1 : 0)
    + (filters.difficulty !== 'Any' ? 1 : 0)
    + (filters.sort !== 'A-Z' ? 1 : 0)
    + (filters.learnedOnly ? 1 : 0);
  const summaryParts = [
    `${resultRows.length} ${resultRows.length === 1 ? 'shortcut' : 'shortcuts'}`,
    selectedApp !== 'All' ? selectedApp : null,
    filters.category !== 'All' ? filters.category : null,
    filters.difficulty !== 'Any' ? filters.difficulty : null,
  ].filter(Boolean);
  const appItems = ['All', ...apps.map((app) => app.name)];

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Loading your shortcuts…</Text></View>;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Browse</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>Find a shortcut that fits what you need.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={activeCount ? `Filters, ${activeCount} active` : 'Filters'}
            onPress={() => setSheetVisible(true)}
            style={[styles.filterButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Ionicons name="options-outline" size={18} color={theme.primary} />
            <Text style={[styles.filterText, { color: theme.text }]}>Filters</Text>
            {activeCount > 0 && <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}><Text style={[styles.badgeText, { color: theme.onPrimary }]}>{activeCount}</Text></View>}
          </Pressable>
        </View>
        <SearchBar value={query} onChangeText={setQuery} onFocus={() => setSearchFocused(true)} onSubmitEditing={submitSearch} />

        {searchFocused && !query.trim() && recentSearches.length > 0 && (
          <View style={[styles.recentBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.recentHeading}>
              <Text style={[styles.recentTitle, { color: theme.text }]}>Recent searches</Text>
              <Ionicons name="time-outline" size={16} color={theme.muted} />
            </View>
            {recentSearches.slice(0, 5).map((value) => (
              <Pressable key={value} accessibilityRole="button" accessibilityLabel={`Search again for ${value}`} onPress={() => chooseRecentSearch(value)} style={styles.recentItem}>
                <Ionicons name="return-down-forward-outline" size={16} color={theme.muted} />
                <Text style={[styles.recentText, { color: theme.text }]}>{value}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={[styles.appLabel, { color: theme.text }]}>Apps</Text>
        <FilterChips accessibilityPrefix="Show app" items={appItems} selected={selectedApp} onSelect={setSelectedApp} />
        <View style={styles.summaryRow}>
          <Text numberOfLines={2} style={[styles.summary, { color: theme.muted }]}>{summaryParts.join(' · ')}</Text>
          {(query.trim() || activeCount > 0) && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear all search and filters" onPress={() => { setQuery(''); setSelectedApp('All'); setFilters(initialFilters); }} style={styles.clearAll}>
              <Text style={[styles.clearText, { color: theme.primary }]}>Clear all</Text>
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        contentContainerStyle={[styles.listContent, { maxWidth: 640 }]}
        data={resultRows}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={(
          <EmptyState
            icon="search-outline"
            title="No matching shortcuts"
            message="Try another phrase or clear your filters."
            actionLabel="Clear filters"
            onAction={() => { setQuery(''); setSelectedApp('All'); setFilters(initialFilters); }}
          />
        )}
        renderItem={({ item }) => (
          <ShortcutCard
            shortcut={item}
            system={computerType}
            isFavorite={favorites.includes(item.id)}
            onPress={() => navigation.navigate('Details', { shortcutId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
      <FilterSheet
        visible={sheetVisible}
        filters={filters}
        categories={categories}
        getCount={draftCount}
        onClose={() => setSheetVisible(false)}
        onApply={(nextFilters) => { setFilters(nextFilters); setSheetVisible(false); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { alignSelf: 'center', gap: spacing.sm, maxWidth: 640, paddingHorizontal: spacing.md, paddingTop: spacing.md, width: '100%' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  filterButton: { alignItems: 'center', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 44, paddingHorizontal: 10 },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterBadge: { alignItems: 'center', borderRadius: 9, height: 18, justifyContent: 'center', minWidth: 18, paddingHorizontal: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  recentBox: { borderRadius: 12, borderWidth: 1, padding: 10 },
  recentHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  recentTitle: { fontSize: 13, fontWeight: '700' },
  recentItem: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 44, paddingHorizontal: 4 },
  recentText: { fontSize: 14 },
  appLabel: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  summaryRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 36 },
  summary: { flex: 1, fontSize: 12, lineHeight: 17 },
  clearAll: { alignItems: 'center', justifyContent: 'center', minHeight: 40, minWidth: 64 },
  clearText: { fontSize: 12, fontWeight: '700' },
  list: { flex: 1 },
  listContent: { alignSelf: 'center', gap: spacing.sm, paddingBottom: spacing.xl, paddingHorizontal: spacing.md, paddingTop: spacing.xs, width: '100%' },
});
