"use client";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted-bg text-foreground",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-muted-bg text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-foreground",
  primary: "bg-primary",
  secondary: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
};

export function Badge({ children, variant = "default", className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
}

// Pre-configured status badges
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: "success", label: "Active" },
    inactive: { variant: "secondary", label: "Inactive" },
    pending: { variant: "warning", label: "Pending" },
    open: { variant: "warning", label: "Open" },
    in_progress: { variant: "info", label: "In Progress" },
    resolved: { variant: "success", label: "Resolved" },
    closed: { variant: "secondary", label: "Closed" },
    escalated: { variant: "error", label: "Escalated" },
    completed: { variant: "success", label: "Completed" },
    failed: { variant: "error", label: "Failed" },
    cancelled: { variant: "secondary", label: "Cancelled" },
    expired: { variant: "secondary", label: "Expired" },
  };

  const config = statusConfig[status.toLowerCase()] || { variant: "default" as BadgeVariant, label: status };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

// Pre-configured role badges
export function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    platform_admin: { variant: "primary", label: "Platform Admin" },
    chairman: { variant: "info", label: "Chairman" },
    secretary: { variant: "info", label: "Secretary" },
    treasurer: { variant: "warning", label: "Treasurer" },
    guard: { variant: "secondary", label: "Guard" },
    resident: { variant: "success", label: "Resident" },
    security_guard: { variant: "secondary", label: "Security Guard" },
  };

  const config = roleConfig[role.toLowerCase()] || { variant: "default" as BadgeVariant, label: role };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Priority badge
export function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    low: { variant: "secondary", label: "Low" },
    medium: { variant: "info", label: "Medium" },
    high: { variant: "warning", label: "High" },
    urgent: { variant: "error", label: "Urgent" },
    critical: { variant: "error", label: "Critical" },
  };

  const config = priorityConfig[priority.toLowerCase()] || { variant: "default" as BadgeVariant, label: priority };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
