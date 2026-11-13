import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { FilterChips } from './FilterChips';

const sortOptions = ['A-Z', 'Newest', 'Difficulty'];
const difficultyOptions = ['Any', 'Beginner', 'Intermediate', 'Advanced'];

export function FilterSheet({ visible, filters, categories, getCount, onApply, onClose }) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  const patch = (change) => setDraft((current) => ({ ...current, ...change }));
  const reset = () => setDraft({ category: 'All', difficulty: 'Any', sort: 'A-Z', learnedOnly: false });

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={onClose} style={styles.scrim} />
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.handle} />
          <View style={styles.headingRow}>
            <View>
              <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Filters</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>Narrow your shortcut list</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Reset filters" onPress={reset} style={styles.resetButton}>
              <Text style={[styles.resetText, { color: theme.primary }]}>Reset</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.sections}>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <FilterChips accessibilityPrefix="Filter by category" items={['All', ...categories]} selected={draft.category} onSelect={(category) => patch({ category })} />
            <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
            <FilterChips accessibilityPrefix="Filter by difficulty" items={difficultyOptions} selected={draft.difficulty} onSelect={(difficulty) => patch({ difficulty })} />
            <Text style={[styles.label, { color: theme.text }]}>Sort</Text>
            <FilterChips accessibilityPrefix="Sort shortcuts" items={sortOptions} selected={draft.sort} onSelect={(sort) => patch({ sort })} />
            <View style={styles.learnedRow}>
              <View style={styles.learnedText}>
                <Text style={[styles.label, { color: theme.text }]}>Learned only</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>Show shortcuts you have marked as learned</Text>
              </View>
              <Switch
                accessibilityLabel="Learned shortcuts only"
                onValueChange={(learnedOnly) => patch({ learnedOnly })}
                thumbColor={draft.learnedOnly ? theme.primary : undefined}
                trackColor={{ false: theme.border, true: theme.surfaceMuted }}
                value={draft.learnedOnly}
              />
            </View>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Show ${getCount(draft)} shortcuts`}
            onPress={() => onApply(draft)}
            style={({ pressed }) => [styles.applyButton, { backgroundColor: theme.primary, opacity: pressed ? 0.84 : 1 }]}
          >
            <Text style={[styles.applyText, { color: theme.onPrimary }]}>Show {getCount(draft)} shortcuts</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, maxHeight: '88%', paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  handle: { alignSelf: 'center', backgroundColor: '#9AA6BA', borderRadius: 3, height: 5, marginBottom: spacing.md, width: 40 },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 3 },
  resetButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 56 },
  resetText: { fontSize: 14, fontWeight: '700' },
  sections: { gap: spacing.sm, paddingBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', marginTop: spacing.sm },
  learnedRow: { alignItems: 'center', borderTopColor: '#D9DEE7', borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md },
  learnedText: { flex: 1, paddingRight: spacing.sm },
  applyButton: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', minHeight: 50, marginTop: spacing.sm },
  applyText: { fontSize: 15, fontWeight: '700' },
});
