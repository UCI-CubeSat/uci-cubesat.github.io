export type CategoryId =
  | "screw"
  | "hinge"
  | "panel"
  | "topPlate"
  | "standoff"
  | "pcb"
  | "isolator"
  | "antenna"
  | "burnwire"
  | "deployable"
  | "skeleton"
  | "chassis";

interface CategoryConfig {
  id: CategoryId;
  pattern: RegExp;
  distanceScale: number;
  phase: { start: number; end: number };
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "skeleton",   pattern: /chassis[\s_-]?skeleton/i,                              distanceScale: 0.0, phase: { start: 0.00, end: 0.00 } },
  { id: "screw",      pattern: /screw|^pin[-_]\d/i,                                    distanceScale: 1.4, phase: { start: 0.10, end: 0.42 } },
  { id: "hinge",      pattern: /hinge|torsion/i,                                       distanceScale: 1.2, phase: { start: 0.10, end: 0.50 } },
  { id: "panel",      pattern: /solar[\s_]panel/i,                                     distanceScale: 1.7, phase: { start: 0.10, end: 0.68 } },
  { id: "deployable", pattern: /^panel\d/i,                                            distanceScale: 1.55, phase: { start: 0.10, end: 0.68 } },
  { id: "topPlate",   pattern: /top[\s_]?plate|cover[\s_]plate|vedskin/i,              distanceScale: 1.5, phase: { start: 0.18, end: 0.68 } },
  { id: "standoff",   pattern: /standoff/i,                                            distanceScale: 0.95, phase: { start: 0.28, end: 0.78 } },
  { id: "pcb",        pattern: /pcb|powerboard|mahogeneyboard|magnetorquer|comms|xcvr/i, distanceScale: 1.05, phase: { start: 0.30, end: 0.82 } },
  { id: "isolator",   pattern: /vibration[\s_]isolator/i,                              distanceScale: 1.1, phase: { start: 0.42, end: 0.90 } },
  { id: "antenna",    pattern: /antenna/i,                                             distanceScale: 1.75, phase: { start: 0.50, end: 0.96 } },
  { id: "burnwire",   pattern: /burnwire/i,                                            distanceScale: 1.65, phase: { start: 0.50, end: 0.96 } },
  { id: "chassis",    pattern: /baseplate|bracket|skel[\s_]/i,                         distanceScale: 0.65, phase: { start: 0.28, end: 0.78 } },
];

export function classify(name: string): CategoryId | null {
  for (const cat of CATEGORIES) {
    if (cat.pattern.test(name)) return cat.id;
  }
  return null;
}

export function categoryConfig(id: CategoryId): CategoryConfig {
  const c = CATEGORIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown category: ${id}`);
  return c;
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function phaseProgress(progress: number, id: CategoryId): number {
  const { phase } = categoryConfig(id);
  if (phase.end <= phase.start) return 0;
  const t = clamp01((progress - phase.start) / (phase.end - phase.start));
  return easeInOutCubic(t);
}

export const PART_DISTANCE_METERS = 0.18;
