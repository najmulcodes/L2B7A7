"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";

// Sample data only — clearly a demo, not a live attempt. Mirrors exactly
// how a real MCQ is scored in the product: instantly, on selection, no
// manual review step (that's reserved for WRITTEN/CODING questions).
const QUESTION = {
  title: "React Hooks — Round 1",
  prompt: "Which hook runs your code after React has committed changes to the DOM?",
  options: [
    { id: "a", text: "useMemo" },
    { id: "b", text: "useEffect" },
    { id: "c", text: "useRef" },
    { id: "d", text: "useCallback" },
  ],
  correctId: "b",
};

type Stage = "question" | "scoring" | "result";

function useCountUp(target: number, active: boolean, durationMs = 700) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    startRef.current = null;
    let frame: number;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const progress = Math.min(1, (t - startRef.current) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs]);

  return value;
}

export function InteractiveDemo() {
  const [stage, setStage] = useState<Stage>("question");
  const [selected, setSelected] = useState<string | null>(null);

  const passed = selected === QUESTION.correctId;
  const percent = useCountUp(passed ? 100 : 0, stage === "result");

  const choose = (optionId: string) => {
    if (stage !== "question") return;
    setSelected(optionId);
    setStage("scoring");
    window.setTimeout(() => setStage("result"), 650);
  };

  const reset = () => {
    setSelected(null);
    setStage("question");
  };

  return (
    <div className="surface-grain w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-ink-panel font-mono text-[13px] shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 text-white/40">demo_attempt.tsx</span>
        </div>
        <span className="text-[11px] text-white/30">try it — no login</span>
      </div>

      <div className="min-h-[280px] px-5 py-6">
        <AnimatePresence mode="wait">
          {stage === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-white/40">{QUESTION.title} · MCQ</p>
              <p className="mt-3 font-sans text-[15px] leading-snug text-white/90">{QUESTION.prompt}</p>
              <div className="mt-5 space-y-2">
                {QUESTION.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => choose(opt.id)}
                    className="block w-full rounded-lg border border-white/10 px-3 py-2.5 text-left font-sans text-white/75 transition-colors duration-150 hover:border-signal-500/50 hover:bg-signal-500/10 hover:text-white"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "scoring" && (
            <motion.div
              key="scoring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-white/50"
            >
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.65, repeat: Infinity }}
              >
                scoring…
              </motion.span>
            </motion.div>
          )}

          {stage === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-white/40">{QUESTION.title}</p>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                    passed ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                  }`}
                >
                  {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {passed ? "PASSED" : "NOT PASSED"}
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-white">{percent}%</span>
                <span className="text-white/40">{passed ? "1 / 1 pts" : "0 / 1 pts"}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-signal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-sans text-white/70">Which hook runs after DOM commit?</p>
                  <span className="shrink-0 text-white/50">{passed ? "1/1" : "0/1"}</span>
                </div>
                <p className="mt-1 font-sans text-[12px] text-white/35">
                  {passed ? "Correct — useEffect." : `You picked ${QUESTION.options.find((o) => o.id === selected)?.text}. Correct answer: useEffect.`}
                </p>
              </div>

              <button
                onClick={reset}
                className="mt-5 flex items-center gap-1.5 text-[12px] text-white/40 transition-colors hover:text-white/70"
              >
                <RotateCcw className="h-3 w-3" /> try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
