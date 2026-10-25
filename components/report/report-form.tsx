"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, Camera, LocateFixed, MapPin, LockKeyhole, RotateCcw, ImagePlus } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, LABELS, LABEL_NAMES, SOURCE_NAMES, publishSchema, type DraftReport, type Label, type PublicReport, type ServiceStatus } from "@/lib/contracts";
import { imageInputError, parseCoordinates } from "@/lib/report-input";
import { getSessionToken } from "@/lib/supabase/browser";
import { LocationPicker } from "@/components/map/location-picker";
import { ComplaintEditor } from "@/components/complaint/complaint-editor";

type Stage = "capture" | "review" | "published";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(url, { ...init, cache: "no-store" }); }
  catch { throw new Error("The connection was interrupted. Your report has not been confirmed. Please try again."); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "The report could not be saved. Please try again.");
  if (!payload) throw new Error("The server returned an unreadable response. Please try again.");
  return payload as T;
}

export function ReportForm({ onPublished }: { onPublished: () => void }) {
  const [stage, setStage] = useState<Stage>("capture");
  const [service, setService] = useState<ServiceStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [statusAttempt, setStatusAttempt] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [draft, setDraft] = useState<DraftReport | null>(null);
  const [localPreview, setLocalPreview] = useState(false);
  const [labels, setLabels] = useState<Label[]>(["unclear"]);
  const [evidence, setEvidence] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [published, setPublished] = useState<PublicReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const previewUrl = useRef("");
  const submitting = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const locationRequest = useRef(0);
  const coordinates = parseCoordinates(latitude, longitude);

  useEffect(() => {
    const controller = new AbortController();
    requestJson<ServiceStatus>("/api/status", { signal: controller.signal })
      .then((status) => { if (!controller.signal.aborted) { setService(status); setStatusError(false); } })
      .catch(() => { if (!controller.signal.aborted) setStatusError(true); });
    return () => controller.abort();
  }, [statusAttempt]);
  useEffect(() => () => { URL.revokeObjectURL(previewUrl.current); locationRequest.current += 1; }, []);
  useEffect(() => { if (stage !== "capture") heading.current?.focus(); }, [stage]);

  function selectFile(nextFile?: File) {
    if (!nextFile || busy) return;
    const validation = imageInputError(nextFile);
    setFileError(validation || "");
    if (validation) return;
    URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(nextFile);
    setPreview(previewUrl.current);
    setFile(nextFile);
    setError("");
  }

  function chooseLocation(lat: number, lng: number) {
    locationRequest.current += 1;
    setLocating(false);
    setLatitude(lat.toFixed(6)); setLongitude(lng.toFixed(6));
    setLocationError(""); setReviewed(false);
  }

  function locate() {
    if (!navigator.geolocation) { setLocationError("Location is unavailable in this browser. Enter coordinates or choose a point on the map."); return; }
    const request = ++locationRequest.current;
    setLocating(true); setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { if (request === locationRequest.current) chooseLocation(coords.latitude, coords.longitude); },
      (failure) => {
        if (request !== locationRequest.current) return;
        setLocating(false);
        setLocationError(failure.code === 1 ? "Location access was not allowed. You can choose a point on the map or enter coordinates." : "We couldn’t find your location. Choose a point on the map or enter coordinates.");
      },
      { timeout: 10000, maximumAge: 30000, enableHighAccuracy: false },
    );
  }

  async function createDraft(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    if (!file || fileError) { setError("Choose a supported photo before continuing."); return; }
    if (!coordinates) { setError("Enter a valid latitude (−90 to 90) and longitude (−180 to 180), or choose a point on the map."); return; }
    if (!service) { setError("The reporting service hasn’t been checked yet. Try checking the connection again."); return; }
    locationRequest.current += 1; setLocating(false);
    submitting.current = true; setBusy(true);
    try {
      let nextDraft: DraftReport;
      const isLocal = !service.configured;
      if (isLocal) {
        nextDraft = { id: crypto.randomUUID(), ...coordinates, labels: ["unclear"], evidence: "", analysis_source: "manual_fallback", is_demo: true, status: "needs_review" };
      } else {
        const token = await getSessionToken();
        const data = new FormData();
        data.append("image", file); data.append("latitude", String(coordinates.latitude)); data.append("longitude", String(coordinates.longitude));
        nextDraft = (await requestJson<{ report: DraftReport }>("/api/reports", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: data })).report;
      }
      setDraft(nextDraft); setLocalPreview(isLocal); setLabels(nextDraft.labels);
      setEvidence(nextDraft.analysis_source === "manual_fallback" ? "" : nextDraft.evidence);
      setReviewed(false); setShowPicker(false); setStage("review");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The draft could not be saved. Please try again."); }
    finally { submitting.current = false; setBusy(false); }
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || !draft || localPreview) return;
    setError("");
    const parsed = publishSchema.safeParse({ action: "publish", labels, evidence, ...coordinates, reviewed });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "Check your labels, description, and location."); return; }
    submitting.current = true; setBusy(true);
    try {
      const token = await getSessionToken();
      const { report } = await requestJson<{ report: PublicReport }>(`/api/reports/${draft.id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setPublished(report); setStage("published"); onPublished();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Publication was not confirmed. You can try again on this same draft."); }
    finally { submitting.current = false; setBusy(false); }
  }

  function toggleLabel(label: Label) {
    setReviewed(false);
    setLabels((current) => {
      if (current.includes(label)) return current.filter((value) => value !== label);
      if (label === "unclear" || label === "no_visible_pollution") return [label];
      return [...current.filter((value) => value !== "unclear" && value !== "no_visible_pollution"), label];
    });
  }

  function reset() {
    URL.revokeObjectURL(previewUrl.current); previewUrl.current = "";
    setFile(null); setPreview(""); setFileError(""); setDraft(null); setPublished(null);
    setEvidence(""); setLabels(["unclear"]); setReviewed(false); setError(""); setStage("capture");
    setLocalPreview(false); setShowPicker(false);
  }

  const locationFields = <fieldset className="location-fields" disabled={busy}>
    <legend>Observation location</legend>
    <div className="coordinate-row">
      <label htmlFor="latitude">Latitude<input id="latitude" name="latitude" inputMode="decimal" autoComplete="off" value={latitude} placeholder="e.g. 22.5726" onChange={(event) => { locationRequest.current += 1; setLocating(false); setLatitude(event.target.value); setReviewed(false); }} /></label>
      <label htmlFor="longitude">Longitude<input id="longitude" name="longitude" inputMode="decimal" autoComplete="off" value={longitude} placeholder="e.g. 88.3639" onChange={(event) => { locationRequest.current += 1; setLocating(false); setLongitude(event.target.value); setReviewed(false); }} /></label>
    </div>
    <div className="location-actions"><button type="button" className="text-button" onClick={locate} disabled={locating}><LocateFixed size={15} />{locating ? "Finding location…" : "Use my location"}</button><button type="button" className="text-button" onClick={() => setShowPicker(!showPicker)} aria-expanded={showPicker}><MapPin size={15} />{showPicker ? "Hide map" : "Choose on map"}</button></div>
    {locationError && <p className="field-error" role="alert">{locationError}</p>}
    {showPicker && <LocationPicker latitude={coordinates?.latitude ?? null} longitude={coordinates?.longitude ?? null} onChange={chooseLocation} disabled={busy} />}
  </fieldset>;

  return <div className="report-flow" aria-busy={busy}>
    <ol className="stepper" aria-label="Report progress">{["Observe", "Review", "Share"].map((label, index) => {
      const step = ["capture", "review", "published"].indexOf(stage);
      return <li key={label} aria-current={step === index ? "step" : undefined} className={step >= index ? "step-reached" : ""}><span>{step > index ? <Check size={12} /> : index + 1}</span>{label}</li>;
    })}</ol>

    {stage === "capture" && <form onSubmit={createDraft} noValidate>
      <div className="section-heading"><h2 ref={heading} tabIndex={-1}>Make an observation</h2><p>One photo. A location. Your perspective.</p></div>
      <fieldset disabled={busy} className="photo-fieldset"><legend className="sr-only">Observation photo</legend>
        <input ref={fileInput} className="sr-only" tabIndex={-1} type="file" id="photo" accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={(event) => selectFile(event.target.files?.[0])} aria-describedby="photo-help photo-error" />
        <button className={`photo-picker ${preview ? "has-photo" : ""}`} type="button" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files.length > 1) { setFileError("Choose one photo at a time."); return; } selectFile(event.dataTransfer.files[0]); }} aria-label={preview ? "Change observation photo" : "Choose observation photo"}>
          {preview ? <>
            {/* Blob URLs are local previews and must not pass through the image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Your selected water observation" onError={() => setFileError("This photo cannot be opened. Please choose another image.")} />
            <span className="change-photo"><ImagePlus size={15} /> Change photo</span>
          </> : <><Camera size={28} strokeWidth={1.4} /><strong>Choose a photo</strong><span>or drop it here</span></>}
        </button>
        <div className="photo-meta"><span id="photo-help">JPEG, PNG, or WebP · up to 3 MB</span><LockKeyhole size={12} aria-label="Private photo" /></div>
        {file && <p className="file-name">{file.name}</p>}
        <p id="photo-error" className="field-error" role="alert">{fileError}</p>
      </fieldset>
      {locationFields}
      {statusError ? <p className="connection-note">The connection check failed. <button type="button" className="inline-button" onClick={() => { setStatusError(false); setStatusAttempt((value) => value + 1); }}>Try again</button></p>
        : !service ? <p className="connection-note" role="status">Checking reporting availability…</p>
        : !service.configured ? <p className="connection-note">Publishing isn’t connected yet. You can try an unsaved preview; your photo stays in this browser.</p>
        : service.visionMode === "mock" ? <p className="connection-note">Sample mode is on. This report will appear only in Samples.</p>
        : <p className="connection-note"><LockKeyhole size={13} /> Your photo stays private. You decide what gets shared.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary full-width" type="submit" disabled={busy || !service}>{busy ? "Saving and preparing review…" : service && !service.configured ? "Try a local preview" : "Save & review"}<ArrowRight size={16} /></button>
      <p className="button-note">You’ll review the details before anything is published.</p>
    </form>}

    {stage === "review" && draft && <form onSubmit={publish} noValidate>
      <div className="section-heading"><h2 ref={heading} tabIndex={-1}>Check what you can see</h2><p>{localPreview ? "Local preview · not saved or published" : draft.analysis_source === "vision" ? "An AI suggestion, ready for your review." : draft.is_demo ? "A sample suggestion, ready for your review." : "Describe the photo in your own words."}</p></div>
      {preview && <div className="review-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Photo to review before publication" />
        <span><LockKeyhole size={12} /> Private photo</span>
      </div>}
      {draft.analysis_source === "manual_fallback" && !localPreview && <p className="connection-note">No AI assessment is available. Your own observation is enough to continue.</p>}
      <fieldset className="label-options" disabled={busy}><legend>Visible conditions</legend><p className="field-help">Choose visible conditions, or one neutral label.</p><div className="label-choice-list">{LABELS.map((label) => <label className="label-choice" key={label}><input type="checkbox" checked={labels.includes(label)} onChange={() => toggleLabel(label)} /><span>{LABEL_NAMES[label]}</span></label>)}</div></fieldset>
      <label className="description-field" htmlFor="evidence">What’s visible?<textarea id="evidence" rows={3} maxLength={240} value={evidence} disabled={busy} onChange={(event) => { setEvidence(event.target.value); setReviewed(false); }} placeholder="Describe visible details, such as litter beside the water’s edge." /></label>
      <p className="character-count">{evidence.length}/240 characters</p>
      {locationFields}
      <label className="review-confirmation"><input type="checkbox" checked={reviewed} disabled={busy} onChange={(event) => setReviewed(event.target.checked)} /><span>I checked the labels, description, and location. I understand these details will be public and that a photo cannot establish water safety.</span></label>
      {localPreview && <p className="connection-note">This is an unsaved preview. Publishing will be available once reporting is connected.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary full-width" type="submit" disabled={busy || localPreview || !reviewed}>{busy ? "Publishing…" : draft.is_demo ? "Publish to sample map" : "Publish observation"}<ArrowRight size={16} /></button>
      <button className="text-button restart-button" type="button" disabled={busy} onClick={reset}><RotateCcw size={14} /> Start a new observation</button>
    </form>}

    {stage === "published" && published && <>
      <div className="section-heading"><h2 ref={heading} tabIndex={-1}>{published.is_demo ? "Shared with sample reports" : "Your observation is on the map"}</h2><p>{published.is_demo ? "Open Samples to find your report." : "Thanks for adding a little local perspective."}</p></div>
      <div className="published-summary"><span className="source-line"><Check size={16} />{SOURCE_NAMES[published.analysis_source]}</span><p>{published.evidence}</p><span className="coordinates"><MapPin size={13} />{published.latitude.toFixed(5)}, {published.longitude.toFixed(5)}</span></div>
      <ComplaintEditor report={published} />
      <button className="text-button restart-button" type="button" onClick={reset}><PlusIcon /> Make another observation</button>
    </>}
  </div>;
}

function PlusIcon() { return <span aria-hidden="true">+</span>; }
