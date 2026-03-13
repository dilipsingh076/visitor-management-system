"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import { theme } from "@/lib/theme";
import { getSocietyBySlug } from "@/lib/api";
import { signup, getLandingPage } from "@/lib/auth";
import { useAuthContext } from "@/features/auth";
import { AuthLayout, SignupForm } from "../_components";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthContext();
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
  const [societyLoading, setSocietyLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"resident" | "guard">("resident");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSocietyCodeBlur = () => {
    const code = societyCode.trim();
    if (!code) {
      setBuildings([]);
      setSelectedBuildingId("");
      setSocietyNotFound(false);
      return;
    }
    setSocietyLoading(true);
    setSocietyNotFound(false);
    getSocietyBySlug(code, true)
      .then((s) => {
        if (!s) {
          setBuildings([]);
          setSelectedBuildingId("");
          setSocietyNotFound(true);
          return;
        }
        setSocietyNotFound(false);
        setBuildings(s.buildings || []);
        setSelectedBuildingId("");
      })
      .finally(() => setSocietyLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!societyCode.trim()) {
      setError("Society code is required. Get it from your building manager, or register a new society.");
      setLoading(false);
      return;
    }
    if (societyNotFound) {
      setError("Society not found. Check the code or use Register Society to create a new one.");
      setLoading(false);
      return;
    }
    if (buildings.length > 0 && selectedRole === "resident" && !selectedBuildingId) {
      setError("Please select your building.");
      setLoading(false);
      return;
    }
    if (buildings.length > 0 && selectedRole === "resident" && !flatNumber.trim()) {
      setError("Please enter your flat / unit number.");
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
      society_slug: societyCode.trim(),
      building_id: selectedBuildingId || undefined,
    });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result.user) {
      setUser(result.user);
      setLoading(false);
      router.push(getLandingPage(result.user));
      return;
    }
    setError("Sign up failed. Please try again.");
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Join your society"
      subtitle="Use your society code to join as Guard or Resident. Get the code from your building manager."
      maxWidth="xl"
      links={[
        { href: "/login", label: "Already have an account? Sign in" },
        { href: "/register-society", label: "Register your society" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error" className="text-sm py-2">{error}</Alert>}
        <SignupForm
          societyCode={societyCode}
          onSocietyCodeChange={setSocietyCode}
          onSocietyCodeBlur={handleSocietyCodeBlur}
          societyNotFound={societyNotFound}
          societyLoading={societyLoading}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          fullName={fullName}
          onFullNameChange={setFullName}
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          onBuildingChange={setSelectedBuildingId}
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
          phone={phone}
          onPhoneChange={setPhone}
          flatNumber={flatNumber}
          onFlatNumberChange={setFlatNumber}
        />
        <div className="pt-1">
          <button type="submit" disabled={loading} className={`${theme.button.submit} py-3 text-sm`}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
