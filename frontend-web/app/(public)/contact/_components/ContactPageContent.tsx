"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  SectionHeading,
} from "@/components/marketing";

const contactInfo = [
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    label: "Email",
    value: "hello@vms.in",
    href: "mailto:hello@vms.in",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    label: "Phone",
    value: "+91 80 1234 5678",
    href: "tel:+918012345678",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    label: "Office",
    value: "Bangalore, India",
    href: "#",
  },
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card mb-4">
              Get in <span className="text-primary">touch</span>
            </h1>
            <p className="text-base text-card/80">
              Have questions? Want a demo? Our team is here to help you get started.
            </p>
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
                  <p className="text-muted-foreground text-xs">{info.label}</p>
                  <p className="text-foreground font-medium text-sm">{info.value}</p>
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
                <h2 className="text-lg font-bold text-foreground mb-1">Send us a message</h2>
                <p className="text-muted-foreground text-sm mb-6">We&apos;ll get back to you within 24 hours.</p>

                {isSubmitted ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">Thank you!</h3>
                    <p className="text-muted-foreground text-sm">We&apos;ll get back to you soon.</p>
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
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
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
                <h2 className="text-lg font-bold text-foreground mb-1">Frequently asked questions</h2>
                <p className="text-muted-foreground text-sm mb-6">Quick answers to common questions.</p>

                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-muted-bg p-4 rounded-xl">
                      <h3 className="font-medium text-foreground text-sm mb-1">{faq.q}</h3>
                      <p className="text-muted-foreground text-xs">{faq.a}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                  <h3 className="font-medium text-primary text-sm mb-1">Need immediate help?</h3>
                  <p className="text-primary/80 text-xs mb-3">
                    Our support team is available Monday to Saturday, 9 AM to 6 PM IST.
                  </p>
                  <a
                    href="tel:+918012345678"
                    className="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:text-primary-hover"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
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
                  <h3 className="text-base font-bold text-foreground mb-0.5">{office.city}</h3>
                  <p className="text-primary text-xs mb-2">{office.country}</p>
                  <p className="text-muted-foreground text-xs">{office.address}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
