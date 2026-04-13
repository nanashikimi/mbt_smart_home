import type { Event, State } from '../model';

// System under test: separate from model/. Break a rule here to see MBT fail.
export function systemStep(state: State, event: Event): State {
  // Different structure than the model: event reducer + derived light.
  const next = reduceEvent(state, event);
  const derivedLight = deriveLight(next);
  return next.light === derivedLight ? next : { ...next, light: derivedLight }; // less allocs, less trash
}

function reduceEvent(state: State, event: Event): State {
  switch (event) {
    case 'userArrives':
      return { ...state, presence: 'HOME', motion: 'NONE' };
    case 'userLeaves':
      return { ...state, presence: 'AWAY', motion: 'NONE', light: 'OFF' };
    case 'nightFalls':
      return { ...state, time: 'NIGHT', motion: 'NONE' };
    case 'dayBreaks':
      return { ...state, time: 'DAY', motion: 'NONE', light: 'OFF' };
    case 'motionDetected':
      return { ...state, motion: 'DETECTED' };
    case 'userSleeps':
      return { ...state, activity: 'SLEEPING', motion: 'NONE' };
    case 'userWakesUp':
      return { ...state, activity: 'AWAKE', motion: 'NONE' };
  }
}

function deriveLight(s: State): State['light'] {
  if (s.presence === 'AWAY') return 'OFF';
  if (s.activity === 'SLEEPING') return 'OFF';
  if (s.time === 'DAY') return 'OFF';
  return s.motion === 'DETECTED' ? 'ON' : 'OFF';
}
