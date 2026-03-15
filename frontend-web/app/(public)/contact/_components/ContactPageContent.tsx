"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone, MapPin, Check, Loader2 } from "lucide-react";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  SectionHeading,
} from "@/components/marketing";
import { Text } from "@/components/ui";

const contactInfo = [
  { icon: <Mail className="w-5 h-5" />, label: "Email", value: "hello@vms.in", href: "mailto:hello@vms.in" },
  { icon: <Phone className="w-5 h-5" />, label: "Phone", value: "+91 80 1234 5678", href: "tel:+918012345678" },
  { icon: <MapPin className="w-5 h-5" />, label: "Office", value: "Bangalore, India", href: "#" },
];

const offices = [
  { city: "Bangalore", country: "India", type: "Headquarters", address: "123 Tech Park, Whitefield, Bangalore 560066" },
  { city: "Mumbai", country: "India", type: "Regional Office", address: "456 Business Center, BKC, Mumbai 400051" },
  { city: "Pune", country: "India", type: "Regional Office", address: "789 IT Hub, Hinjewadi, Pune 411057" },
];

const faqs = [
  { q: "How long does setup take?", a: "Most societies are up and running within 24 hours." },
  { q: "Is there a free trial?", a: "Yes! 14-day free trial with full features. No credit card required." },
  { q: "What support do you offer?", a: "Email, phone, and WhatsApp support. Premium plans include dedicated account managers." },
  { q: "Can I customize the system?", a: "Yes, VMS is highly configurable. Custom branding and workflows available." },
];

export function ContactPageContent() {
  const [formState, setFormState] = useState({ name: "", email: "", phone: "", company: "", message: "", type: "society" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-16 bg-foreground overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/website/team-office.jpg" alt="Team" fill className="object-cover opacity-15" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInUp className="max-w-2xl mx-auto text-center">
            <Text variant="h1" as="h1" className="text-card mb-4">
              Get in <span className="text-primary">touch</span>
            </Text>
            <Text variant="body" className="text-base text-card/80">
              Need a demo, custom quote, or help choosing the right plan? We’ll respond within 24 hours.
            </Text>
          </FadeInUp>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid md:grid-cols-3 gap-4">
          {contactInfo.map((info, index) => (
            <FadeInUp key={index} delay={index * 0.05}>
              <a
                href={info.href}
                className="flex items-center gap-3 bg-card p-4 rounded-xl shadow-md border border-border hover:border-primary/30 hover:shadow-lg transition"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {info.icon}
                </div>
                <div>
                  <Text variant="caption">{info.label}</Text>
                  <Text variant="label" className="text-sm mb-0">{info.value}</Text>
                </div>
              </a>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Form */}
            <FadeInLeft>
              <div className="bg-muted-bg p-6 lg:p-8 rounded-xl">
                <Text variant="h3" as="h2" className="mb-1">Send us a message</Text>
                <Text variant="muted" className="mb-6">We&apos;ll get back to you within 24 hours.</Text>

                {isSubmitted ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-7 h-7 text-success" />
                    </div>
                    <Text variant="h3" as="h3" className="mb-1">Thank you!</Text>
                    <Text variant="muted">We&apos;ll get back to you soon.</Text>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary transition outline-none text-sm"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary transition outline-none text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formState.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary transition outline-none text-sm"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">Organization type</label>
                        <select
                          name="type"
                          value={formState.type}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary transition outline-none text-sm"
                        >
                          <option value="society">Residential Society</option>
                          <option value="office">Corporate Office</option>
                          <option value="factory">Industrial Facility</option>
                          <option value="school">Educational Institution</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Organization name</label>
                      <input
                        type="text"
                        name="company"
                        value={formState.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary transition outline-none text-sm"
                        placeholder="Your organization"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Message</label>
                      <textarea
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary transition outline-none resize-none text-sm"
                        placeholder="Tell us about your requirements..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-2.5 bg-primary text-card font-semibold rounded-lg hover:bg-primary-hover transition disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </FadeInLeft>

            {/* FAQ */}
            <FadeInRight>
              <div>
                <Text variant="h3" as="h2" className="mb-1">Frequently asked questions</Text>
                <Text variant="muted" className="mb-6">Quick answers to common questions.</Text>

                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-muted-bg p-4 rounded-xl">
                      <Text variant="label" className="mb-1">{faq.q}</Text>
                      <Text variant="caption">{faq.a}</Text>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                  <Text variant="label" className="text-primary mb-1">Need immediate help?</Text>
                  <Text variant="caption" className="text-primary/80 mb-3">
                    Our support team is available Monday to Saturday, 9 AM to 6 PM IST.
                  </Text>
                  <a
                    href="tel:+918012345678"
                    className="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:text-primary-hover"
                  >
                    <Phone className="w-4 h-4" />
                    Call us now
                  </a>
                </div>
              </div>
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-16 bg-muted-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Our Offices"
              title={<>Visit us at our <span className="text-primary">locations</span></>}
              className="mb-10"
            />
          </FadeInUp>

          <div className="grid md:grid-cols-3 gap-5">
            {offices.map((office, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-card p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
                  <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                    {office.type}
                  </span>
                  <Text variant="h3" as="h3" className="mb-0.5">{office.city}</Text>
                  <Text variant="caption" className="text-primary mb-2">{office.country}</Text>
                  <Text variant="caption">{office.address}</Text>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
