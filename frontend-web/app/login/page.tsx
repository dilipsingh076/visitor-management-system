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
  const [registerBuildings, setRegisterBuildings] = useState<{ name: string; code: string }[]>([]);

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
        buildings: buildingsPayload.length > 0 ? buildingsPayload : undefined,
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
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
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-gradient-to-b from-primary-muted/20 to-background">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden ring-1 ring-black/5">
          <div className="bg-gradient-to-br from-primary to-primary-hover px-8 py-8 text-center">
            <div className="inline-block text-white/90 mb-3">
              <WelcomeIllustration className="w-20 h-20 sm:w-24 sm:h-24 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isRegisterSociety ? "Register Your Society" : isSignup ? "Join Your Society" : "Welcome Back"}
            </h1>
            <p className="text-primary-light mt-2 text-sm">
              {isRegisterSociety
                ? "Create your society and become the building manager (admin)"
                : isSignup
                  ? "Admin, guard, and resident accounts belong to a society"
                  : "Sign in to your society account"}
            </p>
          </div>

          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-sm font-medium transition ${
                tabMode === "login"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 py-3 text-sm font-medium transition ${
                tabMode === "signup"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setTab("registerSociety")}
              className={`flex-1 py-3 text-sm font-medium transition ${
                tabMode === "registerSociety"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Register Society
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="text-error text-sm bg-error-light px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {isSignup && (
              <>
                <div>
                  <label htmlFor="societyCode" className="block text-sm font-medium text-muted mb-1">
                    Society code *
                  </label>
                  <input
                    id="societyCode"
                    type="text"
                    value={societyCode}
                    onChange={(e) => setSocietyCode(e.target.value)}
                    placeholder="e.g. green-valley"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required
                  />
                  <p className="mt-1 text-xs text-muted">
                    Get the society code from your building manager. All roles (admin, guard, resident) are part of a society.
                  </p>
                  {societyNotFound && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                      Society not found. Check the code or use Register Society to create a new one.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
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
                            ? "bg-primary text-white border-primary"
                            : "bg-muted-bg text-muted border-border hover:border-primary/50"
                        }`}
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    To create a new society and become its admin, use the Register Society tab.
                  </p>
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-muted mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required
                  />
                </div>
                {buildings.length > 0 && (
                  <div>
                    <label htmlFor="building" className="block text-sm font-medium text-muted mb-1">
                      Building / Wing
                    </label>
                    <select
                      id="building"
                      value={selectedBuildingId}
                      onChange={(e) => setSelectedBuildingId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-background"
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
              </>
            )}

            {isRegisterSociety && (
              <>
                <p className="text-sm font-medium text-foreground border-b border-border pb-2">
                  Society information
                </p>
                <div>
                  <label htmlFor="societyName" className="block text-sm font-medium text-muted mb-1">
                    Society name *
                  </label>
                  <input
                    id="societyName"
                    type="text"
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    placeholder="e.g. Green Valley Apartments"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="societySlug" className="block text-sm font-medium text-muted mb-1">
                    Society code (optional)
                  </label>
                  <input
                    id="societySlug"
                    type="text"
                    value={societySlug}
                    onChange={(e) => setSocietySlug(e.target.value)}
                    placeholder="e.g. green-valley (leave blank to derive from society name)"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                  <p className="mt-1 text-xs text-muted">
                    If left blank, the code is derived from the society name. Residents and guards will use this code to join.
                  </p>
                </div>
                <div>
                  <label htmlFor="societyAddress" className="block text-sm font-medium text-muted mb-1">
                    Address
                  </label>
                  <input
                    id="societyAddress"
                    type="text"
                    value={societyAddress}
                    onChange={(e) => setSocietyAddress(e.target.value)}
                    placeholder="Street, area, landmark"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="societyCity" className="block text-sm font-medium text-muted mb-1">
                      City
                    </label>
                    <input
                      id="societyCity"
                      type="text"
                      value={societyCity}
                      onChange={(e) => setSocietyCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="societyState" className="block text-sm font-medium text-muted mb-1">
                      State
                    </label>
                    <input
                      id="societyState"
                      type="text"
                      value={societyState}
                      onChange={(e) => setSocietyState(e.target.value)}
                      placeholder="State"
                      className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="societyPincode" className="block text-sm font-medium text-muted mb-1">
                      Pincode
                    </label>
                    <input
                      id="societyPincode"
                      type="text"
                      value={societyPincode}
                      onChange={(e) => setSocietyPincode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="societyCountry" className="block text-sm font-medium text-muted mb-1">
                      Country
                    </label>
                    <input
                      id="societyCountry"
                      type="text"
                      value={societyCountry}
                      onChange={(e) => setSocietyCountry(e.target.value)}
                      placeholder="India"
                      className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground border-b border-border pb-2 pt-1">
                  Society contact (for official communications)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-muted mb-1">
                      Contact email *
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="society@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-muted mb-1">
                      Contact phone
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground border-b border-border pb-2 pt-1">
                  Buildings (optional)
                </p>
                <p className="text-sm text-muted -mt-1 mb-1">
                  Societies often have multiple towers or wings. Add them now or from the dashboard later.
                </p>
                {registerBuildings.map((b, idx) => (
                  <div key={idx} className="flex gap-2 items-end mb-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) =>
                          setRegisterBuildings((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p))
                          )
                        }
                        placeholder="e.g. Tower A"
                        className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        value={b.code}
                        onChange={(e) =>
                          setRegisterBuildings((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, code: e.target.value } : p))
                          )
                        }
                        placeholder="Code"
                        className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none transition text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegisterBuildings((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2.5 rounded-lg border border-border text-muted hover:bg-muted-bg hover:text-foreground transition"
                      aria-label="Remove building"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRegisterBuildings((prev) => [...prev, { name: "", code: "" }])}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  + Add building
                </button>
                <p className="text-sm font-medium text-foreground border-b border-border pb-2 pt-1 mt-4">
                  Building manager account (you)
                </p>
                <p className="text-sm text-muted -mt-1 mb-1">
                  You will be the first admin. Add more managers, guards, and residents from the dashboard after registration.
                </p>
                <div>
                  <label htmlFor="regFullName" className="block text-sm font-medium text-muted mb-1">
                    Your full name *
                  </label>
                  <input
                    id="regFullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required={isRegisterSociety}
                  />
                </div>
                <div>
                  <label htmlFor="regEmail" className="block text-sm font-medium text-muted mb-1">
                    Your email (admin login) *
                  </label>
                  <input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required={isRegisterSociety}
                  />
                </div>
                <div>
                  <label htmlFor="regPassword" className="block text-sm font-medium text-muted mb-1">
                    Password *
                  </label>
                  <input
                    id="regPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required={isRegisterSociety}
                  />
                  <p className="text-xs text-muted mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label htmlFor="regPhone" className="block text-sm font-medium text-muted mb-1">
                    Your phone
                  </label>
                  <input
                    id="regPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                </div>
              </>
            )}

            {!isRegisterSociety && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-muted mb-1">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    required
                  />
                  {isSignup && (
                    <p className="text-xs text-muted mt-1">Minimum 6 characters</p>
                  )}
                </div>

                {isSignup && (
                  <>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted mb-1">
                        Confirm Password *
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-muted mb-1">
                          Phone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="1234567890"
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="flatNumber" className="block text-sm font-medium text-muted mb-1">
                          Flat/Unit
                        </label>
                        <input
                          id="flatNumber"
                          type="text"
                          value={flatNumber}
                          onChange={(e) => setFlatNumber(e.target.value)}
                          placeholder="A-101"
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold rounded-lg transition shadow-lg"
            >
              {loading
                ? (isRegisterSociety ? "Creating society..." : isSignup ? "Creating account..." : "Signing in...")
                : (isRegisterSociety ? "Register Society" : isSignup ? "Create Account" : "Sign In")}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
