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
}

export interface PartPhase {
  start: number;
  end: number;
}

const ORDERED_PHASE_START = 0.08;
const ORDERED_PHASE_SPAN = 0.36;
const ORDERED_PHASE_DURATION = 0.34;

export function orderedPartPhase(order: number): PartPhase {
  const start = ORDERED_PHASE_START + ORDERED_PHASE_SPAN * clamp01(order);
  return { start, end: start + ORDERED_PHASE_DURATION };
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "skeleton",   pattern: /chassis[\s_-]?skeleton/i,                              distanceScale: 0.0 },
  { id: "screw",      pattern: /screw|^pin[-_]\d/i,                                    distanceScale: 1.4 },
  { id: "hinge",      pattern: /hinge|torsion/i,                                       distanceScale: 1.2 },
  { id: "deployable", pattern: /^panel\d/i,                                            distanceScale: 1.55 },
  { id: "panel",      pattern: /solar[\s_]panel/i,                                     distanceScale: 1.7 },
  { id: "topPlate",   pattern: /top[\s_]?plate|cover[\s_]plate|vedskin/i,              distanceScale: 1.5 },
  { id: "chassis",    pattern: /baseplate|bracket|skel[\s_]/i,                         distanceScale: 0.65 },
  { id: "standoff",   pattern: /standoff/i,                                            distanceScale: 0.95 },
  { id: "pcb",        pattern: /pcb|powerboard|mahogeneyboard|magnetorquer|comms|xcvr/i, distanceScale: 1.05 },
  { id: "isolator",   pattern: /vibration[\s_]isolator/i,                              distanceScale: 1.1 },
  { id: "burnwire",   pattern: /burnwire/i,                                            distanceScale: 1.65 },
  { id: "antenna",    pattern: /antenna/i,                                             distanceScale: 1.75 },
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

export function easeOrderedPhase(t: number): number {
  return t * t * (3 - 2 * t);
}

export function phaseProgress(progress: number, phase: PartPhase): number {
  if (phase.end <= phase.start) return 0;
  const t = clamp01((progress - phase.start) / (phase.end - phase.start));
  return easeOrderedPhase(t);
}

export const PART_DISTANCE_METERS = 0.18;
