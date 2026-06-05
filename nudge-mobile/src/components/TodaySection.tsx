import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { tasksApi } from '../api/tasks';
import { colors, font, radius, spacing } from '../theme';
import { type TaskItemDto } from '../types';
import { TaskItem } from './TaskItem';

interface Props {
  tasks: TaskItemDto[];         // all today tasks — used for capacity calculation
  displayTasks: TaskItemDto[];  // filtered subset — used for the rendered list
  completedCapacity: number;
  totalCapacity: number;
  onEdit: (task: TaskItemDto) => void;
  onSetToday: (task: TaskItemDto) => void;
}

export function TodaySection({ tasks, displayTasks, completedCapacity, totalCapacity, onEdit, onSetToday }: Props) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });
  const [showAssignMore, setShowAssignMore] = useState(false);
  const [extraPoints, setExtraPoints] = useState('2');

  const toggle = useMutation({ mutationFn: (id: number) => tasksApi.toggle(id), onSuccess: invalidate });
  const del    = useMutation({ mutationFn: (id: number) => tasksApi.delete(id), onSuccess: invalidate });
  const assign = useMutation({
    mutationFn: (pts: number) => tasksApi.assignMore({ extraPoints: pts }),
    onSuccess: () => { invalidate(); setShowAssignMore(false); setExtraPoints('2'); },
  });

  const assignedCapacity = completedCapacity + tasks.reduce((s, t) => s + effortCost(t.effort), 0);
  const isOver = assignedCapacity > totalCapacity;
  const effective = Math.max(totalCapacity, assignedCapacity);
  const completedPct = effective > 0 ? (completedCapacity / effective) * 100 : 0;
  const incompletePct = effective > 0 ? (tasks.reduce((s, t) => s + effortCost(t.effort), 0) / effective) * 100 : 0;
  const allDone = tasks.length === 0 && completedCapacity > 0;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={[styles.cap, isOver && styles.capOver]}>
          {isOver ? '⚠ ' : ''}{completedCapacity} / {assignedCapacity} / {totalCapacity} pts
        </Text>
      </View>

      {/* Two-color progress bar */}
      <View style={styles.track}>
        {completedPct > 0 && <View style={[styles.barFill, { width: `${completedPct}%` as any, backgroundColor: '#22c55e' }]} />}
        {incompletePct > 0 && <View style={[styles.barFill, { width: `${incompletePct}%` as any, backgroundColor: colors.primary }]} />}
      </View>

      {tasks.length === 0 && completedCapacity === 0 ? (
        <Text style={styles.empty}>Nothing scheduled today.</Text>
      ) : allDone ? (
        <View style={styles.allDone}>
          <Text style={styles.allDoneText}>All tasks complete.</Text>
          {showAssignMore ? (
            <View style={styles.assignRow}>
              <Text style={styles.assignLabel}>Extra effort points:</Text>
              <TextInput
                style={styles.assignInput}
                value={extraPoints}
                onChangeText={setExtraPoints}
                keyboardType="numeric"
              />
              <Pressable onPress={() => assign.mutate(parseInt(extraPoints) || 2)} style={styles.assignConfirm}>
                <Text style={styles.assignConfirmText}>Confirm</Text>
              </Pressable>
              <Pressable onPress={() => setShowAssignMore(false)}>
                <Text style={styles.assignCancel}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setShowAssignMore(true)}>
              <Text style={styles.assignLink}>+ Assign more tasks for today</Text>
            </Pressable>
          )}
        </View>
      ) : (
        displayTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            variant="today"
            onToggle={id => toggle.mutate(id)}
            onEdit={onEdit}
            onDelete={id => del.mutate(id)}
          />
        ))
      )}
    </View>
  );
}

function effortCost(effort: string): number {
  if (effort === 'High') return 4;
  if (effort === 'Medium') return 2;
  return 1;
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: colors.textSecondary, fontSize: font.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cap: { color: colors.textMuted, fontSize: font.xs },
  capOver: { color: '#facc15' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.card, marginHorizontal: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', overflow: 'hidden' },
  barFill: { height: '100%' as any },
  empty: { color: colors.textDisabled, fontSize: font.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  allDone: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  allDoneText: { color: '#4ade80', fontSize: font.sm },
  assignRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  assignLabel: { color: colors.textMuted, fontSize: font.sm },
  assignInput: { width: 48, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, color: colors.textPrimary, fontSize: font.sm, textAlign: 'center' },
  assignConfirm: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  assignConfirmText: { color: '#fff', fontSize: font.sm },
  assignCancel: { color: colors.textMuted, fontSize: font.sm },
  assignLink: { color: colors.info, fontSize: font.sm },
});
