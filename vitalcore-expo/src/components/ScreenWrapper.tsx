import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControlProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, ArrowLeft } from 'lucide-react-native';

interface ScreenWrapperProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  showThemeToggle?: boolean;
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
  scrollable = true,
  contentContainerStyle,
  refreshControl,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme, isCareMode } = useTheme();

  const paddingTop = Math.max(insets.top + 8, 20);
  const paddingBottom = Math.max(insets.bottom + 12, 20);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent
      />

      {/* Header Bar */}
      {(title || showBack || headerRight || showThemeToggle) && (
        <View style={[styles.headerContainer, { paddingTop, borderBottomColor: colors.cardBorder }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {showBack && (
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                  <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.backButtonText, { color: colors.primary }]}>Back</Text>
                </TouchableOpacity>
              )}
              {title && (
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.headerTitle,
                      { color: colors.text, fontSize: isCareMode ? 24 : 20 },
                    ]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                  {subtitle && (
                    <Text style={[styles.headerSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.headerRightRow}>
              {headerRight}
              {showThemeToggle && (
                <TouchableOpacity
                  style={[styles.themeBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                  onPress={toggleTheme}
                >
                  {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Body Content */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom },
            !title && !showBack && { paddingTop },
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
