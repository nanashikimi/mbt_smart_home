import { applyEvent, type State } from '../model';
import type { Event } from '../model';
import { mulberry32 } from './mulberry32';

export interface ScenarioOptions {
  // Number of events in the generated chain.
  length: number;
  // RNG seed; the same seed yields the same scenario.
  seed?: number;
  // Initial state for state-aware generation.
  initial: State;
}

// Builds a pseudo-random event sequence (no hand-written test cases).
export function generateScenario(options: ScenarioOptions): Event[] {
  const { length, seed = Date.now(), initial } = options;
  const rnd = mulberry32(seed >>> 0);
  const out: Event[] = [];
  let s: State = { ...initial };
  for (let i = 0; i < length; i++) {
    const e = pickStateAwareEvent(s, rnd);
    out.push(e);
    s = applyEvent(s, e);
  }
  return out;
}

type WeightedEvent = { event: Event; weight: number };

function pickStateAwareEvent(state: State, rnd: () => number): Event {
  const weighted: WeightedEvent[] = [
    { event: 'userArrives', weight: state.presence === 'AWAY' ? 4 : 0.25 },
    { event: 'userLeaves', weight: state.presence === 'HOME' ? 3 : 0.25 },
    { event: 'nightFalls', weight: state.time === 'DAY' ? 2 : 0.25 },
    { event: 'dayBreaks', weight: state.time === 'NIGHT' ? 2 : 0.25 },
    {
      event: 'motionDetected',
      weight:
        state.presence === 'HOME' && state.time === 'NIGHT'
          ? 4
          : state.presence === 'HOME'
            ? 1
            : 0.1,
    },
    { event: 'userSleeps', weight: state.activity === 'AWAKE' ? 1.5 : 0.1 },
    { event: 'userWakesUp', weight: state.activity === 'SLEEPING' ? 2.5 : 0.1 },
  ];
// weighted random selection
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let r = rnd() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.event;
  }
  return weighted[weighted.length - 1]!.event;
}
