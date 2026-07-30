"use client";

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  analyzeAudioFile,
  MAX_FILE_SIZE_BYTES,
  NOTE_NAMES,
  type AnalysisResult,
} from "@/lib/audio-analysis";

type Status = "idle" | "analyzing" | "done" | "error";

const ACCEPTED_EXT = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;

export function TrackAnalyzer() {
  const { t, links } = useLocale();
  const a = t.contact.analyzer;

  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("audio/") && !ACCEPTED_EXT.test(file.name)) {
        setStatus("error");
        setError(a.errorGeneric);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setStatus("error");
        setError(a.errorTooBig);
        return;
      }

      setFileName(file.name);
      setResult(null);
      setError("");
      setStatus("analyzing");

      // Let the "analyzing" UI paint before the heavy synchronous DSP work runs.
      await new Promise((resolve) => setTimeout(resolve, 30));

      try {
        const res = await analyzeAudioFile(file);
        setResult(res);
        setStatus("done");
      } catch {
        setStatus("error");
        setError(a.errorGeneric);
      }
    },
    [a.errorGeneric, a.errorTooBig],
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runAnalysis(file);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runAnalysis(file);
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const keyLabel = result
    ? `${NOTE_NAMES[result.rootIndex]} ${result.mode === "major" ? a.major : a.minor}`
    : "";

  return (
    <div className="analyzer-card rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 md:p-10">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[400px]">
          <span className="inline-block rounded-full border border-accent/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-accent">
            {a.badge}
          </span>
          <h3 className="mt-4 font-display text-2xl leading-tight tracking-[-0.01em] text-ink md:text-3xl">
            {a.title}
          </h3>
          <p className="mt-3 text-[14px] leading-[1.7] text-muted">{a.body}</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.1em] text-muted/50">
            {a.privacyNote}
          </p>
        </div>

        <div className="w-full md:max-w-[380px]">
          {status !== "done" && (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 text-center transition-colors ${
                dragOver ? "border-accent bg-accent/5" : "border-ink/20 hover:border-ink/35"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                className="hidden"
                onChange={onInputChange}
                disabled={status === "analyzing"}
              />

              {status === "analyzing" ? (
                <>
                  <span
                    className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-accent"
                    aria-hidden
                  />
                  <span className="text-[12px] uppercase tracking-[0.14em] text-muted">
                    {a.analyzing}
                  </span>
                  <span className="max-w-[220px] truncate text-[11px] text-muted/60">
                    {fileName}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="text-ink/40"
                  >
                    <path
                      d="M12 16V4m0 0L7 9m5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] tracking-[0.02em] text-ink">{a.dropTitle}</span>
                  <span className="text-[11px] uppercase tracking-[0.1em] text-muted/60">
                    {a.dropHint}
                  </span>
                </>
              )}
            </label>
          )}

          {status === "error" && <p className="mt-3 text-[12px] text-accent">{error}</p>}

          {status === "done" && result && (
            <div className="rounded-2xl border border-accent/30 bg-accent/[0.03] p-6">
              <p className="max-w-[220px] truncate text-[11px] uppercase tracking-[0.12em] text-muted/60">
                {fileName}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-6">
                <div>
                  <p className="font-display text-4xl tabular-nums text-ink">
                    {result.bpm || "—"}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {a.bpmLabel}
                  </p>
                </div>
                <div>
                  <p className="font-display text-4xl text-accent">{keyLabel}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {a.keyLabel}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-700"
                  style={{ width: `${Math.round(result.keyConfidence * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.1em] text-muted/50">
                {a.confidenceLabel}: {Math.round(result.keyConfidence * 100)}%
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={links.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-paper transition-colors hover:border-accent hover:bg-accent"
                >
                  {a.ctaAfter}
                </a>
                <button
                  type="button"
                  onClick={reset}
                  data-cursor
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {a.reset}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
