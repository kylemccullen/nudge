import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import { Effort, Priority } from '../types';

export interface TaskFormValues {
  title: string;
  priority: Priority;
  effort: Effort;
  dueDate: string | null;
}

interface Props {
  initial?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const TODAY = new Date().toISOString().slice(0, 10);
const TOMORROW = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();

const PRIORITY_ACTIVE: Record<Priority, string> = {
  [Priority.Critical]: '#dc2626',
  [Priority.High]:     '#ea580c',
  [Priority.Medium]:   '#ca8a04',
  [Priority.Low]:      '#16a34a',
};

export function TaskForm({ initial, onSubmit, onCancel, isLoading, submitLabel = 'Save' }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? Priority.Medium);
  const [effort, setEffort] = useState<Effort>(initial?.effort ?? Effort.Medium);
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null);
  const [showPicker, setShowPicker] = useState(false);
  const isCustomDate = dueDate !== null && dueDate !== TODAY && dueDate !== TOMORROW;

  const handleSubmit = () => {
    if (!title.trim() || isLoading) return;
    onSubmit({ title: title.trim(), priority, effort, dueDate });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Task title…"
        placeholderTextColor={colors.textDisabled}
        autoFocus
        multiline
      />

      {/* Priority */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Priority</Text>
        <View style={styles.segmented}>
          {Object.values(Priority).map((p, i) => {
            const active = priority === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.seg,
                  i === 0 && styles.segFirst,
                  i === Object.values(Priority).length - 1 && styles.segLast,
                  active && { backgroundColor: PRIORITY_ACTIVE[p] },
                ]}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Effort */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Effort</Text>
        <View style={styles.segmented}>
          {Object.values(Effort).map((e, i) => {
            const active = effort === e;
            return (
              <Pressable
                key={e}
                onPress={() => setEffort(e)}
                style={[
                  styles.seg,
                  i === 0 && styles.segFirst,
                  i === Object.values(Effort).length - 1 && styles.segLast,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>{e}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Due date */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Due</Text>
        <View style={styles.dueRow}>
          <View style={styles.segmented}>
            {([['None', null], ['Today', TODAY], ['Tomorrow', TOMORROW]] as [string, string | null][]).map(([label, val], i) => {
              const active = dueDate === val;
              return (
                <Pressable
                  key={label}
                  onPress={() => setDueDate(val)}
                  style={[
                    styles.seg,
                    i === 0 && styles.segFirst,
                    Platform.OS === 'web' && i === 2 && styles.segLast,
                    active && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
            {Platform.OS !== 'web' && (
              <Pressable
                onPress={() => setShowPicker(true)}
                style={[styles.seg, styles.segLast, isCustomDate && { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.segText, isCustomDate && styles.segTextActive]}>
                  {isCustomDate ? dueDate! : 'Custom'}
                </Text>
              </Pressable>
            )}
          </View>
          {Platform.OS === 'web' && (
            <input
              type="date"
              value={dueDate ?? ''}
              onChange={e => setDueDate(e.target.value || null)}
              style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 6, padding: '4px 8px', color: colors.textPrimary, fontSize: 12, colorScheme: 'dark' }}
            />
          )}
        </View>
      </View>

      {Platform.OS !== 'web' && showPicker && (
        <Modal transparent animationType="slide">
          <Pressable style={styles.pickerOverlay} onPress={() => setShowPicker(false)}>
            <View style={styles.pickerSheet}>
              <DateTimePicker
                mode="date"
                value={isCustomDate ? new Date(dueDate + 'T12:00:00') : new Date()}
                onChange={(_, date) => {
                  setShowPicker(false);
                  if (date) setDueDate(date.toISOString().slice(0, 10));
                }}
                display="spinner"
                themeVariant="dark"
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable onPress={onCancel} disabled={isLoading} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSubmit} disabled={!title.trim() || isLoading} style={[styles.submitBtn, (!title.trim() || isLoading) && styles.btnDisabled]}>
          <Text style={styles.submitText}>{isLoading ? 'Saving…' : submitLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.xl },
  titleInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: font.md,
    minHeight: 48,
  },
  row: { gap: spacing.sm },
  rowLabel: { color: colors.textMuted, fontSize: font.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  segmented: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden', alignSelf: 'flex-start' },
  seg: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.card },
  segFirst: { borderTopLeftRadius: radius.md - 1, borderBottomLeftRadius: radius.md - 1 },
  segLast: { borderTopRightRadius: radius.md - 1, borderBottomRightRadius: radius.md - 1 },
  segText: { color: colors.textMuted, fontSize: font.xs, fontWeight: '500' },
  segTextActive: { color: '#fff' },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  pickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingBottom: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, paddingTop: spacing.md },
  cancelBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  cancelText: { color: colors.textMuted, fontSize: font.sm },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  btnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: font.sm, fontWeight: '600' },
});
