import { useState, useEffect, useCallback } from "react";
import Joyride, { type CallBackProps, type Step, STATUS, ACTIONS } from "react-joyride";
import { useSimStore } from "../../store.ts";
import { APP_VERSION } from "../../lib/version.ts";

const TOUR_STORAGE_KEY = "bowstring-tour-completed";
const TOUR_VERSION_KEY = "bowstring-tour-version";

function hasTourBeenCompleted(): boolean {
  try {
    const completedVersion = localStorage.getItem(TOUR_VERSION_KEY);
    return completedVersion === APP_VERSION;
  } catch {
    return false;
  }
}

function markTourCompleted(): void {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    localStorage.setItem(TOUR_VERSION_KEY, APP_VERSION);
  } catch {
    // localStorage unavailable
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function resetTour(): void {
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_VERSION_KEY);
  } catch {
    // localStorage unavailable
  }
}

const STEPS: Step[] = [
  {
    target: "[data-tour='header']",
    content:
      "Welcome to the Bowstring Dynamics Simulator! This tool models bowstring physics, arrow flight, and tuning — built for engineers and archers alike. Let's take a quick tour.",
    placement: "bottom",
    disableBeacon: true,
    title: "Welcome",
  },
  {
    target: "[data-tour='tab-switcher']",
    content:
      "Use these tabs to switch between sections: Bow & String configuration, Arrow builder, Tuning tools, the Bow Database, and your saved Profiles.",
    placement: "right",
    title: "Navigation Tabs",
  },
  {
    target: "[data-tour='control-panel']",
    content:
      "This is the Bow & String panel. Select your bow type, set draw weight and length, choose a string material, adjust strand count, and manage speed weights. Everything updates the visualizations in real-time.",
    placement: "right",
    title: "Bow & String Controls",
  },
  {
    target: "[data-tour='stats-bar']",
    content:
      "Key metrics at a glance — estimated arrow speed, stored energy, fundamental frequency, total string mass, speed loss from weights, vibration reduction, and balance point. These update live as you tweak parameters.",
    placement: "bottom",
    title: "Stats Dashboard",
  },
  {
    target: "[data-tour='string-viz']",
    content:
      "The string vibration visualization shows real-time standing wave animation. Drag the weights along the string to reposition them and see how they affect harmonics and damping.",
    placement: "bottom",
    title: "String Visualizer",
  },
  {
    target: "[data-tour='force-energy']",
    content:
      "The force-draw curve shows how much force is required at each point in the draw cycle. The energy breakdown shows where your stored energy goes — arrow KE, limb losses, hysteresis, vibration, and sound.",
    placement: "top",
    title: "Force & Energy",
  },
  {
    target: "[data-tour='draw-cycle']",
    content:
      "Watch an animated draw sequence — limb deflection, cam rotation, and the string path. Use Play to animate or the scrubber to step through manually. Force and energy bars update in real-time.",
    placement: "top",
    title: "Draw Cycle Animation",
  },
  {
    target: "[data-tour='sound-analysis']",
    content:
      "The sound & vibration section shows a decay waterfall of harmonic frequencies over time. Hit 'Play Twang' to hear a synthesized bowstring sound based on your setup. The noise meter estimates shot loudness in decibels.",
    placement: "top",
    title: "Sound & Vibration",
  },
  {
    target: "[data-tour='share-export']",
    content:
      "Generate a share link to send your exact setup to someone, or download a complete text report with all your bow, string, arrow, and energy data.",
    placement: "top",
    title: "Share & Export",
  },
  {
    target: "[data-tour='header-buttons']",
    content:
      "Quick access to help: the Setup Wizard guides beginners through selecting the right equipment. The Glossary has 28 archery terms with detailed explanations. Docs covers the physics formulas and models with an Engineer / Non-Engineer toggle.",
    placement: "bottom",
    title: "Help & Resources",
  },
  {
    target: "[data-tour='theme-menu']",
    content:
      "Pick your preferred color theme from the settings menu — 6 themes available including Midnight, Neon, Dracula, and more. That's the tour — have fun experimenting!",
    placement: "left",
    title: "Themes & Settings",
  },
];

interface GuidedTourProps {
  forceRun?: boolean;
  onFinish?: () => void;
}

export function GuidedTour({ forceRun, onFinish }: GuidedTourProps) {
  const theme = useSimStore((s) => s.theme);
  const c = theme.colors;

  const [autoRun, setAutoRun] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [prevForceRun, setPrevForceRun] = useState(forceRun);

  // Reset dismissed state when forceRun transitions to true (replay)
  // This is the recommended setState-during-render pattern for derived state
  if (forceRun && !prevForceRun) {
    setDismissed(false);
    setPrevForceRun(forceRun);
  } else if (forceRun !== prevForceRun) {
    setPrevForceRun(forceRun);
  }

  const run = (forceRun || autoRun) && !dismissed;

  useEffect(() => {
    // Auto-show for new users or new versions (only on mount)
    if (!hasTourBeenCompleted()) {
      const timer = setTimeout(() => setAutoRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setDismissed(true);
        setAutoRun(false);
        markTourCompleted();
        onFinish?.();
      }

      // Close on overlay click
      if (action === ACTIONS.CLOSE) {
        setDismissed(true);
        setAutoRun(false);
        markTourCompleted();
        onFinish?.();
      }
    },
    [onFinish],
  );

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlayClose={false}
      callback={handleCallback}
      locale={{
        back: "Back",
        close: "Close",
        last: "Done",
        next: "Next",
        skip: "Skip Tour",
      }}
      styles={{
        options: {
          arrowColor: c.panel,
          backgroundColor: c.panel,
          overlayColor: "rgba(0, 0, 0, 0.6)",
          primaryColor: c.accent,
          textColor: c.text,
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: "12px",
          border: `1px solid ${c.borderLight}`,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "12px",
          padding: "20px",
        },
        tooltipTitle: {
          fontSize: "14px",
          fontWeight: 700,
          color: c.accent,
          marginBottom: "8px",
        },
        tooltipContent: {
          color: c.textMuted,
          lineHeight: "1.6",
          fontSize: "11px",
        },
        buttonNext: {
          backgroundColor: c.accent,
          color: c.bg,
          borderRadius: "6px",
          fontSize: "10px",
          fontFamily: "monospace",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase" as const,
          padding: "8px 16px",
        },
        buttonBack: {
          color: c.textDim,
          fontSize: "10px",
          fontFamily: "monospace",
          marginRight: "8px",
        },
        buttonSkip: {
          color: c.textDim,
          fontSize: "9px",
          fontFamily: "monospace",
        },
        spotlight: {
          borderRadius: "8px",
        },
        tooltipFooter: {
          marginTop: "12px",
        },
      }}
    />
  );
}
