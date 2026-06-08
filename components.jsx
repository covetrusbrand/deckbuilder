/* ============================================================
   components.jsx — editing primitives + asset pickers
   Loaded after React. Exports to window.
   ============================================================ */
/* global React, ICON_LIBRARY, ICON_SRC, IMAGE_LIBRARY */
const { useState, useRef, useEffect, useCallback } = React;

/* Inline contentEditable text. Commits on blur; only re-syncs from
   props when not focused so typing isn't clobbered by re-render. */
function Editable({ value, onChange, className, style, tag = 'div', multiline = false, placeholder = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== (value || '')) {
      el.innerText = value || '';
    }
  }, [value]);
  const commit = () => {
    const el = ref.current;
    if (!el) return;
    const txt = el.innerText.replace(/\u00a0/g, ' ');
    if (txt !== (value || '')) onChange(txt);
  };
  const Tag = tag;
  return (
    <Tag
      ref={ref}
      className={'ed' + (className ? ' ' + className : '')}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={placeholder}
      onBlur={commit}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { e.currentTarget.blur(); }
        e.stopPropagation();
      }}
    />
  );
}

/* Generic modal */
function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={'modal' + (wide ? ' modal-wide' : '')} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <b>{title}</b>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* Icon picker — searchable grid of the brand icon set */
function IconPicker({ onPick, onClose }) {
  const [q, setQ] = useState('');
  const list = ICON_LIBRARY.filter(i =>
    i.label.toLowerCase().includes(q.toLowerCase()) || i.name.includes(q.toLowerCase()));
  return (
    <Modal title="Choose an icon" onClose={onClose} wide>
      <input className="search" autoFocus placeholder="Search icons…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="icon-grid">
        {list.map(i => (
          <button key={i.name} className="icon-cell" onClick={() => { onPick(i.name); onClose(); }} title={i.label}>
            <img src={ICON_SRC(i.name)} alt={i.label} />
            <span>{i.label}</span>
          </button>
        ))}
        {list.length === 0 && <div className="empty">No icons match “{q}”.</div>}
      </div>
    </Modal>
  );
}

/* Image picker — curated gallery + upload, plus "remove" */
function ImagePicker({ onPick, onClose, allowNone = true }) {
  const [tab, setTab] = useState('gallery');
  const fileRef = useRef(null);
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { onPick({ kind: 'upload', value: r.result }); onClose(); };
    r.readAsDataURL(f);
  };
  return (
    <Modal title="Choose an image" onClose={onClose} wide>
      <div className="tabs">
        <button className={tab === 'gallery' ? 'tab on' : 'tab'} onClick={() => setTab('gallery')}>Brand gallery</button>
        <button className={tab === 'upload' ? 'tab on' : 'tab'} onClick={() => setTab('upload')}>Upload</button>
      </div>
      {tab === 'gallery' && (
        <div className="img-grid">
          {IMAGE_LIBRARY.map(im => (
            <button key={im.id} className="img-cell" onClick={() => { onPick({ kind: 'preset', value: im.css, id: im.id }); onClose(); }}>
              <span className="swatch" style={{ background: im.css }} />
              <span>{im.label}</span>
            </button>
          ))}
        </div>
      )}
      {tab === 'upload' && (
        <div className="upload-zone" onClick={() => fileRef.current && fileRef.current.click()}>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <div className="up-ic">⤓</div>
          <div className="up-title">Click to upload an image</div>
          <div className="up-sub">PNG or JPG. Stored in your browser with this deck.</div>
        </div>
      )}
      {allowNone && (
        <div className="modal-foot">
          <button className="btn ghost" onClick={() => { onPick({ kind: 'none' }); onClose(); }}>Remove image</button>
        </div>
      )}
    </Modal>
  );
}

Object.assign(window, { Editable, Modal, IconPicker, ImagePicker });
