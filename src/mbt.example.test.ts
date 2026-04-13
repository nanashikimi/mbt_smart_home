import { describe, expect, it } from 'vitest';
import { generateScenario } from './generator';
import { applyEvent, INITIAL_STATE } from './model';
import { runScenario } from './runner';

describe('MBT Smart Home', () => {
  it('matches model and system on random scenarios', () => {
    for (let seed = 0; seed < 30; seed++) {
      const events = generateScenario({ length: 100, seed, initial: INITIAL_STATE });
      const r = runScenario(INITIAL_STATE, events);
      expect(r.ok, `seed ${seed}`).toBe(true);
    }
  });
  it('example trace: night → motion → day', () => {
    const events = ['nightFalls', 'motionDetected', 'dayBreaks'] as const;
    let s = INITIAL_STATE;
    for (const e of events) {
      s = applyEvent(s, e);
    }
    expect(s).toMatchObject({
      presence: 'HOME',
      time: 'DAY',
      motion: 'NONE',
      light: 'OFF',
      activity: 'AWAKE',
    });
  });

  it('does not turn light on when resident is sleeping', () => {
    const events = ['nightFalls', 'userSleeps', 'motionDetected'] as const;
    let s = INITIAL_STATE;
    for (const e of events) {
      s = applyEvent(s, e);
    }
    expect(s).toMatchObject({
      time: 'NIGHT',
      activity: 'SLEEPING',
      motion: 'DETECTED',
      light: 'OFF',
    });
  });
});
