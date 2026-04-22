"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee, Target, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { ToolLayout } from "./tool-layout";
import { Button } from "./button";
import { useI18n } from "../hooks/useI18n";

type Phase = "work" | "shortBreak" | "longBreak";

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function FeatureTag({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-secondary rounded-full text-sm flex items-center gap-2 cursor-default"
    >
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </motion.div>
  );
}

export default function PomodoroPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("work");
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const getPhaseDuration = useCallback((p: Phase): number => {
    switch (p) {
      case "work": return settings.workDuration * 60;
      case "shortBreak": return settings.shortBreakDuration * 60;
      case "longBreak": return settings.longBreakDuration * 60;
    }
  }, [settings]);

  const handlePhaseComplete = useCallback(() => {
    if (notificationPermission === "granted") {
      new Notification(t("pomodoro.notification.title"), {
        body: t(`pomodoro.phase.${phase}.complete`),
        icon: "/favicon.ico"
      });
    }

    if (phase === "work") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % settings.sessionsBeforeLongBreak === 0) {
        setPhase("longBreak");
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setPhase("shortBreak");
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setPhase("work");
      setTimeLeft(settings.workDuration * 60);
    }
    setIsRunning(false);
  }, [phase, sessions, settings, notificationPermission, t]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handlePhaseComplete]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getPhaseDuration(phase));
  };

  const handleSkip = () => {
    handlePhaseComplete();
  };

  const progress = 1 - (timeLeft / getPhaseDuration(phase));
  const phaseColor = phase === "work" ? "#ef4444" : "#22c55e";

  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference * (1 - progress);

  const features = [
    { icon: Target, text: t("pomodoro.feature.pomodoro") },
    { icon: Coffee, text: t("pomodoro.feature.regular") },
    { icon: Play, text: t("pomodoro.feature.focus") },
  ];

  return (
    <ToolLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            {t("pomodoro.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground mb-6"
          >
            {t("pomodoro.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <FeatureTag icon={feature.icon} text={feature.text} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timer Section */}
      <section className="py-6 px-4">
        <div className="max-w-md mx-auto">
          {/* Phase Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-2 mb-6 justify-center"
          >
            <Button
              variant={phase === "work" ? "default" : "secondary"}
              size="sm"
              onClick={() => { if (!isRunning) { setPhase("work"); setTimeLeft(getPhaseDuration("work")); }}}
              className="min-w-16"
            >
              {t("pomodoro.phase.work")}
            </Button>
            <Button
              variant={phase === "shortBreak" ? "default" : "secondary"}
              size="sm"
              onClick={() => { if (!isRunning) { setPhase("shortBreak"); setTimeLeft(getPhaseDuration("shortBreak")); }}}
              className="min-w-16"
            >
              {t("pomodoro.phase.shortBreak")}
            </Button>
            <Button
              variant={phase === "longBreak" ? "default" : "secondary"}
              size="sm"
              onClick={() => { if (!isRunning) { setPhase("longBreak"); setTimeLeft(getPhaseDuration("longBreak")); }}}
              className="min-w-16"
            >
              {t("pomodoro.phase.longBreak")}
            </Button>
          </motion.div>

          {/* Progress Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative w-64 h-64 mx-auto mb-6"
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-border"
              />
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke={phaseColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl md:text-6xl font-bold">
                {formatTime(timeLeft)}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                {phase === "work" ? <Target className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                <span>{t(`pomodoro.phase.${phase}`)}</span>
              </div>
            </div>
          </motion.div>

          {/* Control Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <Button
              variant={notificationPermission === "granted" ? "secondary" : "outline"}
              size="icon"
              onClick={notificationPermission !== "granted" ? requestNotificationPermission : handleReset}
              title={notificationPermission === "granted" ? t("common.reset") : t("common.enable")}
            >
              {notificationPermission === "granted" ? (
                <RotateCcw className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </Button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
            </motion.div>

            <Button variant="outline" size="icon" onClick={handleSkip}>
              <RotateCcw className="w-5 h-5 scale-x-[-1]" />
            </Button>
          </motion.div>

          {/* Sessions Completed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="text-sm text-muted-foreground">{t("pomodoro.sessions")}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: i < sessions % settings.sessionsBeforeLongBreak
                      ? "var(--primary)"
                      : "var(--border)"
                  }}
                  transition={{ type: "spring", stiffness: 200 }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {Math.floor(sessions / settings.sessionsBeforeLongBreak)} {t("pomodoro.rounds")}
            </span>
          </motion.div>

          {/* Settings Toggle */}
          <div className="flex justify-center mb-4">
            <Button
              variant={showSettings ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? t("pomodoro.settings.hide") : t("pomodoro.settings.show")}
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-card rounded-xl p-4 md:p-6 border border-border overflow-hidden mb-4"
            >
              <div className="mb-4">
                <label className="flex justify-between items-center mb-2 text-sm font-medium">
                  <span>{t("pomodoro.settings.work")}</span>
                  <span>{settings.workDuration} {t("pomodoro.settings.minutes")}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => {
                    setSettings(s => ({ ...s, workDuration: parseInt(e.target.value) }));
                    if (phase === "work" && !isRunning) setTimeLeft(parseInt(e.target.value) * 60);
                  }}
                  className="w-full accent-foreground"
                />
              </div>

              <div className="mb-4">
                <label className="flex justify-between items-center mb-2 text-sm font-medium">
                  <span>{t("pomodoro.settings.shortBreak")}</span>
                  <span>{settings.shortBreakDuration} {t("pomodoro.settings.minutes")}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => {
                    setSettings(s => ({ ...s, shortBreakDuration: parseInt(e.target.value) }));
                    if (phase === "shortBreak" && !isRunning) setTimeLeft(parseInt(e.target.value) * 60);
                  }}
                  className="w-full accent-foreground"
                />
              </div>

              <div className="mb-4">
                <label className="flex justify-between items-center mb-2 text-sm font-medium">
                  <span>{t("pomodoro.settings.longBreak")}</span>
                  <span>{settings.longBreakDuration} {t("pomodoro.settings.minutes")}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => {
                    setSettings(s => ({ ...s, longBreakDuration: parseInt(e.target.value) }));
                    if (phase === "longBreak" && !isRunning) setTimeLeft(parseInt(e.target.value) * 60);
                  }}
                  className="w-full accent-foreground"
                />
              </div>

              <div>
                <label className="flex justify-between items-center mb-2 text-sm font-medium">
                  <span>{t("pomodoro.settings.sessions")}</span>
                  <span>{settings.sessionsBeforeLongBreak}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={settings.sessionsBeforeLongBreak}
                  onChange={(e) => setSettings(s => ({ ...s, sessionsBeforeLongBreak: parseInt(e.target.value) }))}
                  className="w-full accent-foreground"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </ToolLayout>
  );
}
