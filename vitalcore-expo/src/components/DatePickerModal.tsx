import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { getLocalDateString } from '../utils/dateUtils';
import { fetchActiveDatesForMonth } from '../services/dailyTracker';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  userId?: string;
  timezone?: string | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePickerModal({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  userId,
  timezone,
}: DatePickerModalProps) {
  const { colors } = useTheme();
  const todayStr = getLocalDateString(undefined, timezone || undefined);

  const parseDate = (dStr: string) => {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) };
    }
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  };

  const initial = parseDate(selectedDate);
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [viewMonth, setViewMonth] = useState<number>(initial.month);
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      const p = parseDate(selectedDate);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [visible, selectedDate]);

  useEffect(() => {
    if (visible && userId && supabase) {
      let isMounted = true;
      setLoading(true);
      fetchActiveDatesForMonth(supabase, userId, viewYear, viewMonth)
        .then((dates: Set<string>) => {
          if (isMounted) setActiveDates(dates);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [visible, userId, viewYear, viewMonth]);

  if (!visible) return null;

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.headerTitleRow}>
              <Calendar size={18} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {MONTH_NAMES[viewMonth - 1]} {viewYear}
              </Text>
            </View>

            <View style={styles.headerNav}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.iconBtn}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.iconBtn}
              >
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={[styles.iconBtn, { marginLeft: 8 }]}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Row */}
          <View style={styles.weekdayRow}>
            {WEEKDAY_NAMES.map(day => (
              <Text key={day} style={[styles.weekdayText, { color: colors.textMuted }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.dayCell} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${viewYear}-${pad(viewMonth)}-${pad(dayNum)}`;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const hasData = activeDates.has(dateStr);

              return (
                <TouchableOpacity
                  key={dateStr}
                  onPress={() => {
                    onSelectDate(dateStr);
                    onClose();
                  }}
                  style={[
                    styles.dayCell,
                    isToday && { backgroundColor: colors.primary, borderRadius: 10 },
                    isSelected && !isToday && { backgroundColor: colors.primary + 'D0', borderRadius: 10, borderWidth: 1.5, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: (isToday || isSelected) ? '#FFFFFF' : colors.text },
                      (isToday || isSelected) && { fontWeight: '900' },
                    ]}
                  >
                    {dayNum}
                  </Text>

                  {/* Active Indicator Dot */}
                  {hasData && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: (isToday || isSelected) ? '#FFFFFF' : '#10B981' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Activity logged</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                onSelectDate(todayStr);
                onClose();
              }}
            >
              <Text style={[styles.todayLink, { color: colors.primary }]}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  todayLink: {
    fontSize: 12,
    fontWeight: '700',
  },
});
