import Image from "next/image";
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";

export default function ContactPage() {
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
            src="/WhatsApp Image 2026-09-30 at 5.14.41 PM (1).jpeg"
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
        <a className="whatsappBar" href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer">
          <span className="whatsappIcon"><MessageCircle size={34} /></span>
          <span><small>Message Here</small><strong>+92 300 1234567</strong></span>
          <span className="whatsappArrow"><ArrowRight size={28} /></span>
        </a>
      </section>

      <section className="socialSection innerContainer">
        <span className="sectionPill">Our Social Media</span>
        <h2>Follow us for the latest updates, events, and highlights.</h2>
        <div className="socialLinks">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/instagram/default.svg" alt="" width="28" height="28" /></a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/linkedin/default.svg" alt="LinkedIn" width="28" height="28" /></a>
        </div>
      </section>

      <section className="contactDetails innerContainer">
        <span className="sectionPill">We&apos;re Here For You</span>
        <div className="contactDetailsGrid">
          <article>
            <Mail size={48} />
            <div><h2>General Inquiries</h2><p>Have questions about our society, events, or membership? Feel free to reach out.</p><a href="mailto:ieeecs@superior.edu.pk">ieeecs@superior.edu.pk</a></div>
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
