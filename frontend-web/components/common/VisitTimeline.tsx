"use client";

import { Check, Clock, LogIn, LogOut, X } from "lucide-react";
import type { ReactNode } from "react";

type VisitStatus = "pending" | "approved" | "checked_in" | "checked_out" | "cancelled";

interface TimelineStep {
  key: VisitStatus;
  label: string;
  icon: ReactNode;
  timestamp?: string | null;
}

interface VisitTimelineProps {
  status: VisitStatus;
  createdAt: string;
  actualArrival?: string | null;
  actualDeparture?: string | null;
  className?: string;
}

const statusOrder: VisitStatus[] = ["pending", "approved", "checked_in", "checked_out"];

function getStepState(
  stepStatus: VisitStatus,
  currentStatus: VisitStatus
): "completed" | "current" | "upcoming" | "cancelled" {
  if (currentStatus === "cancelled") {
    const currentIdx = statusOrder.indexOf("pending");
    const stepIdx = statusOrder.indexOf(stepStatus);
    if (stepIdx <= currentIdx) return "completed";
    if (stepStatus === "pending") return "cancelled";
    return "upcoming";
  }

  const currentIdx = statusOrder.indexOf(currentStatus);
  const stepIdx = statusOrder.indexOf(stepStatus);

  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

const stateStyles = {
  completed: {
    circle: "bg-success text-white border-success",
    line: "bg-success",
    label: "text-foreground font-medium",
    time: "text-muted-foreground",
  },
  current: {
    circle: "bg-primary text-white border-primary ring-4 ring-primary/20",
    line: "bg-border",
    label: "text-primary font-semibold",
    time: "text-primary",
  },
  upcoming: {
    circle: "bg-muted-bg text-muted-foreground border-border border-2",
    line: "bg-border",
    label: "text-muted-foreground",
    time: "text-muted-foreground",
  },
  cancelled: {
    circle: "bg-error text-white border-error",
    line: "bg-border",
    label: "text-error font-medium",
    time: "text-error",
  },
};

function formatTime(ts?: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VisitTimeline({
  status,
  createdAt,
  actualArrival,
  actualDeparture,
  className = "",
}: VisitTimelineProps) {
  const isCancelled = status === "cancelled";

  const steps: TimelineStep[] = [
    { key: "pending", label: "Invited", icon: <Clock className="w-4 h-4" />, timestamp: createdAt },
    { key: "approved", label: "Approved", icon: <Check className="w-4 h-4" />, timestamp: createdAt },
    { key: "checked_in", label: "Checked In", icon: <LogIn className="w-4 h-4" />, timestamp: actualArrival },
    { key: "checked_out", label: "Checked Out", icon: <LogOut className="w-4 h-4" />, timestamp: actualDeparture },
  ];

  if (isCancelled) {
    // Replace upcoming steps with a cancelled step
    const cancelledStep: TimelineStep = {
      key: "cancelled",
      label: "Cancelled",
      icon: <X className="w-4 h-4" />,
      timestamp: null,
    };
    // Show: Invited → Cancelled
    return (
      <div className={`${className}`}>
        <div className="flex items-center">
          {[steps[0], cancelledStep].map((step, idx, arr) => {
            const state = idx === 0 ? "completed" : "cancelled";
            const styles = stateStyles[state];
            const isLast = idx === arr.length - 1;
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${styles.circle}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-1.5 ${styles.label} whitespace-nowrap`}>{step.label}</span>
                  {step.timestamp && (
                    <span className={`text-[10px] mt-0.5 ${styles.time}`}>{formatTime(step.timestamp)}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={`h-0.5 w-12 sm:w-20 mx-2 mt-[-1.5rem] ${idx === 0 ? stateStyles.cancelled.line : "bg-border"}`} style={{ backgroundColor: "#dc2626" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const state = getStepState(step.key, status);
          const styles = stateStyles[state];
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${styles.circle}`}>
                  {step.icon}
                </div>
                <span className={`text-xs mt-1.5 ${styles.label} whitespace-nowrap`}>{step.label}</span>
                {state !== "upcoming" && step.timestamp && (
                  <span className={`text-[10px] mt-0.5 ${styles.time}`}>{formatTime(step.timestamp)}</span>
                )}
              </div>
              {!isLast && (
                <div className={`h-0.5 w-12 sm:w-20 mx-2 mt-[-1.5rem] rounded-full transition-all ${state === "completed" ? styles.line : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
