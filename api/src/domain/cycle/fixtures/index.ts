import { anovulatory } from './anovulatory';
import { clean } from './clean';
import { configFlipBreaks, configFlipControl, configFlipStillConfirms } from './config-flip';
import { decimalAbove, decimalGrid, decimalOnLine } from './decimal-boundary';
import { disagreement } from './disagreement';
import { disturbed, disturbedIncluded, disturbedMovesWindow } from './disturbed';
import { falseShift } from './false-shift';
import { liveConfirmed, livePendingDay15, livePendingDay18 } from './live-pending';
import { lowData } from './low-data';
import { mucusOnly, tempOnly } from './single-signal';
import type { Fixture } from './types';

/** Every fixture runs through assessCycle in fixtures.test.ts. Add a file, add it here. */
export const FIXTURES: Fixture[] = [
  clean,
  anovulatory,
  lowData,
  disturbed,
  disturbedIncluded,
  disturbedMovesWindow,
  falseShift,
  disagreement,
  decimalOnLine,
  decimalAbove,
  decimalGrid,
  livePendingDay18,
  livePendingDay15,
  liveConfirmed,
  mucusOnly,
  tempOnly,
  configFlipStillConfirms,
  configFlipBreaks,
  configFlipControl,
];
