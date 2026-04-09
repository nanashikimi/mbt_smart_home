import { generateScenario } from './generator';
import { INITIAL_STATE } from './model';
import { runScenario } from './runner';

const SCENARIOS = 20;
const EVENTS_PER_SCENARIO = 50;
const BASE_SEED = 42_001;

function main(): void {
  let failed = 0;
  for (let i = 0; i < SCENARIOS; i++) {
    const seed = BASE_SEED + i;
    const events = generateScenario({ length: EVENTS_PER_SCENARIO, seed, initial: INITIAL_STATE });
    const result = runScenario(INITIAL_STATE, events);
    if (!result.ok) {
      failed++;
      console.error(
        `Mismatch seed=${seed} step=${result.firstMismatchIndex} after ${result.event}`,
      );
      console.error('trace', result.trace);
      console.error('expected', result.expected);
      console.error('actual  ', result.actual);
    }
  }
  if (failed === 0) {
    console.log(
      `MBT: ${SCENARIOS} scenarios × ${EVENTS_PER_SCENARIO} events — model vs system OK`,
    );
  } else {
    process.exitCode = 1;
  }
}

main();
