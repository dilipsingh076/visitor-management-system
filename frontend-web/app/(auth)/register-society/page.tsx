"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import { theme } from "@/lib/theme";
import { registerSociety } from "@/lib/auth";
import { useAuthContext } from "@/features/auth";
import {
  AuthLayout,
  RegisterSocietyWizard,
  REGISTER_STEPS,
  type RegisterSocietyState,
} from "../_components";

export default function RegisterSocietyPage() {
  const router = useRouter();
  const { setUser } = useAuthContext();
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
  const [registerBuildings, setRegisterBuildings] = useState<{ name: string }[]>([]);
  const [adminBuildingIndex, setAdminBuildingIndex] = useState(0);
  const [registerStep, setRegisterStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canProceedRegisterStep = () => {
    if (registerStep === 1) return !!societyName.trim();
    if (registerStep === 2) return !!contactEmail.trim();
    if (registerStep === 4) return registerBuildings.some((b) => b.name.trim().length > 0);
    return true;
  };

  const registerState: RegisterSocietyState = {
    registerStep,
    societyName,
    societySlug,
    societyAddress,
    societyCity,
    societyState,
    societyPincode,
    societyCountry,
    contactEmail,
    contactPhone,
    registrationNumber,
    societyType,
    registrationYear,
    registerBuildings,
    adminBuildingIndex,
    fullName,
    email,
    password,
    phone,
    flatNumber,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
      .map((b) => ({ name: b.name.trim() }));
    if (buildingsPayload.length === 0) {
      setError("Add at least one building in step 4 before registering.");
      setLoading(false);
      return;
    }
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
      buildings: buildingsPayload,
      admin_building_index: adminBuildingIndex,
      email: email.trim(),
      password,
      full_name: fullName.trim(),
      phone: phone.trim() || undefined,
      flat_number: flatNumber.trim() || undefined,
    });
    if (result.error) {
      setError(result.error);
      if (typeof window !== "undefined") console.error("[RegisterSociety] Backend error:", result.error);
      setLoading(false);
      return;
    }
    if (result.user) {
      setUser(result.user);
      setLoading(false);
      router.push("/dashboard");
      return;
    }
    setError("Registration failed. Please try again.");
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Register your society"
      subtitle="Step-by-step setup. You'll be the first admin."
      maxWidth="xl"
      links={[
        { href: "/login", label: "Already have an account? Sign in" },
        { href: "/signup", label: "Join existing society" },
      ]}
    >
      <form onSubmit={handleSubmit} className={`${theme.layout.contentPadding} space-y-5`}>
        {error && <Alert variant="error">{error}</Alert>}
        <RegisterSocietyWizard
          state={registerState}
          setters={{
            setRegisterStep,
            setSocietyName,
            setSocietySlug,
            setSocietyAddress,
            setSocietyCity,
            setSocietyState,
            setSocietyPincode,
            setSocietyCountry,
            setContactEmail,
            setContactPhone,
            setRegistrationNumber,
            setSocietyType,
            setRegistrationYear,
            setRegisterBuildings,
            setAdminBuildingIndex,
            setFullName,
            setEmail,
            setPassword,
            setPhone,
            setFlatNumber,
          }}
          canProceed={canProceedRegisterStep}
        />
        {registerStep === REGISTER_STEPS && (
          <div className="pt-2">
            <button type="submit" disabled={loading} className={theme.button.submit}>
              {loading ? "Creating society..." : "Register society"}
            </button>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}
