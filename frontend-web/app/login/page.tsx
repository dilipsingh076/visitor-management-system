"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, signup, registerSociety, ROLE_LABELS } from "@/lib/auth";
import { getSocietyBySlug } from "@/lib/api";
import { WelcomeIllustration } from "@/components/ui";

/** Only guard and resident can join via Sign Up. Admin is only created when registering a new society. */
const JOIN_SOCIETY_ROLES = ["resident", "guard"] as const;
type TabMode = "login" | "signup" | "registerSociety";

export default function LoginPage() {
  const router = useRouter();
  const [tabMode, setTabMode] = useState<TabMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [societyCode, setSocietyCode] = useState("");
  const [buildings, setBuildings] = useState<{ id: string; code: string | null; name: string }[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [societyNotFound, setSocietyNotFound] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"resident" | "guard">("resident");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Register society form
  const [societyName, setSocietyName] = useState("");
  const [societySlug, setSocietySlug] = useState("");
  const [societyAddress, setSocietyAddress] = useState("");
  const [societyCity, setSocietyCity] = useState("");
  const [societyState, setSocietyState] = useState("");
  const [societyPincode, setSocietyPincode] = useState("");
  const [societyCountry, setSocietyCountry] = useState("India");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [societyType, setSocietyType] = useState("");
  const [registrationYear, setRegistrationYear] = useState("");
  const [registerBuildings, setRegisterBuildings] = useState<{ name: string; code: string }[]>([]);
  const [registerStep, setRegisterStep] = useState(1);
  const REGISTER_STEPS = 5;

  const SOCIETY_TYPE_OPTIONS = [
    { value: "", label: "— Select type (optional) —" },
    { value: "cooperative_housing", label: "Cooperative Housing Society" },
    { value: "aoa", label: "Apartment Owners Association (AOA)" },
    { value: "rwa", label: "Residents Welfare Association (RWA)" },
    { value: "other", label: "Other" },
  ];

  const isSignup = tabMode === "signup";
  const isRegisterSociety = tabMode === "registerSociety";

  useEffect(() => {
    if (!societyCode.trim()) {
      setBuildings([]);
      setSelectedBuildingId("");
      setSocietyNotFound(false);
      return;
    }
    let cancelled = false;
    setSocietyNotFound(false);
    getSocietyBySlug(societyCode.trim(), true).then((s) => {
      if (cancelled) return;
      if (!s) {
        setBuildings([]);
        setSelectedBuildingId("");
        setSocietyNotFound(true);
        return;
      }
      setSocietyNotFound(false);
      setBuildings(s.buildings || []);
      setSelectedBuildingId("");
    });
    return () => { cancelled = true; };
  }, [societyCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim()) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    if (isSignup) {
      if (!societyCode.trim()) {
        setError("Society code is required. Get it from your building manager, or use Register Society to create a new society.");
        setLoading(false);
        return;
      }
      if (societyNotFound) {
        setError("Society not found. Check the code or ask your building manager for the correct society code.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (!fullName.trim()) {
        setError("Please enter your full name");
        setLoading(false);
        return;
      }

      const result = await signup({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        flat_number: flatNumber.trim() || undefined,
        role: selectedRole,
        society_slug: societyCode.trim() || undefined,
        building_id: selectedBuildingId || undefined,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.user) {
        setLoading(false);
        router.push("/dashboard");
        return;
      }
    } else if (isRegisterSociety) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      if (!societyName.trim() || !contactEmail.trim() || !fullName.trim() || !email.trim()) {
        setError("Society name, contact email, your full name, and admin email are required");
        setLoading(false);
        return;
      }
      const buildingsPayload = registerBuildings
        .filter((b) => b.name.trim())
        .map((b) => ({ name: b.name.trim(), code: b.code.trim() || undefined }));
      const result = await registerSociety({
        society_name: societyName.trim(),
        society_slug: societySlug.trim() || undefined,
        address: societyAddress.trim() || undefined,
        city: societyCity.trim() || undefined,
        state: societyState.trim() || undefined,
        pincode: societyPincode.trim() || undefined,
        country: societyCountry.trim() || "India",
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || undefined,
        registration_number: registrationNumber.trim() || undefined,
        society_type: societyType || undefined,
        registration_year: registrationYear.trim() || undefined,
        buildings: buildingsPayload.length > 0 ? buildingsPayload : undefined,
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        flat_number: flatNumber.trim() || undefined,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      if (result.user) {
        setLoading(false);
        router.push("/dashboard");
        return;
      }
      setError("Registration failed. Please try again.");
      setLoading(false);
      return;
    } else {
      const result = await login(email.trim(), password);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.user) {
        setLoading(false);
        router.push("/dashboard");
        return;
      }
    }

    setError(isSignup ? "Signup failed. Please try again." : "Login failed. Please try again.");
    setLoading(false);
  };

  const setTab = (mode: TabMode) => {
    setTabMode(mode);
    setError("");
    if (mode !== "registerSociety") setRegisterStep(1);
  };

  const canProceedRegisterStep = () => {
    if (registerStep === 1) return !!societyName.trim();
    if (registerStep === 2) return !!contactEmail.trim();
    return true;
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-x-hidden bg-slate-100">
      {/* Left: branding — fixed on desktop */}
      <div className="hidden md:flex md:w-[44%] lg:w-[42%] flex-shrink-0 bg-gradient-to-b from-emerald-600 to-emerald-700 p-12 flex-col justify-center shadow-xl">
        <div className="max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-8">
            <WelcomeIllustration className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Visitor Management for Societies
          </h2>
          <p className="text-emerald-100 mt-4 text-sm leading-relaxed">
            Contactless check-in, pre-approvals, and DPDP-compliant tracking for housing societies and apartments.
          </p>
          <ul className="mt-10 space-y-4 text-sm text-white/95">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-medium shrink-0">1</span>
              QR & OTP check-in
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-medium shrink-0">2</span>
              Resident approvals & muster
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-medium shrink-0">3</span>
              India & DPDP ready
            </li>
          </ul>
        </div>
      </div>

      {/* Right: single scroll region */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start md:justify-center py-8 px-4 sm:px-6 bg-slate-100">
        <div className={`w-full flex-shrink-0 ${isRegisterSociety ? "max-w-lg" : "max-w-md"}`}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200 bg-white">
              <div className="md:hidden w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
                <WelcomeIllustration className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                {isRegisterSociety ? "Register your society" : isSignup ? "Join your society" : "Sign in"}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                {isRegisterSociety
                  ? "Step-by-step setup. You’ll be the first admin."
                  : isSignup
                    ? "Use your society code to join as Guard or Resident."
                    : "Enter your email and password."}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setTab("login")}
                className={`flex-1 py-3.5 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                  tabMode === "login"
                    ? "text-emerald-600 border-b-2 border-emerald-600 -mb-px"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`flex-1 py-3.5 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                  tabMode === "signup"
                    ? "text-emerald-600 border-b-2 border-emerald-600 -mb-px"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setTab("registerSociety")}
                className={`flex-1 py-3.5 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                  tabMode === "registerSociety"
                    ? "text-emerald-600 border-b-2 border-emerald-600 -mb-px"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register Society
              </button>
            </div>

          <form onSubmit={handleSubmit} className={`p-6 sm:px-8 ${isRegisterSociety ? "space-y-5" : "space-y-4"}`}>
            {error && (
              <div className="text-red-700 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {isSignup && (
              <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                <div>
                  <label htmlFor="societyCode" className={labelClass}>
                    Society code *
                  </label>
                  <input
                    id="societyCode"
                    type="text"
                    value={societyCode}
                    onChange={(e) => setSocietyCode(e.target.value)}
                    placeholder="e.g. green-valley or demo-society"
                    className={inputClass}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Get the society code from your building manager. Only Guard and Resident can join here; to create a society and become Admin, use Register Society.
                  </p>
                  {societyNotFound && (
                    <p className="mt-1.5 text-xs text-amber-700">
                      Society not found. Check the code or use Register Society to create a new one.
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    I am a *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOIN_SOCIETY_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`flex-1 min-w-0 py-2.5 px-3 rounded-lg text-sm font-medium border transition ${
                          selectedRole === r
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
                        }`}
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Admin can only be created when you Register a new society (see Register Society tab).
                  </p>
                </div>
                <div>
                  <label htmlFor="fullName" className={labelClass}>
                    Full name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={inputClass}
                    required
                  />
                </div>
                {buildings.length > 0 && (
                  <div>
                    <label htmlFor="building" className={labelClass}>
                      Building / wing (optional)
                    </label>
                    <select
                      id="building"
                      value={selectedBuildingId}
                      onChange={(e) => setSelectedBuildingId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— Select (optional) —</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}{b.code ? ` (${b.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </section>
            )}

            {isRegisterSociety && (
              <>
                {/* Step progress */}
                <div className="px-6 sm:px-8 pt-4 pb-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>Step {registerStep} of {REGISTER_STEPS}</span>
                    <span>{Math.round((registerStep / REGISTER_STEPS) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${(registerStep / REGISTER_STEPS) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-2.5">
                    {registerStep === 1 && "Society basics"}
                    {registerStep === 2 && "Address & contact"}
                    {registerStep === 3 && "Official documents"}
                    {registerStep === 4 && "Buildings (optional)"}
                    {registerStep === 5 && "Your admin account"}
                  </p>
                </div>

                {/* Step 1: Society basics */}
                {registerStep === 1 && (
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="societyName" className={labelClass}>Society name *</label>
                      <input
                        id="societyName"
                        type="text"
                        value={societyName}
                        onChange={(e) => setSocietyName(e.target.value)}
                        placeholder="e.g. Green Valley Apartments"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="societySlug" className={labelClass}>Society code (optional)</label>
                      <input
                        id="societySlug"
                        type="text"
                        value={societySlug}
                        onChange={(e) => setSocietySlug(e.target.value)}
                        placeholder="Leave blank to derive from name"
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-slate-500">Residents and guards use this code to join.</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Address & contact */}
                {registerStep === 2 && (
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="societyAddress" className={labelClass}>Address</label>
                      <input
                        id="societyAddress"
                        type="text"
                        value={societyAddress}
                        onChange={(e) => setSocietyAddress(e.target.value)}
                        placeholder="Street, area, landmark"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="societyCity" className={labelClass}>City</label>
                        <input id="societyCity" type="text" value={societyCity} onChange={(e) => setSocietyCity(e.target.value)} placeholder="City" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="societyState" className={labelClass}>State</label>
                        <input id="societyState" type="text" value={societyState} onChange={(e) => setSocietyState(e.target.value)} placeholder="State" className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="societyPincode" className={labelClass}>Pincode</label>
                        <input id="societyPincode" type="text" value={societyPincode} onChange={(e) => setSocietyPincode(e.target.value)} placeholder="400001" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="societyCountry" className={labelClass}>Country</label>
                        <input id="societyCountry" type="text" value={societyCountry} onChange={(e) => setSocietyCountry(e.target.value)} placeholder="India" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contactEmail" className={labelClass}>Contact email *</label>
                      <input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="society@example.com" className={inputClass} required={registerStep >= 2} />
                    </div>
                    <div>
                      <label htmlFor="contactPhone" className={labelClass}>Contact phone</label>
                      <input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="9876543210" className={inputClass} />
                    </div>
                  </div>
                )}

                {/* Step 3: Official documents */}
                {registerStep === 3 && (
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">Optional but recommended. Helps verify your society.</p>
                    <div>
                      <label htmlFor="registrationNumber" className={labelClass}>Registration number</label>
                      <input id="registrationNumber" type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. MH/HSG/2024/12345" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="societyType" className={labelClass}>Type of society</label>
                      <select id="societyType" value={societyType} onChange={(e) => setSocietyType(e.target.value)} className={inputClass}>
                        {SOCIETY_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value || "e"} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="registrationYear" className={labelClass}>Year of registration</label>
                      <input id="registrationYear" type="text" value={registrationYear} onChange={(e) => setRegistrationYear(e.target.value)} placeholder="e.g. 2018" className={inputClass} />
                    </div>
                  </div>
                )}

                {/* Step 4: Buildings (optional) */}
                {registerStep === 4 && (
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">Add towers or wings now, or skip and add later from the dashboard.</p>
                    {registerBuildings.map((b, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <input type="text" value={b.name} onChange={(e) => setRegisterBuildings((prev) => prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)))} placeholder="e.g. Tower A" className={inputClass} />
                        </div>
                        <div className="w-20">
                          <input type="text" value={b.code} onChange={(e) => setRegisterBuildings((prev) => prev.map((p, i) => (i === idx ? { ...p, code: e.target.value } : p)))} placeholder="Code" className={inputClass} />
                        </div>
                        <button type="button" onClick={() => setRegisterBuildings((prev) => prev.filter((_, i) => i !== idx))} className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50 shrink-0 transition" aria-label="Remove">✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setRegisterBuildings((prev) => [...prev, { name: "", code: "" }])} className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition">+ Add building</button>
                  </div>
                )}

                {/* Step 5: Your admin account */}
                {registerStep === 5 && (
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">You will be the first admin. Add more users from the dashboard later.</p>
                <div>
                  <label htmlFor="regFullName" className={labelClass}>
                    Your full name *
                  </label>
                  <input
                    id="regFullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={inputClass}
                    required={isRegisterSociety}
                  />
                </div>
                <div>
                  <label htmlFor="regEmail" className={labelClass}>
                    Your email (admin login) *
                  </label>
                  <input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputClass}
                    required={isRegisterSociety}
                  />
                </div>
                <div>
                  <label htmlFor="regPassword" className={labelClass}>
                    Password *
                  </label>
                  <input
                    id="regPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    required={isRegisterSociety}
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label htmlFor="regPhone" className={labelClass}>Your phone</label>
                  <input id="regPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="1234567890" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="regFlatNumber" className={labelClass}>Your flat / unit</label>
                  <input id="regFlatNumber" type="text" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} placeholder="e.g. 1201 or A-101" className={inputClass} />
                </div>
                  </div>
                )}

                {/* Wizard footer for Register Society */}
                {isRegisterSociety && (
                  <div className="px-6 sm:px-8 pb-6 flex gap-3">
                    {registerStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setRegisterStep((s) => s - 1)}
                        className="py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                      >
                        Back
                      </button>
                    ) : <div />}
                    <div className="flex-1" />
                    {registerStep < REGISTER_STEPS ? (
                      <button
                        type="button"
                        onClick={() => { if (canProceedRegisterStep()) setRegisterStep((s) => s + 1); }}
                        disabled={!canProceedRegisterStep()}
                        className="py-2.5 px-5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        Next
                      </button>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {!isRegisterSociety && (
              <>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    required
                  />
                  {isSignup && (
                    <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                  )}
                </div>

                {isSignup && (
                  <>
                    <div>
                      <label htmlFor="confirmPassword" className={labelClass}>
                        Confirm Password *
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="phone" className={labelClass}>
                          Phone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="1234567890"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="flatNumber" className={labelClass}>
                          Flat/Unit
                        </label>
                        <input
                          id="flatNumber"
                          type="text"
                          value={flatNumber}
                          onChange={(e) => setFlatNumber(e.target.value)}
                          placeholder="A-101"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {(!isRegisterSociety || registerStep === REGISTER_STEPS) && (
              <div className="px-6 sm:px-8 pb-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm"
                >
                  {loading
                    ? (isRegisterSociety ? "Creating society..." : isSignup ? "Creating account..." : "Signing in...")
                    : (isRegisterSociety ? "Register Society" : isSignup ? "Create Account" : "Sign In")}
                </button>
              </div>
            )}
          </form>

          <div className="px-6 sm:px-8 pb-6 pt-1 text-center">
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition">
              Back to home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
