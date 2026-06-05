import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminApi } from '../api/admin';
import { colors, font, radius, spacing } from '../theme';

export function AdminScreen() {
  const qc = useQueryClient();
  const users   = useQuery({ queryKey: ['admin', 'users'],   queryFn: adminApi.getUsers });
  const invites = useQuery({ queryKey: ['admin', 'invites'], queryFn: adminApi.getInvites });
  const generate = useMutation({
    mutationFn: adminApi.generateInvite,
    onSuccess: (invite) => {
      qc.setQueryData(['admin', 'invites'], (old: any[]) => [invite, ...(old ?? [])]);
    },
  });

  if (users.isLoading || invites.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>

        {/* Users */}
        <Text style={styles.sectionLabel}>Users</Text>
        <View style={styles.card}>
          {users.data?.map((u, i) => (
            <View key={u.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <Text style={styles.email}>{u.email}</Text>
                {u.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Invite codes */}
        <View style={styles.inviteHeader}>
          <Text style={styles.sectionLabel}>Invite Codes</Text>
          <Pressable onPress={() => generate.mutate()} disabled={generate.isPending} style={[styles.genBtn, generate.isPending && styles.btnDisabled]}>
            <Text style={styles.genBtnText}>{generate.isPending ? 'Generating…' : 'Generate Invite'}</Text>
          </Pressable>
        </View>

        {(!invites.data || invites.data.length === 0) ? (
          <Text style={styles.empty}>No invite codes yet.</Text>
        ) : (
          <View style={styles.card}>
            {invites.data.map((inv, i) => (
              <View key={inv.code}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.inviteRow}>
                  <Text style={styles.code}>{inv.code}</Text>
                  <View style={styles.inviteMeta}>
                    <Text style={styles.inviteDate}>
                      {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <View style={[styles.statusBadge, inv.isUsed ? styles.usedBadge : styles.pendingBadge]}>
                      <Text style={[styles.statusText, inv.isUsed ? styles.usedText : styles.pendingText]}>
                        {inv.isUsed ? 'Used' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  inner: { width: '100%', maxWidth: 672, alignSelf: 'center', gap: spacing.sm },
  sectionLabel: { color: colors.textMuted, fontSize: font.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
  email: { color: colors.textSecondary, fontSize: font.sm, flex: 1 },
  adminBadge: { backgroundColor: '#1e1b4b', borderRadius: 99, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  adminBadgeText: { color: '#a5b4fc', fontSize: font.xs, fontWeight: '600' },
  inviteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  genBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  genBtnText: { color: '#fff', fontSize: font.sm, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
  empty: { color: colors.textDisabled, fontSize: font.sm, textAlign: 'center', paddingVertical: spacing.xl },
  inviteRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.xs },
  code: { color: colors.textPrimary, fontSize: font.sm, fontFamily: 'monospace' },
  inviteMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  inviteDate: { color: colors.textMuted, fontSize: font.xs },
  statusBadge: { borderRadius: 99, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  usedBadge: { backgroundColor: colors.card },
  pendingBadge: { backgroundColor: '#052e16' },
  statusText: { fontSize: font.xs, fontWeight: '600' },
  usedText: { color: colors.textDisabled },
  pendingText: { color: '#4ade80' },
});
