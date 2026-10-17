import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Home, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { listPublicTeamMembers } from "@/lib/public-content";
import { getTeamCategory, TEAM_CATEGORIES } from "@/lib/team-categories";
import { PublicTeamMemberGrid } from "@/components/PublicTeamMemberGrid";

export const revalidate = 30;
export const dynamicParams = false;

export function generateStaticParams() {
  return TEAM_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getTeamCategory(slug);
  return {
    title: category ? `${category.name} | IEEE CS Superior University` : "Our Team",
    description: category?.description,
  };
}

export default async function TeamCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getTeamCategory(slug);
  if (!category) notFound();

  const members = (await listPublicTeamMembers()).filter((member) => member.category === category.slug);

  return (
    <main className="innerPage teamCategoryPage">
      <section className="teamCategoryHeader innerContainer">
        <div className="teamBreadcrumb" aria-label="Breadcrumb">
          <Link href="/"><Home size={15} /><span className="srOnly">Home</span></Link>
          <ChevronRight size={14} />
          <Link href="/team">Our Team</Link>
          <ChevronRight size={14} />
          <span>{category.name}</span>
        </div>
        <Link href="/team" className="backToTeams"><ArrowLeft size={16} /> Back to Teams</Link>
        <span className="sectionPill">IEEE CS Leadership</span>
        <h1>IEEE CS <em>{category.name}</em></h1>
        <p>{category.description}</p>
      </section>

      <section className="teamCategoryMembers innerContainer">
        {members.length === 0 ? (
          <div className="teamCategoryEmpty">
            <span><Sparkles size={29} /></span>
            <h2>{category.name} announcement coming soon</h2>
            <p>Members added to this team from the admin dashboard will appear here automatically.</p>
          </div>
        ) : (
          <PublicTeamMemberGrid members={members} />
        )}
      </section>
    </main>
  );
}
