import { applyEvent, type State } from '../model';
import type { Event } from '../model';
import { systemStep } from '../system';

export interface RunScenarioResult {
  ok: boolean;
  steps: number;
  // Full event list used for run.
  events: readonly Event[];
  // When ok is false, thn index of the first mismatching step.
  firstMismatchIndex?: number;
  expected?: State;
  actual?: State;
  // Key event after which model and system diverged.
  event?: Event;
  // Prefix of events up to and including(]) the failing one (only when ok is false).
  trace?: readonly Event[];
}

function statesEqual(a: State, b: State): boolean {
  return (
    a.presence === b.presence &&
    a.time === b.time &&
    a.motion === b.motion &&
    a.light === b.light &&
    a.activity === b.activity
  );
}

// Runs the scenario through the model and the system, compares state after every step.
export function runScenario(
  initial: State,
  events: readonly Event[],
): RunScenarioResult {
  let model = { ...initial };
  let system = { ...initial };
  for (let i = 0; i < events.length; i++) {
    const e = events[i]!; // index should be defined
    model = applyEvent(model, e);
    system = systemStep(system, e);
    if (!statesEqual(model, system)) {
      return {
        ok: false,
        steps: i + 1,
        events,
        firstMismatchIndex: i,
        expected: model,
        actual: system,
        event: e,
        trace: events.slice(0, i + 1),
      };
    }
  }
  return { ok: true, steps: events.length, events };
}
