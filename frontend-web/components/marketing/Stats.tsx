"use client";

import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 500, suffix: "+", label: "Societies", description: "Trusting VMS" },
  { value: 50000, suffix: "+", label: "Daily Check-ins", description: "Across India" },
  { value: 99.9, suffix: "%", label: "Uptime", description: "Reliability" },
  { value: 100, suffix: "%", label: "DPDP Compliant", description: "Data Protection" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
    }
    return num.toString();
  };

  return (
    <div ref={ref} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
      {formatNumber(count)}
      {suffix}
    </div>
  );
}

export function Stats() {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-r from-emerald-600 to-emerald-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Numbers that speak
          </h2>
          <p className="text-emerald-100 text-lg">
            Join thousands of societies and offices already using VMS
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm"
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="text-xl font-semibold text-white mt-2">{stat.label}</p>
              <p className="text-emerald-100 text-sm mt-1">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
