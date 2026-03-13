"use client";

import Image from "next/image";
import Link from "next/link";

export function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
  className?: string;
}) {
  return (
    <span className={`text-primary ${className}`}>
      {children}
    </span>
  );
}

export function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        bg-card/80 backdrop-blur-sm border border-border rounded-xl shadow-sm
        ${hover ? "transition-shadow duration-200 hover:shadow-md" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function FeatureCard({
  icon,
  title,
  description,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: "emerald" | "blue" | "purple" | "orange" | "red" | "teal";
  className?: string;
}) {
  return (
    <div
      className={`
        group bg-card p-6 rounded-xl border border-border 
        transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5
        ${className}
      `}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export function ImageWithOverlay({
  src,
  alt,
  title,
  subtitle,
  className = "",
}: {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  overlayColor?: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl group ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {title && <h3 className="text-card text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-card/80 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  value,
  suffix = "",
  label,
  description,
  className = "",
}: {
  value: string;
  suffix?: string;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-3xl font-bold text-card mb-1">
        {value}{suffix}
      </div>
      <div className="text-base font-medium text-card">{label}</div>
      {description && <div className="text-card/70 text-sm">{description}</div>}
    </div>
  );
}

export function Tag({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}) {
  const variants = {
    default: "bg-muted-bg text-foreground",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    error: "bg-error-light text-error",
    info: "bg-info-light text-info",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={`inline-flex items-center rounded-md font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
  light = false,
  className = "",
}: {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className={`font-semibold uppercase tracking-wider text-xs mb-3 ${light ? "text-primary-light" : "text-primary"}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${light ? "text-card" : "text-foreground"}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-base max-w-2xl mx-auto ${light ? "text-card/80" : "text-muted-foreground"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export function WaveDivider({
  color = "white",
  flip = false,
  className = "",
}: {
  color?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12" style={{ fill: color }}>
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
      </svg>
    </div>
  );
}

export function GradientBlob({ className = "" }: { color1?: string; color2?: string; className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="w-96 h-96 rounded-full blur-3xl opacity-10 bg-primary" />
    </div>
  );
}

export function TrustBadge({
  icon,
  label,
  className = "",
}: {
  icon?: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon || (
        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )}
      <span className="text-muted-foreground text-sm">{label}</span>
    </div>
  );
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  className = "",
}: {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  className?: string;
}) {
  return (
    <div className={`bg-card p-6 rounded-xl border border-border transition-shadow duration-200 hover:shadow-md ${className}`}>
      <svg className="w-8 h-8 text-primary/20 mb-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-foreground text-sm leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-card text-sm font-semibold">
          {author.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{author}</p>
          <p className="text-muted-foreground text-xs">{role}{company && `, ${company}`}</p>
        </div>
      </div>
    </div>
  );
}

export function GradientButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}) {
  const variants = {
    primary: "bg-primary text-card hover:bg-primary-hover shadow-sm",
    secondary: "bg-card/10 backdrop-blur-sm text-card border border-card/30 hover:bg-card/20",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-card",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const baseClass = `inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClass}>
      {children}
    </button>
  );
}
