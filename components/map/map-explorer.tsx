"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowUpRight, CircleHelp, Droplets, Leaf, MapPin, RefreshCw, Trash2, Waves, X } from "lucide-react";
import { z } from "zod";
import { coordinatesSchema, labelsSchema, LABEL_NAMES, SOURCE_NAMES, type Label, type PublicReport } from "@/lib/contracts";
import { formatCoordinates, formatPublishedDate } from "@/lib/complaint";
import { SAMPLE_REPORT_NOTICE, SAMPLE_REPORTS } from "@/lib/sample-reports";
import { ComplaintEditor } from "@/components/complaint/complaint-editor";
import { PresencePanel } from "@/components/ui/motion";
import "./map.css";

const ReportMap = dynamic(() => import("./map-canvas").then((module) => module.ReportMapCanvas), {
  ssr: false,
  loading: () => <div className="map-loading" role="status">Loading report map…</div>,
});

const responseSchema = z.object({
  reports: z.array(coordinatesSchema.extend({
    id: z.string().min(1),
    published_at: z.iso.datetime({ offset: true }),
    labels: labelsSchema,
    evidence: z.string().min(1).max(240),
    analysis_source: z.enum(["vision", "manual_fallback", "mock"]),
    is_demo: z.boolean(),
  })),
});

type View = "real" | "samples";
type ReportState = {
  view: View;
  reports: PublicReport[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

const labelSymbols = {
  algal_bloom: Leaf,
  oil_sheen: Waves,
  garbage: Trash2,
  no_visible_pollution: Droplets,
  unclear: CircleHelp,
} satisfies Record<Label, typeof Leaf>;

function focusReportHeading(heading: HTMLHeadingElement | null) {
  if (!heading || heading.closest("[inert]")) return;
  const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.input === "keyboard";
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ block: "nearest", behavior: quiet ? "instant" : "smooth" });
}

function SelectedReportDetail({ report, onClose, headingRef }: {
  report: PublicReport;
  onClose: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const headingId = useId();
  useEffect(() => {
    const frame = requestAnimationFrame(() => focusReportHeading(headingRef.current));
    return () => cancelAnimationFrame(frame);
  }, [headingRef]);

  return <section className="map-selected-report" aria-labelledby={headingId}>
    <div className="map-selected-heading">
      <h3 id={headingId} ref={headingRef} tabIndex={-1}>{report.is_demo ? "Sample report" : "Reviewed report"}</h3>
      <button type="button" onClick={onClose} aria-label="Close report details"><X size={18} aria-hidden /></button>
    </div>
    <p>{report.evidence}</p>
    <p className="map-detail-coordinates">{formatCoordinates(report.latitude, report.longitude)}</p>
    <ComplaintEditor report={report} />
  </section>;
}

export function MapExplorer({ refreshKey, onReportSelect }: {
  refreshKey: number;
  onReportSelect?: (report: PublicReport) => void;
}) {
  const [view, setView] = useState<View>("real");
  const [reload, setReload] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reportButtons = useRef(new Map<string, HTMLButtonElement>());
  const restoreFocusId = useRef<string | null>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<ReportState>({ view: "real", reports: [], loading: true, error: null, updatedAt: null });

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15_000);

    async function loadReports() {
      try {
        const response = await fetch(`/api/reports${view === "samples" ? "?samples=true" : ""}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(response.status === 503
            ? "Public reports are unavailable right now."
            : "Reports could not be loaded. Please try refreshing.");
        }
        const parsed = responseSchema.safeParse(await response.json());
        if (!parsed.success) throw new Error("The report list could not be read. Please try refreshing.");
        const serverReports = parsed.data.reports.filter((report) => report.is_demo === (view === "samples"));
        const reports = view === "samples"
          ? [...serverReports, ...SAMPLE_REPORTS.filter((sample) => !serverReports.some((report) => report.id === sample.id))]
          : serverReports;
        if (!controller.signal.aborted) {
          setState({ view, reports, loading: false, error: null, updatedAt: new Date().toISOString() });
        }
      } catch (error) {
        if (controller.signal.aborted && !timedOut) return;
        const message = timedOut
          ? "Loading reports took too long. Please try refreshing."
          : error instanceof Error && error.message !== "Failed to fetch"
            ? error.message
            : "Reports could not be loaded. Check your connection and try again.";
        setState((previous) => ({
          view,
          reports: previous.view === view ? previous.reports : view === "samples" ? SAMPLE_REPORTS : [],
          loading: false,
          error: view === "samples" ? "Showing built-in examples. Published sample reports are unavailable." : message,
          updatedAt: previous.view === view ? previous.updatedAt : null,
        }));
      } finally {
        clearTimeout(timer);
      }
    }

    void loadReports();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [view, reload, refreshKey]);

  function changeView(nextView: View) {
    if (nextView === view) return;
    restoreFocusId.current = null;
    setView(nextView);
    setSelectedId(null);
    setShowAll(false);
    setState({ view: nextView, reports: nextView === "samples" ? SAMPLE_REPORTS : [], loading: true, error: null, updatedAt: null });
  }

  function refresh() {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    setReload((value) => value + 1);
  }

  function selectReport(report: PublicReport) {
    restoreFocusId.current = null;
    // A map marker may refer to a row outside the collapsed list. Keep its return target available.
    if (state.reports.findIndex((item) => item.id === report.id) >= 4) setShowAll(true);
    if (selectedId === report.id && !onReportSelect) focusReportHeading(detailHeading.current);
    setSelectedId(report.id);
    onReportSelect?.(report);
  }

  function closeDetail() {
    restoreFocusId.current = selectedId;
    setSelectedId(null);
  }

  function restoreReportFocus() {
    const id = restoreFocusId.current;
    restoreFocusId.current = null;
    if (id) reportButtons.current.get(id)?.focus();
  }

  const selectedReport = state.reports.find((report) => report.id === selectedId);
  const visibleReports = showAll ? state.reports : state.reports.slice(0, 4);
  const scopeLabel = `${view === "samples" ? "sample" : "published"} report${state.reports.length === 1 ? "" : "s"}`;

  return (
    <section className="map-explorer" aria-labelledby="map-heading">
      <div className="map-section-heading">
        <div>
          <h2 id="map-heading">Around the water</h2>
          <p>Reviewed observations, one location at a time.</p>
        </div>
        <MapPin size={20} strokeWidth={1.5} aria-hidden />
      </div>
      <div className="map-toolbar">
        <div className="map-view-switch" data-view={view} role="group" aria-label="Report view">
          <button type="button" aria-pressed={view === "real"} onClick={() => changeView("real")}>Public reports</button>
          <button type="button" aria-pressed={view === "samples"} onClick={() => changeView("samples")}>Samples</button>
        </div>
        <button className="map-refresh" type="button" onClick={refresh} disabled={state.loading} aria-label="Refresh reports">
          <RefreshCw size={16} aria-hidden />
          <span>Refresh</span>
        </button>
      </div>
      {view === "samples" && <p className="map-sample-notice">{SAMPLE_REPORT_NOTICE}</p>}
      <ReportMap reports={state.reports} selectedId={selectedId} onSelect={selectReport} />
      <AnimatePresence initial={false} mode="wait" onExitComplete={restoreReportFocus}>
        {selectedReport && !onReportSelect && (
          <PresencePanel key={selectedReport.id} focusHeading={false}>
            <SelectedReportDetail report={selectedReport} onClose={closeDetail} headingRef={detailHeading} />
          </PresencePanel>
        )}
      </AnimatePresence>
      <div className="map-list-heading">
        <h3>{state.loading && !state.reports.length ? "Loading observations…" : state.error && !state.reports.length ? "Report list unavailable" : `${state.reports.length} ${scopeLabel}`}</h3>
        {state.updatedAt && <span>Updated {new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(state.updatedAt))}</span>}
      </div>
      {state.error && (
        <div className="map-report-notice" role="status">
          <p>{state.error}{state.reports.length > 0 && view === "real" ? " Previously loaded reports are still shown." : ""}</p>
          <div className="map-notice-actions">
            {view === "real" && !state.reports.length && <button className="map-sample-action" type="button" onClick={() => changeView("samples")}>Explore samples <ArrowUpRight className="map-action-arrow" size={15} aria-hidden /></button>}
            {!state.loading && <button type="button" onClick={refresh}>Try again</button>}
          </div>
        </div>
      )}
      {state.loading && !state.reports.length ? (
        <div className="map-list-loading" aria-busy="true" aria-label="Loading reports"><span /><span /></div>
      ) : !state.error && !state.reports.length ? (
        <div className="map-empty">
          <p>No public observations yet.</p>
          <span>Once a report is reviewed and published, its pin will appear here.</span>
          <button type="button" onClick={() => changeView("samples")}>Explore sample reports <ArrowUpRight size={15} aria-hidden /></button>
        </div>
      ) : state.reports.length > 0 ? (
        <ul className="map-report-list" aria-label={`${scopeLabel} with coordinates`}>
          {visibleReports.map((report) => {
            const LabelSymbol = labelSymbols[report.labels[0]];
            return <li key={report.id}>
              <button className="map-report-row" type="button" aria-pressed={report.id === selectedId} onClick={() => selectReport(report)} ref={(element) => {
                if (element) reportButtons.current.set(report.id, element);
                else reportButtons.current.delete(report.id);
              }}>
                <div className="map-row-top">
                  <div className="map-report-identity"><LabelSymbol className="map-category-symbol" size={18} strokeWidth={1.7} aria-hidden /><strong>{report.labels.map((label) => LABEL_NAMES[label]).join(" · ")}</strong></div>
                  <ArrowUpRight className="map-row-open" size={16} aria-hidden />
                </div>
                <p>{report.evidence}</p>
                <div className="map-row-meta"><span>{SOURCE_NAMES[report.analysis_source]}</span><time dateTime={report.published_at}>{formatPublishedDate(report.published_at)}</time></div>
                <span className="map-row-coordinates">{formatCoordinates(report.latitude, report.longitude)}</span>
              </button>
            </li>;
          })}
        </ul>
      ) : null}
      {state.reports.length > 4 && <button type="button" className="map-show-all" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show fewer reports" : `View all ${state.reports.length} reports`}</button>}
      <p className="map-footnote">A visual observation is not a water-quality test. Photos stay private.</p>
    </section>
  );
}
