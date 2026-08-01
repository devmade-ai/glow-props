// Requirement: non-intrusive banner for updates detected MID-SESSION — the
//   deferred half of the auto-on-launch policy; never force-reload over
//   in-progress reading (PWA_SYSTEM.md "Update Application Policy").
// "Later" is safe to tap: the waiting worker auto-applies on next launch
// anyway when the toggle is on.
export function UpdateBanner({ onUpdate, onDismiss }) {
  return (
    <div
      className="update-banner fixed left-4 right-4 z-70 flex items-center justify-between gap-3
        rounded-xl bg-base-200 border border-base-300 px-4 py-3 shadow-lg
        max-w-md mx-auto no-print"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <span className="text-sm text-base-content">A new version is available.</span>
      <div className="flex gap-2 shrink-0">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>Later</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onUpdate}>Update</button>
      </div>
    </div>
  );
}
