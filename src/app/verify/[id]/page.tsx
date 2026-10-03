"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Certificate } from "@/lib/types";

export default function VerifyResult({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/certificates/${resolvedParams.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setCert(data);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) return <div className="resultWrap">Loading...</div>;

  return (
    <div className="page active">
      <div className="resultWrap">
        <button className="backBtn" onClick={() => router.push("/")}>
          ← Back to Verification
        </button>

        <div className="resultBox">
          {cert ? (
            cert.status === "Valid" ? (
              <>
                <div className="resultHeader valid">
                  <div className="resultIcon">✓</div>
                  <div>
                    <h2>Certificate Verified</h2>
                    <p style={{ color: "var(--green)" }}>This certificate is genuine and valid.</p>
                  </div>
                </div>
                <div className="detailGrid">
                  <div className="detail"><span>Recipient Name</span><strong>{cert.recipientName}</strong></div>
                  <div className="detail"><span>Certificate Title</span><strong>{cert.certificateType}</strong></div>
                  <div className="detail"><span>Event</span><strong>{cert.eventName}</strong></div>
                  <div className="detail"><span>Issuing Organization</span><strong>{cert.organization}</strong></div>
                  <div className="detail"><span>Issued By</span><strong>{cert.issuedBy}</strong></div>
                  <div className="detail"><span>Issue Date</span><strong>{cert.issueDate}</strong></div>
                  <div className="detail"><span>Credential ID</span><strong>{cert.credentialId}</strong></div>
                  <div className="detail"><span>Status</span><strong className="statusValid">Valid</strong></div>
                </div>
                <div className="resultActions">
                  <Link href={`/certificate/${cert.credentialId}`}>
                    <button className="primary">View Full Certificate</button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="resultHeader revoked">
                <div className="resultIcon">⚠</div>
                <div>
                  <h2>Certificate Revoked</h2>
                  <p style={{ color: "var(--red)" }}>This certificate is no longer valid.</p>
                </div>
              </div>
            )
          ) : (
            <>
              <div className="resultHeader notfound">
                <div className="resultIcon">✕</div>
                <div>
                  <h2 style={{ color: "var(--red)" }}>Certificate Not Found</h2>
                  <p>The entered Credential ID is not valid or does not exist.</p>
                </div>
              </div>
              <div className="resultNote notFoundHelp">
                <div className="helpIcon">i</div>
                <div>
                  <strong>Please check the Credential ID and try again.</strong>
                  <p>
                    Make sure the complete ID is entered exactly as printed on the certificate.
                    If you believe this is an error, contact IEEE CS Superior University Student Branch.
                  </p>
                  <button className="secondary" onClick={() => router.push("/#verify")}>
                    Try Another Credential ID
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
