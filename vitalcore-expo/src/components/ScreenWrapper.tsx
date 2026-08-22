import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControlProps,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Sun, Moon, ArrowLeft, Activity, Settings } from 'lucide-react-native';

interface ScreenWrapperProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  showThemeToggle?: boolean;
  showSettingsButton?: boolean;
  scrollable?: boolean;
  contentContainerStyle?: any;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export default function ScreenWrapper({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  headerRight,
  showThemeToggle = true,
  showSettingsButton = true,
  scrollable = true,
  contentContainerStyle,
  refreshControl,
}: ScreenWrapperProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme, isCareMode } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const paddingTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16) + 4;
  const paddingBottom = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent
      />

      {/* Header Bar */}
      <View style={[styles.headerContainer, { paddingTop, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.topRow}>
          <View style={styles.headerLeft}>
            {showBack ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Go Back"
                accessibilityRole="button"
              >
                <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.backButtonText, { color: colors.primary }]}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.brandRow}>
                <View style={[styles.brandLogoCircle, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Activity size={18} color={colors.primary} />
                </View>
                <Text style={[styles.brandTitleText, { color: colors.text, fontSize: isCareMode ? 19 : 17 }]}>
                  VitalCore <Text style={{ color: colors.primary, fontWeight: '800' }}>AI</Text>
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerRightRow}>
            {headerRight}
            {showThemeToggle && (
              <TouchableOpacity
                style={[styles.themeBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                onPress={toggleTheme}
                accessibilityLabel="Toggle Theme"
              >
                {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
              </TouchableOpacity>
            )}
            {showSettingsButton && (
              <TouchableOpacity
                style={[styles.themeBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                onPress={() => navigation.navigate('SettingsDetail')}
                accessibilityLabel="Open Settings"
              >
                <Settings size={18} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {title && (
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.text, fontSize: isCareMode ? 22 : 18 },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

      </View>

      {/* Body Content */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.nonScrollFlex, { paddingBottom }, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  titleContainer: {
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleText: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  themeBtn: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  nonScrollFlex: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
