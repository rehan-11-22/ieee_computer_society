"use client";
import { useEffect, useState } from "react";
import { Certificate } from "@/lib/db";
import Link from "next/link";

export default function AdminPage() {
  const [authState, setAuthState] = useState<"loading" | "login" | "signup" | "authenticated">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [fName, setFName] = useState("");
  const [fType, setFType] = useState("Certificate of Appreciation");
  const [fEvent, setFEvent] = useState("");
  const [fDate, setFDate] = useState("");
  const [fIssuedBy, setFIssuedBy] = useState("President Ahmad Kashif");
  const [fOrg, setFOrg] = useState("IEEE Computer Society");
  const [fCred, setFCred] = useState("");

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUserEmail(data.user.email);
          setAuthState("authenticated");
          return;
        }
      }
    } catch {}
    setAuthState("login");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          action: authState === "signup" ? "signup" : "login"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        setAuthLoading(false);
        return;
      }

      if (authState === "signup") {
        // After signup, log them in
        setAuthState("login");
        setAuthError("");
        setAuthLoading(false);
        alert("Account created! Please login now.");
        return;
      }

      setUserEmail(data.user.email);
      setAuthState("authenticated");
    } catch {
      setAuthError("Network error. Please try again.");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthState("login");
    setEmail("");
    setPassword("");
    setCertificates([]);
  };

  const loadCertificates = async () => {
    const res = await fetch("/api/certificates");
    if (res.ok) {
      setCertificates(await res.json());
    }
  };

  useEffect(() => {
    if (authState === "authenticated") {
      loadCertificates();
    }
  }, [authState]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCert = {
      credentialId: fCred || `IEECS-SU-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
      recipientName: fName,
      certificateType: fType,
      eventName: fEvent,
      issueDate: fDate,
      issuedBy: fIssuedBy,
      organization: fOrg,
      status: "Valid" as "Valid"
    };

    const res = await fetch("/api/certificates", {
      method: "POST",
      body: JSON.stringify(newCert),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      setShowModal(false);
      loadCertificates();
      setFName(""); setFEvent(""); setFDate(""); setFCred("");
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    await fetch(`/api/certificates/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: current === "Valid" ? "Revoked" : "Valid" }),
      headers: { "Content-Type": "application/json" }
    });
    loadCertificates();
  };

  const deleteCert = async (id: string) => {
    if (confirm("Delete this certificate?")) {
      await fetch(`/api/certificates/${id}`, { method: "DELETE" });
      loadCertificates();
    }
  };

  const filtered = certificates.filter(c =>
    c.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    c.credentialId.toLowerCase().includes(search.toLowerCase())
  );

  // Loading state
  if (authState === "loading") {
    return (
      <div className="loginWrap">
        <div className="loginCard">
          <div style={{ fontSize: "32px", marginBottom: "15px" }}>⏳</div>
          <h2>Checking Authentication...</h2>
        </div>
      </div>
    );
  }

  // Login / Signup
  if (authState === "login" || authState === "signup") {
    return (
      <div className="loginWrap">
        <div className="loginCard">
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--navy)", color: "white", display: "grid", placeItems: "center", margin: "0 auto 15px", fontSize: "20px", fontWeight: 800 }}>🔐</div>
          <div className="eyebrow">Restricted Area</div>
          <h2>{authState === "login" ? "Login" : "Create Account"}</h2>
          <p>{authState === "login" ? "Sign in to manage certificates." : "Create a new admin account."}</p>

          {authError && (
            <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginTop: "15px", textAlign: "left" }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "14px", margin: "15px 0 0", border: "1px solid #d7e0eb", borderRadius: "10px", outline: "none" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "14px", margin: "10px 0", border: "1px solid #d7e0eb", borderRadius: "10px", outline: "none" }}
            />
            <button
              className="primary"
              type="submit"
              disabled={authLoading}
              style={{ width: "100%", opacity: authLoading ? 0.7 : 1 }}
            >
              {authLoading ? "Please wait..." : authState === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <div style={{ marginTop: "20px", fontSize: "13px", color: "var(--muted)" }}>
            {authState === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => { setAuthState("signup"); setAuthError(""); }} style={{ border: 0, background: "none", color: "var(--blue)", fontWeight: 700, cursor: "pointer" }}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => { setAuthState("login"); setAuthError(""); }} style={{ border: 0, background: "none", color: "var(--blue)", fontWeight: 700, cursor: "pointer" }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - Admin Panel
  return (
    <div className="page active" style={{ display: "block" }}>
      <div className="adminPanel">
        <div className="adminTop">
          <div>
            <div className="eyebrow">Administration</div>
            <h2>Certificate Records</h2>
            <p>Logged in as <strong>{userEmail}</strong></p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary" onClick={() => setShowModal(true)}>+ Add Certificate</button>
            <button className="secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <span>Total Certificates</span>
            <strong>{certificates.length}</strong>
          </div>
          <div className="stat">
            <span>Valid</span>
            <strong style={{ color: "var(--green)" }}>{certificates.filter(c => c.status === "Valid").length}</strong>
          </div>
          <div className="stat">
            <span>Revoked</span>
            <strong style={{ color: "var(--red)" }}>{certificates.filter(c => c.status === "Revoked").length}</strong>
          </div>
        </div>

        <div className="tableBox">
          <div className="toolbar">
            <input
              placeholder="Search by name or Credential ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>Credential ID</th>
                <th>Recipient</th>
                <th>Certificate</th>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                    {search ? "No certificates match your search." : "No certificates yet. Click '+ Add Certificate' to create one."}
                  </td>
                </tr>
              ) : (
                filtered.map(cert => (
                  <tr key={cert.id || cert.credentialId}>
                    <td>
                      <Link href={`/certificate/${cert.credentialId}`} style={{ color: "var(--blue)" }}>
                        {cert.credentialId}
                      </Link>
                    </td>
                    <td>{cert.recipientName}</td>
                    <td>{cert.certificateType}</td>
                    <td>{cert.eventName}</td>
                    <td>{cert.issueDate}</td>
                    <td>
                      <span className={`status ${cert.status.toLowerCase()}`}>{cert.status}</span>
                    </td>
                    <td>
                      <button className="tableAction" onClick={() => toggleStatus(cert.credentialId, cert.status)}>
                        {cert.status === "Valid" ? "Revoke" : "Validate"}
                      </button>
                      <button className="tableAction tableDelete" onClick={() => deleteCert(cert.credentialId)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modalBox">
            <button className="close" onClick={() => setShowModal(false)}>×</button>
            <div className="eyebrow">Certificate Record</div>
            <h2 style={{ color: "var(--navy)", marginBottom: "20px" }}>Add Certificate</h2>

            <form className="formGrid" onSubmit={handleSave}>
              <input placeholder="Student / Recipient Name" required value={fName} onChange={e => setFName(e.target.value)} />
              <select required value={fType} onChange={e => setFType(e.target.value)}>
                <option>Certificate of Appreciation</option>
                <option>Certificate of Participation</option>
                <option>Certificate of Achievement</option>
                <option>Certificate of Completion</option>
              </select>
              <input placeholder="Event Name" required value={fEvent} onChange={e => setFEvent(e.target.value)} />
              <input type="date" required value={fDate} onChange={e => setFDate(e.target.value)} />
              <input placeholder="Issued By" required value={fIssuedBy} onChange={e => setFIssuedBy(e.target.value)} />
              <input placeholder="Issuing Organization" required value={fOrg} onChange={e => setFOrg(e.target.value)} />
              <input className="full" placeholder="Credential ID (Leave blank to auto-generate)" value={fCred} onChange={e => setFCred(e.target.value)} />
              <button className="primary full" type="submit">Save Certificate</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
