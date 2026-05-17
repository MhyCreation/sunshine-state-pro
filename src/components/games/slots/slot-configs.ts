import { SlotSymbol, LINES_9, LINES_15, LINES_20 } from "@/lib/slot-engine";

export type BonusKind = "free_spins" | "cascade" | "sticky_wilds" | "pick_bonus" | "storm";

export interface SlotConfig {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  emoji: string;
  rtp: string;
  maxWin: string;
  lineCount: number;
  symbols: SlotSymbol[];
  lines: number[][];
  theme: {
    headerGradient: string;
    reelBg: string;
    accentText: string;
    winText: string;
    borderActive: string;
    cabinetBg: string;
  };
  bonus: {
    kind: BonusKind;
    scatterCount: number;
    name: string;
    description: string;
    freeSpinCount?: number;
    expandingWilds?: boolean;
    cascadeSpins?: number;
    maxCascadeMult?: number;
    respinCount?: number;
    jackpotMult?: number;
    stormSpins?: number;
    stormMinMult?: number;
    stormMaxMult?: number;
    chestCount?: number;
  };
  buyBonusMult: number;
}

// ─── 1. Tropical Paradise ───────────────────────────────────────────────────
export const TROPICAL_PARADISE: SlotConfig = {
  id: "tropical-paradise",
  name: "Tropical Paradise",
  subtitle: "Free Spins + Expanding Wilds",
  tagline: "Expand into paradise",
  emoji: "🏖️",
  rtp: "96.5%",
  maxWin: "5,000×",
  lineCount: 15,
  lines: LINES_15,
  theme: {
    headerGradient: "from-teal-900 via-cyan-800 to-teal-900",
    reelBg: "bg-teal-950",
    accentText: "text-cyan-300",
    winText: "text-emerald-400",
    borderActive: "border-cyan-400/60",
    cabinetBg: "bg-teal-900/30 border-teal-600/40",
  },
  symbols: [
    { id: "palm",      emoji: "🌴", label: "Palm Tree",  weight: 30, pays: [3,  10,  30] },
    { id: "wave",      emoji: "🌊", label: "Wave",       weight: 27, pays: [4,  12,  35] },
    { id: "parrot",    emoji: "🦜", label: "Parrot",     weight: 22, pays: [6,  18,  50] },
    { id: "pineapple", emoji: "🍍", label: "Pineapple",  weight: 17, pays: [8,  25,  70] },
    { id: "flamingo",  emoji: "🦩", label: "Flamingo",   weight: 13, pays: [12, 40, 120] },
    { id: "fish",      emoji: "🐠", label: "Fish",       weight: 8,  pays: [20, 65, 200] },
    { id: "tstar",     emoji: "🌟", label: "Wild",       weight: 4,  pays: [30,100, 400], isWild: true },
    { id: "hibiscus",  emoji: "🌺", label: "Scatter",    weight: 5,  pays: [0,   0,   0], isScatter: true },
  ],
  bonus: {
    kind: "free_spins",
    scatterCount: 3,
    name: "Paradise Free Spins",
    description: "10 free spins — Wilds expand to fill their entire reel",
    freeSpinCount: 10,
    expandingWilds: true,
  },
  buyBonusMult: 100,
};

// ─── 2. Dragon Fortune ───────────────────────────────────────────────────────
export const DRAGON_FORTUNE: SlotConfig = {
  id: "dragon-fortune",
  name: "Dragon Fortune",
  subtitle: "Cascade Wins + Multipliers",
  tagline: "Unleash the dragon's rage",
  emoji: "🐉",
  rtp: "97.2%",
  maxWin: "8,888×",
  lineCount: 10,
  lines: LINES_9.slice(0, 10),
  theme: {
    headerGradient: "from-red-950 via-red-900 to-orange-950",
    reelBg: "bg-red-950",
    accentText: "text-amber-400",
    winText: "text-orange-400",
    borderActive: "border-amber-400/60",
    cabinetBg: "bg-red-900/30 border-red-700/40",
  },
  symbols: [
    { id: "bamboo",   emoji: "🎋", label: "Bamboo",   weight: 30, pays: [3,   8,  25] },
    { id: "lantern",  emoji: "🏮", label: "Lantern",  weight: 26, pays: [5,  14,  40] },
    { id: "card",     emoji: "🎴", label: "Tile",     weight: 21, pays: [7,  20,  55] },
    { id: "coin",     emoji: "🪙", label: "Coin",     weight: 16, pays: [10, 30,  90] },
    { id: "crystal",  emoji: "🔮", label: "Crystal",  weight: 11, pays: [15, 50, 150] },
    { id: "treasure", emoji: "💰", label: "Fortune",  weight: 6,  pays: [25, 80, 250] },
    { id: "dlight",   emoji: "⚡", label: "Wild",     weight: 4,  pays: [35,120, 500], isWild: true },
    { id: "dragon",   emoji: "🐉", label: "Scatter",  weight: 5,  pays: [0,   0,   0], isScatter: true },
  ],
  bonus: {
    kind: "cascade",
    scatterCount: 3,
    name: "Dragon Rage",
    description: "5 cascade spins — multiplier grows with each: 1× → 2× → 3× → 4× → 5×",
    cascadeSpins: 5,
    maxCascadeMult: 5,
  },
  buyBonusMult: 75,
};

// ─── 3. Space Odyssey ────────────────────────────────────────────────────────
export const SPACE_ODYSSEY: SlotConfig = {
  id: "space-odyssey",
  name: "Space Odyssey",
  subtitle: "Sticky Wilds Respins",
  tagline: "Lock in the cosmos",
  emoji: "🚀",
  rtp: "96.8%",
  maxWin: "10,000×",
  lineCount: 15,
  lines: LINES_15,
  theme: {
    headerGradient: "from-indigo-950 via-violet-900 to-indigo-950",
    reelBg: "bg-indigo-950",
    accentText: "text-violet-300",
    winText: "text-purple-300",
    borderActive: "border-violet-400/60",
    cabinetBg: "bg-indigo-900/30 border-indigo-700/40",
  },
  symbols: [
    { id: "earth",   emoji: "🌍", label: "Earth",   weight: 30, pays: [3,   9,  28] },
    { id: "saturn",  emoji: "🪐", label: "Saturn",  weight: 26, pays: [5,  14,  40] },
    { id: "comet",   emoji: "☄️", label: "Comet",   weight: 21, pays: [7,  20,  55] },
    { id: "ufo",     emoji: "🛸", label: "UFO",     weight: 15, pays: [11, 35, 100] },
    { id: "alien",   emoji: "👽", label: "Alien",   weight: 10, pays: [18, 55, 180] },
    { id: "rocket",  emoji: "🚀", label: "Rocket",  weight: 6,  pays: [28, 88, 280] },
    { id: "sparkle", emoji: "💫", label: "Wild",    weight: 4,  pays: [40,130, 600], isWild: true },
    { id: "wormhole",emoji: "🌀", label: "Scatter", weight: 5,  pays: [0,   0,   0], isScatter: true },
  ],
  bonus: {
    kind: "sticky_wilds",
    scatterCount: 3,
    name: "Cosmic Lock",
    description: "3 respins — wilds lock their reel; more wilds reset respins. All 5 locked = JACKPOT (200× bet)",
    respinCount: 3,
    jackpotMult: 200,
  },
  buyBonusMult: 80,
};

// ─── 4. Dead Man's Chest ─────────────────────────────────────────────────────
export const DEAD_MANS_CHEST: SlotConfig = {
  id: "dead-mans-chest",
  name: "Dead Man's Chest",
  subtitle: "Treasure Hunt Bonus",
  tagline: "Yo ho, pick your prize",
  emoji: "☠️",
  rtp: "96.1%",
  maxWin: "6,000×",
  lineCount: 9,
  lines: LINES_9,
  theme: {
    headerGradient: "from-slate-900 via-stone-800 to-slate-900",
    reelBg: "bg-stone-950",
    accentText: "text-amber-500",
    winText: "text-yellow-400",
    borderActive: "border-amber-500/60",
    cabinetBg: "bg-stone-900/30 border-stone-700/40",
  },
  symbols: [
    { id: "rum",     emoji: "🍺", label: "Rum",     weight: 30, pays: [4,  10,  28] },
    { id: "anchor",  emoji: "⚓", label: "Anchor",  weight: 26, pays: [5,  14,  38] },
    { id: "sword",   emoji: "🗡️", label: "Sword",   weight: 21, pays: [7,  20,  55] },
    { id: "map",     emoji: "🗺️", label: "Map",     weight: 15, pays: [12, 38, 110] },
    { id: "parrot2", emoji: "🦜", label: "Parrot",  weight: 10, pays: [18, 55, 160] },
    { id: "chest",   emoji: "💰", label: "Treasure",weight: 6,  pays: [28, 90, 260] },
    { id: "flag",    emoji: "🏴‍☠️",label: "Wild",    weight: 4,  pays: [40,130, 500], isWild: true },
    { id: "skull",   emoji: "💀", label: "Scatter", weight: 5,  pays: [0,   0,   0], isScatter: true },
  ],
  bonus: {
    kind: "pick_bonus",
    scatterCount: 3,
    name: "Treasure Hunt",
    description: "Pick from 9 treasure chests — collect coins, multipliers & keys. 3 keys = jackpot!",
    chestCount: 9,
  },
  buyBonusMult: 90,
};

// ─── 5. Thunder Strike ───────────────────────────────────────────────────────
export const THUNDER_STRIKE: SlotConfig = {
  id: "thunder-strike",
  name: "Thunder Strike",
  subtitle: "Storm Multiplier Spins",
  tagline: "Feel the lightning",
  emoji: "⚡",
  rtp: "97.0%",
  maxWin: "7,500×",
  lineCount: 20,
  lines: LINES_20,
  theme: {
    headerGradient: "from-yellow-950 via-amber-900 to-yellow-950",
    reelBg: "bg-zinc-950",
    accentText: "text-yellow-400",
    winText: "text-yellow-300",
    borderActive: "border-yellow-400/60",
    cabinetBg: "bg-zinc-900/30 border-zinc-700/40",
  },
  symbols: [
    { id: "shield",   emoji: "🛡️", label: "Shield",   weight: 28, pays: [3,   8,  22] },
    { id: "axe",      emoji: "🪓", label: "Axe",      weight: 24, pays: [4,  11,  30] },
    { id: "eagle",    emoji: "🦅", label: "Eagle",    weight: 20, pays: [6,  17,  48] },
    { id: "urn",      emoji: "🏺", label: "Urn",      weight: 15, pays: [9,  28,  80] },
    { id: "trident",  emoji: "🔱", label: "Trident",  weight: 10, pays: [14, 45, 135] },
    { id: "bolt",     emoji: "⚡", label: "Bolt",     weight: 6,  pays: [22, 72, 220] },
    { id: "blast",    emoji: "💥", label: "Wild",     weight: 4,  pays: [35,115, 450], isWild: true },
    { id: "storm",    emoji: "🌩️", label: "Scatter",  weight: 5,  pays: [0,   0,   0], isScatter: true },
  ],
  bonus: {
    kind: "storm",
    scatterCount: 3,
    name: "Storm Mode",
    description: "6 free spins — every win is struck by lightning for a 3×–10× random multiplier",
    stormSpins: 6,
    stormMinMult: 3,
    stormMaxMult: 10,
  },
  buyBonusMult: 60,
};

export const ALL_SLOTS: SlotConfig[] = [
  TROPICAL_PARADISE,
  DRAGON_FORTUNE,
  SPACE_ODYSSEY,
  DEAD_MANS_CHEST,
  THUNDER_STRIKE,
];

export function getSlotConfig(id: string): SlotConfig | undefined {
  return ALL_SLOTS.find((s) => s.id === id);
}
