import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, spacing } from '../theme';

export function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Ionicons name="notifications-outline" size={48} color={colors.textDisabled} />
        <Text style={styles.heading}>Notifications</Text>
        <Text style={styles.sub}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  heading: { color: colors.textSecondary, fontSize: font.lg, fontWeight: '600' },
  sub: { color: colors.textDisabled, fontSize: font.sm },
});
