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
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Scale,
  AlertCircle,
  Check,
  FileText,
  UserCheck,
  Globe,
  User,
  RefreshCw,
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
  cardHi:  "#243550",
  border:  "rgba(126,181,224,0.13)",
  borderHi:"rgba(126,181,224,0.28)",
  t: {
    primary:   "#EDF2F7",
    secondary: "rgba(237,242,247,0.62)",
    muted:     "rgba(237,242,247,0.36)",
  },
} as const;

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: C.t.muted, fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase" as const }}>
      {children}
    </p>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px" style={{ background: C.border }} />
      <span style={{ color: C.t.muted, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: C.border }} />
    </div>
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
        // Layered borders: outer rim + inner highlight
        border: "2px solid rgba(126,181,224,0.22)",
        boxShadow: [
          "0 0 0 1px rgba(255,255,255,0.04)",
          "inset 0 1px 0 rgba(255,255,255,0.06)",
          "0 40px 80px rgba(0,0,0,0.7)",
          "0 20px 40px rgba(0,0,0,0.4)",
          `0 0 100px rgba(61,107,158,0.2)`,
          `0 0 200px rgba(74,139,111,0.08)`,
        ].join(", "),
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Specular highlight — top edge shine */}
      <div
        className="absolute left-0 right-0 z-50 pointer-events-none"
        style={{
          top: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 60%, transparent 90%)",
        }}
      />

      {/* Notch */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
        style={{ width: 108, height: 30, background: "#000", borderRadius: "0 0 20px 20px" }}
      >
        {/* Camera dot */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#111", border: "1px solid #222" }} />
          <div style={{ width: 48, height: 8, borderRadius: 4, background: "#0d0d0d" }} />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="absolute top-0 left-0 right-0 z-40 flex items-end justify-between px-8 pb-1.5"
        style={{ height: 46 }}
      >
        <span style={{ color: C.t.secondary, fontSize: 11, fontWeight: 600 }}>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-end gap-0.5" style={{ height: 10 }}>
            {[3, 5, 7, 9].map((h, i) => (
              <div
                key={i}
                style={{ width: 3, height: h, background: i < 3 ? C.t.secondary : "rgba(255,255,255,0.15)", borderRadius: 1 }}
              />
            ))}
          </div>
          <div style={{ width: 22, height: 10, border: "1.5px solid rgba(255,255,255,0.28)", borderRadius: 3, position: "relative", marginLeft: 3 }}>
            <div style={{ position: "absolute", inset: 1.5, right: 3, background: C.mint, borderRadius: 1 }} />
            <div style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 3, height: 5, background: "rgba(255,255,255,0.22)", borderRadius: "0 1px 1px 0" }} />
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 44, paddingTop: 46 }}>
        {children}
      </div>

      {/* Home indicator */}
      <div
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-50"
        style={{ width: 100, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4 }}
      />

      {/* Bottom fade for scrollable screens */}
      <div
        className="absolute bottom-8 left-0 right-0 z-30 pointer-events-none"
        style={{ height: 24, background: `linear-gradient(to bottom, transparent, ${C.deep}88)` }}
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
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, background: C.blue, filter: "blur(75px)", top: "0%", left: "5%", opacity: 0.2 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.28, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 220, height: 220, background: C.sage, filter: "blur(65px)", bottom: "8%", right: "5%", opacity: 0.15 }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.22, 0.15] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 140, height: 140, background: C.sunrise, filter: "blur(50px)", top: "55%", left: "0%", opacity: 0.08 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-6"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl relative"
          style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`,
            boxShadow: `0 8px 40px ${C.blue}55, 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          ⚓
        </div>
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ border: `2px solid ${C.sky}` }}
          animate={{ scale: [1, 1.4], opacity: [0.55, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ border: `2px solid ${C.mint}` }}
          animate={{ scale: [1, 1.7], opacity: [0.2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ color: C.t.primary, fontSize: 36, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.05, fontFamily: "var(--font-fraunces)" }}
      >
        Anchor
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        style={{ color: C.t.secondary, fontSize: 14.5, lineHeight: 1.65, marginTop: 8 }}
      >
        Recovery support that doesn't
        <br />shame you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46 }}
        className="mt-9 px-7 py-3.5 rounded-full font-semibold flex items-center gap-2 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`,
          color: "#fff", fontSize: 14,
          boxShadow: `0 4px 24px ${C.blue}55, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        Take the tour
        <ChevronRight size={16} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.62 }}
        style={{ color: C.t.muted, fontSize: 11, marginTop: 10 }}
      >
        3-minute interactive walkthrough
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="absolute bottom-12 flex gap-1.5"
      >
        {["AI Companion", "Community", "Streak Tracking"].map((f) => (
          <div
            key={f}
            className="px-2.5 py-1 rounded-full"
            style={{ background: `${C.card}cc`, border: `1px solid ${C.border}`, color: C.t.muted, fontSize: 9.5 }}
          >
            {f}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Profile helpers ──────────────────────────────────────────────────────────
const P_ADJ  = ["Calm","Brave","Gentle","Quiet","Steady","Hopeful","Strong","Warm","Serene","Bold"];
const P_NOUN = ["Fox","Owl","Deer","Bear","Hawk","Wolf","Lynx","Crane","Otter","Elk"];
function generateUsername() {
  const adj   = P_ADJ[Math.floor(Math.random() * P_ADJ.length)];
  const noun  = P_NOUN[Math.floor(Math.random() * P_NOUN.length)];
  const num   = Math.floor(1000 + Math.random() * 9000);
  return `${adj}${noun}#${num}`;
}

const ACCENTS = [
  { from: "#3D6B9E", to: "#4A8B6F" },
  { from: "#7B5EA7", to: "#A67FD4" },
  { from: "#C0433A", to: "#E07850" },
  { from: "#B8860B", to: "#F0B86E" },
  { from: "#1B6B3A", to: "#52B788" },
  { from: "#1A4B7A", to: "#5B9BD5" },
];

const AVATARS = ["🦋", "🌿", "⭐", "🌊", "🔥", "🌸", "🦅", "🌙"];

// ─── Screen 1 — Profile setup ─────────────────────────────────────────────────
function ProfileSetupScreen() {
  const [name,     setName]     = useState("");
  const [avatar,   setAvatar]   = useState("🦋");
  const [accent,   setAccent]   = useState(0);
  const [username, setUsername] = useState(() => generateUsername());

  const ac          = ACCENTS[accent];
  const displayName = name.trim() || "Your name";

  return (
    <div className="h-full flex flex-col px-5 pt-4 pb-3 overflow-y-auto" style={{ background: C.deep }}>
      <Label>Step 1 of 4</Label>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ color: C.t.primary, fontSize: 21, fontWeight: 700, lineHeight: 1.2, marginTop: 6, fontFamily: "var(--font-fraunces)" }}
      >
        Create your profile
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.14 }}
        style={{ color: C.t.secondary, fontSize: 12.5, marginTop: 4, lineHeight: 1.5 }}
      >
        Only you see your real name. The community sees only your anonymous username.
      </motion.p>

      {/* Live preview card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 p-3 rounded-2xl flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${ac.from}22, ${ac.to}16)`,
          border: `1.5px solid ${ac.from}44`,
          transition: "all 0.3s ease",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${ac.from}, ${ac.to})`,
            boxShadow: `0 4px 16px ${ac.from}44`,
            transition: "all 0.3s ease",
          }}
        >
          {avatar}
        </div>
        <div className="min-w-0">
          <div style={{ color: C.t.primary, fontSize: 15, fontWeight: 700 }}>{displayName}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.mint }} />
            <span style={{ color: C.t.muted, fontSize: 10.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
              {username}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Display name */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.27 }}
        className="mt-4"
      >
        <Label>Display name</Label>
        <div
          className="mt-1.5 flex items-center px-3.5 py-2.5 rounded-xl gap-2"
          style={{
            background: C.card,
            border: `1.5px solid ${name ? ac.from + "66" : C.border}`,
            transition: "border-color 0.2s",
          }}
        >
          <User size={13} style={{ color: C.t.muted, flexShrink: 0 }} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            placeholder="e.g. Jordan, M., or just 'Me'"
            maxLength={24}
            className="flex-1 bg-transparent outline-none placeholder:text-white/25"
            style={{ color: C.t.primary, fontSize: 13, caretColor: ac.from }}
          />
          {name && (
            <span style={{ color: C.t.muted, fontSize: 10, flexShrink: 0 }}>{name.length}/24</span>
          )}
        </div>
      </motion.div>

      {/* Avatar picker */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.33 }}
        className="mt-3.5"
      >
        <Label>Avatar</Label>
        <div className="flex gap-2 mt-1.5">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: avatar === a ? `linear-gradient(135deg, ${ac.from}44, ${ac.to}33)` : C.card,
                border: `1.5px solid ${avatar === a ? ac.from + "88" : C.border}`,
                transform: avatar === a ? "scale(1.13)" : "scale(1)",
                transition: "all 0.18s ease",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Journey color */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="mt-3.5"
      >
        <Label>Journey color</Label>
        <div className="flex gap-2 mt-1.5">
          {ACCENTS.map((a, i) => (
            <button
              key={i}
              onClick={() => setAccent(i)}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                border: accent === i ? "2.5px solid #fff" : "2.5px solid transparent",
                boxShadow: accent === i ? `0 0 0 1.5px ${a.from}, 0 2px 8px ${a.from}55` : "none",
                transition: "all 0.18s ease",
              }}
            >
              {accent === i && <Check size={10} color="#fff" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Anonymous username */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        className="mt-3.5"
      >
        <Label>Community username</Label>
        <div className="flex items-center gap-2 mt-1.5">
          <div
            className="flex-1 px-3.5 py-2.5 rounded-xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <span style={{ color: C.t.secondary, fontSize: 12.5 }}>{username}</span>
          </div>
          <button
            onClick={() => setUsername(generateUsername())}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.t.muted, cursor: "pointer" }}
            title="Generate new username"
          >
            <RefreshCw size={13} />
          </button>
        </div>
        <p style={{ color: C.t.muted, fontSize: 10.5, marginTop: 5, lineHeight: 1.5 }}>
          Randomly generated · Tap 🔄 to shuffle · Never tied to your real identity
        </p>
      </motion.div>
    </div>
  );
}

// ─── Screen 2 — Habit picker ──────────────────────────────────────────────────
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
      <Label>Step 2 of 4</Label>
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
                background: on ? `linear-gradient(135deg, ${C.blue}2a, ${C.sage}1c)` : C.card,
                border: `1.5px solid ${on ? C.sky : C.border}`,
                color: on ? C.t.primary : C.t.secondary,
                transition: "all 0.18s ease",
                boxShadow: on ? `0 0 12px ${C.blue}22` : "none",
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
          Community only sees your anonymous username. Habits never appear publicly.
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
      <div className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`, boxShadow: `0 2px 12px ${C.blue}44` }}
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
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mb-0.5"
                  style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>
                  ⚓
                </div>
              )}
              <div
                className="px-3.5 py-2.5 rounded-2xl"
                style={{
                  maxWidth: "76%",
                  background: m.role === "ai" ? C.card : `linear-gradient(135deg, ${C.blue}cc, ${C.sage}99)`,
                  border: m.role === "ai" ? `1px solid ${C.border}` : "none",
                  color: C.t.primary, fontSize: 12.5, lineHeight: 1.55,
                  borderTopLeftRadius:  m.role === "ai"   ? 4 : undefined,
                  borderTopRightRadius: m.role === "user" ? 4 : undefined,
                  boxShadow: m.role === "user" ? `0 2px 14px ${C.blue}33` : "none",
                }}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {visible < msgs.length && visible > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-2"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>⚓</div>
            <div className="px-3.5 py-3 rounded-2xl flex gap-1.5 items-center"
              style={{ background: C.card, border: `1px solid ${C.border}`, borderTopLeftRadius: 4 }}>
              {[0, 1, 2].map((j) => (
                <motion.div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: C.sky }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.75, repeat: Infinity, delay: j * 0.14 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="px-4 pb-5 pt-2 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex-1 px-4 py-2.5 rounded-full" style={{ background: C.card, color: C.t.muted, fontSize: 12 }}>
          Talk to Anchor…
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>
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
      <div className="px-4 pt-3 pb-2">
        <p style={{ color: C.t.muted, fontSize: 11.5 }}>Good evening</p>
        <h2 style={{ color: C.t.primary, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-fraunces)", letterSpacing: "-0.3px" }}>
          Marcus
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="mx-4 px-4 py-3 rounded-2xl flex items-center justify-between cursor-pointer"
        style={{ background: `${C.red}20`, border: `1.5px solid ${C.red}44`, boxShadow: `0 0 20px ${C.red}18` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.red }}>
            <Shield size={13} color="#fff" />
          </div>
          <span style={{ color: C.t.primary, fontSize: 12.5, fontWeight: 600 }}>I need help right now</span>
        </div>
        <ChevronRight size={14} style={{ color: C.red }} />
      </motion.div>

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
            <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: i === 2 ? `${C.blue}44` : "transparent", border: `1.5px solid ${i === 2 ? C.sky : "transparent"}`, fontSize: 20 }}>
              {e}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mx-4 mt-3 flex gap-2.5">
        {[
          { label: "Social Media", days: 14, color: C.blue, pct: 47 },
          { label: "Nicotine",     days: 6,  color: C.sage, pct: 20 },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="flex-1 p-3 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <Label>Streak</Label>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1.1, marginTop: 3 }}>
              {s.days}<span style={{ fontSize: 12, fontWeight: 500, color: C.t.secondary }}>d</span>
            </div>
            <div style={{ color: C.t.muted, fontSize: 10.5, marginTop: 1 }}>{s.label}</div>
            <div className="mt-2 h-1 rounded-full" style={{ background: `${s.color}28` }}>
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
          </motion.div>
        ))}
      </div>

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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mt-3 mb-5 p-3.5 rounded-2xl flex items-center gap-3"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>A</div>
        <div>
          <div style={{ color: C.t.secondary, fontSize: 12 }}>
            Alex checked in <span style={{ color: C.mint }}>2h ago ✓</span>
          </div>
          <div style={{ color: C.t.muted, fontSize: 10.5 }}>Your pact partner</div>
        </div>
        <div className="ml-auto px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: `${C.blue}22`, color: C.sky, fontSize: 11, fontWeight: 500 }}>
          Send ✉
        </div>
      </motion.div>
    </div>
  );
}

// ─── Screen 4 — SOS / Breathing ──────────────────────────────────────────────
function SOSScreen() {
  const sequence = [
    { phase: "inhale" as const, label: "Breathe in",  secs: 4 },
    { phase: "hold"   as const, label: "Hold",         secs: 7 },
    { phase: "exhale" as const, label: "Breathe out",  secs: 8 },
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

  return (
    <div className="h-full flex flex-col items-center px-5 relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, #0A1626 0%, ${C.deep} 100%)` }}>
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, background: C.blue, filter: "blur(80px)", top: "12%", left: "50%", transform: "translateX(-50%)", opacity: 0.18 }}
        animate={{ scale: circleScale, opacity: phase === "exhale" ? 0.1 : 0.22 }}
        transition={{ duration: secs, ease: phase === "inhale" ? "easeIn" : phase === "exhale" ? "easeOut" : "linear" }}
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

      <div className="relative flex items-center justify-center mt-6" style={{ width: 190, height: 190, flexShrink: 0 }}>
        {[30, 18, 6].map((inset, ri) => (
          <motion.div key={ri} className="absolute rounded-full"
            style={{ inset: -inset, border: `1px solid ${C.sky}${18 - ri * 5}` }}
            animate={{ scale: circleScale, opacity: phase === "exhale" ? [0.25, 0.06] : 0.18 }}
            transition={{ duration: secs, ease: phase === "inhale" ? "easeIn" : phase === "exhale" ? "easeOut" : "linear" }}
          />
        ))}
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: secs, ease: phase === "inhale" ? "easeIn" : phase === "exhale" ? "easeOut" : "linear" }}
          className="rounded-full flex flex-col items-center justify-center"
          style={{
            width: 124, height: 124,
            background: `radial-gradient(circle, ${C.blue}99, ${C.sage}66)`,
            boxShadow: `0 0 40px ${C.blue}44, 0 0 70px ${C.sage}22`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span key={count}
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

      <div className="w-full mt-4 grid grid-cols-2 gap-2">
        {[
          { emoji: "🧭", label: "Grounding",      sub: "5-4-3-2-1 senses" },
          { emoji: "⏱️", label: "Wait 10 min",    sub: "Delay timer"       },
          { emoji: "💬", label: "Talk to Anchor", sub: "AI support"        },
          { emoji: "🤝", label: "Alert partner",  sub: "SOS to Alex"       },
        ].map((a, i) => (
          <motion.div key={i}
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
  const days = Array.from({ length: 28 }, (_, i) =>
    i === 11 ? "relapse" : "clean"
  );
  const stats = [
    { label: "Money saved",     value: "$168",  emoji: "💵", color: C.mint    },
    { label: "Hours reclaimed", value: "56h",   emoji: "⏰", color: C.sky     },
    { label: "Urges resisted",  value: "31",    emoji: "💪", color: C.sunrise },
    { label: "Clean days",      value: "19/20", emoji: "📅", color: C.sage    },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 pt-3 pb-4" style={{ background: C.deep }}>
      <h2 style={{ color: C.t.primary, fontSize: 20, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>Your Journey</h2>
      <p style={{ color: C.t.secondary, fontSize: 12, marginTop: 2 }}>Social Media · May 2026</p>

      <div className="grid grid-cols-2 gap-2.5 mt-4">
        {stats.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.07 }}
            className="p-3 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <span style={{ fontSize: 17 }}>{s.emoji}</span>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 800, lineHeight: 1.1, marginTop: 3 }}>{s.value}</div>
            <div style={{ color: C.t.muted, fontSize: 10.5, marginTop: 2 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

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
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.012, type: "spring", stiffness: 220 }}
              className="rounded-sm"
              style={{ height: 16, background: d === "clean" ? C.sage : "#C0433A55" }}
            />
          ))}
        </div>
        <p style={{ color: C.t.muted, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
          One relapse in 20 days = 19 days of real progress. That matters.
        </p>
      </motion.div>

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
    { slug: "#day-1",           desc: "Starting fresh today",   online: 23, hot: false },
    { slug: "#relapse-support", desc: "No judgment here",       online: 8,  hot: false },
    { slug: "#night-urges",     desc: "Late-night support",     online: 41, hot: true  },
    { slug: "#wins-today",      desc: "Share your wins ⭐",     online: 19, hot: false },
    { slug: "#social-media",    desc: "Phone addiction support", online: 15, hot: false },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: C.deep }}>
      <div className="px-4 pt-3 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between">
          <h2 style={{ color: C.t.primary, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>Community</h2>
          <div className="px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.mint }} />
            <span style={{ color: C.t.secondary, fontSize: 10.5 }}>TealFox#4821</span>
          </div>
        </div>
        <p style={{ color: C.t.muted, fontSize: 11, marginTop: 2 }}>Anonymous · Safe · Moderated 24/7</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3">
          <Label>Channels</Label>
          <div className="mt-2">
            {channels.map((ch, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.07 }}
                className="flex items-center py-2.5 cursor-pointer"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="flex-1">
                  <div style={{ color: ch.hot ? C.sky : C.t.primary, fontSize: 13, fontWeight: ch.hot ? 600 : 400 }}>{ch.slug}</div>
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-4 mt-4 mb-4 p-3.5 rounded-2xl"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>O</div>
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mt-3 p-4 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`, boxShadow: `0 4px 16px ${C.blue}33` }}>A</div>
          <div>
            <div style={{ color: C.t.primary, fontSize: 15, fontWeight: 700 }}>Alex</div>
            <div style={{ color: C.t.muted, fontSize: 11.5 }}>Partners since Day 1 · 14 days together</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[{ label: "Alex's streak", val: "14d ✅" }, { label: "Your streak", val: "14d ✅" }].map((s, i) => (
            <div key={i} className="p-2.5 rounded-xl" style={{ background: `${C.deep}cc` }}>
              <div style={{ color: C.t.muted, fontSize: 10.5 }}>{s.label}</div>
              <div style={{ color: C.mint, fontSize: 15, fontWeight: 700, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-3 p-3.5 rounded-2xl" style={{ background: `${C.sunrise}18`, border: `1px solid ${C.sunrise}33` }}>
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

      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {[
          { icon: <MessageCircle size={14} style={{ color: C.sky }} />, label: "Encourage",    bg: `${C.blue}22`, border: `${C.blue}44` },
          { icon: <Zap size={14} style={{ color: "#ff8a7a" }} />,        label: "SOS to Alex", bg: `${C.red}18`,  border: `${C.red}33`  },
        ].map((a, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            className="px-3 py-3 rounded-2xl flex items-center gap-2 cursor-pointer"
            style={{ background: a.bg, border: `1px solid ${a.border}` }}>
            {a.icon}
            <span style={{ color: C.t.primary, fontSize: 12.5, fontWeight: 500 }}>{a.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.44 }}
        className="mt-4" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
        <Label>Check-in feed</Label>
        {[
          { text: "Alex checked in",        time: "8:02am",  icon: "✅" },
          { text: "You checked in",          time: "9:14am",  icon: "✅" },
          { text: "Alex sent encouragement", time: "11:30am", icon: "🙏" },
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

// ─── Screen 8 — Achievements ─────────────────────────────────────────────────
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
      <h2 style={{ color: C.t.primary, fontSize: 20, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>Progress</h2>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="mt-3 p-4 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div style={{ color: C.t.muted, fontSize: 10.5 }}>LEVEL 3</div>
            <div style={{ color: C.t.primary, fontSize: 15, fontWeight: 700 }}>Building Momentum</div>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>⚓</div>
        </div>
        <div className="flex justify-between mb-1.5">
          <span style={{ color: C.t.muted, fontSize: 10.5 }}>580 XP</span>
          <span style={{ color: C.t.muted, fontSize: 10.5 }}>600 to Level 4</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: C.border }}>
          <motion.div className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.sage})` }}
            initial={{ width: 0 }}
            animate={{ width: "97%" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span style={{ color: C.t.secondary, fontSize: 12.5, fontWeight: 600 }}>Achievements</span>
          <span style={{ color: C.t.muted, fontSize: 11 }}>4 / 6 earned</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 200 }}
              className="p-3 rounded-2xl flex flex-col items-center gap-1.5"
              style={{
                background: b.earned ? `linear-gradient(135deg, ${C.blue}22, ${C.sage}18)` : `${C.card}88`,
                border: `1.5px solid ${b.earned ? `${C.sky}44` : C.border}`,
                opacity: b.earned ? 1 : 0.42,
              }}>
              <span style={{ fontSize: 22, filter: b.earned ? "none" : "grayscale(1)" }}>{b.emoji}</span>
              <span style={{ color: b.earned ? C.t.primary : C.t.muted, fontSize: 9.5, textAlign: "center", lineHeight: 1.3 }}>{b.label}</span>
              {b.earned
                ? <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.mint }} />
                : <div style={{ color: C.t.muted, fontSize: 8.5 }}>Locked</div>}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="mt-4 p-3.5 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p style={{ color: C.t.secondary, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Recent XP</p>
        {[
          { action: "Daily check-in",            xp: "+10",  color: C.mint    },
          { action: "Craving logged (resisted)",  xp: "+25",  color: C.sunrise },
          { action: "Partner encouraged",         xp: "+10",  color: C.sky     },
          { action: "7-day streak bonus",         xp: "+100", color: C.sage    },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1.5"
            style={{ borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ color: C.t.secondary, fontSize: 11.5 }}>{r.action}</span>
            <span style={{ color: r.color, fontSize: 12, fontWeight: 700 }}>{r.xp}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Screen 9 — Privacy Policy (NEW) ─────────────────────────────────────────
function PrivacyPolicyScreen() {
  const commitments = [
    {
      icon: <Lock size={14} color={C.mint} />,
      title: "End-to-end encrypted",
      desc: "Your journal, AI conversations, and habit data are encrypted. Only you can read them.",
      bg: `${C.sage}18`,
      border: `${C.sage}30`,
    },
    {
      icon: <EyeOff size={14} color={C.sky} />,
      title: "We never sell your data",
      desc: "Your health and recovery data is never sold or shared with advertisers. Ever.",
      bg: `${C.blue}18`,
      border: `${C.blue}30`,
    },
    {
      icon: <UserCheck size={14} color={C.sunrise} />,
      title: "Separate identities",
      desc: "Your real identity is completely isolated from your anonymous community username.",
      bg: `${C.sunrise}15`,
      border: `${C.sunrise}30`,
    },
    {
      icon: <Trash2 size={14} color="#ff8f82" />,
      title: "Delete everything, anytime",
      desc: "Permanently delete all your data instantly from Settings. No questions asked.",
      bg: `${C.red}12`,
      border: `${C.red}28`,
    },
    {
      icon: <Download size={14} color={C.mint} />,
      title: "Your data is yours",
      desc: "Export a full copy of your data at any time in JSON or PDF format.",
      bg: `${C.sage}18`,
      border: `${C.sage}30`,
    },
    {
      icon: <Globe size={14} color={C.sky} />,
      title: "GDPR & CCPA compliant",
      desc: "Full compliance with global privacy law. Your rights are enforced automatically.",
      bg: `${C.blue}18`,
      border: `${C.blue}30`,
    },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: C.deep }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>
            <Lock size={13} color="#fff" />
          </div>
          <h2 style={{ color: C.t.primary, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>
            Your Privacy
          </h2>
        </div>
        <p style={{ color: C.t.secondary, fontSize: 12, lineHeight: 1.5 }}>
          We built Anchor with privacy as the foundation — not an afterthought.
        </p>
      </div>

      {/* Commitments */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {commitments.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 + i * 0.07 }}
            className="px-3 py-2.5 rounded-xl flex items-start gap-2.5"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}
          >
            <div className="flex-shrink-0 mt-0.5">{c.icon}</div>
            <div>
              <div style={{ color: C.t.primary, fontSize: 12, fontWeight: 600 }}>{c.title}</div>
              <div style={{ color: C.t.secondary, fontSize: 11, lineHeight: 1.5, marginTop: 1 }}>{c.desc}</div>
            </div>
          </motion.div>
        ))}

        {/* Compliance badge */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-1 p-3 rounded-xl flex items-center gap-3"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex gap-1.5">
            {["GDPR", "CCPA", "HIPAA-grade"].map((tag) => (
              <div key={tag} className="px-2 py-0.5 rounded-full"
                style={{ background: `${C.blue}22`, border: `1px solid ${C.blue}44`, color: C.sky, fontSize: 9.5, fontWeight: 600 }}>
                {tag}
              </div>
            ))}
          </div>
          <span style={{ color: C.t.muted, fontSize: 10.5, marginLeft: "auto" }}>Compliant</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-center pb-1"
          style={{ color: C.t.muted, fontSize: 10.5, lineHeight: 1.6 }}
        >
          Full Privacy Policy available at anchor.app/privacy
        </motion.p>
      </div>
    </div>
  );
}

// ─── Screen 10 — User Agreement (NEW) ────────────────────────────────────────
function UserAgreementScreen() {
  const [agreed, setAgreed] = useState<Record<string, boolean>>({
    terms:     false,
    privacy:   false,
    medical:   false,
    age:       false,
  });

  const allAgreed = Object.values(agreed).every(Boolean);
  const toggle = (key: string) => setAgreed((a) => ({ ...a, [key]: !a[key] }));

  const items = [
    {
      key:     "terms",
      label:   "I agree to the Terms of Service",
      sub:     "You agree to use Anchor responsibly and not share harmful content.",
      required: true,
    },
    {
      key:     "privacy",
      label:   "I agree to the Privacy Policy",
      sub:     "You consent to data collection as described — securely and never sold.",
      required: true,
    },
    {
      key:     "medical",
      label:   "Anchor is not medical treatment",
      sub:     "I understand Anchor is a support tool, not a substitute for professional therapy, medical care, or crisis services.",
      required: true,
    },
    {
      key:     "age",
      label:   "I am 17 years of age or older",
      sub:     "Anchor requires users to be 17+ due to the sensitive nature of recovery content.",
      required: true,
    },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: C.deep }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})` }}>
            <Scale size={13} color="#fff" />
          </div>
          <h2 style={{ color: C.t.primary, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-fraunces)" }}>
            Before We Begin
          </h2>
        </div>
        <p style={{ color: C.t.secondary, fontSize: 12, lineHeight: 1.5 }}>
          Please read and confirm each item. We keep this honest and brief.
        </p>
      </div>

      {/* Agreement items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
        {items.map((item, i) => {
          const on = agreed[item.key];
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.08 }}
              onClick={() => toggle(item.key)}
              className="w-full flex items-start gap-3 px-3.5 py-3 rounded-2xl text-left"
              style={{
                background: on ? `linear-gradient(135deg, ${C.blue}20, ${C.sage}14)` : C.card,
                border: `1.5px solid ${on ? C.sky + "66" : C.border}`,
                transition: "all 0.2s ease",
                boxShadow: on ? `0 0 14px ${C.blue}1a` : "none",
              }}
            >
              {/* Checkbox */}
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: on ? `linear-gradient(135deg, ${C.blue}, ${C.sage})` : "transparent",
                  border: `1.5px solid ${on ? "transparent" : C.border}`,
                  transition: "all 0.18s ease",
                }}
              >
                {on && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
              <div>
                <div style={{ color: on ? C.t.primary : C.t.secondary, fontSize: 12.5, fontWeight: on ? 600 : 400, lineHeight: 1.35 }}>
                  {item.label}
                </div>
                <div style={{ color: C.t.muted, fontSize: 11, lineHeight: 1.5, marginTop: 2 }}>
                  {item.sub}
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Important notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="px-3 py-2.5 rounded-xl flex items-start gap-2"
          style={{ background: `${C.sunrise}14`, border: `1px solid ${C.sunrise}30` }}
        >
          <AlertCircle size={13} style={{ color: C.sunrise, flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: C.t.secondary, fontSize: 10.5, lineHeight: 1.55 }}>
            <strong style={{ color: C.sunrise }}>Not a crisis service.</strong> If you are in immediate danger, please call 988 or your local emergency services.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="px-5 py-3.5 rounded-2xl font-semibold text-sm text-center mt-1"
          style={{
            background: allAgreed
              ? `linear-gradient(135deg, ${C.blue}, ${C.sage})`
              : `${C.card}`,
            color:  allAgreed ? "#fff" : C.t.muted,
            border: allAgreed ? "none" : `1.5px solid ${C.border}`,
            boxShadow: allAgreed ? `0 4px 20px ${C.blue}44` : "none",
            transition: "all 0.25s ease",
            cursor: allAgreed ? "pointer" : "not-allowed",
          }}
        >
          {allAgreed ? "✓ Agreed — Start my journey" : `${Object.values(agreed).filter(Boolean).length} / 4 confirmed`}
        </motion.div>

        <p className="text-center pb-1" style={{ color: C.t.muted, fontSize: 10 }}>
          anchor.app/terms · anchor.app/privacy
        </p>
      </div>
    </div>
  );
}

// ─── Screen 11 — Finale ──────────────────────────────────────────────────────
function FinaleScreen() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center px-7 text-center relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, ${C.navy} 0%, ${C.deep} 100%)` }}
    >
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 300, height: 300, background: C.sage, filter: "blur(90px)", top: "0%", left: "-10%", opacity: 0.18 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 250, height: 250, background: C.blue, filter: "blur(75px)", bottom: "5%", right: "-5%", opacity: 0.15 }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex gap-2.5 mb-6"
      >
        {["🌅", "🔥", "🏅", "💪"].map((b, i) => (
          <motion.div key={i}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200, damping: 14 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            {b}
          </motion.div>
        ))}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        style={{ color: C.t.primary, fontSize: 25, fontWeight: 800, lineHeight: 1.2, fontFamily: "var(--font-fraunces)" }}
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
          style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`, color: "#fff", boxShadow: `0 4px 20px ${C.blue}44` }}
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
        Not a medical device · Not therapy
        <br />Always private · Always free to start
      </motion.p>
    </div>
  );
}

// ─── Screen registry ──────────────────────────────────────────────────────────
const SCREENS = [
  {
    label:    "Welcome",
    subtitle: "The beginning of something real",
    group:    "Start",
    features: ["Shame-free design", "Always available", "Private & secure"],
    Component: WelcomeScreen,
  },
  {
    label:    "My Profile",
    subtitle: "Make Anchor yours from day one",
    group:    "Onboarding",
    features: ["Custom display name", "Choose your avatar", "Anonymous community ID"],
    Component: ProfileSetupScreen,
  },
  {
    label:    "Your Habits",
    subtitle: "Private, judgment-free setup",
    group:    "Onboarding",
    features: ["Multi-habit support", "Totally anonymous", "Change anytime"],
    Component: HabitPickerScreen,
  },
  {
    label:    "AI Companion",
    subtitle: "Support in every moment",
    group:    "Onboarding",
    features: ["Context-aware memory", "Never judgmental", "24/7 available"],
    Component: AIChatScreen,
  },
  {
    label:    "Daily Home",
    subtitle: "Your command center",
    group:    "Features",
    features: ["Daily check-in", "Live streak counters", "One-tap SOS"],
    Component: HomeDashboardScreen,
  },
  {
    label:    "Crisis SOS",
    subtitle: "Help in the hardest moments",
    group:    "Features",
    features: ["4-7-8 breathing", "Delay timer", "Crisis line routing"],
    Component: SOSScreen,
  },
  {
    label:    "Progress",
    subtitle: "See how far you've come",
    group:    "Features",
    features: ["Activity calendar", "Money & time saved", "Health milestones"],
    Component: ProgressScreen,
  },
  {
    label:    "Community",
    subtitle: "Anonymous but never alone",
    group:    "Features",
    features: ["100% anonymous", "Topic channels", "Human-moderated"],
    Component: CommunityScreen,
  },
  {
    label:    "Pact",
    subtitle: "Real accountability, real connection",
    group:    "Features",
    features: ["Shared streaks", "Partner SOS alerts", "Team milestones"],
    Component: PactScreen,
  },
  {
    label:    "Achievements",
    subtitle: "Every step earns something",
    group:    "Features",
    features: ["XP for honesty", "Comeback badges", "Journey map"],
    Component: GamificationScreen,
  },
  {
    label:    "Privacy",
    subtitle: "Your data, protected by design",
    group:    "Legal",
    features: ["End-to-end encrypted", "Data never sold", "Delete anytime"],
    Component: PrivacyPolicyScreen,
  },
  {
    label:    "Agreement",
    subtitle: "Clear commitments, both ways",
    group:    "Legal",
    features: ["Plain-language terms", "Medical disclaimer", "Age verification"],
    Component: UserAgreementScreen,
  },
  {
    label:    "Get Started",
    subtitle: "Join thousands on their journey",
    group:    "Start",
    features: ["Free to start", "No credit card", "Cancel anytime"],
    Component: FinaleScreen,
  },
];

// ─── Transition variants ──────────────────────────────────────────────────────
const slideVariants = {
  enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0,  scale: 0.98 }),
  center:              ({ x: 0,    opacity: 1,  scale: 1    }),
  exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0,  scale: 0.98 }),
};

// ─── Group colors ─────────────────────────────────────────────────────────────
const GROUP_COLOR: Record<string, string> = {
  Start:       C.sky,
  Onboarding:  C.mint,
  Features:    C.sage,
  Legal:       C.sunrise,
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

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(step + 1);
      if (e.key === "ArrowLeft")  go(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, go]);

  const { label, subtitle, features, group, Component } = SCREENS[step];
  const groupColor = GROUP_COLOR[group] ?? C.sky;

  // Group the screen list for the right mini-map
  const groups = SCREENS.reduce<Record<string, number[]>>((acc, s, i) => {
    acc[s.group] = [...(acc[s.group] ?? []), i];
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#05101C", fontFamily: "var(--font-inter)" }}
    >
      {/* ── Rich ambient background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{ width: 700, height: 700, background: "#3D6B9E", filter: "blur(140px)", top: "-15%", left: "-15%", opacity: 0.07 }}
          animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 550, height: 550, background: "#4A8B6F", filter: "blur(120px)", bottom: "-10%", right: "-10%", opacity: 0.06 }}
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 300, height: 300, background: "#F0B86E", filter: "blur(100px)", top: "50%", right: "20%", opacity: 0.04 }}
          animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: "linear-gradient(rgba(126,181,224,1) 1px, transparent 1px), linear-gradient(90deg, rgba(126,181,224,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,16,28,0.6) 100%)" }}
        />
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14">

        {/* ── Left info panel ── */}
        <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${step}`}
              initial={{ opacity: 0, x: -18, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0,   filter: "blur(0px)" }}
              exit={{    opacity: 0, x: -12,  filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Group + step pill */}
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{ background: `${groupColor}18`, border: `1px solid ${groupColor}33` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: groupColor }} />
                  <span style={{ color: groupColor, fontSize: 10.5, fontWeight: 600 }}>{group}</span>
                </div>
                <span style={{ color: C.t.muted, fontSize: 10.5 }}>{step + 1} / {SCREENS.length}</span>
              </div>

              <h3 style={{ color: C.t.primary, fontSize: 22, fontWeight: 800, lineHeight: 1.2, fontFamily: "var(--font-fraunces)" }}>
                {label}
              </h3>
              <p style={{ color: C.t.secondary, fontSize: 13.5, marginTop: 6, lineHeight: 1.55 }}>
                {subtitle}
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                {features.map((f, fi) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: fi * 0.06 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: groupColor }} />
                    <span style={{ color: C.t.secondary, fontSize: 13 }}>{f}</span>
                  </motion.div>
                ))}
              </div>

              {/* Keyboard hint */}
              <div className="mt-8 flex items-center gap-2">
                {["←", "→"].map((k) => (
                  <div key={k} className="px-2 py-0.5 rounded"
                    style={{ background: C.card, border: `1px solid ${C.border}`, color: C.t.muted, fontSize: 11, fontFamily: "monospace" }}>
                    {k}
                  </div>
                ))}
                <span style={{ color: C.t.muted, fontSize: 11 }}>navigate</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Phone + controls ── */}
        <div className="flex flex-col items-center gap-5">
          <PhoneFrame>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Component />
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>

          {/* ── Progress dots ── */}
          <div className="flex items-center gap-1.5">
            {SCREENS.map((s, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="transition-all duration-200"
                style={{
                  width:        i === step ? 22 : 6,
                  height:       6,
                  borderRadius: 4,
                  background:   i === step
                    ? GROUP_COLOR[s.group] ?? C.sky
                    : i < step
                    ? `${GROUP_COLOR[s.group] ?? C.sky}55`
                    : "rgba(126,181,224,0.2)",
                }}
                aria-label={`Go to screen ${i + 1}: ${s.label}`}
              />
            ))}
          </div>

          {/* ── Nav controls — frosted pill ── */}
          <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-2xl"
            style={{
              background:  "rgba(30,45,66,0.7)",
              border:      `1px solid ${C.border}`,
              backdropFilter: "blur(12px)",
              boxShadow:   "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: step === 0 ? "rgba(255,255,255,0.03)" : C.cardHi,
                color:      step === 0 ? "rgba(237,242,247,0.2)"  : C.t.primary,
                cursor:     step === 0 ? "not-allowed" : "pointer",
                border:     `1px solid ${step === 0 ? "transparent" : C.borderHi}`,
              }}
            >
              <ChevronLeft size={17} />
            </button>

            <button
              onClick={() => step === SCREENS.length - 1 ? go(0) : go(step + 1)}
              className="px-5 h-9 rounded-xl flex items-center gap-2 font-semibold text-sm transition-all"
              style={{
                background: `linear-gradient(135deg, ${C.blue}, ${C.sage})`,
                color:      "#fff",
                boxShadow:  `0 2px 14px ${C.blue}44`,
              }}
            >
              {step === SCREENS.length - 1 ? "Restart" : "Next"}
              <ChevronRight size={14} />
            </button>

            {step < SCREENS.length - 1 && (
              <button
                onClick={() => go(SCREENS.length - 1)}
                className="px-3 h-9 rounded-xl text-xs transition-all"
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

        {/* ── Right mini-map ── */}
        <div className="hidden lg:flex flex-col w-44 gap-0.5 flex-shrink-0">
          {Object.entries(groups).map(([grp, indices]) => (
            <div key={grp} className="mb-2">
              <SectionDivider label={grp} />
              {indices.map((i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-all mt-0.5"
                  style={{
                    background: i === step ? `${GROUP_COLOR[grp] ?? C.sky}18` : "transparent",
                    border:     `1px solid ${i === step ? `${GROUP_COLOR[grp] ?? C.sky}33` : "transparent"}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: i < step
                        ? GROUP_COLOR[grp] ?? C.sage
                        : i === step
                        ? GROUP_COLOR[grp] ?? C.blue
                        : "rgba(255,255,255,0.07)",
                      fontSize: 8,
                      color: i <= step ? "#fff" : "rgba(255,255,255,0.25)",
                      fontWeight: 700,
                    }}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      color:      i === step ? C.t.primary : i < step ? C.t.secondary : C.t.muted,
                      fontSize:   11.5,
                      fontWeight: i === step ? 600 : 400,
                    }}
                  >
                    {SCREENS[i].label}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 text-center pb-5 flex items-center gap-3"
        style={{ color: "rgba(237,242,247,0.2)", fontSize: 11 }}>
        <span>Anchor — Recovery support that doesn't shame you</span>
        <span>·</span>
        <span>Interactive prototype</span>
        <span>·</span>
        <span>Screen {step + 1} of {SCREENS.length}</span>
      </div>
    </div>
  );
}
