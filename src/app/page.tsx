"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroCarousel } from "../components/Carousel";

export default function Home() {
  const [credentialId, setCredentialId] = useState("");
  const router = useRouter();

  const verifyCertificate = () => {
    if (credentialId.trim()) {
      router.push(`/verify/${credentialId}`);
    }
  };

  const fillDemo = () => {
    setCredentialId("IEECS-SU-2026-0001");
  };

  return (
    <>
      {/* Section 1: Split Hero */}
      <section className="hero">
        <div className="heroText">
          <div className="eyebrow">● IEEE Computer Society Superior University</div>
          <h1>Certificate <span style={{ color: "var(--blue)", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>Verification</span> Portal</h1>
          <p>Instantly verify the authenticity of certificates issued by IEEE CS Superior University Student Branch.</p>
          <div style={{ marginTop: '30px' }}>
            <button className="primary" onClick={() => document.getElementById('verify')?.scrollIntoView({ behavior: 'smooth' })}>
              Verify Certificate ↓
            </button>
          </div>
        </div>
        <div className="heroVisual" style={{ width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden', minHeight: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <HeroCarousel />
        </div>
      </section>

      {/* Section 2: Verify Certificate */}
      <section className="verifySection" id="verify">
        <div className="verifySectionInner">
          <div className="verifySectionText">
            <div className="eyebrow">● Official Verification Portal</div>
            <h2>Verify Your <span style={{ color: "var(--blue)", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>Certificate</span></h2>
            <p>Enter the unique Credential ID printed on your certificate to verify its authenticity and view the official digital record.</p>
          </div>

          <div className="verifyBox">
            <label>Credential ID</label>
            <div className="verifyRow">
              <input
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="e.g. IEECS-SU-2026-0001"
                onKeyDown={(e) => e.key === 'Enter' && verifyCertificate()}
              />
              <button className="primary" onClick={verifyCertificate}>
                Verify →
              </button>
            </div>
            <div className="demoText">
              Try a demo:
              <button onClick={fillDemo}>IEECS-SU-2026-0001</button>
            </div>
          </div>

          <div className="trustRow">
            <div className="trustItem">
              <div className="trustIcon">✓</div>
              <div>
                <strong>Authentic Records</strong>
                <span>Verified by IEEE CS</span>
              </div>
            </div>
            <div className="trustItem">
              <div className="trustIcon">🔒</div>
              <div>
                <strong>Secure & Tamper-Proof</strong>
                <span>Unique Credential IDs</span>
              </div>
            </div>
            <div className="trustItem">
              <div className="trustIcon">⚡</div>
              <div>
                <strong>Instant Verification</strong>
                <span>Results in seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
