// Shared slot machine engine — symbols, grid generation, payline evaluation

export interface SlotSymbol {
  id: string;
  emoji: string;
  label: string;
  weight: number;
  pays: [number, number, number]; // multipliers for 3, 4, 5 match
  isWild?: boolean;
  isScatter?: boolean;
}

export type Grid = string[][]; // [col][row], col 0..4, row 0..2

export function pickSymbol(symbols: SlotSymbol[], excludeScatter = false): string {
  const pool = excludeScatter ? symbols.filter((s) => !s.isScatter) : symbols;
  const total = pool.reduce((s, sym) => s + sym.weight, 0);
  let r = Math.random() * total;
  for (const sym of pool) {
    r -= sym.weight;
    if (r <= 0) return sym.id;
  }
  return pool[0].id;
}

export function makeGrid(symbols: SlotSymbol[], cols = 5, rows = 3): Grid {
  return Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => pickSymbol(symbols))
  );
}

export const LINES_9: number[][] = [
  [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2], [2, 2, 1, 0, 0],
  [1, 0, 1, 0, 1], [1, 2, 1, 2, 1],
];

export const LINES_15: number[][] = [
  ...LINES_9,
  [0, 1, 1, 1, 0], [2, 1, 1, 1, 2],
  [0, 0, 1, 0, 0], [2, 2, 1, 2, 2],
  [1, 1, 0, 1, 1], [1, 1, 2, 1, 1],
];

export const LINES_20: number[][] = [
  ...LINES_15,
  [0, 1, 2, 1, 2], [2, 1, 0, 1, 0],
  [0, 0, 0, 1, 2], [2, 2, 2, 1, 0],
  [1, 0, 2, 0, 1],
];

export interface LineWin {
  lineIdx: number;
  symbolId: string;
  count: number;
  amount: number;
  positions: [number, number][];
}

export function evalPaylines(
  grid: Grid,
  symbols: SlotSymbol[],
  lines: number[][],
  betPerLine: number,
  multiplier = 1
): { total: number; wins: LineWin[] } {
  const symMap = new Map(symbols.map((s) => [s.id, s]));
  const wildId = symbols.find((s) => s.isWild)?.id;
  const scatterId = symbols.find((s) => s.isScatter)?.id;
  let total = 0;
  const wins: LineWin[] = [];

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const ids = line.map((row, col) => grid[col][row]);

    let baseId =
      ids[0] === wildId
        ? (ids.find((id) => id !== wildId && id !== scatterId) ?? ids[0])
        : ids[0];

    const baseSym = symMap.get(baseId);
    if (!baseSym || baseSym.isScatter) continue;

    let count = 0;
    const positions: [number, number][] = [];
    for (let col = 0; col < ids.length; col++) {
      const id = ids[col];
      if (id === baseId || id === wildId) {
        count++;
        positions.push([col, line[col]]);
      } else break;
    }

    if (count >= 3) {
      const mult = baseSym.pays[count - 3] ?? 0;
      if (mult > 0) {
        const amount = Math.round(betPerLine * mult * multiplier);
        total += amount;
        wins.push({ lineIdx: li, symbolId: baseId, count, amount, positions });
      }
    }
  }

  return { total, wins };
}

export function countSymbol(grid: Grid, symbolId: string): number {
  return grid.flat().filter((id) => id === symbolId).length;
}

export function expandWildsInGrid(grid: Grid, wildId: string): Grid {
  return grid.map((col) =>
    col.some((id) => id === wildId) ? col.map(() => wildId) : col
  );
}
