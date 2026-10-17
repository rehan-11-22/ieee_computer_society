"use client";

import Image from "next/image";
import { Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TeamMember } from "@/lib/types";

export function PublicTeamMemberGrid({ members }: { members: TeamMember[] }) {
  const [viewing, setViewing] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!viewing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [viewing]);

  return (
    <>
      <div className="teamCategoryMemberGrid">
        {members.map((member) => (
          <article key={member.id} className="teamCategoryMemberCard">
            <span className={`teamCategoryMemberPhoto${member.imageUrl ? " hasImage" : ""}`}>
              {member.imageUrl ? (
                <Image src={member.imageUrl} alt={member.name} fill loading="lazy" sizes="(max-width: 560px) 104px, 124px" style={{ objectFit: "cover", objectPosition: "center top" }} />
              ) : member.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="teamCategoryMemberInfo">
              <strong>{member.name}</strong>
              <small>{member.role}</small>
              <button type="button" className="teamMemberViewButton" onClick={() => setViewing(member)}><Eye size={14} /> View Profile</button>
            </span>
          </article>
        ))}
      </div>

      {viewing && (
        <div className="publicTeamViewOverlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewing(null); }}>
          <section className="publicTeamViewPanel" role="dialog" aria-modal="true" aria-labelledby="public-team-member-title">
            <button type="button" className="publicTeamViewClose" aria-label="Close profile" title="Close" onClick={() => setViewing(null)}><X size={18} /></button>
            <div className="publicTeamViewImage">
              {viewing.imageUrl ? <Image src={viewing.imageUrl} alt={viewing.name} fill sizes="260px" style={{ objectFit: "cover", objectPosition: "center top" }} /> : <span>{viewing.name.slice(0, 2).toUpperCase()}</span>}
            </div>
            <div className="publicTeamViewDetails">
              <span className="sectionPill">IEEE CS Team</span>
              <h2 id="public-team-member-title">{viewing.name}</h2>
              <strong>{viewing.role}</strong>
              <p>{viewing.bio || "IEEE Computer Society Superior University team member."}</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
