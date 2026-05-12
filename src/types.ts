// ===== Core data types =====

/** A generated question / problem. The `divisor` field is the second operand
 *  regardless of operator (÷, +, −, ×), kept for historical naming. */
export interface Question {
  dividend: number | string;
  divisor: number | string;
  ans: number | string | DecompAddAnswer;
  symbol: string;
}

export interface DecompAddAnswer {
  tens: number;
  units: number;
  total: number;
}

export interface CheckResult {
  ok: boolean;
  display: string;
  exactAns?: string;
  errorRate?: string;
  exactDividend?: string;
}

// ===== Game mode configuration =====

export interface GameModeConfig {
  name: string;
  title?: string;
  hintNote?: string;
  hint?: string;
  isSmallFont?: boolean;
  gen?: (count: number, extra?: GameGenExtra) => Question[];
  check?: (
    userValue: number,
    targetAnswer: Question['ans'],
    inputStr?: string,
    inputArray?: string[],
  ) => CheckResult;
}

export interface GameGenExtra {
  divisor?: number;
}

export interface ModeGroup {
  label: string;
  modes: string[];
}

// ===== History / persistence =====

export interface ResultItem {
  q: string;
  ok: boolean;
  yourAns: string;
  realAns: string;
  usedStr: string;
  exactAns?: string;
  errorRate?: string;
  exactDividend?: string;
  detailTimes?: string;
}

export interface TrainLogItem {
  q: string;
  usedStr: string;
  wrong: number;
  skipped: boolean;
}

export type DetailItem = ResultItem | TrainLogItem;

export interface HistoryRecord {
  ts: number;
  timeStr: string;
  mode: string;
  modeName: string;
  duration: string;
  summary: string;
  detail: DetailItem[];
}

export interface BuildRecordPayload {
  modeKey: string;
  modeName: string;
  totalSec: number;
  summary: string;
  detail: DetailItem[];
}

// ===== 3D / Three.js =====

export interface SliceConfig {
  constant: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

export interface ExamShapeDef {
  name: string;
  create: () => THREE.BufferGeometry;
}

// Import THREE for the shape def but keep it lightweight.
import type * as THREE from 'three';

// ===== View state =====

export type ViewState = 'home' | 'selectDivisor' | 'game' | 'result' | 'history' | 'cubic';

// ===== Mode key (for future refinement) =====

export type ModeKey = string;
