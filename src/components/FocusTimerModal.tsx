import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, CheckCircle, Sparkles, Flame } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import confetti from 'canvas-confetti';

export const FocusTimerModal: React.FC = () => {
  const {
    isFocusTimerOpen,
    setIsFocusTimerOpen,
    subjects,
    currentFocusTopic,
    setCurrentFocusTopic,
    recordStudySession,
    theme,
  } = useStudy();

  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'pomodoro' | 'short-break' | 'long-break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [soundType, setSoundType] = useState<'white-noise' | 'focus-waves' | 'rain'>('focus-waves');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  // Web Audio ambient sound generator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    if (mode === 'pomodoro') setTimeLeft(25 * 60);
    else if (mode === 'short-break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
    setIsActive(false);
  }, [mode]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      stopAmbientSound();
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      if (mode === 'pomodoro') {
        recordStudySession(selectedSubjectId, 25);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, selectedSubjectId]);

  // Audio synthesis
  const startAmbientSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAmbientSound();

      if (soundType === 'focus-waves') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.setValueAtTime(216, ctx.currentTime);
        osc2.frequency.setValueAtTime(226, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        soundNodeRef.current = gain;
      } else {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(soundType === 'rain' ? 0.06 : 0.04, ctx.currentTime);
        whiteNoise.connect(gain);
        gain.connect(ctx.destination);
        whiteNoise.start();
        soundNodeRef.current = gain;
      }
      setSoundEnabled(true);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  };

  const stopAmbientSound = () => {
    if (audioCtxRef.current && soundNodeRef.current) {
      try {
        (soundNodeRef.current as any).disconnect();
      } catch (e) {}
      soundNodeRef.current = null;
    }
    setSoundEnabled(false);
  };

  const toggleSound = () => {
    if (soundEnabled) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  if (!isFocusTimerOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = (mode === 'pomodoro' ? 25 : mode === 'short-break' ? 5 : 15) * 60;
  const progressPercent = totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#0A221B] border-emerald-500/40 text-slate-100'
            : 'bg-white border-[#D1E7DD] text-[#1F2937]'
        }`}
      >
        {/* Glow ambient background in Emerald */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Flame className="w-5 h-5 text-amber-500" />
            </span>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                Focus Study Chamber
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Deep Work & Pomodoro Session
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAmbientSound();
              setIsFocusTimerOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session Mode Selector */}
        <div
          className={`flex p-1 rounded-xl border mb-6 relative z-10 ${
            isDark ? 'bg-[#071C16] border-emerald-900' : 'bg-[#ECFDF5] border-[#D1E7DD]'
          }`}
        >
          <button
            onClick={() => setMode('pomodoro')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'pomodoro'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => setMode('short-break')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'short-break'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => setMode('long-break')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'long-break'
                ? 'bg-green-700 text-white shadow-lg shadow-green-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            15m Reset
          </button>
        </div>

        {/* Target Topic Selection */}
        <div className="mb-6 relative z-10">
          <label className="block text-xs font-medium opacity-80 mb-1.5">
            Currently Studying:
          </label>
          <div className="flex gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={`flex-1 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-slate-200' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
              }`}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
          {currentFocusTopic && (
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate font-medium">Topic: {currentFocusTopic}</span>
            </div>
          )}
        </div>

        {/* Big Circular Clock Display in Emerald */}
        <div className="relative my-4 flex flex-col items-center justify-center z-10">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                className={isDark ? 'text-emerald-950/60' : 'text-slate-200'}
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={276.4}
                strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  mode === 'pomodoro'
                    ? 'text-emerald-500'
                    : mode === 'short-break'
                    ? 'text-teal-400'
                    : 'text-green-500'
                }`}
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-extrabold tracking-tight font-mono ${
                  isDark ? 'text-white' : 'text-[#065F46]'
                }`}
              >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {isActive ? 'In Deep Focus' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6 relative z-10">
          <button
            onClick={() => {
              if (mode === 'pomodoro') setTimeLeft(25 * 60);
              else if (mode === 'short-break') setTimeLeft(5 * 60);
              else setTimeLeft(15 * 60);
              setIsActive(false);
            }}
            className={`p-3 rounded-full border transition ${
              isDark
                ? 'bg-[#071C16] border-emerald-900 text-slate-300 hover:text-white'
                : 'bg-emerald-50 border-[#D1E7DD] text-slate-600 hover:text-emerald-900'
            }`}
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-8 py-3.5 rounded-full font-bold flex items-center gap-2 text-white shadow-xl transition-all ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Start Focus
              </>
            )}
          </button>
          <button
            onClick={() => setTimeLeft((t) => t + 5 * 60)}
            className={`p-3 rounded-full border text-xs font-bold transition ${
              isDark
                ? 'bg-[#071C16] border-emerald-900 text-slate-300 hover:text-white'
                : 'bg-emerald-50 border-[#D1E7DD] text-slate-600 hover:text-emerald-900'
            }`}
            title="+5 Minutes"
          >
            +5m
          </button>
        </div>

        {/* Ambient Noise Synthesizer Bar in Green */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs relative z-10 ${
            isDark ? 'bg-[#071C16] border-emerald-900' : 'bg-[#ECFDF5] border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg transition ${
                soundEnabled
                  ? 'bg-emerald-500 text-white'
                  : isDark
                  ? 'bg-[#0A221B] text-slate-400 hover:text-slate-200'
                  : 'bg-white text-slate-600 hover:text-emerald-900'
              }`}
              title="Toggle Synthesized Ambient Noise"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="flex flex-col">
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                Binaural / Ambient Sound
              </span>
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {soundEnabled ? 'Synthesizing Alpha waves' : 'Sound off'}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {(['focus-waves', 'rain', 'white-noise'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSoundType(type);
                  if (soundEnabled) {
                    setTimeout(() => startAmbientSound(), 50);
                  }
                }}
                className={`px-2 py-1 rounded text-[10px] capitalize transition ${
                  soundType === type
                    ? 'bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 font-bold'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'focus-waves' ? 'Alpha Wave' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Auto log notice */}
        <div className={`mt-3 text-center text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Completed sessions automatically log 25 minutes to your daily study streak.
        </div>
      </div>
    </div>
  );
};
