import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { dataApi } from '../api/data';
import { useAuth } from '../contexts/AuthContext';
import type { SettingsStackParams } from '../navigation';
import { colors, font, radius, spacing } from '../theme';

const MAX_WIDTH = 672;

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParams>>();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await dataApi.exportData();
      const content = JSON.stringify(json, null, 2);
      const filename = `nudge-export-${new Date().toISOString().slice(0, 10)}.json`;
      if (Platform.OS === 'web') {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      } else {
        const path = FileSystem.cacheDirectory + filename;
        await FileSystem.writeAsStringAsync(path, content);
        await Sharing.shareAsync(path, { mimeType: 'application/json' });
      }
    } catch {
      /* silently fail */
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImportError(null);
    setImportSuccess(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;
      setImporting(true);
      let content: string;
      if (Platform.OS === 'web') {
        content = await result.assets[0].file!.text();
      } else {
        content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      }
      await dataApi.importData(content);
      setImportSuccess(true);
    } catch (e: any) {
      setImportError(e?.message || 'Failed to import file.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>

          {/* Data */}
          <Text style={styles.sectionLabel}>Data</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.rowTitle}>Export data</Text>
                <Text style={styles.rowDesc}>Download all tasks and capacity overrides as JSON.</Text>
              </View>
              <Pressable onPress={handleExport} disabled={exporting} style={[styles.btn, exporting && styles.btnDisabled]}>
                <Text style={styles.btnText}>{exporting ? 'Exporting…' : 'Export'}</Text>
              </Pressable>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.rowTitle}>Import data</Text>
                <Text style={styles.rowDesc}>Restore from a previously exported file.</Text>
                {importError && <Text style={styles.errorText}>{importError}</Text>}
                {importSuccess && <Text style={styles.successText}>Import complete.</Text>}
              </View>
              <Pressable onPress={handleImport} disabled={importing} style={[styles.btn, importing && styles.btnDisabled]}>
                <Text style={styles.btnText}>{importing ? 'Importing…' : 'Import'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Admin (conditional) */}
          {user?.isAdmin && (
            <>
              <Text style={styles.sectionLabel}>Administration</Text>
              <View style={styles.card}>
                <Pressable onPress={() => navigation.navigate('Admin')} style={styles.navRow}>
                  <View style={styles.navRowLeft}>
                    <Ionicons name="shield-outline" size={20} color={colors.textMuted} />
                    <Text style={styles.rowTitle}>Admin panel</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
                </Pressable>
              </View>
            </>
          )}

          {/* Account */}
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{user?.email}</Text>
            </View>
            <View style={styles.divider} />
            <Pressable onPress={logout} style={styles.signOutRow}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: spacing.sm },
  sectionLabel: { color: colors.textMuted, fontSize: font.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: spacing.xs },
  rowTitle: { color: colors.textSecondary, fontSize: font.md, fontWeight: '500' },
  rowDesc: { color: colors.textMuted, fontSize: font.sm },
  errorText: { color: colors.danger, fontSize: font.sm },
  successText: { color: '#4ade80', fontSize: font.sm },
  divider: { height: 1, backgroundColor: colors.border },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: font.sm, fontWeight: '600' },
  signOutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  signOutText: { color: colors.danger, fontSize: font.md, fontWeight: '500' },
});
