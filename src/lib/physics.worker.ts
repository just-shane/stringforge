// ─── Web Worker for physics calculations ───────────────────────
// Offloads computePhysics to a separate thread to keep UI responsive.
// Falls back to main thread if Workers are unavailable.

import { computePhysics, type SimParams, type Weight, type PhysicsResult } from "./physics.ts";

export interface WorkerRequest {
  id: number;
  params: SimParams;
  weights: Weight[];
}

export interface WorkerResponse {
  id: number;
  result: PhysicsResult;
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, params, weights } = e.data;
  const result = computePhysics(params, weights);
  (self as unknown as Worker).postMessage({ id, result } satisfies WorkerResponse);
};
