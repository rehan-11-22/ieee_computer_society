"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Certificate } from "@/lib/types";
import { CertificateTemplateCanvas } from "@/components/CertificateTemplateCanvas";
import { legacyCertificateTemplateLayout } from "@/lib/certificate-template-layout";

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
            <h2>{cert.certificateType}</h2>
            <p>Issued to {cert.recipientName}. Click the Credential ID to verify it.</p>
          </div>
          <div className="certificateActions printHide">
            <a
              className="primary"
              href={`/api/certificates/${encodeURIComponent(cert.credentialId)}/pdf`}
            >
              Download PDF
            </a>
            <button className="secondary" onClick={handlePrint}>Print Preview</button>
          </div>
        </div>

        {cert.templateId ? (
          <CertificateTemplateCanvas
            imageUrl={`/api/templates/${cert.templateId}/image`}
            layout={cert.templateLayout || legacyCertificateTemplateLayout()}
            certificate={cert}
          />
        ) : (
          <div className="certificate">
            <div className="corner top"></div>
            <div className="corner bottom"></div>
            <div className="certTop">
              <Image className="certificateSocietyLogo" src="/images/ieee-neural-mark.png" alt="IEEE Society Superior University" width={218} height={103} />
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
                <Link href={cert.verificationLink}>
                  {cert.credentialId} ↗
                </Link>
              </div>
              <div className="certIssueDate">
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
        )}
      </div>
    </div>
  );
}
