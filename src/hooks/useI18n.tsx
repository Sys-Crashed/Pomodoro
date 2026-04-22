"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "zh" | "en";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Common
    "common.start": "开始",
    "common.pause": "暂停",
    "common.reset": "重置",
    "common.enable": "开启通知",
    // Timer page
    "timer.title": "计时器工具",
    "timer.description": "支持倒计时和秒表功能",
    "timer.clock": "时钟",
    "timer.countdown": "倒计时",
    "timer.stopwatch": "秒表",
    "timer.digital": "电子钟",
    "timer.analog": "模拟钟",
    "timer.realTime": "实时时钟、倒计时与秒表功能，随时掌握时间",
    "timer.feature.time": "实时时钟显示",
    "timer.feature.countdown": "倒计时功能",
    "timer.feature.stopwatch": "秒表计次",
    "timer.hour": "时",
    "timer.minute": "分",
    "timer.second": "秒",
    "timer.notification.title": "倒计时结束",
    "timer.notification.body": "计时器已完成！",
    "timer.today": "今天是",
    // Pomodoro page
    "pomodoro.title": "番茄钟",
    "pomodoro.description": "专注时间管理工具，采用番茄工作法",
    "pomodoro.feature.pomodoro": "番茄工作法",
    "pomodoro.feature.regular": "规律休息",
    "pomodoro.feature.focus": "专注时间管理",
    "pomodoro.phase.work": "专注工作",
    "pomodoro.phase.shortBreak": "短休息",
    "pomodoro.phase.longBreak": "长休息",
    "pomodoro.phase.work.complete": "工作时间结束！",
    "pomodoro.phase.shortBreak.complete": "短休息结束！",
    "pomodoro.phase.longBreak.complete": "长休息结束！",
    "pomodoro.notification.title": "番茄钟",
    "pomodoro.sessions": "今日完成",
    "pomodoro.rounds": "轮",
    "pomodoro.settings.show": "自定义设置",
    "pomodoro.settings.hide": "收起设置",
    "pomodoro.settings.work": "工作时长",
    "pomodoro.settings.shortBreak": "短休息时长",
    "pomodoro.settings.longBreak": "长休息时长",
    "pomodoro.settings.sessions": "轮数",
    "pomodoro.settings.minutes": "分钟",
  },
  en: {
    // Common
    "common.start": "Start",
    "common.pause": "Pause",
    "common.reset": "Reset",
    "common.enable": "Enable Notification",
    // Timer page
    "timer.title": "Timer Tool",
    "timer.description": "Countdown and stopwatch functionality",
    "timer.clock": "Clock",
    "timer.countdown": "Countdown",
    "timer.stopwatch": "Stopwatch",
    "timer.digital": "Digital",
    "timer.analog": "Analog",
    "timer.realTime": "Real-time clock, countdown, and stopwatch",
    "timer.feature.time": "Real-time clock",
    "timer.feature.countdown": "Countdown",
    "timer.feature.stopwatch": "Stopwatch",
    "timer.hour": "Hour",
    "timer.minute": "Min",
    "timer.second": "Sec",
    "timer.notification.title": "Countdown Complete",
    "timer.notification.body": "Timer finished!",
    "timer.today": "Today is",
    // Pomodoro page
    "pomodoro.title": "Pomodoro Timer",
    "pomodoro.description": "Focus time management tool using the Pomodoro Technique",
    "pomodoro.feature.pomodoro": "Pomodoro Technique",
    "pomodoro.feature.regular": "Regular Breaks",
    "pomodoro.feature.focus": "Focus Time Management",
    "pomodoro.phase.work": "Work",
    "pomodoro.phase.shortBreak": "Short Break",
    "pomodoro.phase.longBreak": "Long Break",
    "pomodoro.phase.work.complete": "Work session complete!",
    "pomodoro.phase.shortBreak.complete": "Short break complete!",
    "pomodoro.phase.longBreak.complete": "Long break complete!",
    "pomodoro.notification.title": "Pomodoro Timer",
    "pomodoro.sessions": "Completed",
    "pomodoro.rounds": "rounds",
    "pomodoro.settings.show": "Settings",
    "pomodoro.settings.hide": "Hide Settings",
    "pomodoro.settings.work": "Work Duration",
    "pomodoro.settings.shortBreak": "Short Break",
    "pomodoro.settings.longBreak": "Long Break",
    "pomodoro.settings.sessions": "Sessions",
    "pomodoro.settings.minutes": "min",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null;
    if (saved === "zh" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      language: "zh" as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}
