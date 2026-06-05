import React, { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import { type TaskItemDto } from '../types';

interface Props {
  task: TaskItemDto;
  variant: 'today' | 'future' | 'backlog' | 'done' | 'overdue';
  onToggle: (id: number) => void;
  onEdit: (task: TaskItemDto) => void;
  onDelete: (id: number) => void;
  onSetToday?: (task: TaskItemDto) => void;
  showCheckbox?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// bg = Tailwind *-900, text = Tailwind *-300 — matches Blazor exactly
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Critical: { bg: '#7f1d1d', text: '#fca5a5' },
  High:     { bg: '#7c2d12', text: '#fdba74' },
  Medium:   { bg: '#713f12', text: '#fde047' },
  Low:      { bg: '#14532d', text: '#86efac' },
  '0':      { bg: '#7f1d1d', text: '#fca5a5' },
  '1':      { bg: '#7c2d12', text: '#fdba74' },
  '2':      { bg: '#713f12', text: '#fde047' },
  '3':      { bg: '#14532d', text: '#86efac' },
};

const FALLBACK_COLOR = { bg: colors.card, text: colors.textMuted };

export function TaskItem({ task, variant, onToggle, onEdit, onDelete, onSetToday, showCheckbox }: Props) {
  const menuBtnRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const isElevated = variant === 'today' || variant === 'overdue' || variant === 'done';
  const canCheck   = variant === 'today' || variant === 'overdue' || variant === 'done';
  const showCheck  = showCheckbox ?? canCheck;
  const titleColor = isElevated ? colors.textSecondary : colors.textMuted;
  const pc         = PRIORITY_COLORS[String(task.priority)] ?? FALLBACK_COLOR;
  const isOverdue  = variant === 'overdue';

  const openMenu = () => {
    menuBtnRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      const windowWidth = Dimensions.get('window').width;
      setMenuPos({ top: y + h + 4, right: windowWidth - x - w });
      setMenuOpen(true);
      setConfirmDelete(false);
    });
  };

  const closeMenu = () => { setMenuOpen(false); setConfirmDelete(false); };

  return (
    <View style={[styles.row, isElevated ? styles.elevated : styles.flat]}>
      {showCheck && (
        <TouchableOpacity onPress={() => onToggle(task.id)} activeOpacity={0.7} style={styles.checkWrap}>
          <View style={[styles.checkbox, task.isDone && styles.checkboxDone]}>
            {task.isDone && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: titleColor }, task.isDone && styles.struck]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.badges}>
          {task.dueDate && (
            <View style={[styles.badge, isOverdue ? styles.overdueBadge : styles.dueBadge]}>
              <Text style={[styles.badgeText, { color: isOverdue ? '#fca5a5' : '#93c5fd' }]}>
                {formatDate(task.dueDate)}
              </Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: pc.bg }]}>
            <Text style={[styles.badgeText, { color: pc.text }]}>{task.priority}</Text>
          </View>
          <View style={[styles.badge, styles.effortBadge]}>
            <Text style={[styles.badgeText, styles.effortText]}>{task.effort}</Text>
          </View>
          {task.completedDate && (
            <Text style={styles.timeAgo}>{timeAgo(task.completedDate)}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity ref={menuBtnRef as any} onPress={openMenu} activeOpacity={0.7} style={styles.menuBtn}>
        <Text style={styles.menuDots}>•••</Text>
      </TouchableOpacity>

      {/* Transparent full-screen modal so dropdown escapes overflow:hidden and has a real backdrop */}
      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
          <View
            style={[styles.dropdown, { position: 'absolute', top: menuPos.top, right: menuPos.right }]}
            onStartShouldSetResponder={() => true}
          >
            {confirmDelete ? (
              <>
                <Text style={styles.dropdownLabel}>Delete this task?</Text>
                <Pressable onPress={() => { onDelete(task.id); closeMenu(); }} style={styles.dropdownItem}>
                  <Text style={[styles.dropdownText, { color: colors.danger }]}>Confirm delete</Text>
                </Pressable>
                <Pressable onPress={() => setConfirmDelete(false)} style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                {onSetToday && variant !== 'today' && (
                  <Pressable onPress={() => { onSetToday(task); closeMenu(); }} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>Set to today</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => { onEdit(task); closeMenu(); }} style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => setConfirmDelete(true)} style={styles.dropdownItem}>
                  <Text style={[styles.dropdownText, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  elevated: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  flat: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkWrap: { padding: 2 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: '700' },
  content: { flex: 1, gap: spacing.xs },
  title: { fontSize: font.sm, lineHeight: 18 },
  struck: { textDecorationLine: 'line-through', color: colors.textDisabled },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: { fontSize: font.xs, fontWeight: '600' },
  dueBadge: { backgroundColor: '#1e3a8a' },
  overdueBadge: { backgroundColor: '#7f1d1d' },
  effortBadge: { backgroundColor: '#374151' },
  effortText: { color: '#d1d5db' },
  timeAgo: { color: colors.textMuted, fontSize: font.xs },
  menuBtn: { padding: spacing.sm },
  menuDots: { color: colors.textDisabled, fontSize: 11, letterSpacing: 1 },
  dropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
  },
  dropdownLabel: { color: colors.textMuted, fontSize: font.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  dropdownItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  dropdownText: { color: colors.textSecondary, fontSize: font.sm },
});
