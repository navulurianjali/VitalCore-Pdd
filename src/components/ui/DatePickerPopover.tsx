"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getLocalDateString } from "@/utils/dateUtils";
import { fetchActiveDatesForMonth } from "@/services/dailyTracker";

interface DatePickerPopoverProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  timezone?: string | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DatePickerPopover: React.FC<DatePickerPopoverProps> = ({
  selectedDate,
  onSelectDate,
  isOpen,
  onClose,
  userId,
  timezone,
}) => {
  const todayStr = getLocalDateString(undefined, timezone || undefined);
  
  // Parse initial selectedDate for initial month view
  const parseDate = (dStr: string) => {
    const parts = dStr.split("-");
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

  // Synchronize view state when selectedDate changes or picker opens
  useEffect(() => {
    if (isOpen) {
      const p = parseDate(selectedDate);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [isOpen, selectedDate]);

  // Load active dates for the current viewMonth & viewYear
  useEffect(() => {
    if (isOpen && userId && supabase) {
      let isMounted = true;
      fetchActiveDatesForMonth(supabase, userId, viewYear, viewMonth)
        .then((dates) => {
          if (isMounted) setActiveDates(dates);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, userId, viewYear, viewMonth]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calculate calendar grid days
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sun, 6 = Sat

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Glassmorphic Centered Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] p-6 sm:p-7 shadow-2xl space-y-4 text-[var(--foreground)]">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              {MONTH_NAMES[viewMonth - 1]} {viewYear}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground)] transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground)] transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors ml-2 cursor-pointer"
              title="Close Calendar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 text-center gap-1">
          {WEEKDAY_NAMES.map((day) => (
            <div key={day} className="text-[11px] font-extrabold text-[var(--muted)] uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="h-11 w-full" />
          ))}

          {/* Actual Month Days (All days 1-31 are crisp and selectable) */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateStr = `${viewYear}-${pad(viewMonth)}-${pad(dayNum)}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasData = activeDates.has(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => {
                  onSelectDate(dateStr);
                  onClose();
                }}
                className={`h-11 w-full rounded-2xl flex flex-col items-center justify-center relative text-sm font-bold transition-all cursor-pointer ${
                  isToday
                    ? "bg-primary text-white font-black shadow-md shadow-primary/30 ring-2 ring-primary/40 border-2 border-white/20"
                    : isSelected
                    ? "bg-primary/90 text-white shadow-lg font-extrabold scale-105 border-2 border-primary"
                    : "text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                }`}
              >
                <span>{dayNum}</span>

                {/* Active Data Dot Indicator */}
                {hasData && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full absolute bottom-1.5 ${
                      isToday || isSelected ? "bg-white" : "bg-emerald-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Activity logged</span>
          </div>

          <button
            onClick={() => {
              onSelectDate(todayStr);
              onClose();
            }}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            Go to Today
          </button>
        </div>

      </div>
    </div>
  );
};

export default DatePickerPopover;
