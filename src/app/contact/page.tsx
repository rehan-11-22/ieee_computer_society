import Image from "next/image";
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import { getPublicContactSettings } from "@/lib/public-content";

export const revalidate = 60;

export default async function ContactPage() {
  const contactSettings = await getPublicContactSettings();
  return (
    <main className="innerPage contactPage">
      <section className="contactHero innerContainer">
        <div className="innerHeroCopy">
          <span className="sectionPill">Get In Touch</span>
          <h1>Let&apos;s <em>Connect</em></h1>
          <p>
            We are always open to new ideas, collaborations, and opportunities. Reach out through
            our social platforms or get in touch directly. We&apos;d love to hear from you!
          </p>
        </div>
        <div className="innerHeroImage contactHeroImage">
          <Image
            src="/contact.jpeg"
            alt="IEEE Computer Society students collaborating"
            fill
            priority
            sizes="(max-width: 850px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </section>

      <section className="membershipCard innerContainer">
        <div className="membershipCopy">
          <span className="sectionPill">Become a Part of Our Community</span>
          <h2>Do you study in Superior University?<br />Want to be an <em>IEEE Member?</em></h2>
          <p>Join enthusiastic learners, innovators, and leaders. Get access to workshops, events, certifications, and new opportunities.</p>
        </div>
        <Send className="membershipPlane" size={112} strokeWidth={1.1} />
        <a className="whatsappBar" href={contactSettings.whatsappUrl} target="_blank" rel="noopener noreferrer">
          <span className="whatsappIcon"><MessageCircle size={34} /></span>
          <span><small>Message Here</small><strong>{contactSettings.phoneNumber}</strong></span>
          <span className="whatsappArrow"><ArrowRight size={28} /></span>
        </a>
      </section>

      <section className="socialSection innerContainer">
        <span className="sectionPill">Our Social Media</span>
        <h2>Follow us for the latest updates, events, and highlights.</h2>
        <div className="socialLinks">
          <a href="https://www.instagram.com/ieee.superior?igsh=MWxsa3p0ampwN2Vobw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.16c3.2 0 3.58.02 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.05 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 2.69.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.3.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/ieee-superior-lahore/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93a1.4 1.4 0 0 1 2.79 0v4.93h2.75ZM6.88 8.56a1.68 1.68 0 1 0 0-3.37 1.68 1.68 0 0 0 0 3.37Zm1.39 9.94v-8.37H5.5v8.37h2.77Z" />
            </svg>
          </a>
        </div>
      </section>

      <section className="contactDetails innerContainer">
        <span className="sectionPill">We&apos;re Here For You</span>
        <div className="contactDetailsGrid">
          <article>
            <Mail size={48} />
            <div><h2>General Inquiries</h2><p>Have questions about our society, events, or membership? Feel free to reach out.</p><a href="mailto:ieeesuperioruniversity@gmail.com">ieeesuperioruniversity@gmail.com</a></div>
          </article>
          <article>
            <MapPin size={50} />
            <div><h2>Our Location</h2><p>Superior University,<br />Lahore, Pakistan</p></div>
          </article>
        </div>
      </section>
    </main>
  );
}
