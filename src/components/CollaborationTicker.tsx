import Image from "next/image";
import { listCollaborations } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function CollaborationTicker() {
  const collaborations = await listCollaborations();

  if (!collaborations || collaborations.length === 0) {
    return null;
  }

  // Duplicate list to allow smooth, seamless infinite scrolling
  const displayList = [...collaborations, ...collaborations, ...collaborations, ...collaborations];

  return (
    <section className="collabTickerSection" aria-label="Collaborations and Partners">
      <div className="collabTickerTrackWrapper">
        <div className="collabTickerTrack">
          {displayList.map((item, index) => {
            const cardContent = (
              <div className="collabCircularCard">
                <div className="collabCircleAvatar">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="80px"
                      className="collabCircleImg"
                    />
                  ) : (
                    <span className="collabInitialFallback">
                      {item.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="collabUnderText">{item.name}</span>
              </div>
            );

            return item.websiteUrl ? (
              <a
                key={`${item.id}-${index}`}
                href={item.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="collabItemLink"
                title={`${item.name} - Open Website`}
              >
                {cardContent}
              </a>
            ) : (
              <div key={`${item.id}-${index}`} className="collabItemLink">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
