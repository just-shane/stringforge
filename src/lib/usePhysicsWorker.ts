// ─── Hook: offload physics to Web Worker ───────────────────────
// Uses a Web Worker when available, falls back to main-thread computation.

import { useEffect, useRef, useState, useMemo } from "react";
import { computePhysics, type SimParams, type Weight, type PhysicsResult } from "./physics.ts";
import type { WorkerRequest, WorkerResponse } from "./physics.worker.ts";

export function usePhysicsWorker(params: SimParams, weights: Weight[]): PhysicsResult {
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const [workerResult, setWorkerResult] = useState<PhysicsResult | null>(null);
  const [workerReady, setWorkerReady] = useState(false);

  // Initialize worker
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL("./physics.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        setWorkerResult(e.data.result);
      };
      worker.onerror = () => {
        // Worker failed — fall back to main thread
        workerRef.current = null;
        setWorkerReady(false);
      };
      workerRef.current = worker;
      setWorkerReady(true);

      return () => worker.terminate();
    } catch {
      // Workers not available
      setWorkerReady(false);
    }
  }, []);

  // Post to worker on param changes
  useEffect(() => {
    if (workerRef.current && workerReady) {
      idRef.current++;
      const msg: WorkerRequest = {
        id: idRef.current,
        params,
        weights,
      };
      workerRef.current.postMessage(msg);
    }
  }, [params, weights, workerReady]);

  // Fallback: main-thread computation (used when worker isn't ready or for initial render)
  const mainThreadResult = useMemo(() => computePhysics(params, weights), [params, weights]);

  // Use worker result if available, otherwise main-thread
  return workerResult ?? mainThreadResult;
}
