import type { Event, State } from './types';

// Reference behaviour for MBT: model transitions.
// Rules: userLeaves → light OFF; day → light OFF; AWAY → light never ON;
// HOME + NIGHT + motion → light ON.
export function applyEvent(state: State, event: Event): State {
  let next: State = { ...state }; // copy all fields
  switch (event) {
    case 'userArrives':
      next.presence = 'HOME';
      next.motion = 'NONE';
      break;
    case 'userLeaves':
      next.presence = 'AWAY';
      next.light = 'OFF';
      next.motion = 'NONE';
      break;
    case 'nightFalls':
      next.time = 'NIGHT';
      next.motion = 'NONE';
      break;
    case 'dayBreaks':
      next.time = 'DAY';
      next.light = 'OFF';
      next.motion = 'NONE';
      break;
    case 'motionDetected':
      next.motion = 'DETECTED';
      break;
  }
  next = applyLightRules(next);
  return next;
}

function applyLightRules(s: State): State {
  if (s.presence === 'AWAY') {
    return { ...s, light: 'OFF' };
  }
  if (s.time === 'DAY') {
    return { ...s, light: 'OFF' };
  }
  if (s.motion === 'DETECTED') {
    return { ...s, light: 'ON' };
  }
  return { ...s, light: 'OFF' };
}
