import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tasksApi } from '../api/tasks';
import { colors, font, radius, spacing } from '../theme';
import type { TaskItemDto } from '../types';
import { TaskItem } from './TaskItem';

interface Props {
  title: string;
  tasks: TaskItemDto[];
  expanded: boolean;
  onToggle: () => void;
  variant: 'done' | 'backlog' | 'future';
  onEdit: (task: TaskItemDto) => void;
  onSetToday?: (task: TaskItemDto) => void;
}

export function CollapsibleSection({ title, tasks, expanded, onToggle, variant, onEdit, onSetToday }: Props) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });
  const toggle = useMutation({ mutationFn: (id: number) => tasksApi.toggle(id), onSuccess: invalidate });
  const del    = useMutation({ mutationFn: (id: number) => tasksApi.delete(id), onSuccess: invalidate });

  // done tasks render as elevated cards; backlog/future as flat rows inside a bordered container
  const isElevated = variant === 'done';

  if (tasks.length === 0) return null;

  return (
    <View style={styles.section}>
      <Pressable onPress={onToggle} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.right}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{tasks.length}</Text>
          </View>
          <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
        </View>
      </Pressable>

      {expanded && (
        isElevated ? (
          <View style={styles.cards}>
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} variant={variant}
                onToggle={id => toggle.mutate(id)} onEdit={onEdit} onDelete={id => del.mutate(id)} />
            ))}
          </View>
        ) : (
          <View style={styles.flatList}>
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} variant={variant} showCheckbox={false}
                onToggle={id => toggle.mutate(id)} onEdit={onEdit} onDelete={id => del.mutate(id)} onSetToday={onSetToday} />
            ))}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  title: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countBadge: { backgroundColor: colors.card, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  countText: { color: colors.textMuted, fontSize: font.xs, fontWeight: '600' },
  chevron: { color: colors.textDisabled, fontSize: font.xs },
  cards: { paddingHorizontal: spacing.lg },
  flatList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', marginHorizontal: spacing.lg },
});
