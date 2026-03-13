"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import { theme } from "@/lib/theme";
import { login, getLandingPage } from "@/lib/auth";
import { useAuthContext } from "@/features/auth";
import { AuthLayout, LoginForm } from "../_components";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    const result = await login(email.trim(), password);
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
    setError("Sign in failed. Please try again.");
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Enter your email and password to access your society."
      maxWidth="md"
      links={[
        { href: "/signup", label: "Create account" },
        { href: "/register-society", label: "Register your society" },
      ]}
    >
      <form onSubmit={handleSubmit} className={`${theme.layout.contentPadding} space-y-4`}>
        {error && <Alert variant="error">{error}</Alert>}
        <LoginForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
        <button type="submit" disabled={loading} className={theme.button.submit}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
