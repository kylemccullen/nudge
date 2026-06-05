import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tasksApi } from '../api/tasks';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { OverdueSection } from '../components/OverdueSection';
import { TaskForm, type TaskFormValues } from '../components/TaskForm';
import { TodaySection } from '../components/TodaySection';
import { useAuth } from '../contexts/AuthContext';
import { colors, font, radius, spacing } from '../theme';
import type { TaskItemDto } from '../types';

const MAX_WIDTH = 672;

export function HomeScreen() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskItemDto | null>(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => setAddOpen(true)} style={styles.headerAddBtn} hitSlop={8}>
          <Ionicons name="add" size={28} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  // Expansion state owned here so Expand All / Collapse All can control everything
  const [allExpanded, setAllExpanded] = useState(false);
  const [dayExpanded, setDayExpanded] = useState<Record<string, boolean>>({});
  const [backlogExpanded, setBacklogExpanded] = useState(false);
  const [doneSectionExpanded, setDoneSectionExpanded] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getScheduled,
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => { invalidate(); setAddOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: number } & TaskFormValues) => tasksApi.update(id, body),
    onSuccess: () => { invalidate(); setEditTask(null); },
  });

  const setTodayMutation = useMutation({
    mutationFn: (task: TaskItemDto) => {
      const today = new Date().toISOString().slice(0, 10);
      return tasksApi.update(task.id, { title: task.title, priority: task.priority, effort: task.effort, dueDate: today });
    },
    onSuccess: invalidate,
  });

  const toggleAll = () => {
    const next = !allExpanded;
    setAllExpanded(next);
    if (data) {
      const newDayMap: Record<string, boolean> = {};
      data.futureDayGroups.forEach(g => { newDayMap[g.day] = next; });
      setDayExpanded(newDayMap);
    }
    setBacklogExpanded(next);
  };

  const toggleDay = (day: string) => {
    setDayExpanded(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const isDayExpanded = (day: string) =>
    dayExpanded[day] ?? allExpanded;

  const filter = (tasks: TaskItemDto[]) =>
    search.trim() ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())) : tasks;

  const formatDay = (dayStr: string): string => {
    const date = new Date(dayStr + 'T00:00:00');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return date.toDateString() === tomorrow.toDateString() ? `Tomorrow — ${label}` : label;
  };

  const renderModal = (visible: boolean, title: string, onClose: () => void, content: React.ReactNode) => {
    if (Platform.OS === 'web') {
      if (!visible) return null;
      return (
        <Pressable style={styles.webOverlay} onPress={onClose}>
          <Pressable style={styles.webDialog} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable onPress={onClose} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </Pressable>
            </View>
            {content}
          </Pressable>
        </Pressable>
      );
    }
    // Native: bottom sheet feel with drag handle
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.sheetCloseBtn}>
              <Text style={styles.sheetCloseBtnText}>Done</Text>
            </Pressable>
          </View>
          {content}
        </SafeAreaView>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Could not load tasks.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = !data.todayTasks.length && !data.futureDayGroups.length
    && !data.doneTasks.length && !data.overdueTasks.length && !data.backlogTasks.length;

  const hasFuture = data.futureDayGroups.length > 0;
  const isSearching = search.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Task list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={styles.maxWidth}>
          {/* Free-floating search */}
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.search}
              value={search}
              onChangeText={setSearch}
              placeholder="Search tasks…"
              placeholderTextColor={colors.textDisabled}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={styles.clearBtn}>
                <Text style={styles.clearText}>✕</Text>
              </Pressable>
            )}
          </View>
          {isEmpty && !isSearching ? (
            <Text style={styles.emptyState}>No tasks yet.</Text>
          ) : (
            <>
              <OverdueSection
                tasks={filter(data.overdueTasks)}
                onEdit={setEditTask}
                onSetToday={t => setTodayMutation.mutate(t)}
              />
              <TodaySection
                tasks={data.todayTasks}
                displayTasks={filter(data.todayTasks)}
                completedCapacity={data.todayCompletedCapacity}
                totalCapacity={data.todayTotalCapacity}
                onEdit={setEditTask}
                onSetToday={t => setTodayMutation.mutate(t)}
              />

              {hasFuture && (
                <View style={styles.upcomingSection}>
                  <View style={styles.upcomingHeader}>
                    <Text style={styles.upcomingTitle}>Upcoming</Text>
                    <Pressable onPress={toggleAll}>
                      <Text style={styles.toggleAllBtn}>{allExpanded ? 'Collapse All' : 'Expand All'}</Text>
                    </Pressable>
                  </View>
                  {data.futureDayGroups
                    .map(g => ({ ...g, tasks: filter(g.tasks) }))
                    .filter(g => g.tasks.length > 0 || !isSearching)
                    .map(g => (
                      <CollapsibleSection
                        key={g.day}
                        title={formatDay(g.day)}
                        tasks={g.tasks}
                        expanded={isSearching || isDayExpanded(g.day)}
                        onToggle={() => toggleDay(g.day)}
                        variant="future"
                        onEdit={setEditTask}
                        onSetToday={t => setTodayMutation.mutate(t)}
                      />
                    ))}
                </View>
              )}

              <CollapsibleSection
                title="Backlog"
                tasks={filter(data.backlogTasks)}
                expanded={isSearching ? filter(data.backlogTasks).length > 0 : backlogExpanded}
                onToggle={() => setBacklogExpanded(v => !v)}
                variant="backlog"
                onEdit={setEditTask}
                onSetToday={t => setTodayMutation.mutate(t)}
              />
              <CollapsibleSection
                title="Done"
                tasks={filter(data.doneTasks)}
                expanded={doneSectionExpanded}
                onToggle={() => setDoneSectionExpanded(v => !v)}
                variant="done"
                onEdit={setEditTask}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      {renderModal(
        addOpen,
        'Add Task',
        () => setAddOpen(false),
        <TaskForm
          onSubmit={values => createMutation.mutate(values)}
          onCancel={() => setAddOpen(false)}
          isLoading={createMutation.isPending}
          submitLabel="Add Task"
        />,
      )}

      {/* Edit Task Modal */}
      {editTask && renderModal(
        true,
        'Edit Task',
        () => setEditTask(null),
        <TaskForm
          initial={editTask}
          onSubmit={values => updateMutation.mutate({ id: editTask.id, ...values })}
          onCancel={() => setEditTask(null)}
          isLoading={updateMutation.isPending}
          submitLabel="Save Changes"
        />,
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  maxWidth: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },

  // Header
  headerBar: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  logo: { color: colors.textPrimary, fontSize: font.lg, fontWeight: '600' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: spacing.xs },

  // Search — free-floating inside scroll content
  searchWrap: { position: 'relative', marginBottom: spacing.lg },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xxl + spacing.md,
    color: colors.textPrimary,
    fontSize: font.sm,
  },
  clearBtn: { position: 'absolute', right: spacing.md, top: '50%' as any, transform: [{ translateY: -8 }] },
  clearText: { color: colors.textDisabled, fontSize: font.sm },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.xl, paddingBottom: 100, paddingHorizontal: spacing.sm },
  emptyState: { color: colors.textDisabled, fontSize: font.sm, textAlign: 'center', paddingVertical: spacing.xxl * 2 },

  // Upcoming section
  upcomingSection: { marginBottom: spacing.xl },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  upcomingTitle: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  toggleAllBtn: { color: colors.textMuted, fontSize: font.xs },

  // Error state
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  errorText: { color: colors.textMuted, fontSize: font.md },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
  retryBtnText: { color: '#fff', fontSize: font.sm, fontWeight: '600' },

  headerAddBtn: { marginRight: 8, padding: 4 },

  // Native bottom sheet
  sheet: { flex: 1, backgroundColor: colors.surface },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { color: colors.textPrimary, fontSize: font.lg, fontWeight: '600' },
  sheetCloseBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  sheetCloseBtnText: { color: colors.primary, fontSize: font.md, fontWeight: '600' },

  // Web centered dialog
  webOverlay: {
    position: 'fixed' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  webDialog: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh' as any,
    overflow: 'hidden' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  // Shared header used by web dialog (modalHeader referenced from webDialog's header View)
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { color: colors.textPrimary, fontSize: font.lg, fontWeight: '600' },
  modalCloseBtn: { padding: spacing.xs },
  modalCloseBtnText: { color: colors.textMuted, fontSize: font.md },
});
