"use client";

import { useState } from "react";
import type {
  CertificateTemplate,
  CertificateTemplateFieldKey,
  CertificateTemplateLayout,
} from "@/lib/types";
import {
  CERTIFICATE_TEMPLATE_FIELD_KEYS,
  CERTIFICATE_TEMPLATE_FIELD_LABELS,
  cloneCertificateTemplateLayout,
  DEFAULT_CERTIFICATE_TEMPLATE_LAYOUT,
} from "@/lib/certificate-template-layout";
import { CertificateTemplateCanvas } from "@/components/CertificateTemplateCanvas";

interface CertificateTemplateEditorProps {
  template: CertificateTemplate;
  onClose: () => void;
  onSaved: (template: CertificateTemplate) => void;
  notify: (message: string, type?: "success" | "error") => void;
}

const sampleCertificate = {
  certificateType: "Certificate of Participation",
  recipientName: "Recipient Name",
  eventName: "Sample Event",
  organization: "IEEE Computer Society",
  credentialId: "IEECS-SU-2026-0001",
  issueDate: "2026-10-05",
  issuedBy: "President Name",
  verificationLink: "/verify/IEECS-SU-2026-0001",
};

export function CertificateTemplateEditor({
  template,
  onClose,
  onSaved,
  notify,
}: CertificateTemplateEditorProps) {
  const [layout, setLayout] = useState(() => cloneCertificateTemplateLayout(template.layout));
  const [selectedField, setSelectedField] = useState<CertificateTemplateFieldKey>("recipientName");
  const [saving, setSaving] = useState(false);
  const selected = layout.fields[selectedField];

  function updateSelected(patch: Partial<CertificateTemplateLayout["fields"][CertificateTemplateFieldKey]>) {
    setLayout((current) => ({
      ...current,
      fields: {
        ...current.fields,
        [selectedField]: { ...current.fields[selectedField], ...patch },
      },
    }));
  }

  function moveField(key: CertificateTemplateFieldKey, x: number, y: number) {
    setLayout((current) => ({
      ...current,
      fields: {
        ...current.fields,
        [key]: { ...current.fields[key], x, y },
      },
    }));
  }

  async function saveLayout() {
    setSaving(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        notify(data.error || "Template layout could not be saved", "error");
        return;
      }
      onSaved(data as CertificateTemplate);
      notify(`${template.name} layout saved successfully`);
    } catch {
      notify("Network error while saving template layout", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal templateEditorModal" role="presentation">
      <section className="templateEditorBox" role="dialog" aria-modal="true" aria-labelledby="template-editor-title">
        <div className="templateEditorHeader">
          <div>
            <div className="eyebrow">Template Layout Editor</div>
            <h2 id="template-editor-title">{template.name}</h2>
            <p>Drag a field on the preview, then fine-tune its position and styling.</p>
          </div>
          <button className="close" type="button" onClick={onClose} aria-label="Close template editor">×</button>
        </div>

        <div className="templateEditorWorkspace">
          <div className="templateEditorPreviewPane">
            <CertificateTemplateCanvas
              imageUrl={template.imageUrl}
              layout={layout}
              certificate={sampleCertificate}
              editable
              selectedField={selectedField}
              onSelectField={setSelectedField}
              onMoveField={moveField}
            />
            <p className="templateEditorHint">Tip: use a clean background without sample names or event text.</p>
          </div>

          <aside className="templateEditorControls">
            <label htmlFor="layout-field">Editing field</label>
            <select id="layout-field" value={selectedField} onChange={(event) => setSelectedField(event.target.value as CertificateTemplateFieldKey)}>
              {CERTIFICATE_TEMPLATE_FIELD_KEYS.map((key) => (
                <option value={key} key={key}>{CERTIFICATE_TEMPLATE_FIELD_LABELS[key]}</option>
              ))}
            </select>

            <div className="layoutControlGrid">
              <label>
                <span>Horizontal <strong>{selected.x}%</strong></span>
                <input type="range" min="0" max="100" step="0.5" value={selected.x} onChange={(event) => updateSelected({ x: Number(event.target.value) })} />
              </label>
              <label>
                <span>Vertical <strong>{selected.y}%</strong></span>
                <input type="range" min="0" max="100" step="0.5" value={selected.y} onChange={(event) => updateSelected({ y: Number(event.target.value) })} />
              </label>
              <label>
                <span>Max width <strong>{selected.width}%</strong></span>
                <input type="range" min="10" max="100" step="1" value={selected.width} onChange={(event) => updateSelected({ width: Number(event.target.value) })} />
              </label>
              <label>
                <span>Font size <strong>{selected.fontSize}px</strong></span>
                <input type="range" min="6" max="60" step="1" value={selected.fontSize} onChange={(event) => updateSelected({ fontSize: Number(event.target.value) })} />
              </label>
            </div>

            <label className="layoutColorControl">
              <span>Text color</span>
              <input type="color" value={selected.color} onChange={(event) => updateSelected({ color: event.target.value })} />
              <code>{selected.color}</code>
            </label>

            <label className="templateCheckbox layoutPanelToggle">
              <input
                type="checkbox"
                checked={layout.showContentPanel}
                onChange={(event) => setLayout((current) => ({ ...current, showContentPanel: event.target.checked }))}
              />
              Hide baked-in sample text with a white content panel
            </label>
            <p className="formHelp">Leave this off for proper blank templates. Enable it only for old images that already contain sample text.</p>

            <div className="templateEditorActions">
              <button type="button" className="secondary" onClick={() => setLayout(cloneCertificateTemplateLayout(DEFAULT_CERTIFICATE_TEMPLATE_LAYOUT))}>Reset Layout</button>
              <button type="button" className="primary" disabled={saving} onClick={() => void saveLayout()}>{saving ? "Saving..." : "Save Layout"}</button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
