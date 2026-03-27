"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { Text } from "@/components/ui";

const testimonials = [
  {
    quote: "VMS has completely transformed how we manage visitors at our society. No more paper registers, no more confusion at the gate. Residents love the instant notifications.",
    author: "Rajesh Sharma",
    role: "Chairman, Green Valley Society",
    location: "Pune",
    avatar: "RS",
  },
  {
    quote: "The OTP-based check-in is brilliant. Our delivery personnel and guests check in within seconds. The guard dashboard gives us real-time visibility of everyone on premises.",
    author: "Priya Menon",
    role: "Secretary, Palm Heights",
    location: "Bangalore",
    avatar: "PM",
  },
  {
    quote: "As a corporate office, DPDP compliance was critical for us. VMS handles consent and audit logs automatically. Our reception team can now focus on welcoming guests instead of paperwork.",
    author: "Amit Desai",
    role: "Admin Manager, TechCorp",
    location: "Mumbai",
    avatar: "AD",
  },
  {
    quote: "We needed a system that could handle contractor check-ins at our factory with time-bound access. VMS delivered exactly that, plus the muster export feature is a lifesaver for safety drills.",
    author: "Sunil Patel",
    role: "Safety Officer, IndustrialWorks",
    location: "Ahmedabad",
    avatar: "SP",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-card to-muted-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Text variant="eyebrow" className="text-center text-primary block mb-4">
          Testimonials
        </Text>
        <Text variant="h1" as="h2" className="text-3xl sm:text-4xl text-foreground text-center mb-4">
          Trusted by societies and offices across India
        </Text>
        <Text variant="body" className="text-center text-muted mx-auto mb-14 lg:w-2/3">
          See what our customers say about their experience with VMS
        </Text>

        {/* Featured testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-border relative">
            <Quote className="absolute top-8 left-8 w-12 h-12 text-primary-light" />
            <blockquote className="text-xl sm:text-2xl text-foreground leading-relaxed mb-8 pl-8">
              "{testimonials[activeIndex].quote}"
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                {testimonials[activeIndex].avatar}
              </div>
              <div>
                <Text variant="label" className="font-semibold text-foreground mb-0">{testimonials[activeIndex].author}</Text>
                <Text variant="caption" className="text-muted">{testimonials[activeIndex].role}</Text>
                <Text variant="caption" className="text-primary">{testimonials[activeIndex].location}</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                activeIndex === index
                  ? "bg-primary w-8"
                  : "bg-border hover:bg-muted"
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Small cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {testimonials.map((t, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`p-4 rounded-xl text-left transition-all ${
                activeIndex === index
                  ? "bg-primary-muted border-2 border-primary"
                  : "bg-card border border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    activeIndex === index
                      ? "bg-primary text-white"
                      : "bg-muted-bg text-muted"
                  }`}
                >
                  {t.avatar}
                </div>
                <div>
                  <Text variant="label" className="font-medium text-foreground text-sm mb-0">{t.author}</Text>
                  <Text variant="caption" className="text-muted">{t.location}</Text>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
