"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "aws-path-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    trackEvent(
      choice.outcome === "accepted"
        ? "pwa_install_accepted"
        : "pwa_install_dismissed"
    );
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    trackEvent("pwa_install_dismissed");
    setVisible(false);
  }

  return (
    <div className="install-prompt" role="dialog" aria-label="Install app">
      <div className="install-prompt-body">
        <strong>Install AWS Path</strong>
        <p>Add to your home screen for offline lessons and a full-screen app.</p>
      </div>
      <div className="install-prompt-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={install}>
          Install
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
