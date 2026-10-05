import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Code2, HeartHandshake, ShieldCheck, UsersRound } from "lucide-react";
import { GalleryCarousel } from "@/components/Carousel";

const impactCards = [
  {
    title: "Technical Events",
    description: "Hands-on workshops, expert talks, and practical learning for future-ready skills.",
    icon: Code2,
  },
  {
    title: "Student Leadership",
    description: "A platform for students to lead teams, organize initiatives, and create real impact.",
    icon: UsersRound,
  },
  {
    title: "Community Impact",
    description: "Connecting people through collaboration, shared ideas, and meaningful contribution.",
    icon: HeartHandshake,
  },
];

export default function Home() {
  return (
    <main className="homePage">
      <section className="homeHero" id="home">
        <div className="homeHeroInner">
          <div className="homeHeroCopy">
            <div className="homeBadge">Official IEEE CS Superior University Student Branch</div>
            <h1>
              Building the <span>Future of Computing</span>
            </h1>
            <p>
              We are a community of passionate students driven by technology, innovation, and
              leadership—empowering every member to learn, grow, and create a positive impact.
            </p>
            <div className="homeHeroActions">
              <Link className="primary" href="/about">
                Explore Our Society <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="homeHeroMedia">
            <Image
              src="/ieee-technical-event-hero.png"
              alt="IEEE Society Superior University technical session"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{ objectFit: "cover" }}
            />
            <div className="homeHeroImageTag">
              <strong>Learn. Lead. Build.</strong>
              <span>IEEE CS Superior University</span>
            </div>
          </div>
        </div>
      </section>

      <section className="impactSection" id="impact">
        <div className="homeSectionHeading centered">
          <span>Why join us</span>
          <h2>Grow beyond the classroom</h2>
          <p>Build technical confidence, leadership experience, and a network that moves with you.</p>
        </div>
        <div className="impactGrid">
          {impactCards.map(({ title, description, icon: Icon }, index) => (
            <article className="impactCard" key={title}>
              <div className="impactCardTop">
                <div className="impactIcon"><Icon size={25} strokeWidth={2} /></div>
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gallerySection" id="gallery">
        <div className="homeSectionHeading galleryHeading">
          <div>
            <span>Our community in action</span>
            <h2>Inside IEEE CS</h2>
          </div>
          <p>
            Technical sessions, collaborative learning, student leadership, and community moments
            from across our chapter.
          </p>
        </div>
        <GalleryCarousel />
      </section>

      <section className="homeVerifySection" id="verify">
        <div className="homeVerifyIntro">
          <div className="homeVerifyIcon"><ShieldCheck size={28} /></div>
          <div>
            <span>Official records</span>
            <h2>Need to verify a certificate?</h2>
            <p>Enter the Credential ID printed on the certificate for an instant authenticity check.</p>
          </div>
        </div>
        <Link className="homeVerifyButton" href="/verify">
          Verify Certificate <ArrowRight size={17} />
        </Link>
      </section>

      <section className="collaborationSection">
        <div className="homeSectionHeading">
          <span>Our collaborations</span>
          <h2>Connected to a global community</h2>
        </div>
        <div className="collaborationLogos" aria-label="Partner organizations">
          <div><strong>IEEE</strong><span>Advancing Technology for Humanity</span></div>
          <div><strong>IEEE COMPUTER SOCIETY</strong><span>Superior University Student Branch</span></div>
          <div><strong>SUPERIOR UNIVERSITY</strong><span>Learn. Lead. Impact.</span></div>
        </div>
      </section>
    </main>
  );
}
