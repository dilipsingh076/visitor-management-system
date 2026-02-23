/**
 * Mobile web app - Visitor Management UI for guards & residents
 * Runs at localhost:8081 - mobile-first, touch-friendly
 */
import React, { useState, useEffect } from "react";

type Screen = "home" | "checkin" | "invite" | "walkin" | "dashboard";

const API = "http://localhost:8001/api/v1";

export default function AppWeb() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "home") {
    return (
      <div style={s.container}>
        <header style={s.header}>
          <div style={s.headerInner}>
            <span style={s.headerLogo}>🛡️</span>
            <span style={s.headerTitle}>Visitor Management</span>
          </div>
        </header>
        <main style={s.main}>
          <div style={s.hero}>
            <div style={s.heroIcon}>✓</div>
            <h1 style={s.heroTitle}>Welcome</h1>
            <p style={s.heroSubtitle}>Secure, contactless check-in for societies & offices</p>
          </div>
          <div style={s.cardList}>
            {[
              { title: "Check In", desc: "Scan QR or enter OTP", screen: "checkin" as Screen, icon: "📱", accent: "#059669" },
              { title: "Invite Visitor", desc: "Send pre-approval link", screen: "invite" as Screen, icon: "✉️", accent: "#0284c7" },
              { title: "Guard Walk-in", desc: "Register uninvited visitor", screen: "walkin" as Screen, icon: "👤", accent: "#d97706" },
              { title: "Dashboard", desc: "View activity & stats", screen: "dashboard" as Screen, icon: "📊", accent: "#7c3aed" },
            ].map((c) => (
              <button key={c.title} style={s.card} onClick={() => setScreen(c.screen)}>
                <span style={{ ...s.cardIcon, backgroundColor: c.accent + "20", color: c.accent }}>{c.icon}</span>
                <div style={s.cardContent}>
                  <span style={s.cardTitle}>{c.title}</span>
                  <span style={s.cardDesc}>{c.desc}</span>
                </div>
                <span style={s.cardArrow}>→</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (screen === "checkin") return <CheckInScreen onBack={() => setScreen("home")} />;
  if (screen === "invite") return <InviteScreen onBack={() => setScreen("home")} />;
  if (screen === "walkin") return <WalkInScreen onBack={() => setScreen("home")} />;
  if (screen === "dashboard") return <DashboardScreen onBack={() => setScreen("home")} />;
  return null;
}

function CheckInScreen({ onBack }: { onBack: () => void }) {
  const [otp, setOtp] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckIn = async () => {
    if (otp.length !== 6) {
      setStatus("error");
      setErrorMsg("Enter 6-digit OTP");
      return;
    }
    if (!consent) {
      setStatus("error");
      setErrorMsg("Please consent to data collection (DPDP Act 2023)");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/checkin/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, consent_given: true }),
      });
      const data = await res.json();
      if (res.ok) setStatus("success");
      else {
        setStatus("error");
        setErrorMsg(data.detail || "Check-in failed");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error");
    }
  };

  return (
    <div style={s.container}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <span style={s.headerTitle}>Check In</span>
      </header>
      <main style={s.main}>
        <div style={s.screenTitle}>Enter your check-in code</div>
        <div style={s.section}>
          <div style={s.qrBox}>
            <span style={s.qrPlaceholder}>📷</span>
            <p style={s.qrText}>QR Scanner coming soon</p>
          </div>
        </div>
        <div style={s.divider}>— OR —</div>
        <div style={s.section}>
          <label style={s.label}>6-digit OTP</label>
          <input
            style={s.input}
            placeholder="000000"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setStatus("idle"); }}
            maxLength={6}
            inputMode="numeric"
          />
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => { setConsent(e.target.checked); setStatus("idle"); }}
              style={{ marginTop: 4, width: 18, height: 18 }}
            />
            <span style={{ fontSize: 14, color: "#334155" }}>
              I consent to my data being collected for this visit (DPDP Act 2023)
            </span>
          </label>
          {status === "error" && <p style={s.errorText}>{errorMsg}</p>}
          <button
            style={{ ...s.btn, ...(status === "loading" ? s.btnDisabled : {}) }}
            onClick={handleCheckIn}
            disabled={status === "loading" || otp.length !== 6 || !consent}
          >
            {status === "loading" ? "Processing..." : "Check In"}
          </button>
          {status === "success" && (
            <div style={s.successInline}>
              <span style={s.successIcon}>✓</span>
              <span>Check-in successful!</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InviteScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState<{ otp?: string; qr_code?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async () => {
    if (!name || !phone) { setError("Name and phone required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/visitors/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer demo-token" },
        body: JSON.stringify({ visitor_name: name, visitor_phone: phone, purpose: purpose || undefined }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.detail || "Failed");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <span style={s.headerTitle}>Invite Visitor</span>
      </header>
      <main style={s.main}>
        <div style={s.screenTitle}>Pre-approve a visitor</div>
        {result ? (
          <div style={s.successBox}>
            <div style={s.successIconLarge}>✓</div>
            <h2 style={s.successTitle}>Invitation created!</h2>
            <p style={s.successDesc}>Share OTP with visitor:</p>
            <div style={s.otpDisplay}>{result.otp}</div>
            <button style={s.btn} onClick={() => { setResult(null); setName(""); setPhone(""); setPurpose(""); }}>Invite another</button>
          </div>
        ) : (
          <>
            {error && <div style={s.errorBox}>{error}</div>}
            <label style={s.label}>Visitor name</label>
            <input style={s.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <label style={s.label}>Phone (10 digits)</label>
            <input style={s.input} placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} inputMode="numeric" />
            <label style={s.label}>Purpose (optional)</label>
            <input style={s.input} placeholder="Meeting, delivery..." value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} onClick={handleInvite} disabled={loading}>
              {loading ? "Creating..." : "Send Invite"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

function WalkInScreen({ onBack }: { onBack: () => void }) {
  const [residents, setResidents] = useState<{ id: string; full_name: string; flat_no?: string }[]>([]);
  const [hostId, setHostId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState<{ otp?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/residents`, { headers: { "Authorization": "Bearer demo-token" } })
      .then((r) => r.json())
      .then((data) => { setResidents(data); if (data[0]) setHostId(data[0].id); })
      .catch(() => {});
  }, []);

  const handleWalkIn = async () => {
    if (!name || !phone) { setError("Name and phone required"); return; }
    if (!hostId) { setError("Select whom visitor wants to meet"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/visitors/walkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer demo-token" },
        body: JSON.stringify({
          visitor_name: name,
          visitor_phone: phone,
          purpose: purpose || undefined,
          host_id: hostId,
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.detail || "Failed");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <span style={s.headerTitle}>Guard Walk-in</span>
      </header>
      <main style={s.main}>
        <div style={s.screenTitle}>Register uninvited visitor. Resident will be notified to approve.</div>
        {result ? (
          <div style={s.successBox}>
            <div style={{ ...s.successIcon, backgroundColor: "#d97706" }}>⏳</div>
            <h2 style={s.successTitle}>Waiting for approval</h2>
            <p style={s.successDesc}>Resident has been notified. Allow entry only after they approve. OTP: {result.otp || "—"}</p>
            <button style={s.btn} onClick={() => { setResult(null); setName(""); setPhone(""); setPurpose(""); setHostId(residents[0]?.id || ""); }}>Register another</button>
          </div>
        ) : (
          <>
            {error && <div style={s.errorBox}>{error}</div>}
            <label style={s.label}>Visitor wants to meet *</label>
            <select
              value={hostId}
              onChange={(e) => setHostId(e.target.value)}
              style={{ ...s.input, marginBottom: 16 }}
            >
              {residents.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name} {r.flat_no ? `(Flat ${r.flat_no})` : ""}</option>
              ))}
            </select>
            <label style={s.label}>Visitor name</label>
            <input style={s.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <label style={s.label}>Phone (10 digits)</label>
            <input style={s.input} placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} inputMode="numeric" />
            <label style={s.label}>Purpose (optional)</label>
            <input style={s.input} placeholder="Meeting, delivery..." value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} onClick={handleWalkIn} disabled={loading || !residents.length}>
              {loading ? "Registering..." : "Register Walk-in"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

function DashboardScreen({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState({ visitors_today: 0, pending_approvals: 0, checked_in: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/dashboard/stats`, { headers: { "Authorization": "Bearer demo-token" } })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.container}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <span style={s.headerTitle}>Dashboard</span>
      </header>
      <main style={s.main}>
        <div style={s.screenTitle}>Activity overview</div>
        {loading ? (
          <div style={s.loadingState}>Loading...</div>
        ) : (
          <div style={s.statGrid}>
            <div style={s.statCard}>
              <span style={s.statIcon}>👥</span>
              <span style={s.statValue}>{stats.visitors_today}</span>
              <span style={s.statLabel}>Visitors Today</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statIcon}>⏳</span>
              <span style={s.statValue}>{stats.pending_approvals}</span>
              <span style={s.statLabel}>Pending</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statIcon}>✓</span>
              <span style={s.statValue}>{stats.checked_in}</span>
              <span style={s.statLabel}>Checked In</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", backgroundColor: "#f1f5f9" },
  header: { display: "flex", alignItems: "center", backgroundColor: "#059669", padding: "12px 16px", paddingTop: "calc(12px + env(safe-area-inset-top))", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  headerInner: { display: "flex", alignItems: "center", gap: 8 },
  headerLogo: { fontSize: 24 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: 700 },
  backBtn: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 20, cursor: "pointer", marginRight: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  main: { padding: 20, maxWidth: 480, margin: "0 auto", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" },
  hero: { textAlign: "center", marginBottom: 28, paddingTop: 8 },
  heroIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32, fontWeight: 700 },
  heroTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: "#64748b", lineHeight: 1.5 },
  cardList: { display: "flex", flexDirection: "column", gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, border: "none", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, position: "relative", minHeight: 72 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  cardContent: { flex: 1, minWidth: 0 },
  cardTitle: { display: "block", fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  cardDesc: { display: "block", fontSize: 13, color: "#64748b" },
  cardArrow: { position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18 },
  screenTitle: { fontSize: 16, color: "#64748b", marginBottom: 20 },
  section: { marginBottom: 24 },
  label: { display: "block", fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 8 },
  qrBox: { height: 140, backgroundColor: "#fff", borderRadius: 16, border: "2px dashed #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" },
  qrPlaceholder: { fontSize: 40, marginBottom: 8 },
  qrText: { fontSize: 14 },
  divider: { textAlign: "center", margin: "24px 0", color: "#94a3b8", fontSize: 13 },
  input: { width: "100%", boxSizing: "border-box", padding: 16, fontSize: 16, border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 16, backgroundColor: "#fff" },
  btn: { width: "100%", padding: 16, backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  btnDisabled: { opacity: 0.6 },
  successText: { color: "#059669", marginTop: 12 },
  errorText: { color: "#dc2626", marginTop: -8, marginBottom: 12, fontSize: 14 },
  errorBox: { padding: 12, backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  successInline: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "#059669", fontWeight: 600 },
  successIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  successBox: { backgroundColor: "#ecfdf5", borderRadius: 16, padding: 28, textAlign: "center", border: "1px solid #a7f3d0" },
  successIconLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#059669", color: "#fff", margin: "0 auto 16px", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  successDesc: { fontSize: 14, color: "#64748b", marginBottom: 16 },
  otpDisplay: { fontSize: 28, fontWeight: 700, fontFamily: "monospace", color: "#059669", marginBottom: 20, letterSpacing: 4 },
  loadingState: { textAlign: "center", color: "#64748b", padding: 40 },
  dashSubtitle: { fontSize: 14, color: "#64748b", marginBottom: 20 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  statCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 8 },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 28, fontWeight: 800, color: "#0f172a" },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
};
