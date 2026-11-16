/**
 * Ambient aurora backdrop: drifting blobs and a slow ring behind a section.
 * Pure CSS (see `.nari-aurora` in index.css), so it costs nothing and
 * respects prefers-reduced-motion through the global rule in motion.css.
 */
export function AuroraBackdrop({ className = "" }) {
  return (
    <div className={`nari-aurora ${className}`} aria-hidden="true">
      <span className="aurora-blob" />
      <span className="aurora-blob" />
      <span className="aurora-ring" />
    </div>
  );
}

export default AuroraBackdrop;
