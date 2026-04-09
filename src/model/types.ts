export type Presence = 'HOME' | 'AWAY';
export type TimeOfDay = 'DAY' | 'NIGHT';
export type Motion = 'DETECTED' | 'NONE';
export type Light = 'ON' | 'OFF';

export interface State {
  presence: Presence;
  time: TimeOfDay;
  motion: Motion;
  light: Light;
}

export type Event =
  | 'userArrives'
  | 'userLeaves'
  | 'nightFalls'
  | 'dayBreaks'
  | 'motionDetected';

export const ALL_EVENTS: readonly Event[] = [
  'userArrives',
  'userLeaves',
  'nightFalls',
  'dayBreaks',
  'motionDetected',
] as const; // to fix: both readonly and as const at the same time is over than enough
