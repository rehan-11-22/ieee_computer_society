import { BadgeCheck, FileCheck2, Search } from "lucide-react";
import { VerifyHero } from "@/components/VerifyHero";

const steps = [
  { icon: Search, title: "Enter Credential ID", text: "Use the unique ID printed on your certificate." },
  { icon: FileCheck2, title: "Official Record Lookup", text: "The ID is checked against the official certificate database." },
  { icon: BadgeCheck, title: "Instant Result", text: "View the certificate status and its verified details." },
];

export default function VerifyCertificatePage() {
  return (
    <main className="verifyPortalPage">
      <VerifyHero />
      <section className="verifyInstructions innerContainer">
        <div className="verificationSectionHeading">
          <span className="sectionPill">Simple & Secure</span>
          <h2>How certificate verification works</h2>
          <p>Every issued certificate has a unique Credential ID linked to its official record.</p>
        </div>
        <div className="verifySteps">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article key={title}>
              <span className="verifyStepNumber">0{index + 1}</span>
              <Icon size={29} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="verifyPrivacyNote">
          <BadgeCheck size={23} />
          <div><strong>Official IEEE CS Superior University records</strong><span>No signup is required to verify a certificate.</span></div>
        </div>
      </section>
    </main>
  );
}
