"use client";

import Image from "next/image";
import { EventGalleryManager } from "@/components/EventGalleryManager";
import type { EventPageSection, SocietyEvent, TeamMember } from "@/lib/types";
import { useState, useEffect, useCallback, type FormEvent } from "react";

type Notify = (message: string, type?: "success" | "error" | "info") => void;

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function EventManager({ notify, onUnauthorized }: { notify: Notify; onUnauthorized: () => void }) {
  const [events, setEvents] = useState<SocietyEvent[]>([]);
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
  const [pageSections, setPageSections] = useState<EventPageSection[]>([]);

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
    setPageSections([]);
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
    setPageSections(event.pageSections || []);
  }

  function createNew() {
    reset();
    setShowForm(true);
  }

  function addContentSection() {
    setPageSections((current) => [
      ...current,
      { id: `content-${Date.now()}`, type: "content", heading: "Section heading", subheading: "", body: "", align: "left", headingColor: "#0f2f57", subheadingColor: "#2563eb", bodyColor: "#64748b" },
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
          <input id="event-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
          <span className="formHelp">PNG, JPEG, or WebP up to 4 MB. Leave empty while editing to keep the current image.</span>
          <div className="eventBuilderPanel">
            <div className="eventBuilderHead">
              <div>
                <strong>Page Builder</strong>
                <span>Build this event detail page with content and gallery blocks.</span>
              </div>
              <div>
                <button className="tableAction" type="button" onClick={addContentSection}>+ Text</button>
                <button className="tableAction" type="button" onClick={addGallerySection}>+ Gallery</button>
              </div>
            </div>
            {pageSections.length === 0 ? (
              <p className="adminEmpty">No custom blocks yet. Add text or gallery blocks for the public event page.</p>
            ) : (
              <div className="eventBuilderList">
                {pageSections.map((section, index) => (
                  <article key={section.id} className="eventBuilderBlock">
                    <div className="eventBuilderBlockTop">
                      <span>{index + 1}. {section.type === "content" ? "Text Block" : "Gallery Block"}</span>
                      <button className="tableAction tableDelete" type="button" onClick={() => removePageSection(section.id)}>Remove</button>
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
                        <textarea
                          id={`${section.id}-body`}
                          maxLength={1200}
                          value={section.body}
                          onChange={(event) => updatePageSection(section.id, { ...section, body: event.target.value })}
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
        {loading ? <p className="adminEmpty">Loading events...</p> : events.length === 0 ? (
          <p className="adminEmpty">No events yet. The public Events page currently shows “Coming Soon”.</p>
        ) : (
          <div className="contentAdminList">
            {events.map((item) => (
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    <div className="contentManagement listOnly">
      {showForm && <div className="contentEditorModal" role="presentation">
      <section className="contentFormCard contentEditorPanel">
        <div className="eyebrow">Public Team</div>
        <h3>{editing ? "Edit Team Member" : "Add Team Member"}</h3>
        <p>Members are displayed by their display order on the public Team and Society pages.</p>
        <form className="contentAdminForm" onSubmit={save}>
          <label htmlFor="member-name">Full name</label>
          <input id="member-name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Member name" />
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
        {loading ? <p className="adminEmpty">Loading team members...</p> : members.length === 0 ? (
          <p className="adminEmpty">No team members yet. The public Team page currently shows “Coming Soon”.</p>
        ) : (
          <div className="contentAdminList">
            {members.map((member) => (
              <article key={member.id}>
                <div className="contentThumb round">{member.imageUrl ? <Image src={member.imageUrl} alt="" fill unoptimized loading="lazy" sizes="80px" /> : <span>{member.name.slice(0, 2).toUpperCase()}</span>}</div>
                <div className="contentAdminMeta"><strong>{member.name}</strong><span>{member.role} · Order {member.displayOrder}</span><p>{member.bio || "No bio added."}</p></div>
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
