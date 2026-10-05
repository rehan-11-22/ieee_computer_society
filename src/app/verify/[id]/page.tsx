"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Eye, RotateCcw, SearchX } from "lucide-react";
import type { Certificate } from "@/lib/types";
import { VerifyHero } from "@/components/VerifyHero";

export default function VerifyResult({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/certificates/${encodeURIComponent(resolvedParams.id)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        setCert(data);
        setLoading(false);
      })
      .catch(() => {
        setCert(null);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const isValid = cert?.status === "Valid";

  return (
    <main className="verifyPortalPage">
      <VerifyHero initialCredentialId={decodeURIComponent(resolvedParams.id)} />
      <section className="verificationResultSection innerContainer" aria-live="polite">
        <div className="verificationSectionHeading compact">
          <span className="sectionPill">Official Record</span>
          <h2>Verification Result</h2>
        </div>

        {loading ? (
          <div className="verificationLoading"><span /><p>Checking official certificate records...</p></div>
        ) : cert && isValid ? (
          <article className="verificationRecord validRecord">
            <div className="verificationRecordHeader">
              <div><span className="recordStatusIcon"><BadgeCheck size={25} /></span><strong>Certificate Verified</strong></div>
              <span className="recordBadge validBadge">Valid</span>
            </div>
            <div className="verificationRecordBody">
              <dl className="verificationDetails">
                <div><dt>Recipient Name</dt><dd>{cert.recipientName}</dd></div>
                <div><dt>Certificate Title</dt><dd>{cert.certificateType}</dd></div>
                <div><dt>Event</dt><dd>{cert.eventName}</dd></div>
                <div><dt>Issue Date</dt><dd>{cert.issueDate}</dd></div>
                <div><dt>Certificate ID</dt><dd>{cert.credentialId}</dd></div>
                <div><dt>Issued By</dt><dd>{cert.organization}</dd></div>
              </dl>
              <div className="verificationCertificatePreview">
                <div className="previewCertificateBorder">
                  <span>IEEE COMPUTER SOCIETY</span>
                  <strong>{cert.certificateType}</strong>
                  <small>This certificate is awarded to</small>
                  <h3>{cert.recipientName}</h3>
                  <p>{cert.eventName}</p>
                  <BadgeCheck size={46} />
                </div>
              </div>
            </div>
            <div className="verificationRecordActions">
              <Link className="primary" href={`/certificate/${cert.credentialId}`}><Eye size={17} /> View Full Certificate</Link>
            </div>
          </article>
        ) : cert ? (
          <article className="verificationRecord revokedRecord">
            <div className="verificationRecordHeader">
              <div><span className="recordStatusIcon"><AlertTriangle size={24} /></span><strong>Certificate Revoked</strong></div>
              <span className="recordBadge revokedBadge">Revoked</span>
            </div>
            <div className="verificationMessage">
              <p>This certificate record exists, but it is no longer valid.</p>
              <Link className="retryVerification" href="/verify"><RotateCcw size={16} /> Try Another ID</Link>
            </div>
          </article>
        ) : (
          <article className="verificationRecord notFoundRecord">
            <div className="verificationRecordHeader">
              <div><span className="recordStatusIcon"><SearchX size={24} /></span><strong>Certificate Not Found</strong></div>
              <Link className="retryVerification" href="/verify"><RotateCcw size={16} /> Try Again</Link>
            </div>
            <div className="verificationMessage">
              <p>We could not find a certificate associated with this Credential ID. Check the complete ID and try again.</p>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
