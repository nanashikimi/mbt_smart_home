import { createActor, createMachine } from 'xstate';
import { describe, expect, it } from 'vitest';
import { mulberry32 } from './generator';

type Ev = { type: 'DOORBELL' } | { type: 'ANSWER' } | { type: 'REJECT' } | { type: 'OPEN' } | { type: 'TIMEOUT' } | { type: 'END' };
type EvType = Ev['type'];
const ALL: readonly EvType[] = ['DOORBELL', 'ANSWER', 'REJECT', 'OPEN', 'TIMEOUT', 'END'] as const;

function randomEvents(seed: number, len: number): EvType[] {
  const rnd = mulberry32(seed >>> 0);
  return Array.from({ length: len }, () => ALL[Math.floor(rnd() * ALL.length)]!);
}

describe('XState MBT example', () => {
  it('runs random event sequences', () => {
    const machine = createMachine({
      types: {} as { events: Ev },
      initial: 'idle',
      states: {
        idle: { on: { DOORBELL: 'ringing' } },
        ringing: { on: { ANSWER: 'inCall', REJECT: 'idle', TIMEOUT: 'idle' } },
        inCall: { on: { OPEN: 'doorOpen', END: 'idle' } },
        doorOpen: { on: { TIMEOUT: 'idle' } },
      },
    });
    const valid = new Set(['idle', 'ringing', 'inCall', 'doorOpen']);
    for (let seed = 1; seed <= 25; seed++) {
      const actor = createActor(machine).start();
      const seq = randomEvents(10_000 + seed, 60);
      for (const type of seq) {
        expect(() => actor.send({ type } as Ev)).not.toThrow();
        const value = String(actor.getSnapshot().value);
        expect(valid.has(value)).toBe(true);
      }
      actor.stop();
    }
  });
});
