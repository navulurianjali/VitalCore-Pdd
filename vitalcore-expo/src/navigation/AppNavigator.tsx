import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import IntroScreen from '../screens/auth/IntroScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main Tab Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import AICoachScreen from '../screens/main/AICoachScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Detail Screens
import SleepScreen from '../screens/details/SleepScreen';
import FitnessScreen from '../screens/details/FitnessScreen';
import CalorieTrackerScreen from '../screens/details/CalorieTrackerScreen';
import FutureLabScreen from '../screens/details/FutureLabScreen';
import CommunityScreen from '../screens/details/CommunityScreen';
import ChallengesScreen from '../screens/details/ChallengesScreen';
import HealthyHabitsScreen from '../screens/details/HealthyHabitsScreen';
import SettingsScreen from '../screens/details/SettingsScreen';
import CameraScreen from '../screens/details/CameraScreen';
import HistoryScreen from '../screens/details/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomPadding,
            backgroundColor: colors.navBg,
            borderTopColor: colors.navBorder,
          },
        ],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Text style={{ fontSize: 18, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HealthyHabitsScreen}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Text style={{ fontSize: 18, color }}>🎯</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{
          tabBarLabel: 'AI Coach',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Text style={{ fontSize: 18, color }}>🤖</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Text style={{ fontSize: 18, color }}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, profile, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading VitalCore AI...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Unauthenticated Stack
        <>
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Authenticated Stack with Onboarding Gate
        <>
          {!profile?.onboarding_completed && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="SleepDetail" component={SleepScreen} />
          <Stack.Screen name="FitnessDetail" component={FitnessScreen} />
          <Stack.Screen name="CalorieTrackerDetail" component={CalorieTrackerScreen} />
          <Stack.Screen name="FutureLabDetail" component={FutureLabScreen} />
          <Stack.Screen name="CommunityDetail" component={CommunityScreen} />
          <Stack.Screen name="ChallengesDetail" component={ChallengesScreen} />
          <Stack.Screen name="HealthyHabits" component={HealthyHabitsScreen} />
          <Stack.Screen name="HealthyHabitsDetail" component={HealthyHabitsScreen} />
          <Stack.Screen name="SettingsDetail" component={SettingsScreen} />
          <Stack.Screen name="CameraDetail" component={CameraScreen} />
          <Stack.Screen name="HistoryDetail" component={HistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    padding: 2,
    borderRadius: 8,
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
