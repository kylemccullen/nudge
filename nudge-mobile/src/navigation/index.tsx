import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AdminScreen } from '../screens/AdminScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme';

export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type TabParams = {
  Schedule: undefined;
  Notifications: undefined;
  SettingsStack: undefined;
};

export type SettingsStackParams = {
  Settings: undefined;
  Admin: undefined;
};

const AuthStack     = createNativeStackNavigator<AuthStackParams>();
const Tab           = createBottomTabNavigator<TabParams>();
const SettingsStack = createNativeStackNavigator<SettingsStackParams>();

const NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.border,
    text: colors.textPrimary,
  },
};

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Schedule:      'calendar-outline',
  Notifications: 'notifications-outline',
  SettingsStack: 'settings-outline',
};

const LABELS: Record<string, string> = {
  Schedule:      'Schedule',
  Notifications: 'Notifications',
  SettingsStack: 'Settings',
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: true,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <SettingsStack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
    </SettingsStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
        tabBarLabel: LABELS[route.name],
        tabBarIconStyle: { marginTop: 5 },
        tabBarLabelStyle: { fontSize: 10 },
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          marginHorizontal: 48,
          borderRadius: 24,
          borderTopWidth: 0,
          height: 64,
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 16,
        },
      })}
    >
      <Tab.Screen
        name="Schedule"
        component={HomeScreen}
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="SettingsStack" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={NavTheme}>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
