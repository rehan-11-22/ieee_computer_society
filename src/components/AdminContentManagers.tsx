"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImageIcon, MessageCircle } from "lucide-react";
import { EventGalleryManager } from "@/components/EventGalleryManager";
import { renderInlineFormattedText } from "@/components/InlineFormattedText";
import type { EventPageSection, SocietyEvent, TeamMember, TeamCategory, LeadershipMember, ContactSettings, Collaboration } from "@/lib/types";
import { TEAM_CATEGORIES } from "@/lib/team-categories";
import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";

type Notify = (message: string, type?: "success" | "error" | "info") => void;

function builderHeading(value: string) {
  const heading = value.trim();
  return !heading || heading.toLowerCase() === "section heading" ? "About the Event" : heading;
}

function EventBuilderPreview({
  title,
  description,
  eventDate,
  location,
  imageUrl,
  sections,
}: {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  imageUrl: string | null;
  sections: EventPageSection[];
}) {
  return (
    <section className="eventBuilderPreview" aria-label="Live event page preview">
      <div className="eventBuilderPreviewLabel"><Eye size={14} /> Live Preview</div>
      <div className="eventBuilderPreviewHero">
        <div>
          <span>IEEE CS Event</span>
          <h4>{title.trim() || "Your event title"}</h4>
          <p>{description.trim() || "Your short event description will appear here."}</p>
          <small>{eventDate ? dateLabel(eventDate) : "Event date"}{location.trim() ? ` · ${location}` : " · Event location"}</small>
        </div>
        <div className={`eventBuilderPreviewImage${imageUrl ? "" : " empty"}`}>
          {imageUrl ? (
            <Image src={imageUrl} alt="Selected event preview" fill unoptimized sizes="260px" style={{ objectFit: "cover" }} />
          ) : (
            <><ImageIcon size={30} /><span>Event image</span></>
          )}
        </div>
      </div>
      <div className="eventBuilderPreviewSections">
        {sections.length === 0 ? (
          <p className="eventBuilderPreviewEmpty">Add a text or gallery block to preview the event page layout.</p>
        ) : sections.map((section, index) => section.type === "content" ? (
          <article key={section.id} className={`eventBuilderPreviewContent ${section.align === "center" ? "center" : ""}`}>
            <small>{index + 1}. Text Block</small>
            {section.subheading && <span style={{ color: section.subheadingColor || "#2563eb" }}>{section.subheading}</span>}
            <h5 style={{ color: section.headingColor || "#0f2f57" }}>{builderHeading(section.heading)}</h5>
            <p style={{ color: section.bodyColor || "#64748b" }}>{section.body ? renderInlineFormattedText(section.body) : "Your formatted event content will appear here."}</p>
          </article>
        ) : (
          <article key={section.id} className="eventBuilderPreviewGallery">
            <small>{index + 1}. Gallery Block</small>
            <h5>{section.heading || "Event Gallery"}</h5>
            <div><span /><span /><span /></div>
            <p>{section.layout === "carousel" ? "Horizontal carousel" : "Responsive grid"} · Uploaded gallery images appear here.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RichTextTextarea({
  id,
  value,
  onChange,
  maxLength,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyFormat(marker: "**" | "*") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);
    const markerLength = marker.length;
    const hasMarkers =
      start >= markerLength &&
      value.slice(start - markerLength, start) === marker &&
      value.slice(end, end + markerLength) === marker;

    let nextValue: string;
    let nextStart: number;
    let nextEnd: number;

    if (hasMarkers) {
      nextValue =
        value.slice(0, start - markerLength) +
        selectedText +
        value.slice(end + markerLength);
      nextStart = start - markerLength;
      nextEnd = end - markerLength;
    } else {
      nextValue =
        value.slice(0, start) +
        marker +
        selectedText +
        marker +
        value.slice(end);
      if (nextValue.length > maxLength) return;
      nextStart = start + markerLength;
      nextEnd = end + markerLength;
    }

    onChange(nextValue);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextStart, nextEnd);
    });
  }

  return (
    <div className="richTextInput">
      <div className="richTextToolbar" role="toolbar" aria-label="Description formatting">
        <button
          type="button"
          aria-label="Bold selected text"
          title="Bold selected text"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat("**")}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          aria-label="Italicize selected text"
          title="Italicize selected text"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat("*")}
        >
          <em>I</em>
        </button>
        <span>Select text, then choose Bold or Italic.</span>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

type EventStatus = "upcoming" | "latest" | "previous";

function eventStatus(value: string): EventStatus {
  const eventTime = new Date(`${value}T00:00:00Z`).getTime();
  const today = new Date();
  const todayTime = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (eventTime > todayTime) return "upcoming";
  if (eventTime === todayTime) return "latest";
  return "previous";
}

export function EventManager({ notify, onUnauthorized }: { notify: Notify; onUnauthorized: () => void }) {
  const [events, setEvents] = useState<SocietyEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<"all" | EventStatus>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocietyEvent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SocietyEvent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pageSections, setPageSections] = useState<EventPageSection[]>([]);
  const [showBuilderPreview, setShowBuilderPreview] = useState(false);

  useEffect(() => () => {
    if (imagePreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      if (response.status === 401) return onUnauthorized();
      const data = await response.json().catch(() => []);
      if (!response.ok) return notify(data.error || "Events could not be loaded", "error");
      setEvents(data);
    } catch {
      notify("Network error while loading events", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, onUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/events", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.reload();
          return [];
        }
        if (!response.ok) throw new Error("Events could not be loaded");
        return response.json();
      })
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function reset() {
    setEditing(null);
    setShowForm(false);
    setTitle("");
    setDescription("");
    setEventDate("");
    setLocation("");
    setImageFile(null);
    setImagePreviewUrl(null);
    setPageSections([]);
    setShowBuilderPreview(false);
    const input = document.getElementById("event-image") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function edit(event: SocietyEvent) {
    setEditing(event);
    setShowForm(true);
    setTitle(event.title);
    setDescription(event.description);
    setEventDate(event.eventDate);
    setLocation(event.location);
    setImageFile(null);
    setImagePreviewUrl(event.imageUrl || null);
    setPageSections((event.pageSections || []).map((section) => (
      section.type === "content" && section.heading.trim().toLowerCase() === "section heading"
        ? { ...section, heading: "About the Event" }
        : section
    )));
  }

  function createNew() {
    reset();
    setShowForm(true);
  }

  function addContentSection() {
    setPageSections((current) => [
      ...current,
      { id: `content-${Date.now()}`, type: "content", heading: "About the Event", subheading: "Event Overview", body: "", align: "left", headingColor: "#0f2f57", subheadingColor: "#2563eb", bodyColor: "#64748b" },
    ]);
  }

  function addGallerySection() {
    setPageSections((current) => [
      ...current,
      { id: `gallery-${Date.now()}`, type: "gallery", heading: "Event Gallery", layout: "grid" },
    ]);
  }

  function updatePageSection(id: string, next: EventPageSection) {
    setPageSections((current) => current.map((section) => (section.id === id ? next : section)));
  }

  function removePageSection(id: string) {
    setPageSections((current) => current.filter((section) => section.id !== id));
  }

  function movePageSection(index: number, direction: -1 | 1) {
    setPageSections((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered;
    });
  }

  function chooseEventImage(file: File | null) {
    setImageFile(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : editing?.imageUrl || null);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.set("title", title);
      form.set("description", description);
      form.set("eventDate", eventDate);
      form.set("location", location);
      if (imageFile) form.set("image", imageFile);
      form.set("pageSections", JSON.stringify(pageSections));
      const response = await fetch(editing ? `/api/events/${editing.id}` : "/api/events", { method: editing ? "PUT" : "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Event could not be saved", "error");
      notify(editing ? "Event updated successfully" : "Event added successfully");
      reset();
      await load();
    } catch {
      notify("Network error while saving the event", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    try {
      const response = await fetch(`/api/events/${pendingDelete.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Event could not be deleted", "error");
      notify("Event deleted successfully");
      setPendingDelete(null);
      await load();
    } catch {
      notify("Network error while deleting the event", "error");
    }
  }

  return (
    <div className="contentManagement listOnly">
      {showForm && ( <div className="contentEditorModal" role="presentation">
      <section className="contentFormCard contentEditorPanel">
        <div className="eyebrow">Public Events</div>
        <h3>{editing ? "Edit Event" : "Add New Event"}</h3>
        <p>Published events automatically appear on the public Events and Society pages.</p>
        <form className="contentAdminForm" onSubmit={save}>
          <label htmlFor="event-title">Event title</label>
          <input id="event-title" required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="AI & ML Workshop" />
          <label htmlFor="event-description">Description</label>
          <textarea id="event-description" required maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short event description" />
          <div className="contentFormRow">
            <div><label htmlFor="event-date">Event date</label><input id="event-date" type="date" required value={eventDate} onChange={(event) => setEventDate(event.target.value)} /></div>
            <div><label htmlFor="event-location">Location</label><input id="event-location" maxLength={140} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Superior University" /></div>
          </div>
          <label htmlFor="event-image">Event image</label>
          <input id="event-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseEventImage(event.target.files?.[0] || null)} />
          <span className="formHelp">PNG, JPEG, or WebP up to 4 MB. A portrait photo that includes the face and shoulders works best. Leave empty while editing to keep the current image.</span>
          <div className="eventBuilderPanel">
            <div className="eventBuilderHead">
              <div>
                <strong>Page Builder</strong>
                <span>Build this event detail page with content and gallery blocks.</span>
              </div>
              <div>
                <button className="tableAction eventBuilderPreviewToggle" type="button" aria-pressed={showBuilderPreview} onClick={() => setShowBuilderPreview((current) => !current)}>
                  {showBuilderPreview ? <EyeOff size={14} /> : <Eye size={14} />}{showBuilderPreview ? "Hide Preview" : "Live Preview"}
                </button>
                <button className="tableAction" type="button" onClick={addContentSection}>+ Text</button>
                <button className="tableAction" type="button" onClick={addGallerySection}>+ Gallery</button>
              </div>
            </div>
            {showBuilderPreview && (
              <EventBuilderPreview title={title} description={description} eventDate={eventDate} location={location} imageUrl={imagePreviewUrl} sections={pageSections} />
            )}
            {pageSections.length === 0 ? (
              <p className="adminEmpty">No custom blocks yet. Add text or gallery blocks for the public event page.</p>
            ) : (
              <div className="eventBuilderList">
                {pageSections.map((section, index) => (
                  <article key={section.id} className="eventBuilderBlock">
                    <div className="eventBuilderBlockTop">
                      <span>{index + 1}. {section.type === "content" ? "Text Block" : "Gallery Block"}</span>
                      <div className="eventBuilderBlockActions">
                        <button className="tableAction iconAction" type="button" disabled={index === 0} onClick={() => movePageSection(index, -1)} aria-label={`Move block ${index + 1} up`} title="Move up"><ArrowUp size={15} /></button>
                        <button className="tableAction iconAction" type="button" disabled={index === pageSections.length - 1} onClick={() => movePageSection(index, 1)} aria-label={`Move block ${index + 1} down`} title="Move down"><ArrowDown size={15} /></button>
                        <button className="tableAction tableDelete" type="button" onClick={() => removePageSection(section.id)}>Remove</button>
                      </div>
                    </div>
                    {section.type === "content" ? (
                      <>
                        <label htmlFor={`${section.id}-heading`}>Heading</label>
                        <input
                          id={`${section.id}-heading`}
                          maxLength={140}
                          value={section.heading}
                          onChange={(event) => updatePageSection(section.id, { ...section, heading: event.target.value })}
                        />
                        <label htmlFor={`${section.id}-subheading`}>Subheading</label>
                        <input
                          id={`${section.id}-subheading`}
                          maxLength={180}
                          value={section.subheading || ""}
                          onChange={(event) => updatePageSection(section.id, { ...section, subheading: event.target.value })}
                          placeholder="Optional small line above or below the heading"
                        />
                        <label htmlFor={`${section.id}-body`}>Description</label>
                        <RichTextTextarea
                          id={`${section.id}-body`}
                          maxLength={1200}
                          value={section.body}
                          onChange={(body) => updatePageSection(section.id, { ...section, body })}
                          placeholder="Write the event story, agenda, outcomes, or speaker notes."
                        />
                        <label htmlFor={`${section.id}-align`}>Alignment</label>
                        <select
                          id={`${section.id}-align`}
                          value={section.align}
                          onChange={(event) => updatePageSection(section.id, { ...section, align: event.target.value === "center" ? "center" : "left" })}
                        >
                          <option value="left">Left aligned</option>
                          <option value="center">Centered</option>
                        </select>
                        <div className="builderColorGrid">
                          <label htmlFor={`${section.id}-heading-color`}>Heading color<input id={`${section.id}-heading-color`} type="color" value={section.headingColor || "#0f2f57"} onChange={(event) => updatePageSection(section.id, { ...section, headingColor: event.target.value })} /></label>
                          <label htmlFor={`${section.id}-subheading-color`}>Subheading color<input id={`${section.id}-subheading-color`} type="color" value={section.subheadingColor || "#2563eb"} onChange={(event) => updatePageSection(section.id, { ...section, subheadingColor: event.target.value })} /></label>
                          <label htmlFor={`${section.id}-body-color`}>Description color<input id={`${section.id}-body-color`} type="color" value={section.bodyColor || "#64748b"} onChange={(event) => updatePageSection(section.id, { ...section, bodyColor: event.target.value })} /></label>
                        </div>
                      </>
                    ) : (
                      <>
                        <label htmlFor={`${section.id}-heading`}>Gallery heading</label>
                        <input
                          id={`${section.id}-heading`}
                          maxLength={140}
                          value={section.heading}
                          onChange={(event) => updatePageSection(section.id, { ...section, heading: event.target.value })}
                        />
                        <label htmlFor={`${section.id}-layout`}>Layout</label>
                        <select
                          id={`${section.id}-layout`}
                          value={section.layout}
                          onChange={(event) => updatePageSection(section.id, { ...section, layout: event.target.value === "carousel" ? "carousel" : "grid" })}
                        >
                          <option value="grid">Responsive grid</option>
                          <option value="carousel">Horizontal carousel</option>
                        </select>
                        <span className="formHelp">Gallery uses the images uploaded below for this event.</span>
                      </>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="contentFormActions">
            {editing && <a className="secondary" href={`/events/${editing.id}`} target="_blank" rel="noreferrer">Preview</a>}
            <button className="secondary" type="button" onClick={reset}>Cancel</button>
            <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update Event" : "+ Add Event"}</button>
          </div>
        </form>
        {editing && <EventGalleryManager eventId={editing.id} notify={notify} onUnauthorized={onUnauthorized} />}
      </section>
      </div>) }

      <section className="contentListCard">
        <div className="adminListHead">
          <div><div className="eyebrow">Event Library</div><h3>Published Events</h3></div>
          <div className="adminListActions"><span className="adminCount">{events.length}</span><button className="primary" type="button" onClick={createNew}>+ Add Event</button></div>
        </div>
        <div className="eventFilter">
          <label htmlFor="event-status-filter">Show events</label>
          <select id="event-status-filter" value={eventFilter} onChange={(event) => setEventFilter(event.target.value as "all" | EventStatus)}>
            <option value="all">All events</option>
            <option value="upcoming">Upcoming</option>
            <option value="latest">Latest</option>
            <option value="previous">Previous</option>
          </select>
        </div>
        {loading ? <p className="adminEmpty">Loading events...</p> : events.length === 0 ? (
          <p className="adminEmpty">No events yet. The public Events page currently shows “Coming Soon”.</p>
        ) : (
          <div className="contentAdminList">
            {events.filter((item) => eventFilter === "all" || eventStatus(item.eventDate) === eventFilter).map((item) => (
              <article key={item.id}>
                <div className="contentThumb">{item.imageUrl ? <Image src={item.imageUrl} alt="" fill unoptimized loading="lazy" sizes="110px" /> : <span>EVENT</span>}</div>
                <div className="contentAdminMeta"><strong>{item.title}</strong><span>{dateLabel(item.eventDate)}{item.location ? ` · ${item.location}` : ""}</span><p>{item.description}</p></div>
                <div className="contentAdminActions"><a className="tableAction" href={`/events/${item.id}`} target="_blank" rel="noreferrer">Preview</a><button className="tableAction" type="button" onClick={() => edit(item)}>Edit</button><button className="tableAction tableDelete" type="button" onClick={() => setPendingDelete(item)}>Delete</button></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {pendingDelete && <ConfirmDelete title="Delete Event?" description={`${pendingDelete.title} will be permanently removed.`} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />}
    </div>
  );
}

export function TeamManager({ notify, onUnauthorized }: { notify: Notify; onUnauthorized: () => void }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamFilter, setTeamFilter] = useState<"all" | TeamCategory>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState<TeamCategory>("executive-body");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const visibleMembers = members.filter((member) => teamFilter === "all" || member.category === teamFilter);
  const selectedTeamName = TEAM_CATEGORIES.find((team) => team.slug === teamFilter)?.name;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/team", { cache: "no-store" });
      if (response.status === 401) return onUnauthorized();
      const data = await response.json().catch(() => []);
      if (!response.ok) return notify(data.error || "Team members could not be loaded", "error");
      setMembers(data);
    } catch {
      notify("Network error while loading team members", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, onUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/team", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.reload();
          return [];
        }
        if (!response.ok) throw new Error("Team members could not be loaded");
        return response.json();
      })
      .then((data) => { if (!cancelled) setMembers(data); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function reset() {
    setEditing(null);
    setShowForm(false);
    setName("");
    setRole("");
    setBio("");
    setCategory("executive-body");
    setDisplayOrder("0");
    setImageFile(null);
    const input = document.getElementById("member-image") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function edit(member: TeamMember) {
    setEditing(member);
    setShowForm(true);
    setName(member.name);
    setRole(member.role);
    setBio(member.bio);
    setCategory(member.category);
    setDisplayOrder(String(member.displayOrder));
    setImageFile(null);
  }

  function createNew() {
    reset();
    setShowForm(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("role", role);
      form.set("bio", bio);
      form.set("category", category);
      form.set("displayOrder", displayOrder);
      if (imageFile) form.set("image", imageFile);
      const response = await fetch(editing ? `/api/team/${editing.id}` : "/api/team", { method: editing ? "PUT" : "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Team member could not be saved", "error");
      notify(editing ? "Team member updated successfully" : "Team member added successfully");
      reset();
      await load();
    } catch {
      notify("Network error while saving the team member", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    try {
      const response = await fetch(`/api/team/${pendingDelete.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Team member could not be deleted", "error");
      notify("Team member deleted successfully");
      setPendingDelete(null);
      await load();
    } catch {
      notify("Network error while deleting the team member", "error");
    }
  }

  return (
    <div className="contentManagement listOnly teamManagement">
      {showForm && <div className="contentEditorModal" role="presentation">
      <section className="contentFormCard contentEditorPanel">
        <div className="eyebrow">Public Team</div>
        <h3>{editing ? "Edit Team Member" : "Add Team Member"}</h3>
        <p>Select the team where this member should appear. Members are sorted by display order inside that team.</p>
        <form className="contentAdminForm" onSubmit={save}>
          <label htmlFor="member-name">Full name</label>
          <input id="member-name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Member name" />
          <label htmlFor="member-category">Team</label>
          <select id="member-category" required value={category} onChange={(event) => setCategory(event.target.value as TeamCategory)}>
            {TEAM_CATEGORIES.map((team) => <option key={team.slug} value={team.slug}>{team.name}</option>)}
          </select>
          <div className="contentFormRow">
            <div><label htmlFor="member-role">Role</label><input id="member-role" required maxLength={100} value={role} onChange={(event) => setRole(event.target.value)} placeholder="President" /></div>
            <div><label htmlFor="member-order">Display order</label><input id="member-order" type="number" min="0" max="999" required value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} /></div>
          </div>
          <label htmlFor="member-bio">Short bio</label>
          <textarea id="member-bio" maxLength={400} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Optional short introduction" />
          <label htmlFor="member-image">Profile image</label>
          <input id="member-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
          <span className="formHelp">PNG, JPEG, or WebP up to 4 MB. Leave empty while editing to keep the current image.</span>
          <div className="contentFormActions">
            <button className="secondary" type="button" onClick={reset}>Cancel</button>
            <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update Member" : "+ Add Member"}</button>
          </div>
        </form>
      </section>
      </div>}

      <section className="contentListCard">
        <div className="adminListHead">
          <div><div className="eyebrow">Team Directory</div><h3>Published Members</h3></div>
          <div className="adminListActions"><span className="adminCount">{members.length}</span><button className="primary" type="button" onClick={createNew}>+ Add Member</button></div>
        </div>
        <div className="eventFilter">
          <label htmlFor="team-category-filter">Show team</label>
          <select id="team-category-filter" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value as "all" | TeamCategory)}>
            <option value="all">All teams</option>
            {TEAM_CATEGORIES.map((team) => <option key={team.slug} value={team.slug}>{team.name}</option>)}
          </select>
        </div>
        {loading ? <p className="adminEmpty">Loading team members...</p> : visibleMembers.length === 0 ? (
          <p className="adminEmpty">{teamFilter === "all" ? "No team members yet. The public Team page currently shows “Coming Soon”." : `No members added to ${selectedTeamName || "this team"} yet.`}</p>
        ) : (
          <div className="contentAdminList">
            {visibleMembers.map((member) => (
              <article key={member.id}>
                <div className="contentThumb round">{member.imageUrl ? <Image src={member.imageUrl} alt="" fill unoptimized loading="lazy" sizes="116px" style={{ objectFit: "cover", objectPosition: "center top" }} /> : <span>{member.name.slice(0, 2).toUpperCase()}</span>}</div>
                <div className="contentAdminMeta"><strong>{member.name}</strong><span>{TEAM_CATEGORIES.find((team) => team.slug === member.category)?.name || "Executive Body"} · {member.role} · Order {member.displayOrder}</span><p>{member.bio || "No bio added."}</p></div>
                <div className="contentAdminActions"><button className="tableAction" type="button" onClick={() => edit(member)}>Edit</button><button className="tableAction tableDelete" type="button" onClick={() => setPendingDelete(member)}>Delete</button></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {pendingDelete && <ConfirmDelete title="Delete Team Member?" description={`${pendingDelete.name} will be permanently removed.`} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />}
    </div>
  );
}

export function LeadershipManager({ notify, onUnauthorized }: { notify: Notify; onUnauthorized: () => void }) {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LeadershipMember | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LeadershipMember | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [tenure, setTenure] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leadership", { cache: "no-store" });
      if (response.status === 401) return onUnauthorized();
      const data = await response.json().catch(() => []);
      if (!response.ok) return notify(data.error || "Leadership members could not be loaded", "error");
      setMembers(data);
    } catch {
      notify("Network error while loading leadership members", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, onUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leadership", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.reload();
          return [];
        }
        if (!response.ok) throw new Error("Leadership members could not be loaded");
        return response.json();
      })
      .then((data) => { if (!cancelled) setMembers(data); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function reset() {
    setEditing(null);
    setShowForm(false);
    setName("");
    setRole("");
    setTenure("");
    setDisplayOrder("0");
    setImageFile(null);
    const input = document.getElementById("leadership-image") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function edit(member: LeadershipMember) {
    setEditing(member);
    setShowForm(true);
    setName(member.name);
    setRole(member.role);
    setTenure(member.tenure);
    setDisplayOrder(String(member.displayOrder));
    setImageFile(null);
  }

  function createNew() {
    reset();
    setShowForm(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("role", role);
      form.set("tenure", tenure);
      form.set("displayOrder", displayOrder);
      if (imageFile) form.set("image", imageFile);
      const response = await fetch(editing ? `/api/leadership/${editing.id}` : "/api/leadership", { method: editing ? "PUT" : "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Leadership member could not be saved", "error");
      notify(editing ? "Leadership member updated successfully" : "Leadership member added successfully");
      reset();
      await load();
    } catch {
      notify("Network error while saving the leadership member", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    try {
      const response = await fetch(`/api/leadership/${pendingDelete.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Leadership member could not be deleted", "error");
      notify("Leadership member deleted successfully");
      setPendingDelete(null);
      await load();
    } catch {
      notify("Network error while deleting the leadership member", "error");
    }
  }

  return (
    <div className="contentManagement listOnly leadershipManagement">
      {showForm && <div className="contentEditorModal" role="presentation">
        <section className="contentFormCard contentEditorPanel">
          <div className="eyebrow">About Page Leadership</div>
          <h3>{editing ? "Edit Leadership Member" : "Add Leadership Member"}</h3>
          <p>Upload a clear portrait with the face, shoulders, and chest visible. Members appear by display order.</p>
          <form className="contentAdminForm" onSubmit={save}>
            <label htmlFor="leadership-name">Full name</label>
            <input id="leadership-name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Dr. Hamayun Khan" />
            <div className="contentFormRow">
              <div><label htmlFor="leadership-role">Role</label><input id="leadership-role" required maxLength={100} value={role} onChange={(event) => setRole(event.target.value)} placeholder="Faculty Advisor" /></div>
              <div><label htmlFor="leadership-order">Display order</label><input id="leadership-order" type="number" min="0" max="999" required value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} /></div>
            </div>
            <label htmlFor="leadership-tenure">Tenure line</label>
            <input id="leadership-tenure" required maxLength={120} value={tenure} onChange={(event) => setTenure(event.target.value)} placeholder="Advisor Since 2021" />
            <label htmlFor="leadership-image">Portrait image</label>
            <input id="leadership-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
            <span className="formHelp">PNG, JPEG, or WebP up to 4 MB. Use a vertical or roomy portrait; the page crops it from the top centre. Leave empty while editing to keep the current image.</span>
            <div className="contentFormActions">
              <button className="secondary" type="button" onClick={reset}>Cancel</button>
              <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update Member" : "+ Add Member"}</button>
            </div>
          </form>
        </section>
      </div>}

      <section className="contentListCard">
        <div className="adminListHead">
          <div><div className="eyebrow">Leadership Directory</div><h3>About Page Leaders</h3></div>
          <div className="adminListActions"><span className="adminCount">{members.length}</span><button className="primary" type="button" onClick={createNew}>+ Add Leader</button></div>
        </div>
        {loading ? <p className="adminEmpty">Loading leadership members...</p> : members.length === 0 ? (
          <p className="adminEmpty">No leadership members yet. Add the first leader to publish this section.</p>
        ) : (
          <div className="contentAdminList">
            {members.map((member) => (
              <article key={member.id}>
                <div className="contentThumb leadershipThumb">{member.imageUrl ? <Image src={member.imageUrl} alt="" fill unoptimized loading="lazy" sizes="100px" style={{ objectFit: "cover", objectPosition: "center top" }} /> : <span>{member.name.slice(0, 2).toUpperCase()}</span>}</div>
                <div className="contentAdminMeta"><strong>{member.name}</strong><span>{member.role} · Order {member.displayOrder}</span><p>{member.tenure}</p></div>
                <div className="contentAdminActions"><button className="tableAction" type="button" onClick={() => edit(member)}>Edit</button><button className="tableAction tableDelete" type="button" onClick={() => setPendingDelete(member)}>Delete</button></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {pendingDelete && <ConfirmDelete title="Delete Leadership Member?" description={`${pendingDelete.name} will be permanently removed from the About page.`} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />}
    </div>
  );
}

export function ContactSettingsManager({ notify, onUnauthorized }: { notify: Notify; onUnauthorized: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedSettings, setSavedSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/contact-settings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Contact settings could not be loaded");
        return data as ContactSettings;
      })
      .then((data) => {
        if (cancelled) return;
        setPhoneNumber(data.phoneNumber);
        setSavedSettings(data);
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.set("phoneNumber", phoneNumber);
      const response = await fetch("/api/contact-settings", { method: "PUT", body: form });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Contact number could not be updated", "error");
      setPhoneNumber(data.phoneNumber);
      setSavedSettings(data);
      notify("Contact number updated successfully");
    } catch {
      notify("Network error while updating the contact number", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="contactSettingsManagement">
      <section className="contentFormCard contactSettingsCard">
        <div className="eyebrow">Public Contact Page</div>
        <h3>WhatsApp Contact Number</h3>
        <p>Update the number displayed in the membership contact card. The WhatsApp link is generated securely from the saved number.</p>
        {loading ? <p className="adminEmpty">Loading contact settings...</p> : (
          <form className="contentAdminForm" onSubmit={save}>
            <label htmlFor="contact-phone-number">Contact number with country code</label>
            <input
              id="contact-phone-number"
              type="tel"
              required
              maxLength={30}
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+92 300 1234567"
              autoComplete="tel"
            />
            <span className="formHelp">Start with + and include the country code. Example: +92 300 1234567.</span>
            <div className="contactSettingsPreview" aria-label="Contact number preview">
              <span><MessageCircle size={27} /></span>
              <div><small>CONTACT PAGE PREVIEW</small><strong>{phoneNumber || "+92 300 1234567"}</strong></div>
            </div>
            {savedSettings?.updatedAt && <span className="contactSettingsUpdated">Last updated: {new Date(savedSettings.updatedAt).toLocaleString()}</span>}
            <div className="contentFormActions">
              <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Contact Number"}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function ConfirmDelete({ title, description, onCancel, onConfirm }: { title: string; description: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="modal" role="presentation">
      <div className="confirmBox" role="dialog" aria-modal="true" aria-labelledby="content-delete-title">
        <div className="confirmIcon" aria-hidden="true">!</div>
        <h2 id="content-delete-title">{title}</h2>
        <p>{description} This action cannot be undone.</p>
        <div className="confirmActions"><button className="secondary" type="button" onClick={onCancel}>Cancel</button><button className="dangerButton" type="button" onClick={onConfirm}>Delete</button></div>
      </div>
    </div>
  );
}

export function CollaborationManager({ notify, onUnauthorized }: { notify: Notify; onUnauthorized: () => void }) {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Collaboration | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Collaboration | null>(null);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/collaborations", { cache: "no-store" });
      if (response.status === 401) return onUnauthorized();
      const data = await response.json().catch(() => []);
      if (!response.ok) return notify(data.error || "Collaborations could not be loaded", "error");
      setCollaborations(data);
    } catch {
      notify("Network error while loading collaborations", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, onUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/collaborations", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.reload();
          return [];
        }
        if (!response.ok) throw new Error("Collaborations could not be loaded");
        return response.json();
      })
      .then((data) => { if (!cancelled) setCollaborations(data); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function reset() {
    setName("");
    setWebsiteUrl("");
    setDisplayOrder("0");
    setImageFile(null);
    setEditing(null);
    setShowForm(false);
  }

  function edit(item: Collaboration) {
    setName(item.name);
    setWebsiteUrl(item.websiteUrl || "");
    setDisplayOrder(String(item.displayOrder));
    setImageFile(null);
    setEditing(item);
    setShowForm(true);
  }

  function createNew() {
    reset();
    setShowForm(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("websiteUrl", websiteUrl);
      form.set("displayOrder", displayOrder);
      if (imageFile) form.set("image", imageFile);
      const response = await fetch(editing ? `/api/collaborations/${editing.id}` : "/api/collaborations", {
        method: editing ? "PUT" : "POST",
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Collaboration could not be saved", "error");
      notify(editing ? "Collaboration updated successfully" : "Collaboration added successfully");
      reset();
      await load();
    } catch {
      notify("Network error while saving collaboration", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    try {
      const response = await fetch(`/api/collaborations/${pendingDelete.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Collaboration could not be deleted", "error");
      notify("Collaboration deleted successfully");
      setPendingDelete(null);
      await load();
    } catch {
      notify("Network error while deleting collaboration", "error");
    }
  }

  return (
    <div className="contentManagement listOnly">
      {showForm && (
        <div className="contentEditorModal" role="presentation">
          <section className="contentFormCard contentEditorPanel">
            <div className="eyebrow">Collaboration Partner</div>
            <h3>{editing ? "Edit Collaboration" : "Add Collaboration Partner"}</h3>
            <p>Add a partner, sponsor, or affiliated society. Their logo will appear in the continuous scrolling marquee bar on the public website.</p>
            <form className="contentAdminForm" onSubmit={save}>
              <label htmlFor="collab-name">Partner / Organization Name</label>
              <input
                id="collab-name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. IEEE Lahore Section, Google DSC, MLSA..."
              />
              <div className="contentFormRow">
                <div>
                  <label htmlFor="collab-link">Website / Profile Link (Optional)</label>
                  <input
                    id="collab-link"
                    type="url"
                    maxLength={300}
                    value={websiteUrl}
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label htmlFor="collab-order">Display order</label>
                  <input
                    id="collab-order"
                    type="number"
                    min="0"
                    max="999"
                    required
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(event.target.value)}
                  />
                </div>
              </div>
              <label htmlFor="collab-image">Partner Logo / Picture</label>
              <input
                id="collab-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
              <span className="formHelp">
                {editing
                  ? "PNG, JPEG, or WebP up to 4 MB. Leave empty to keep existing logo."
                  : "Upload a clean logo (transparent PNG or JPEG recommended)."}
              </span>
              <div className="contentFormActions">
                <button className="secondary" type="button" onClick={reset}>Cancel</button>
                <button className="primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Collaboration" : "+ Add Collaboration"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="contentListCard">
        <div className="adminListHead">
          <div>
            <div className="eyebrow">Partners &amp; Collaborators</div>
            <h3>Active Collaborations</h3>
          </div>
          <div className="adminListActions">
            <span className="adminCount">{collaborations.length}</span>
            <button className="primary" type="button" onClick={createNew}>+ Add Partner</button>
          </div>
        </div>
        {loading ? (
          <p className="adminEmpty">Loading collaborations...</p>
        ) : collaborations.length === 0 ? (
          <p className="adminEmpty">
            No collaboration partners added yet. When partners are added here, an automatic animated marquee bar will appear across the public website. If none are added, the bar remains hidden.
          </p>
        ) : (
          <div className="contentAdminList">
            {collaborations.map((item) => (
              <article key={item.id}>
                <div className="contentThumb" style={{ borderRadius: "8px", background: "#f1f5f9" }}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="80px"
                      style={{ objectFit: "contain", padding: "6px" }}
                    />
                  ) : (
                    <span>{item.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="contentAdminMeta">
                  <strong>{item.name}</strong>
                  <span>Order {item.displayOrder} {item.websiteUrl && <>&bull; <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)" }}>{item.websiteUrl}</a></>}</span>
                </div>
                <div className="contentAdminActions">
                  <button className="tableAction" type="button" onClick={() => edit(item)}>Edit</button>
                  <button className="tableAction tableDelete" type="button" onClick={() => setPendingDelete(item)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {pendingDelete && (
        <ConfirmDelete
          title="Delete Collaboration?"
          description={`${pendingDelete.name} will be removed and will no longer show in the public scrolling bar.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void remove()}
        />
      )}
    </div>
  );
}
