"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Certificate } from "@/lib/db";

export default function CertificateView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/certificates/${resolvedParams.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setCert(data);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="section">Loading...</div>;
  if (!cert) return <div className="section">Certificate not found.</div>;

  return (
    <div className="page active">
      <div className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Official Certificate Preview</div>
            <h2>Sample Certificate</h2>
            <p>Click the Credential ID to verify this certificate.</p>
          </div>
          <button className="primary printHide" onClick={handlePrint}>
            Print / Save PDF
          </button>
        </div>

        <div className="certificate">
          <div className="corner top"></div>
          <div className="corner bottom"></div>

          <div className="certTop">
            <div className="certLogo">CS</div>
            <div>
              <strong>IEEE Computer Society</strong>
              <span>Superior University Student Branch</span>
            </div>
          </div>

          <div className="certBody">
            <div className="certTitle">{cert.certificateType.toUpperCase()}</div>
            <p>This certificate is proudly presented to</p>
            <h1>{cert.recipientName}</h1>
            <p>
              for valuable contribution to <strong>{cert.eventName}</strong><br />
              organized by {cert.organization}.
            </p>

            <div className="certId">
              Credential ID:{" "}
              <Link href={`/verify/${cert.credentialId}`} style={{ color: "var(--blue)", fontWeight: 800 }}>
                {cert.credentialId} ↗
              </Link>
            </div>
            <div style={{ marginTop: "7px", color: "#7a8799", fontSize: "12px" }}>
              Issue Date: {cert.issueDate}
            </div>
          </div>

          <div className="certBottom">
            <div className="signature">
              <strong>Issued By</strong>
              <span>{cert.issuedBy}</span>
            </div>
            <div className="signature">
              <strong>Issuing Organization</strong>
              <span>{cert.organization}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
