import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  Activity,
  Flame,
  Apple,
  Moon,
  Dumbbell,
  Brain,
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  Sun,
  Lock,
  UserCheck,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface IntroScreenProps {
  navigation: any;
}

export default function IntroScreen({ navigation }: IntroScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const TOTAL_STEPS = 10;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({ x: nextStep * width, animated: true });
    } else {
      navigation.navigate('Register');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({ x: prevStep * width, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const step = Math.round(contentOffsetX / width);
    if (step !== currentStep && step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  };

  const slidesData = [
    {
      badge: 'AI Preventive Healthcare',
      title: 'Welcome to VitalCore',
      subtitle: 'Your AI-powered preventive healthcare companion.',
      icon: HeartPulse,
      iconColor: '#60a5fa',
      cardTitle: 'Predictive Wellness Ecosystem',
      cardSub: 'Analyzing real-time biomarkers to optimize long-term vitality.',
      features: [
        { title: 'Full Data Ownership', desc: 'Secure local & cloud encrypted storage' },
        { title: 'Adaptive AI Engine', desc: 'Models continuously adapt to your body' },
      ],
    },
    {
      badge: 'Holistic Health Intelligence',
      title: 'How VitalCore Helps You',
      subtitle: 'Unifying nutrition, activity, sleep, and longevity science into one engine.',
      icon: ShieldCheck,
      iconColor: '#34d399',
      cardTitle: 'Complete Longevity Suite',
      cardSub: 'Prevents health decline through proactive daily interventions.',
      features: [
        { title: '360° Diagnostics', desc: 'Combines lifestyle metrics with clinical models' },
        { title: 'Personalized Targets', desc: 'Calculates optimal macro & sleep thresholds' },
      ],
    },
    {
      badge: 'Advanced AI Algorithms',
      title: 'AI Powered Health',
      subtitle: 'Real-time precision health engine running custom bio-neural algorithms.',
      icon: Brain,
      iconColor: '#a78bfa',
      cardTitle: 'AI Health Intelligence',
      cardSub: 'Continuously evaluates metabolic risk and physiological recovery.',
      features: [
        { title: 'Real-Time Insights', desc: 'Instant feedback on dietary & physical choices' },
        { title: 'Personalized Guardrails', desc: 'Custom warning limits for stress and fatigue' },
      ],
    },
    {
      badge: 'Digital Twin Simulation',
      title: 'Digital Twin',
      subtitle: 'A dynamic physiological avatar modeling your biological system.',
      icon: Activity,
      iconColor: '#f43f5e',
      cardTitle: 'Physiological Avatar',
      cardSub: 'Simulates cardiovascular, metabolic, and neurological stress levels.',
      features: [
        { title: 'Biological Age Tracking', desc: 'Compares chronological vs metabolic age' },
        { title: 'Organ System Health', desc: 'Monitors heart, metabolism, and immune score' },
      ],
    },
    {
      badge: 'Predictive Longevity Engine',
      title: 'Future Health Prediction',
      subtitle: 'Forecasts health outcomes using multi-day biometric telemetry trends.',
      icon: TrendingUp,
      iconColor: '#fbbf24',
      cardTitle: 'Future Lab Engine',
      cardSub: 'Requires real data accumulation before unlocking biological projections.',
      features: [
        { title: 'Trajectory Forecasting', desc: 'Predicts biological age 5–10 years ahead' },
        { title: 'Zero Fake Telemetry', desc: 'Only computes when sufficient data exists' },
      ],
    },
    {
      badge: 'Movement & Performance',
      title: 'Workout Tracking',
      subtitle: 'Log exercises, track sets, and measure volume with precision.',
      icon: Dumbbell,
      iconColor: '#8b5cf6',
      cardTitle: 'Performance Suite',
      cardSub: 'Built-in exercise library with exercise timer and set breakdown.',
      features: [
        { title: 'Exercise Library', desc: 'Curated library across muscle groups' },
        { title: 'Calorie Burn Analytics', desc: 'Accurate metabolic expenditure tracking' },
      ],
    },
    {
      badge: 'Nutritional Diagnostics',
      title: 'Nutrition Tracking',
      subtitle: 'Search foods, log meals, and track macros dynamically.',
      icon: Apple,
      iconColor: '#10b981',
      cardTitle: 'Smart Calorie Tracker',
      cardSub: 'Search real food items with instant protein, carb, and fat calculation.',
      features: [
        { title: 'Dynamic Search', desc: 'Real-time database lookup' },
        { title: 'Instant Dashboard Sync', desc: 'Logs sync across Web & Mobile immediately' },
      ],
    },
    {
      badge: 'Circadian Optimization',
      title: 'Sleep Tracking',
      subtitle: 'Log sleep duration and assess recovery quality daily.',
      icon: Moon,
      iconColor: '#06b6d4',
      cardTitle: 'Rest & Recovery',
      cardSub: 'Tracks circadian consistency and calculates body recovery score.',
      features: [
        { title: 'Quality Scoring', desc: 'Deep rest vs REM consistency evaluation' },
        { title: 'Recovery Meter', desc: 'Determines readiness for physical exertion' },
      ],
    },
    {
      badge: '24/7 Personal Health Assistant',
      title: 'AI Coach',
      subtitle: 'Conversational assistant tailored strictly to your own user telemetry.',
      icon: Sparkles,
      iconColor: '#3b82f6',
      cardTitle: 'Private AI Assistant',
      cardSub: 'Scoped strictly to your unique account session for 100% data privacy.',
      features: [
        { title: 'Isolated History', desc: 'Zero data leakage between different users' },
        { title: 'Actionable Advice', desc: 'Tailored recommendations based on real logs' },
      ],
    },
    {
      badge: 'Social Wellness Ecosystem',
      title: 'Community & Challenges',
      subtitle: 'Join fitness challenges and share milestones with fellow users.',
      icon: Users,
      iconColor: '#ec4899',
      cardTitle: 'Social Motivation',
      cardSub: 'Compete in community challenges driven strictly by verified telemetry.',
      features: [
        { title: 'Real Challenge Progress', desc: 'No hardcoded scores; driven by real logs' },
        { title: 'Global Community', desc: 'Share workouts, tips, and achievements' },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Step {currentStep + 1} of {TOTAL_STEPS}
          </Text>
        </View>

        <View style={styles.topRightRow}>
          <TouchableOpacity style={[styles.themeBtn, { backgroundColor: colors.surface }]} onPress={toggleTheme}>
            {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.skipButtonText, { color: colors.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Scrollable Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slidesData.map((slide, index) => {
          const IconComp = slide.icon;
          return (
            <View key={index} style={[styles.slide, { width }]}>
              <ScrollView contentContainerStyle={styles.slideScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.cardContainer}>
                  <View style={[styles.badgePill, { backgroundColor: `${slide.iconColor}18` }]}>
                    <Sparkles size={14} color={slide.iconColor} style={{ marginRight: 6 }} />
                    <Text style={[styles.badgeText, { color: slide.iconColor }]}>{slide.badge}</Text>
                  </View>

                  <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>{slide.subtitle}</Text>

                  {/* Graphic Card */}
                  <View style={[styles.graphicCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: `${slide.iconColor}22` }]}>
                      <IconComp size={40} color={slide.iconColor} />
                    </View>
                    <Text style={[styles.graphicTitle, { color: colors.text }]}>{slide.cardTitle}</Text>
                    <Text style={[styles.graphicSub, { color: colors.textMuted }]}>{slide.cardSub}</Text>

                    <View style={styles.featuresList}>
                      {slide.features.map((feat, fIdx) => (
                        <View key={fIdx} style={styles.featureRow}>
                          <View style={[styles.dot, { backgroundColor: slide.iconColor }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.featTitle, { color: colors.text }]}>{feat.title}</Text>
                            <Text style={[styles.featDesc, { color: colors.textMuted }]}>{feat.desc}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Footer Controls */}
      <View style={[styles.footerBar, { borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {slidesData.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dotIndicator,
                i === currentStep
                  ? { width: 22, backgroundColor: colors.primary }
                  : { width: 6, backgroundColor: colors.border },
              ]}
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          {currentStep > 0 ? (
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.surface }]} onPress={handleBack}>
              <ArrowLeft size={18} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Login</Text>
            </TouchableOpacity>
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>Next</Text>
              <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#10b981' }]} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  stepBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepBadgeText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeBtn: {
    padding: 8,
    borderRadius: 20,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  graphicCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  graphicTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  graphicSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  featuresList: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 14,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  featTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  featDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  footerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  dotIndicator: {
    height: 6,
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
