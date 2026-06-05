import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tasksApi } from '../api/tasks';
import { colors, font, spacing } from '../theme';
import { type TaskItemDto } from '../types';
import { TaskItem } from './TaskItem';

interface Props {
  tasks: TaskItemDto[];
  onEdit: (task: TaskItemDto) => void;
  onSetToday: (task: TaskItemDto) => void;
}

export function OverdueSection({ tasks, onEdit, onSetToday }: Props) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });
  const toggle = useMutation({ mutationFn: (id: number) => tasksApi.toggle(id), onSuccess: invalidate });
  const del    = useMutation({ mutationFn: (id: number) => tasksApi.delete(id), onSuccess: invalidate });

  if (tasks.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Overdue</Text>
        <View style={styles.redDot} />
      </View>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} variant="overdue"
          onToggle={id => toggle.mutate(id)} onEdit={onEdit} onDelete={id => del.mutate(id)} onSetToday={onSetToday} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  title: { color: colors.textSecondary, fontSize: font.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
});
