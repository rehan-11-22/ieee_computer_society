"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";

export function VerifyHero({ initialCredentialId = "" }: { initialCredentialId?: string }) {
  const [credentialId, setCredentialId] = useState(initialCredentialId);
  const router = useRouter();

  function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedId = credentialId.trim().toUpperCase();
    if (normalizedId) router.push(`/verify/${encodeURIComponent(normalizedId)}`);
  }

  return (
    <section className="verifyPortalHero">
      <div className="verifyPortalHeroInner innerContainer">
        <div className="verifyPortalCopy">
          <span>Certificate Verification Portal</span>
          <h1>Verify Your <em>Certificate</em></h1>
          <p>Enter the Certificate ID or Credential ID to check its authenticity.</p>
          <form className="verifyPortalForm" onSubmit={submitVerification}>
            <label htmlFor="portal-credential-id" className="srOnly">Certificate or Credential ID</label>
            <FileText size={19} />
            <input
              id="portal-credential-id"
              value={credentialId}
              onChange={(event) => setCredentialId(event.target.value)}
              placeholder="e.g. IEECS-SU-2026-0001"
              required
            />
            <button type="submit">Verify <ArrowRight size={17} /></button>
          </form>
        </div>

        <div className="verifyPortalArtwork" aria-hidden="true">
          <div className="certificateIllustration">
            <strong>IEEE</strong>
            <span />
            <span />
            <span />
            <small>OFFICIAL CERTIFICATE</small>
          </div>
          <div className="shieldIllustration"><ShieldCheck size={78} strokeWidth={1.7} /></div>
        </div>
      </div>
    </section>
  );
}
