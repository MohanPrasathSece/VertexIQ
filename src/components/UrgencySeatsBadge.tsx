import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Users, Clock, Zap } from "lucide-react";

const STEP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes in ms
const INITIAL_MAX_SEATS = 30;
const CYCLE_MAX_SEATS = 20;

export function useUrgencySeats() {
  const [seats, setSeats] = useState<number>(30);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [totalSeats, setTotalSeats] = useState<number>(30);

  useEffect(() => {
    const STORAGE_KEY = "vertexiq_seats_tracker_v1";
    let trackerData: { startTime: number; initialDuration: number } | null = null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        trackerData = JSON.parse(saved);
      }
    } catch (_) {}

    if (!trackerData || !trackerData.startTime) {
      trackerData = {
        startTime: Date.now(),
        initialDuration: INITIAL_MAX_SEATS * STEP_INTERVAL_MS,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerData));
      } catch (_) {}
    }

    const updateCounts = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - trackerData!.startTime);

      if (elapsed < trackerData!.initialDuration) {
        // Initial 30-seat countdown phase
        const decrements = Math.floor(elapsed / STEP_INTERVAL_MS);
        const currentSeats = Math.max(0, INITIAL_MAX_SEATS - decrements);
        const timeInCurrentStep = elapsed % STEP_INTERVAL_MS;
        const remainingSec = Math.max(1, Math.floor((STEP_INTERVAL_MS - timeInCurrentStep) / 1000));

        setSeats(currentSeats === 0 ? 1 : currentSeats);
        setTotalSeats(INITIAL_MAX_SEATS);
        setSecondsRemaining(remainingSec);
      } else {
        // Recurring 20-seat cycle phase (reduce 1 by 1 every 15 min, then reset to 20 when hitting 0)
        const cycleElapsed = elapsed - trackerData!.initialDuration;
        const cycleDuration = CYCLE_MAX_SEATS * STEP_INTERVAL_MS; // 300 min
        const timeInCycle = cycleElapsed % cycleDuration;
        const decrements = Math.floor(timeInCycle / STEP_INTERVAL_MS);
        const currentSeats = CYCLE_MAX_SEATS - decrements;
        const timeInCurrentStep = timeInCycle % STEP_INTERVAL_MS;
        const remainingSec = Math.max(1, Math.floor((STEP_INTERVAL_MS - timeInCurrentStep) / 1000));

        setSeats(currentSeats <= 0 ? CYCLE_MAX_SEATS : currentSeats);
        setTotalSeats(CYCLE_MAX_SEATS);
        setSecondsRemaining(remainingSec);
      }
    };

    updateCounts();
    const interval = setInterval(updateCounts, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    seats,
    totalSeats,
    secondsRemaining,
    formattedCountdown: formatCountdown(secondsRemaining),
  };
}

export function HeroUrgencyBadge() {
  const { seats } = useUrgencySeats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 via-amber-500/10 to-[#A78BFA]/10 border border-red-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(239,68,68,0.12)] w-fit"
    >
      {/* Live Pulsing Dot */}
      <div className="relative flex size-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
      </div>

      <div className="flex items-center gap-1.5 font-display font-semibold text-[13px] sm:text-[14px] text-ink">
        <Flame className="size-4 text-red-500 fill-red-500 animate-pulse" />
        <span>Plus que</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={seats}
            initial={{ opacity: 0, y: -8, scale: 1.2 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="inline-block font-extrabold text-red-600 text-[14px] sm:text-[15px] px-1.5 py-0.2 rounded-md bg-red-100 border border-red-200"
          >
            {seats}
          </motion.span>
        </AnimatePresence>
        <span>places disponibles</span>
      </div>
    </motion.div>
  );
}

