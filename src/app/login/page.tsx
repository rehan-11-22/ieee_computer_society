"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminAccount, Certificate, CertificateTemplate } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Toast, type ToastMessage } from "@/components/Toast";

export default function AdminPage() {
  const [authState, setAuthState] = useState<"loading" | "login" | "authenticated">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [activePanel, setActivePanel] = useState<"certificates" | "templates" | "admins">("certificates");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId = useRef(0);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState("");
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Certificate | null>(null);

  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateAsDefault, setTemplateAsDefault] = useState(true);
  const [templateUploading, setTemplateUploading] = useState(false);

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
  const [adminFormError, setAdminFormError] = useState("");
  const [adminFormLoading, setAdminFormLoading] = useState(false);

  // Form state
  const [fName, setFName] = useState("");
  const [fType, setFType] = useState("Certificate of Appreciation");
  const [fEvent, setFEvent] = useState("");
  const [fDate, setFDate] = useState("");
  const [fIssuedBy, setFIssuedBy] = useState("President Ahmad Kashif");
  const [fOrg, setFOrg] = useState("IEEE Computer Society");
  const [fCred, setFCred] = useState("");
  const [fTemplateId, setFTemplateId] = useState("");

  const closeToast = useCallback(() => setToast(null), []);

  function showToast(message: string, type: ToastMessage["type"] = "success") {
    toastId.current += 1;
    setToast({ id: toastId.current, message, type });
  }

  // Check auth on mount
  useEffect(() => {
    let cancelled = false;

    async function initializeDashboard() {
      try {
        const authResponse = await fetch("/api/auth/me");
        if (authResponse.ok) {
          const data = await authResponse.json();
          if (data.authenticated) {
            const [certificateResponse, templateResponse] = await Promise.all([
              fetch("/api/certificates"),
              fetch("/api/templates"),
            ]);
            const initialCertificates = certificateResponse.ok ? await certificateResponse.json() : [];
            const initialTemplates = templateResponse.ok ? await templateResponse.json() : [];

            if (!cancelled) {
              setCertificates(initialCertificates);
              setTemplates(initialTemplates);
              if (!certificateResponse.ok) {
                setActionError("Certificates could not be loaded. Please refresh and try again.");
              }
              setUserEmail(data.user.email);
              setAuthState("authenticated");
            }
            return;
          }
        }
      } catch {
        // The login form below handles unavailable authentication services.
      }

      if (!cancelled) setAuthState("login");
    }

    void initializeDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadCertificates() {
    const res = await fetch("/api/certificates");
    if (res.ok) {
      setCertificates(await res.json());
      setActionError("");
      return true;
    }
    if (res.status === 401) setAuthState("login");
    const data = await res.json().catch(() => ({}));
    setActionError(data.error || "Certificates could not be loaded");
    return false;
  }

  async function loadAdmins() {
    setAdminsLoading(true);
    try {
      const res = await fetch("/api/admins");
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        if (res.status === 401) setAuthState("login");
        showToast(data.error || "Admin accounts could not be loaded", "error");
        return false;
      }
      setAdmins(data);
      return true;
    } catch {
      showToast("Network error while loading admin accounts", "error");
      return false;
    } finally {
      setAdminsLoading(false);
    }
  }

  async function loadTemplates() {
    setTemplatesLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        if (res.status === 401) setAuthState("login");
        showToast(data.error || "Certificate templates could not be loaded", "error");
        return false;
      }
      setTemplates(data);
      return true;
    } catch {
      showToast("Network error while loading certificate templates", "error");
      return false;
    } finally {
      setTemplatesLoading(false);
    }
  }

  const openAdminsPanel = async () => {
    setActivePanel("admins");
    if (admins.length === 0) await loadAdmins();
  };

  const openTemplatesPanel = async () => {
    setActivePanel("templates");
    if (templates.length === 0) await loadTemplates();
  };

  const resetCertificateForm = () => {
    setFName("");
    setFType("Certificate of Appreciation");
    setFEvent("");
    setFDate("");
    setFIssuedBy("President Ahmad Kashif");
    setFOrg("IEEE Computer Society");
    setFCred("");
    setFTemplateId(templates.find((template) => template.isDefault)?.id || "");
    setEditingCredentialId(null);
    setCertificateError("");
  };

  const openCreateModal = () => {
    resetCertificateForm();
    setShowModal(true);
  };

  const openEditModal = (certificate: Certificate) => {
    setEditingCredentialId(certificate.credentialId);
    setFName(certificate.recipientName);
    setFType(certificate.certificateType);
    setFEvent(certificate.eventName);
    setFDate(certificate.issueDate);
    setFIssuedBy(certificate.issuedBy);
    setFOrg(certificate.organization);
    setFCred(certificate.credentialId);
    setFTemplateId(certificate.templateId || "");
    setCertificateError("");
    setShowModal(true);
  };

  const closeCertificateModal = () => {
    setShowModal(false);
    resetCertificateForm();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        setAuthLoading(false);
        return;
      }

      await Promise.all([loadCertificates(), loadTemplates()]);
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
    setTemplates([]);
    setAdmins([]);
    setActivePanel("certificates");
    setToast(null);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError("");

    if (adminPassword !== adminPasswordConfirm) {
      setAdminFormError("Passwords do not match");
      showToast("Passwords do not match", "error");
      return;
    }

    setAdminFormLoading(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data.error || "Admin account could not be created";
        setAdminFormError(message);
        showToast(message, "error");
        return;
      }

      setAdmins((current) => [...current, data]);
      setAdminEmail("");
      setAdminPassword("");
      setAdminPasswordConfirm("");
      showToast(`Admin ${data.email} created successfully`);
    } catch {
      const message = "Network error. Please try again.";
      setAdminFormError(message);
      showToast(message, "error");
    } finally {
      setAdminFormLoading(false);
    }
  };

  const handleTemplateUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!templateFile) {
      showToast("Select a PNG or JPEG template image", "error");
      return;
    }

    setTemplateUploading(true);
    try {
      const formData = new FormData();
      formData.set("name", templateName);
      formData.set("image", templateFile);
      formData.set("setAsDefault", String(templateAsDefault));
      const res = await fetch("/api/templates", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Certificate template could not be uploaded", "error");
        return;
      }

      await loadTemplates();
      setTemplateName("");
      setTemplateFile(null);
      setTemplateAsDefault(false);
      const fileInput = document.getElementById("template-image") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      showToast(`Template ${data.name} uploaded successfully`);
    } catch {
      showToast("Network error while uploading the template", "error");
    } finally {
      setTemplateUploading(false);
    }
  };

  const makeDefaultTemplate = async (template: CertificateTemplate) => {
    try {
      const res = await fetch(`/api/templates/${template.id}`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Default template could not be changed", "error");
        return;
      }
      await loadTemplates();
      showToast(`${template.name} is now the default template`);
    } catch {
      showToast("Network error while updating the template", "error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertificateError("");
    setCertificateLoading(true);

    const certificateDetails = {
      recipientName: fName,
      certificateType: fType,
      eventName: fEvent,
      issueDate: fDate,
      issuedBy: fIssuedBy,
      organization: fOrg,
      templateId: fTemplateId || null,
    };

    try {
      const url = editingCredentialId
        ? `/api/certificates/${encodeURIComponent(editingCredentialId)}`
        : "/api/certificates";
      const res = await fetch(url, {
        method: editingCredentialId ? "PUT" : "POST",
        body: JSON.stringify(
          editingCredentialId
            ? certificateDetails
            : { ...certificateDetails, credentialId: fCred || undefined },
        ),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error || "Certificate could not be saved";
        setCertificateError(message);
        showToast(message, "error");
        return;
      }

      closeCertificateModal();
      await loadCertificates();
      showToast(
        editingCredentialId
          ? `Certificate ${data.credentialId} updated successfully`
          : `Certificate ${data.credentialId} created successfully`,
      );
    } catch {
      setCertificateError("Network error. Please try again.");
      showToast("Certificate could not be saved", "error");
    } finally {
      setCertificateLoading(false);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    setActionError("");
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: current === "Valid" ? "Revoked" : "Valid" }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.error || "Certificate status could not be updated";
        setActionError(message);
        showToast(message, "error");
        return;
      }
      await loadCertificates();
      showToast(`Certificate ${id} marked ${current === "Valid" ? "Revoked" : "Valid"}`);
    } catch {
      setActionError("Network error. Please try again.");
      showToast("Certificate status could not be updated", "error");
    }
  };

  const deleteCertificate = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.credentialId;
    setActionError("");
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.error || "Certificate could not be deleted";
        setActionError(message);
        showToast(message, "error");
        return;
      }
      setPendingDelete(null);
      await loadCertificates();
      showToast(`Certificate ${id} deleted successfully`);
    } catch {
      setActionError("Network error. Please try again.");
      showToast("Certificate could not be deleted", "error");
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

  // Login
  if (authState === "login") {
    return (
      <div className="loginWrap">
        <div className="loginCard">
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--navy)", color: "white", display: "grid", placeItems: "center", margin: "0 auto 15px", fontSize: "20px", fontWeight: 800 }}>🔐</div>
          <div className="eyebrow">Restricted Area</div>
          <h2>Admin Login</h2>
          <p>Sign in to manage certificates and admin accounts.</p>

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
              {authLoading ? "Please wait..." : "Sign In →"}
            </button>
          </form>
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
            <h2>
              {activePanel === "certificates"
                ? "Certificate Records"
                : activePanel === "templates"
                  ? "Certificate Templates"
                  : "Admin Accounts"}
            </h2>
            <p>Logged in as <strong>{userEmail}</strong></p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {activePanel === "certificates" && (
              <button className="primary" onClick={openCreateModal}>+ Add Certificate</button>
            )}
            <button className="secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="adminTabs" role="tablist" aria-label="Admin dashboard sections">
          <button
            type="button"
            role="tab"
            aria-selected={activePanel === "certificates"}
            className={activePanel === "certificates" ? "active" : ""}
            onClick={() => setActivePanel("certificates")}
          >
            Certificates
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePanel === "templates"}
            className={activePanel === "templates" ? "active" : ""}
            onClick={() => void openTemplatesPanel()}
          >
            Templates
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePanel === "admins"}
            className={activePanel === "admins" ? "active" : ""}
            onClick={() => void openAdminsPanel()}
          >
            Admins
          </button>
        </div>

        {actionError && (
          <div className="adminError" role="alert">{actionError}</div>
        )}

        {activePanel === "certificates" ? (
          <>
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
                          <a
                            className="tableAction"
                            href={`/api/certificates/${encodeURIComponent(cert.credentialId)}/pdf`}
                          >
                            PDF
                          </a>
                          <button className="tableAction" onClick={() => openEditModal(cert)}>
                            Edit
                          </button>
                          <button className="tableAction" onClick={() => toggleStatus(cert.credentialId, cert.status)}>
                            {cert.status === "Valid" ? "Revoke" : "Validate"}
                          </button>
                          <button className="tableAction tableDelete" onClick={() => setPendingDelete(cert)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : activePanel === "templates" ? (
          <div className="templateManagement">
            <section className="templateUploadCard">
              <div className="eyebrow">Design Upload</div>
              <h3>Add Certificate Template</h3>
              <p>
                Upload a landscape PNG or JPEG background. The system places recipient details,
                Credential ID, verification link, and signatures on top and generates the PDF.
              </p>
              <form className="templateForm" onSubmit={handleTemplateUpload}>
                <label htmlFor="template-name">Template name</label>
                <input
                  id="template-name"
                  required
                  maxLength={100}
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  placeholder="e.g. Appreciation 2026"
                />
                <label htmlFor="template-image">PNG or JPEG image</label>
                <input
                  id="template-image"
                  type="file"
                  required
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  onChange={(event) => setTemplateFile(event.target.files?.[0] || null)}
                />
                <span className="formHelp">Maximum file size: 5 MB. Landscape format is recommended.</span>
                <label className="templateCheckbox">
                  <input
                    type="checkbox"
                    checked={templateAsDefault}
                    onChange={(event) => setTemplateAsDefault(event.target.checked)}
                  />
                  Use as the default for new certificates
                </label>
                <button className="primary" type="submit" disabled={templateUploading}>
                  {templateUploading ? "Uploading..." : "+ Upload Template"}
                </button>
              </form>
            </section>

            <section className="templateLibraryCard">
              <div className="adminListHead">
                <div>
                  <div className="eyebrow">Template Library</div>
                  <h3>Available Templates</h3>
                </div>
                <span className="adminCount">{templates.length}</span>
              </div>
              {templatesLoading ? (
                <p className="adminEmpty">Loading certificate templates...</p>
              ) : templates.length === 0 ? (
                <p className="adminEmpty">
                  No image template uploaded yet. Existing certificates use the built-in design.
                </p>
              ) : (
                <div className="templateGrid">
                  {templates.map((template) => (
                    <article className="templateCard" key={template.id}>
                      <div className="templatePreview">
                        <Image
                          src={template.imageUrl}
                          alt={`${template.name} certificate background`}
                          fill
                          sizes="(max-width: 850px) 100vw, 360px"
                          unoptimized
                        />
                      </div>
                      <div className="templateMeta">
                        <div>
                          <strong>{template.name}</strong>
                          <span>
                            {template.mimeType === "image/png" ? "PNG" : "JPEG"} · {(template.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        {template.isDefault ? (
                          <span className="defaultTemplateBadge">Default</span>
                        ) : (
                          <button
                            type="button"
                            className="tableAction"
                            onClick={() => void makeDefaultTemplate(template)}
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="adminManagement">
            <section className="adminCreateCard">
              <div className="eyebrow">Authorized Access</div>
              <h3>Add New Admin</h3>
              <p>New admins can manage certificates and create other admin accounts.</p>

              {adminFormError && <div className="formError" role="alert">{adminFormError}</div>}

              <form className="adminForm" onSubmit={handleCreateAdmin}>
                <label htmlFor="admin-email">Email address</label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="admin@example.com"
                />
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  minLength={10}
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="At least 10 characters"
                />
                <label htmlFor="admin-password-confirm">Confirm password</label>
                <input
                  id="admin-password-confirm"
                  type="password"
                  required
                  minLength={10}
                  value={adminPasswordConfirm}
                  onChange={(event) => setAdminPasswordConfirm(event.target.value)}
                  placeholder="Re-enter password"
                />
                <button className="primary" type="submit" disabled={adminFormLoading}>
                  {adminFormLoading ? "Creating Admin..." : "+ Create Admin"}
                </button>
              </form>
            </section>

            <section className="adminListCard">
              <div className="adminListHead">
                <div>
                  <div className="eyebrow">Access List</div>
                  <h3>Existing Admins</h3>
                </div>
                <span className="adminCount">{admins.length}</span>
              </div>
              {adminsLoading ? (
                <p className="adminEmpty">Loading admin accounts...</p>
              ) : admins.length === 0 ? (
                <p className="adminEmpty">No admin accounts found.</p>
              ) : (
                <div className="adminAccountList">
                  {admins.map((admin) => (
                    <div className="adminAccount" key={admin.id}>
                      <div className="adminAvatar">{admin.email.charAt(0).toUpperCase()}</div>
                      <div>
                        <strong>{admin.email}</strong>
                        <span>Administrator · Added {new Date(admin.createdAt).toLocaleDateString()}</span>
                      </div>
                      {admin.email === userEmail && <span className="currentAdmin">You</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={closeToast} />

      {showModal && (
        <div className="modal">
          <div className="modalBox">
            <button className="close" onClick={closeCertificateModal} aria-label="Close">×</button>
            <div className="eyebrow">Certificate Record</div>
            <h2 style={{ color: "var(--navy)", marginBottom: "20px" }}>
              {editingCredentialId ? "Edit Certificate" : "Add Certificate"}
            </h2>

            {certificateError && (
              <div className="formError" role="alert">{certificateError}</div>
            )}

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
              <select
                className="full"
                value={fTemplateId}
                onChange={(event) => setFTemplateId(event.target.value)}
                aria-label="Certificate template"
              >
                <option value="">Built-in default design</option>
                {templates.map((template) => (
                  <option value={template.id} key={template.id}>
                    {template.name}{template.isDefault ? " (Default)" : ""}
                  </option>
                ))}
              </select>
              <span className="formHelp full">
                The selected image is used as the PDF background. Dynamic certificate details are added automatically.
              </span>
              <input
                className="full"
                placeholder="Credential ID (leave blank for secure auto-generation)"
                value={fCred}
                onChange={e => setFCred(e.target.value)}
                disabled={editingCredentialId !== null}
                aria-describedby="credential-id-help"
              />
              <span className="formHelp full" id="credential-id-help">
                {editingCredentialId
                  ? "Credential ID cannot be changed after issue."
                  : "Leave blank to generate the next unique Credential ID on the server."}
              </span>
              <button className="primary full" type="submit" disabled={certificateLoading}>
                {certificateLoading
                  ? "Saving..."
                  : editingCredentialId
                    ? "Update Certificate"
                    : "Save Certificate"}
              </button>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="modal" role="presentation">
          <div className="confirmBox" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="confirmIcon" aria-hidden="true">!</div>
            <h2 id="delete-title">Delete Certificate?</h2>
            <p>
              <strong>{pendingDelete.credentialId}</strong> for {pendingDelete.recipientName} will be
              permanently removed. This action cannot be undone.
            </p>
            <div className="confirmActions">
              <button className="secondary" type="button" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button className="dangerButton" type="button" onClick={() => void deleteCertificate()}>
                Delete Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
