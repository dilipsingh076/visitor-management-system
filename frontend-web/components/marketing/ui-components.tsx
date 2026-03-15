"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Quote } from "lucide-react";
import { Text } from "@/components/ui";

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
      <Text variant="h3" as="h3" className="text-lg mb-2">{title}</Text>
      <Text variant="muted" className="text-sm">{description}</Text>
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
          {title && <Text variant="h3" as="h3" className="text-card text-lg">{title}</Text>}
          {subtitle && <Text variant="muted" className="text-card/80 text-sm mt-1">{subtitle}</Text>}
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
        <Text variant="eyebrow" className={`mb-3 block ${light ? "text-primary-light" : ""}`}>
          {eyebrow}
        </Text>
      )}
      {typeof title === "string" ? (
        <Text variant="h2" as="h2" className={`text-2xl sm:text-3xl mb-3 block ${light ? "text-card" : "text-foreground"}`}>
          {title}
        </Text>
      ) : (
        <Text as="div" variant="h2" className={`text-2xl sm:text-3xl mb-3 block ${light ? "text-card" : "text-foreground"}`}>
          {title}
        </Text>
      )}
      {description && (
        <Text variant="muted" className={`text-base max-w-2xl mx-auto block ${light ? "text-card/80" : ""}`}>
          {description}
        </Text>
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
      {icon || <CheckCircle className="w-4 h-4 text-primary" />}
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
      <Quote className="w-8 h-8 text-primary/20 mb-3" />
      <Text variant="body" className="mb-4">&ldquo;{quote}&rdquo;</Text>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-card text-sm font-semibold">
          {author.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <Text variant="label" className="mb-0 font-medium text-sm">{author}</Text>
          <Text variant="caption">{role}{company ? `, ${company}` : ""}</Text>
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
