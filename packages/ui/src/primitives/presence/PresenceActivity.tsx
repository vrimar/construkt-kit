import { Activity, type ReactNode } from "react";

export interface PresenceActivityProps {
  /** Whether the content shows: `Presence.mounted`. */
  mounted: boolean;
  /** Hides the content while it doesn't show instead of unmounting it. */
  keepMounted: boolean;
  children: ReactNode;
}

/**
 * Renders `children` while `mounted`. With `keepMounted` it hides them in an `<Activity>` instead,
 * which keeps their DOM and state and pauses their effects until they show again.
 */
export function PresenceActivity({ mounted, keepMounted, children }: PresenceActivityProps) {
  if (!mounted && !keepMounted) return null;
  return <Activity mode={mounted ? "visible" : "hidden"}>{children}</Activity>;
}
