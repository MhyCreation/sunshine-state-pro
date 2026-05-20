"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Shield,
  Star,
  MessageCircle,
  Zap,
  CheckCircle2,
  TrendingUp,
  Users,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  deep:    "#0F1B2D",
  navy:    "#1A2B4A",
  blue:    "#3D6B9E",
  sky:     "#7EB5E0",
  sage:    "#4A8B6F",
  mint:    "#7BC9A8",
  sunrise: "#F0B86E",
  red:     "#C0433A",
  card:    "#1E2D42",
  border:  "rgba(126,181,224,0.13)",
  t: {
    primary:   "#EDF2F7",
    secondary: "rgba(237,242,247,0.62)",
    muted:     "rgba(237,242,247,0.36)",
  },
} as const;

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Card({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, ...style }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: C.t.muted, fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase" as const }}>
      {children}
    </p>
  );
}

// ─── Phone frame ─────────────────────────────────────────────────────────────
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto select-none"
      style={{
        width: 320,
        height: 680,
        borderRadius: 44,
        background: C.deep,
        border: "2px solid rgba(126,181,224,0.18)",
        boxShadow: [
          "0 0 0 1px rgba(255,255,255,0.04)",
          "0 40px 80px rgba(0,0,0,0.65)",
          `0 0 80px rgba(61,107,158,0.18)`,
        ].join(", "),
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
        style={{ width: 112, height: 28, background: "#000", borderRadius: "0 0 18px 18px" }}
      >
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2"
          style={{ width: 56, height: 11, background: "#0a0a0a", borderRadius: 6 }}
        />
      </div>

      {/* Status bar */}
      <div
        className="absolute top-0 left-0 right-0 z-40 flex items-end justify-between px-8 pb-1"
        style={{ height: 44 }}
      >
        <span style={{ color: C.t.secondary, fontSize: 11, fontWeight: 600 }}>9:41</span>
        <div className="flex items-center gap-1">
          {/* Signal bars */}
          <div className="flex items-end gap-0.5" style={{ height: 11 }}>
            {[3, 5, 7, 9].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: h,
                  background: i < 3 ? C.t.secondary : "rgba(255,255,255,0.18)",
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
          {/* Battery */}
          <div
            style={{
              width: 22,
              height: 10,
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: 3,
              position: "relative",
              marginLeft: 4,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 1.5,
                right: 3,
                background: C.mint,
                borderRadius: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -4,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: 5,
                background: "rgba(255,255,255,0.25)",
                borderRadius: "0 1px 1px 0",
              }}
            />
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 44, paddingTop: 44 }}>
        {children}
      </div>

      {/* Home indicator */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50"
        style={{ width: 96, height: 4, background: "rgba(255,255,255,0.22)", borderRadius: 4 }}
      />
    </div>
  );
}

// ─── Screen 0 — Welcome ───────────────────────────────────────────────────────
function WelcomeScreen() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center px-7 text-center overflow-hidden relative"
      style={{ background: `linear-gradient(165deg, ${C.navy} 0%, ${C.deep} 100%)` }}
    >
      {/* Ambient blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 260, height: 260, background: C.blue, filter: "blur(70px)", top: "5%", left: "10%", opacity: 0.22 }}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 200, height: 200, background: C.sage, filter: "blur(60px)", bottom: "12%", right: "8%", opacity: 0.18 }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-6"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`,
            boxShadow: `0 8px 32px ${C.blue}55, 0 2px 8px rgba(0,0,0,0.4)`,
          }}
        >
          ⚓
        </div>
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ border: `2px solid ${C.sky}` }}
          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        style={{
          color: C.t.primary,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: "-0.6px",
          lineHeight: 1.05,
          fontFamily: "var(--font-fraunces)",
        }}
      >
        Anchor
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ color: C.t.secondary, fontSize: 14.5, lineHeight: 1.6, marginTop: 8 }}
      >
        Recovery support that doesn't
        <br />shame you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        className="mt-9 px-7 py-3.5 rounded-full font-semibold flex items-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`,
          color: "#fff",
          fontSize: 14,
          boxShadow: `0 4px 20px ${C.blue}44`,
        }}
      >
        Take the tour
        <ChevronRight size={16} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ color: C.t.muted, fontSize: 11, marginTop: 12 }}
      >
        3-minute interactive walkthrough
      </motion.p>

      {/* Feature chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-12 flex gap-2"
      >
        {["AI Companion", "Community", "Streak Tracking"].map((f) => (
          <div
            key={f}
            className="px-2.5 py-1 rounded-full"
            style={{ background: `${C.card}cc`, border: `1px solid ${C.border}`, color: C.t.muted, fontSize: 10 }}
          >
            {f}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Screen 1 — Habit picker ──────────────────────────────────────────────────
function HabitPickerScreen() {
  const [selected, setSelected] = useState<string[]>(["Social Media"]);
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const habits = [
    { id: "Porn",         emoji: "🔞", label: "Porn"         },
    { id: "Nicotine",     emoji: "🚬", label: "Nicotine"     },
    { id: "Alcohol",      emoji: "🍷", label: "Alcohol"      },
    { id: "Gambling",     emoji: "🎰", label: "Gambling"     },
    { id: "Social Media", emoji: "📱", label: "Social Media" },
    { id: "Shopping",     emoji: "🛍️", label: "Shopping"     },
  ];

  return (
    <div className="h-full flex flex-col px-5 pt-4 pb-3" style={{ background: C.deep }}>
      <Label>Step 1 of 4</Label>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ color: C.t.primary, fontSize: 21, fontWeight: 700, lineHeight: 1.2, marginTop: 6, fontFamily: "var(--font-fraunces)" }}
      >
        What are you working on?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.16 }}
        style={{ color: C.t.secondary, fontSize: 12.5, marginTop: 5, lineHeight: 1.55 }}
      >
        Choose as many as you like. No judgment — this stays private.
      </motion.p>

      <div className="grid grid-cols-2 gap-2.5 mt-5">
        {habits.map((h, i) => {
          const on = selected.includes(h.id);
          return (
            <motion.button
              key={h.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => toggle(h.id)}
              className="flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left"
              style={{
                background: on ? `linear-gradient(135deg, ${C.blue}28, ${C.sage}1a)` : C.card,
                border: `1.5px solid ${on ? C.sky : C.border}`,
                color: on ? C.t.primary : C.t.secondary,
                transition: "all 0.18s ease",
              }}
            >
              <span style={{ fontSize: 18 }}>{h.emoji}</span>
              <span style={{ fontSize: 12.5, fontWeight: on ? 600 : 400 }}>{h.label}</span>
              {on && <CheckCircle2 size={12} style={{ marginLeft: "auto", color: C.mint, flexShrink: 0 }} />}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-4 px-3.5 py-2.5 rounded-xl flex items-start gap-2.5"
        style={{ background: `${C.sage}16`, border: `1px solid ${C.sage}30` }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>🔒</span>
        <p style={{ color: C.t.secondary, fontSize: 11, lineHeight: 1.55 }}>
          Community only sees your anonymous username. Habits never appear on your public profile.
        </p>
      </motion.div>

      <div className="flex-1" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="text-center"
        style={{ color: selected.length ? C.mint : C.t.muted, fontSize: 11.5, fontWeight: selected.length ? 600 : 400 }}
      >
        {selected.length > 0
          ? `${selected.length} habit${selected.length > 1 ? "s" : ""} selected ✓`
          : "Select at least one"}
      </motion.p>
    </div>
  );
}

// ─── Screen 2 — AI chat ───────────────────────────────────────────────────────
function AIChatScreen() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(1), 500);
    const t2 = setTimeout(() => setVisible(2), 2000);
    const t3 = setTimeout(() => setVisible(3), 3600);
    const t4 = setTimeout(() => setVisible(4), 5400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const msgs = [
    { role: "ai",   text: "Hey. I'm really glad you're here." },
    { role: "user", text: "Honestly, I've tried quitting before. I didn't think I'd try again." },
    { role: "ai",   text: "That took courage to say. Trying again, even after setbacks, is exactly what matters most." },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: C.deep }}>
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`, boxShadow: `0 2px 10px ${C.blue}44` }}
        >
          ⚓
        </div>
        <div>
          <div style={{ color: C.t.primary, fontSize: 13.5, fontWeight: 700 }}>Anchor</div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.mint }} />
            <span style={{ color: C.mint, fontSize: 10.5 }}>Always here for you</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-4 py-4 flex flex-col gap-3 justify-end">
        <AnimatePresence>
          {msgs.slice(0, visible).map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {m.role === "ai" && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mb-0.5"
                  style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}
                >
                  ⚓
                </div>
              )}
              <div
                className="px-3.5 py-2.5 rounded-2xl"
                style={{
                  maxWidth: "76%",
                  background:
                    m.role === "ai"
                      ? C.card
                      : `linear-gradient(135deg, ${C.blue}cc, ${C.sage}99)`,
                  border: m.role === "ai" ? `1px solid ${C.border}` : "none",
                  color: C.t.primary,
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  borderTopLeftRadius:  m.role === "ai"   ? 4 : undefined,
                  borderTopRightRadius: m.role === "user" ? 4 : undefined,
                  boxShadow: m.role === "user" ? `0 2px 12px ${C.blue}33` : "none",
                }}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {visible < msgs.length && visible > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-2"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}
            >
              ⚓
            </div>
            <div
              className="px-3.5 py-3 rounded-2xl flex gap-1.5 items-center"
              style={{ background: C.card, border: `1px solid ${C.border}`, borderTopLeftRadius: 4 }}
            >
              {[0, 1, 2].map((j) => (
                <motion.div
                  key={j}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: C.sky }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.75, repeat: Infinity, delay: j * 0.14 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 pb-5 pt-2 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
        <div
          className="flex-1 px-4 py-2.5 rounded-full"
          style={{ background: C.card, color: C.t.muted, fontSize: 12 }}
        >
          Talk to Anchor…
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}
        >
          <ChevronRight size={14} color="#fff" />
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3 — Home dashboard ────────────────────────────────────────────────
function HomeDashboardScreen() {
  return (
    <div className="h-full overflow-y-auto" style={{ background: C.deep }}>
      {/* Greeting */}
      <div className="px-4 pt-3 pb-2">
        <p style={{ color: C.t.muted, fontSize: 11.5 }}>Good evening</p>
        <h2 style={{ color: C.t.primary, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-fraunces)", letterSpacing: "-0.3px" }}>
          Marcus
        </h2>
      </div>

      {/* SOS strip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="mx-4 px-4 py-3 rounded-2xl flex items-center justify-between cursor-pointer"
        style={{ background: `${C.red}1e`, border: `1.5px solid ${C.red}44` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.red }}>
            <Shield size={13} color="#fff" />
          </div>
          <span style={{ color: C.t.primary, fontSize: 12.5, fontWeight: 600 }}>I need help right now</span>
        </div>
        <ChevronRight size={14} style={{ color: C.red }} />
      </motion.div>

      {/* Mood picker */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="mx-4 mt-3 p-3.5 rounded-2xl"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p style={{ color: C.t.secondary, fontSize: 12 }}>How are you feeling?</p>
        <div className="flex justify-between mt-2.5 px-1">
          {["😔", "😐", "🙂", "😊", "💪"].map((e, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: i === 2 ? `${C.blue}44` : "transparent",
                border: `1.5px solid ${i === 2 ? C.sky : "transparent"}`,
                fontSize: 20,
              }}
            >
              {e}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Streaks */}
      <div className="mx-4 mt-3 flex gap-2.5">
        {[
          { label: "Social Media", days: 14, color: C.blue,  pct: 47 },
          { label: "Nicotine",     days: 6,  color: C.sage,  pct: 20 },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="flex-1 p-3 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <Label>Streak</Label>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1.1, marginTop: 3 }}>
              {s.days}
              <span style={{ fontSize: 12, fontWeight: 500, color: C.t.secondary }}>d</span>
            </div>
            <div style={{ color: C.t.muted, fontSize: 10.5, marginTop: 1 }}>{s.label}</div>
            <div className="mt-2 h-1 rounded-full" style={{ background: `${s.color}28` }}>
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily mission */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="mx-4 mt-3 p-3.5 rounded-2xl flex items-center gap-3"
        style={{ background: `${C.sage}18`, border: `1px solid ${C.sage}30` }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${C.sage}30` }}>
          <Star size={13} style={{ color: C.mint }} />
        </div>
        <div className="flex-1 min-w-0">
          <Label>Today's mission</Label>
          <div style={{ color: C.t.primary, fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>
            Log a craving before you act on it
          </div>
        </div>
        <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: C.sage }} />
      </motion.div>

      {/* Partner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mt-3 mb-5 p-3.5 rounded-2xl flex items-center gap-3"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}
        >
          A
        </div>
        <div>
          <div style={{ color: C.t.secondary, fontSize: 12 }}>
            Alex checked in <span style={{ color: C.mint }}>2h ago ✓</span>
          </div>
          <div style={{ color: C.t.muted, fontSize: 10.5 }}>Your pact partner</div>
        </div>
        <div
          className="ml-auto px-2.5 py-1 rounded-full"
          style={{ background: `${C.blue}22`, color: C.sky, fontSize: 11, fontWeight: 500, flexShrink: 0 }}
        >
          Send ✉
        </div>
      </motion.div>
    </div>
  );
}

// ─── Screen 4 — SOS / Breathing ──────────────────────────────────────────────
function SOSScreen() {
  const sequence = [
    { phase: "inhale"  as const, label: "Breathe in",  secs: 4 },
    { phase: "hold"    as const, label: "Hold",         secs: 7 },
    { phase: "exhale"  as const, label: "Breathe out",  secs: 8 },
  ];

  const [idx, setIdx]     = useState(0);
  const [count, setCount] = useState(4);

  useEffect(() => {
    let rem = sequence[idx].secs;
    setCount(rem);
    const id = setInterval(() => {
      rem -= 1;
      if (rem <= 0) {
        setIdx((p) => (p + 1) % sequence.length);
        clearInterval(id);
      } else {
        setCount(rem);
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const { phase, label, secs } = sequence[idx];
  const circleScale = phase === "exhale" ? 1 : 1.38;
  const dur         = secs;

  return (
    <div
      className="h-full flex flex-col items-center px-5 relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, #0A1626 0%, ${C.deep} 100%)` }}
    >
      {/* Subtle ambient glow that breathes with the circle */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, background: C.blue, filter: "blur(80px)", top: "15%", left: "50%", transform: "translateX(-50%)", opacity: 0.18 }}
        animate={{ scale: circleScale, opacity: phase === "exhale" ? 0.1 : 0.22 }}
        transition={{ duration: dur, ease: phase === "inhale" ? "easeIn" : phase === "exhale" ? "easeOut" : "linear" }}
      />

      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 text-center"
        style={{ color: C.t.primary, fontSize: 19, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}
      >
        I'm here with you.
      </motion.p>
      <p style={{ color: C.t.secondary, fontSize: 12.5, marginTop: 4 }}>Let's breathe through this together.</p>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center mt-6" style={{ width: 190, height: 190, flexShrink: 0 }}>
        {[30, 18, 6].map((inset, ri) => (
          <motion.div
            key={ri}
            className="absolute rounded-full"
            style={{ inset: -inset, border: `1px solid ${C.sky}${18 - ri * 5}` }}
            animate={{ scale: circleScale, opacity: phase === "exhale" ? [0.25, 0.06] : 0.18 }}
            transition={{ duration: dur, ease: phase === "inhale" ? "easeIn" : phase === "exhale" ? "easeOut" : "linear" }}
          />
        ))}
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: dur, ease: phase === "inhale" ? "easeIn" : phase === "exhale" ? "easeOut" : "linear" }}
          className="rounded-full flex flex-col items-center justify-center"
          style={{
            width: 124,
            height: 124,
            background: `radial-gradient(circle, ${C.blue}99, ${C.sage}66)`,
            boxShadow: `0 0 40px ${C.blue}44, 0 0 70px ${C.sage}22`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22 }}
              style={{ color: "#fff", fontSize: 30, fontWeight: 300, lineHeight: 1 }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 }}>{label}</span>
        </motion.div>
      </div>

      <p style={{ color: C.t.muted, fontSize: 11, marginTop: 10 }}>4-7-8 Breathing · Urges peak, then pass</p>

      {/* Quick actions grid */}
      <div className="w-full mt-4 grid grid-cols-2 gap-2">
        {[
          { emoji: "🧭", label: "Grounding",    sub: "5-4-3-2-1 senses" },
          { emoji: "⏱️", label: "Wait 10 min",  sub: "Delay timer"      },
          { emoji: "💬", label: "Talk to Anchor", sub: "AI support"      },
          { emoji: "🤝", label: "Alert partner", sub: "SOS to Alex"      },
        ].map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            className="px-3 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{a.emoji}</span>
            <div>
              <div style={{ color: C.t.primary, fontSize: 11.5, fontWeight: 500 }}>{a.label}</div>
              <div style={{ color: C.t.muted, fontSize: 10 }}>{a.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 px-4 py-1.5 rounded-full mb-1"
        style={{ background: `${C.red}1a`, border: `1px solid ${C.red}33` }}
      >
        <span style={{ color: "#ff8f82", fontSize: 10.5 }}>Crisis line: 988 · Text HOME to 741741</span>
      </motion.div>
    </div>
  );
}

// ─── Screen 5 — Progress ──────────────────────────────────────────────────────
function ProgressScreen() {
  // 28-day calendar — day 12 was a relapse, rest clean
  const days = Array.from({ length: 28 }, (_, i) =>
    i === 11 ? "relapse" : i < 28 ? "clean" : "empty"
  );

  const stats = [
    { label: "Money saved",     value: "$168", emoji: "💵", color: C.mint    },
    { label: "Hours reclaimed", value: "56h",  emoji: "⏰", color: C.sky     },
    { label: "Urges resisted",  value: "31",   emoji: "💪", color: C.sunrise },
    { label: "Clean days",      value: "19/20", emoji: "📅", color: C.sage   },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 pt-3 pb-4" style={{ background: C.deep }}>
      <h2 style={{ color: C.t.primary, fontSize: 20, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>
        Your Journey
      </h2>
      <p style={{ color: C.t.secondary, fontSize: 12, marginTop: 2 }}>Social Media · May 2026</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 mt-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.07 }}
            className="p-3 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <span style={{ fontSize: 17 }}>{s.emoji}</span>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 800, lineHeight: 1.1, marginTop: 3 }}>
              {s.value}
            </div>
            <div style={{ color: C.t.muted, fontSize: 10.5, marginTop: 2 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="mt-4 p-3.5 rounded-2xl"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex justify-between items-center mb-2.5">
          <span style={{ color: C.t.secondary, fontSize: 12, fontWeight: 600 }}>Activity</span>
          <div className="flex items-center gap-2">
            {[["#4A8B6F", "Clean"], ["#C0433A55", "Hard day"]].map(([bg, lbl]) => (
              <div key={lbl} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: bg }} />
                <span style={{ color: C.t.muted, fontSize: 10 }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.012, type: "spring", stiffness: 220 }}
              className="rounded-sm"
              style={{
                height: 16,
                background:
                  d === "clean"   ? C.sage :
                  d === "relapse" ? "#C0433A55" :
                  `${C.border}`,
              }}
            />
          ))}
        </div>
        <p style={{ color: C.t.muted, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
          One relapse in 20 days = 19 days of real progress. That matters.
        </p>
      </motion.div>

      {/* Health milestone */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-3 px-3.5 py-3 rounded-2xl flex items-center gap-3"
        style={{ background: `${C.blue}1a`, border: `1px solid ${C.blue}33` }}
      >
        <span style={{ fontSize: 20 }}>🧠</span>
        <div>
          <div style={{ color: C.t.primary, fontSize: 12.5, fontWeight: 600 }}>Day 14 milestone</div>
          <div style={{ color: C.t.secondary, fontSize: 11, lineHeight: 1.45 }}>
            Dopamine receptors resetting. Focus and sleep noticeably improving.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Screen 6 — Community ────────────────────────────────────────────────────
function CommunityScreen() {
  const channels = [
    { slug: "#day-1",           desc: "Starting fresh today",    online: 23, hot: false },
    { slug: "#relapse-support", desc: "No judgment here",        online: 8,  hot: false },
    { slug: "#night-urges",     desc: "Late-night support",      online: 41, hot: true  },
    { slug: "#wins-today",      desc: "Share your wins ⭐",      online: 19, hot: false },
    { slug: "#social-media",    desc: "Phone addiction support",  online: 15, hot: false },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: C.deep }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between">
          <h2 style={{ color: C.t.primary, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>
            Community
          </h2>
          <div
            className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.mint }} />
            <span style={{ color: C.t.secondary, fontSize: 10.5 }}>TealFox#4821</span>
          </div>
        </div>
        <p style={{ color: C.t.muted, fontSize: 11, marginTop: 2 }}>Anonymous · Safe · Moderated 24/7</p>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3">
          <Label>Channels</Label>
          <div className="mt-2">
            {channels.map((ch, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.07 }}
                className="flex items-center py-2.5 cursor-pointer"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="flex-1">
                  <div style={{ color: ch.hot ? C.sky : C.t.primary, fontSize: 13, fontWeight: ch.hot ? 600 : 400 }}>
                    {ch.slug}
                  </div>
                  <div style={{ color: C.t.muted, fontSize: 11, marginTop: 1 }}>{ch.desc}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: ch.online > 20 ? C.mint : C.t.muted }} />
                  <span style={{ color: C.t.muted, fontSize: 10.5 }}>{ch.online}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured post */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-4 mt-4 mb-4 p-3.5 rounded-2xl"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}
            >
              O
            </div>
            <span style={{ color: C.t.secondary, fontSize: 11 }}>OrangeSky#2214 · #wins-today</span>
          </div>
          <p style={{ color: C.t.primary, fontSize: 12.5, lineHeight: 1.55 }}>
            "Day 30. I honestly didn't think I'd make it. Thank you all for being here."
          </p>
          <div className="flex gap-4 mt-2.5">
            {[["❤️", "47"], ["🙏", "31"], ["💪", "28"]].map(([e, n]) => (
              <div key={e} className="flex items-center gap-1">
                <span style={{ fontSize: 13 }}>{e}</span>
                <span style={{ color: C.t.muted, fontSize: 11.5 }}>{n}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Screen 7 — Pact / Partner ────────────────────────────────────────────────
function PactScreen() {
  return (
    <div className="h-full overflow-y-auto px-4 pt-3 pb-4" style={{ background: C.deep }}>
      <Label>Your Pact</Label>

      {/* Partner card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-3 p-4 rounded-2xl"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`, boxShadow: `0 4px 16px ${C.blue}33` }}
          >
            A
          </div>
          <div>
            <div style={{ color: C.t.primary, fontSize: 15, fontWeight: 700 }}>Alex</div>
            <div style={{ color: C.t.muted, fontSize: 11.5 }}>Partners since Day 1 · 14 days together</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { label: "Alex's streak", val: "14d ✅" },
            { label: "Your streak",   val: "14d ✅" },
          ].map((s, i) => (
            <div key={i} className="p-2.5 rounded-xl" style={{ background: `${C.deep}cc` }}>
              <div style={{ color: C.t.muted, fontSize: 10.5 }}>{s.label}</div>
              <div style={{ color: C.mint, fontSize: 15, fontWeight: 700, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Shared milestone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-3 p-3.5 rounded-2xl"
        style={{ background: `${C.sunrise}18`, border: `1px solid ${C.sunrise}33` }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: 18 }}>🏆</span>
          <div>
            <div style={{ color: C.t.primary, fontSize: 12.5, fontWeight: 600 }}>30-Day Pact — 16 days to go</div>
            <div style={{ color: C.t.secondary, fontSize: 11, marginTop: 1 }}>Both clean = team badge unlocked</div>
          </div>
        </div>
        <div className="mt-2.5 h-1.5 rounded-full" style={{ background: `${C.sunrise}28` }}>
          <div className="h-full rounded-full" style={{ width: "47%", background: C.sunrise }} />
        </div>
        <div className="flex justify-between mt-1">
          <span style={{ color: C.t.muted, fontSize: 10 }}>14 days done</span>
          <span style={{ color: C.t.muted, fontSize: 10 }}>47%</span>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {[
          { icon: <MessageCircle size={14} style={{ color: C.sky }} />, label: "Encourage",    bg: `${C.blue}22`, border: `${C.blue}44` },
          { icon: <Zap size={14} style={{ color: "#ff8a7a" }} />,        label: "SOS to Alex", bg: `${C.red}18`,  border: `${C.red}33`  },
        ].map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            className="px-3 py-3 rounded-2xl flex items-center gap-2 cursor-pointer"
            style={{ background: a.bg, border: `1px solid ${a.border}` }}
          >
            {a.icon}
            <span style={{ color: C.t.primary, fontSize: 12.5, fontWeight: 500 }}>{a.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Check-in feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.44 }}
        className="mt-4"
        style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}
      >
        <Label>Check-in feed</Label>
        {[
          { text: "Alex checked in",          time: "8:02am",  icon: "✅" },
          { text: "You checked in",            time: "9:14am",  icon: "✅" },
          { text: "Alex sent encouragement",   time: "11:30am", icon: "🙏" },
        ].map((e, i) => (
          <div key={i} className="flex items-center gap-2 mt-2.5">
            <span style={{ fontSize: 14 }}>{e.icon}</span>
            <span style={{ color: C.t.secondary, fontSize: 12 }}>{e.text}</span>
            <span style={{ color: C.t.muted, fontSize: 10.5, marginLeft: "auto" }}>{e.time}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Screen 8 — Gamification ─────────────────────────────────────────────────
function GamificationScreen() {
  const badges = [
    { emoji: "🌅", label: "First Dawn",    earned: true  },
    { emoji: "🔥", label: "Week One Real", earned: true  },
    { emoji: "🏅", label: "Urge Buster",   earned: true  },
    { emoji: "🤝", label: "Not Alone",     earned: true  },
    { emoji: "💎", label: "Day 30",        earned: false },
    { emoji: "⭐", label: "Day 90",        earned: false },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 pt-3 pb-4" style={{ background: C.deep }}>
      <h2 style={{ color: C.t.primary, fontSize: 20, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>
        Progress
      </h2>

      {/* XP + level */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-3 p-4 rounded-2xl"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <div style={{ color: C.t.muted, fontSize: 10.5 }}>LEVEL 3</div>
            <div style={{ color: C.t.primary, fontSize: 15, fontWeight: 700 }}>Building Momentum</div>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}
          >
            ⚓
          </div>
        </div>
        <div className="flex justify-between mb-1.5">
          <span style={{ color: C.t.muted, fontSize: 10.5 }}>580 XP</span>
          <span style={{ color: C.t.muted, fontSize: 10.5 }}>600 to Level 4</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: `${C.border}` }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.sage})` }}
            initial={{ width: 0 }}
            animate={{ width: "97%" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Badges grid */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span style={{ color: C.t.secondary, fontSize: 12.5, fontWeight: 600 }}>Achievements</span>
          <span style={{ color: C.t.muted, fontSize: 11 }}>4 / 6 earned</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 200 }}
              className="p-3 rounded-2xl flex flex-col items-center gap-1.5"
              style={{
                background: b.earned ? `linear-gradient(135deg, ${C.blue}22, ${C.sage}18)` : `${C.card}88`,
                border: `1.5px solid ${b.earned ? `${C.sky}44` : C.border}`,
                opacity: b.earned ? 1 : 0.42,
              }}
            >
              <span style={{ fontSize: 22, filter: b.earned ? "none" : "grayscale(1)" }}>{b.emoji}</span>
              <span style={{ color: b.earned ? C.t.primary : C.t.muted, fontSize: 9.5, textAlign: "center", lineHeight: 1.3 }}>
                {b.label}
              </span>
              {b.earned && <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.mint }} />}
              {!b.earned && <div style={{ color: C.t.muted, fontSize: 8.5 }}>Locked</div>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* XP breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-4 p-3.5 rounded-2xl"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p style={{ color: C.t.secondary, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Recent XP</p>
        {[
          { action: "Daily check-in",          xp: "+10", color: C.mint    },
          { action: "Craving logged (resisted)", xp: "+25", color: C.sunrise },
          { action: "Partner encouraged",       xp: "+10", color: C.sky    },
          { action: "7-day streak bonus",       xp: "+100", color: C.sage  },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ color: C.t.secondary, fontSize: 11.5 }}>{r.action}</span>
            <span style={{ color: r.color, fontSize: 12, fontWeight: 700 }}>{r.xp}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Screen 9 — Finale ───────────────────────────────────────────────────────
function FinaleScreen() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center px-7 text-center relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, ${C.navy} 0%, ${C.deep} 100%)` }}
    >
      {/* Ambient */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 300, height: 300, background: C.sage, filter: "blur(90px)", top: "0%", left: "-10%", opacity: 0.18 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 250, height: 250, background: C.blue, filter: "blur(75px)", bottom: "5%", right: "-5%", opacity: 0.15 }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Badge row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex gap-2.5 mb-6"
      >
        {["🌅", "🔥", "🏅", "💪"].map((b, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200, damping: 14 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            {b}
          </motion.div>
        ))}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        style={{
          color: C.t.primary,
          fontSize: 25,
          fontWeight: 800,
          lineHeight: 1.2,
          fontFamily: "var(--font-fraunces)",
        }}
      >
        Someone will notice
        <br />when you disappear.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52 }}
        style={{ color: C.t.secondary, fontSize: 13, lineHeight: 1.65, marginTop: 12 }}
      >
        Recovery isn't about being perfect.
        <br />It's about being seen, supported,
        <br />and never alone — even on hard nights.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mt-8 w-full flex flex-col gap-2.5"
      >
        <div
          className="px-5 py-3.5 rounded-2xl font-semibold text-sm text-center"
          style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`,
            color: "#fff",
            boxShadow: `0 4px 20px ${C.blue}44`,
          }}
        >
          Start your journey — it's free
        </div>
        <div
          className="px-5 py-3 rounded-2xl text-sm text-center"
          style={{ background: C.card, color: C.t.secondary, border: `1px solid ${C.border}` }}
        >
          Restart the tour
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ color: C.t.muted, fontSize: 10.5, marginTop: 14, lineHeight: 1.6 }}
      >
        Not a medical device. Not therapy.
        <br />Just support. Always private. Always free to start.
      </motion.p>
    </div>
  );
}

// ─── Screen registry ──────────────────────────────────────────────────────────
const SCREENS = [
  {
    label: "Welcome",
    subtitle: "The beginning of something real",
    features: ["Shame-free design", "Always available", "Private & secure"],
    Component: WelcomeScreen,
  },
  {
    label: "Your Habits",
    subtitle: "Private, judgment-free setup",
    features: ["Multi-habit support", "Totally anonymous", "Change anytime"],
    Component: HabitPickerScreen,
  },
  {
    label: "AI Companion",
    subtitle: "Support in every moment",
    features: ["Contextually aware", "Never judgmental", "24/7 available"],
    Component: AIChatScreen,
  },
  {
    label: "Daily Home",
    subtitle: "Your command center",
    features: ["Daily check-in", "Live streak counters", "One-tap SOS"],
    Component: HomeDashboardScreen,
  },
  {
    label: "Crisis SOS",
    subtitle: "Help in the hardest moments",
    features: ["4-7-8 breathing", "Delay timer", "Crisis line routing"],
    Component: SOSScreen,
  },
  {
    label: "Progress",
    subtitle: "See how far you've come",
    features: ["Activity calendar", "Money & time saved", "Health milestones"],
    Component: ProgressScreen,
  },
  {
    label: "Community",
    subtitle: "Anonymous but never alone",
    features: ["100% anonymous", "Topic channels", "Human-moderated"],
    Component: CommunityScreen,
  },
  {
    label: "Pact",
    subtitle: "Real accountability, real connection",
    features: ["Shared streaks", "Partner SOS alerts", "Team milestones"],
    Component: PactScreen,
  },
  {
    label: "Achievements",
    subtitle: "Every step earns something",
    features: ["XP for honesty", "Comeback badges", "Journey map"],
    Component: GamificationScreen,
  },
  {
    label: "Get Started",
    subtitle: "Join thousands on their journey",
    features: ["Free to start", "No credit card", "Cancel anytime"],
    Component: FinaleScreen,
  },
];

// ─── Slide transition ─────────────────────────────────────────────────────────
const slideVariants = {
  enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0   }),
  center:              ({ x: 0,    opacity: 1   }),
  exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0   }),
};

// ─── Main component ───────────────────────────────────────────────────────────
export function TutorialWalkthrough() {
  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= SCREENS.length) return;
      setDirection(next > step ? 1 : -1);
      setStep(next);
    },
    [step],
  );

  const { label, subtitle, features, Component } = SCREENS[step];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#060F1A", fontFamily: "var(--font-inter)" }}
    >
      {/* ── Page-level ambient background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large soft blobs */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 600, height: 600, background: "#3D6B9E", filter: "blur(130px)", top: "-10%", left: "-10%", opacity: 0.08 }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 500, height: 500, background: "#4A8B6F", filter: "blur(110px)", bottom: "-5%", right: "-5%", opacity: 0.07 }}
          animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(126,181,224,1) 1px, transparent 1px), linear-gradient(90deg, rgba(126,181,224,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">

        {/* ── Left info panel (desktop only) ── */}
        <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${step}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.32 }}
            >
              {/* Step chip */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4"
                style={{ background: `rgba(61,107,158,0.18)`, border: `1px solid rgba(126,181,224,0.22)` }}
              >
                <span style={{ color: C.sky, fontSize: 11, fontWeight: 600 }}>
                  {step + 1} / {SCREENS.length}
                </span>
              </div>

              <h3
                style={{ color: "#EDF2F7", fontSize: 22, fontWeight: 800, lineHeight: 1.2, fontFamily: "var(--font-fraunces)" }}
              >
                {label}
              </h3>
              <p style={{ color: "rgba(237,242,247,0.55)", fontSize: 13.5, marginTop: 6, lineHeight: 1.55 }}>
                {subtitle}
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.mint }} />
                    <span style={{ color: "rgba(237,242,247,0.65)", fontSize: 13 }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Phone ── */}
        <div className="flex flex-col items-center gap-6">
          <PhoneFrame>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Component />
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>

          {/* ── Dot indicators ── */}
          <div className="flex items-center gap-1.5">
            {SCREENS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="transition-all duration-200"
                style={{
                  width:  i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 4,
                  background: i === step ? C.sky : "rgba(126,181,224,0.25)",
                }}
                aria-label={`Go to screen ${i + 1}`}
              />
            ))}
          </div>

          {/* ── Nav buttons ── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background:   step === 0 ? "rgba(255,255,255,0.04)" : C.card,
                border:       `1px solid ${C.border}`,
                color:        step === 0 ? "rgba(237,242,247,0.2)" : C.t.primary,
                cursor:       step === 0 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => step === SCREENS.length - 1 ? go(0) : go(step + 1)}
              className="px-6 h-10 rounded-full flex items-center gap-2 font-semibold text-sm transition-all"
              style={{
                background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`,
                color:      "#fff",
                boxShadow:  `0 2px 16px ${C.blue}44`,
              }}
            >
              {step === SCREENS.length - 1 ? "Restart tour" : "Next"}
              <ChevronRight size={15} />
            </button>

            {step < SCREENS.length - 1 && (
              <button
                onClick={() => go(SCREENS.length - 1)}
                className="px-3 h-10 rounded-full text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border:     `1px solid ${C.border}`,
                  color:      C.t.muted,
                  cursor:     "pointer",
                }}
              >
                Skip
              </button>
            )}
          </div>
        </div>

        {/* ── Right panel — screen mini-map (desktop) ── */}
        <div className="hidden lg:flex flex-col w-48 gap-1 flex-shrink-0">
          <p style={{ color: "rgba(237,242,247,0.3)", fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>
            All screens
          </p>
          {SCREENS.map((s, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
              style={{
                background: i === step ? `${C.blue}22` : "transparent",
                border:     `1px solid ${i === step ? `${C.sky}44` : "transparent"}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{
                  background: i < step ? C.sage : i === step ? C.blue : "rgba(255,255,255,0.08)",
                  color:      i <= step ? "#fff" : "rgba(255,255,255,0.3)",
                  fontSize:   10,
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                style={{
                  color:      i === step ? C.t.primary : i < step ? C.t.secondary : C.t.muted,
                  fontSize:   12,
                  fontWeight: i === step ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom caption ── */}
      <div
        className="relative z-10 text-center mt-2 mb-6"
        style={{ color: "rgba(237,242,247,0.22)", fontSize: 11 }}
      >
        Anchor — Recovery support that doesn't shame you · Interactive prototype
      </div>
    </div>
  );
}
