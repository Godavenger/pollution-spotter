"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { PublicReport } from "@/lib/contracts";
import { buildComplaint } from "@/lib/complaint";
import "./complaint.css";

export function ComplaintEditor({ report }: { report: PublicReport }) {
  return <Editor key={`${report.id}:${report.published_at}`} report={report} />;
}

function Editor({ report }: { report: PublicReport }) {
  const textId = useId();
  const [text, setText] = useState(() => buildComplaint(report));
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const textarea = useRef<HTMLTextAreaElement>(null);

  async function copyComplaint() {
    if (copyStatus === "copying") return;
    const copiedText = text;
    setCopyStatus("copying");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(copiedText);
      if (textarea.current?.value === copiedText) setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
      textarea.current?.focus();
      textarea.current?.select();
    }
  }

  return (
    <section className="complaint-editor" aria-labelledby={`${textId}-heading`}>
      <div className="complaint-heading">
        <div>
          <h3 id={`${textId}-heading`}>Your complaint draft</h3>
          <p>Review the wording and recipient, then send it yourself.</p>
        </div>
      </div>
      {report.is_demo && (
        <p className="complaint-sample-note">This sample complaint is for demonstration only.</p>
      )}
      <label htmlFor={textId}>Edit your message</label>
      <textarea
        ref={textarea}
        id={textId}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setCopyStatus("idle");
        }}
        rows={12}
        spellCheck
      />
      <div className="complaint-actions">
        <button
          type="button"
          className="complaint-copy"
          onClick={copyComplaint}
          disabled={!text.trim() || copyStatus === "copying"}
        >
          {copyStatus === "copied" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copyStatus === "copied" ? "Copied" : copyStatus === "copying" ? "Copying…" : "Copy complaint"}
        </button>
        <p role="status" aria-live="polite">
          {copyStatus === "copied" && "Copied to clipboard."}
          {copyStatus === "failed" && "Copy was unavailable. Your text is selected; use your device’s Copy command."}
          {copyStatus === "idle" && "Edits stay on this page."}
        </p>
      </div>
    </section>
  );
}
