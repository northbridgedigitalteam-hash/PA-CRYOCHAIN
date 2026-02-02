:root {
    --green-header: #7aa22f;
    --green-header-dark: #567221;
    --bg-main: #f5f7f9;
    --bg-panel: #ffffff;
    --border: #d1d5db;
    --border-soft: #e5e7eb;
    --text-main: #111827;
    --text-muted: #6b7280;
    --accent: #2563eb;
    --accent-soft: #dbeafe;
    --danger: #b91c1c;
    --ok: #166534;
    --warn: #92400e;
    --radius-lg: 10px;
    --radius-sm: 6px;
    --font-main: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

*,
*::before,
*::after {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: var(--font-main);
    color: var(--text-main);
    background: var(--bg-main);
}

.consignment-body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Header / nav */

.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to bottom, var(--green-header), var(--green-header-dark));
    color: #fff;
    padding: 8px 12px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 18px;
}

.logo-inline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
}

.logo-symbol {
    font-size: 1.3rem;
}

.logo-title {
    font-size: 1rem;
}

.top-nav {
    display: flex;
    align-items: center;
    gap: 8px;
}

.nav-link {
    text-decoration: none;
    text-transform: lowercase;
    font-size: 0.85rem;
    padding: 4px 8px;
    border-radius: 12px;
    color: #ecfdf5;
}

.nav-link.active,
.nav-link:hover {
    background: rgba(255, 255, 255, 0.12);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
}

.header-badge {
    background: rgba(255, 255, 255, 0.12);
    padding: 4px 8px;
    border-radius: 999px;
}

.header-user {
    font-weight: 500;
}

.header-icon-btn {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 999px;
    padding: 4px 8px;
    cursor: pointer;
    color: #f9fafb;
}

/* Consignment bar */

.consignment-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-soft);
    background: #eef5da;
}

.consignment-bar h1 {
    margin: 0;
    font-size: 1.1rem;
    color: #1f2937;
}

.consignment-sub {
    margin: 2px 0 0;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.consignment-actions {
    display: flex;
    gap: 6px;
}

.btn {
    border-radius: 999px;
    border: 1px solid var(--border);
    padding: 5px 10px;
    font-size: 0.8rem;
    cursor: pointer;
    background: #fff;
}

.btn.primary-btn {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
}

.btn.primary-btn:hover {
    background: #1d4ed8;
    color: #fff;
}

.btn.secondary-btn:hover {
    background: #f3f4f6;
}

/* Layout */

.consignment-layout {
    flex: 1;
    padding: 10px 12px 14px;
}

.detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(320px, 1.1fr);
    gap: 10px;
}

/* Panels */

.panel {
    background: var(--bg-panel);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-soft);
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
}

.panel-header {
    padding: 6px 10px;
    border-bottom: 1px solid var(--border-soft);
    background: #f3f4f6;
}

.panel-header h2,
.panel-header h3 {
    margin: 0;
    font-size: 0.9rem;
}

.panel-body {
    padding: 8px 10px;
}

/* Summary cards */

.summary-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}

.summary-card {
    background: #f9fafb;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-soft);
    padding: 8px 10px;
    font-size: 0.8rem;
    min-width: 160px;
}

.summary-card-title {
    color: var(--text-muted);
    margin-bottom: 2px;
}

.summary-card-value {
    font-size: 1rem;
    font-weight: 600;
}

/* Summary tables */

.sub-heading {
    margin-top: 4px;
    margin-bottom: 4px;
    font-size: 0.9rem;
}

.summary-hint {
    margin: 6px 0 10px;
    font-size: 0.78rem;
    color: var(--text-muted);
}

/* Tables */

.status-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
}

.status-table th,
.status-table td {
    padding: 4px 4px;
    border-bottom: 1px solid var(--border-soft);
    vertical-align: middle;
}

.status-table th {
    background: #f9fafb;
    font-weight: 500;
    color: var(--text-muted);
}

.status-table tbody tr:hover {
    background: #f3f4f6;
    cursor: pointer;
}

/* Detail summary */

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.summary-block {
    border-right: 1px dashed var(--border-soft);
}

.summary-block:last-child {
    border-right: none;
}

.summary-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
}

.summary-table th {
    text-align: left;
    width: 38%;
    padding: 2px 6px 2px 0;
    font-weight: 500;
    color: var(--text-muted);
    vertical-align: top;
}

.summary-table td {
    padding: 2px 0;
}

.summary-table-wide th,
.summary-table-wide td {
    padding: 3px 6px 3px 0;
}

/* Notes */

.notes-box {
    width: 100%;
    min-height: 120px;
    font-size: 0.8rem;
    line-height: 1.4;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-soft);
    padding: 6px;
    resize: vertical;
    background: #fcfdfd;
}

/* Panel split */

.panel-split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0;
}

.panel-split .sub-panel {
    border-right: 1px solid var(--border-soft);
}

.panel-split .sub-panel:last-child {
    border-right: none;
}

/* Status pills */

.status-pill {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 999px;
    font-size: 0.72rem;
}

.status-ok {
    background: #dcfce7;
    color: var(--ok);
}

.status-warn {
    background: #fef9c3;
    color: var(--warn);
}

.status-bad {
    background: #fee2e2;
    color: var(--danger);
}

/* Map */

.map-container {
    height: 220px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-soft);
    overflow: hidden;
}

.map-meta {
    margin: 6px 0 0;
    font-size: 0.78rem;
    color: var(--text-muted);
}

.map-note {
    margin: 4px 0 0;
    font-size: 0.72rem;
    color: var(--text-muted);
}

/* Uploads */

.upload-form {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-size: 0.8rem;
}

.upload-label {
    font-weight: 500;
    color: var(--text-muted);
}

#docUpload {
    font-size: 0.78rem;
}

.upload-note {
    margin: 5px 0 0;
    font-size: 0.72rem;
    color: var(--text-muted);
}

/* Messages */

.message-list {
    list-style: none;
    margin: 0 0 8px;
    padding: 0;
    font-size: 0.78rem;
}

.message-list li {
    border-bottom: 1px solid var(--border-soft);
    padding: 4px 0;
}

.message-meta {
    font-size: 0.72rem;
    color: var(--text-muted);
}

.message-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

#fileMessageInput {
    min-height: 70px;
    resize: vertical;
    font-size: 0.8rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-soft);
    padding: 6px;
}

/* Footer */

.consignment-footer {
    border-top: 1px solid var(--border-soft);
    padding: 6px 12px 10px;
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-muted);
}

/* Back button */

.back-btn {
    margin-bottom: 8px;
}

/* Hidden helper */

.hidden {
    display: none !important;
}

/* Modal (booking) */

.modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 50;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
}

.modal-content {
    position: relative;
    margin-top: 7vh;
    max-width: 720px;
    width: 100%;
    background: #ffffff;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-soft);
    box-shadow: 0 10px 40px rgba(15, 23, 42, 0.35);
    z-index: 60;
}

.modal-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-soft);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-header h2 {
    margin: 0;
    font-size: 0.95rem;
}

.modal-body {
    padding: 10px 12px 12px;
}

.modal-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
}

.modal-body .form-group {
    margin-bottom: 8px;
}

.modal-body label {
    display: block;
    margin-bottom: 3px;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.modal-body input,
.modal-body textarea {
    width: 100%;
    font-size: 0.8rem;
    padding: 6px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-soft);
}

.modal-actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
    gap: 6px;
}

/* Responsive */

@media (max-width: 960px) {
    .detail-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 720px) {
    .summary-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .panel-split {
        grid-template-columns: minmax(0, 1fr);
    }

    .main-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }

    .consignment-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }

    .consignment-actions {
        flex-wrap: wrap;
    }

    .modal-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}
