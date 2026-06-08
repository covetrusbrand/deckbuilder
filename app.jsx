/* ============================================================
   app.jsx — Presentation Builder shell
   ============================================================ */
/* global React, ReactDOM, SlideView, IconPicker, ImagePicker, Modal,
   SLIDE_TYPES, SLIDE_TYPE_NAME, THEME_OPTIONS, makeSlide, starterDeck,
   defaultData, imageBg, PptxGenJS, htmlToImage */
const { useState, useEffect, useRef, useCallback } = React;

const LS_KEY = 'covetrus-builder-v1';

/* ---------- persistence ---------- */
function loadDeck() {
  try {
    if (location.hash.startsWith('#d=')) {
      const json = decodeURIComponent(escape(atob(location.hash.slice(3))));
      const d = JSON.parse(json);
      if (d && d.slides) return d;
    }
  } catch (e) { /* ignore */ }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.slides) return d; }
  } catch (e) { /* ignore */ }
  return starterDeck();
}

/* ---------- small UI bits ---------- */
function Seg({ value, options, onChange, labels }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o} className={o === value ? 'on' : ''} onClick={() => onChange(o)}>{labels ? labels[o] || o : o}</button>
      ))}
    </div>
  );
}
function Field({ label, children }) {
  return <label className="field"><span className="field-lbl">{label}</span>{children}</label>;
}
function RowList({ items, onAdd, onRemove, addLabel, min = 1, max = 99, children }) {
  return (
    <div className="rowlist">
      {items.map((_, i) => (
        <div className="rl-item" key={i}>
          <div className="rl-body">{children(i)}</div>
          <button className="rl-del" disabled={items.length <= min} onClick={() => onRemove(i)} title="Remove">✕</button>
        </div>
      ))}
      {items.length < max && <button className="btn ghost sm" onClick={onAdd}>+ {addLabel}</button>}
    </div>
  );
}

/* ============================================================
   Inspector — contextual structure controls (right panel)
   ============================================================ */
function Inspector({ slide, patch }) {
  const d = slide.data;
  const t = slide.type;
  const themes = THEME_OPTIONS[t] || ['light'];
  const setField = (k, v) => patch(dd => ({ ...dd, [k]: v }));
  const setArr = (k, arr) => patch(dd => ({ ...dd, [k]: arr }));

  return (
    <div className="insp">
      <div className="insp-type">{SLIDE_TYPE_NAME[t]}</div>

      {themes.length > 1 && (
        <Field label="Theme">
          <Seg value={d.theme} options={themes} onChange={(v) => setField('theme', v)}
            labels={{ light: 'Light', muted: 'Gray', navy: 'Navy' }} />
        </Field>
      )}

      {/* AGENDA */}
      {t === 'agenda' && (
        <RowList items={d.items} addLabel="Add item" min={1} max={8}
          onAdd={() => setArr('items', [...d.items, { num: String(d.items.length + 1).padStart(2, '0'), label: 'New item', desc: 'Description.' }])}
          onRemove={(i) => setArr('items', d.items.filter((_, j) => j !== i))}>
          {(i) => <div className="rl-name">{d.items[i].num} · {d.items[i].label}</div>}
        </RowList>
      )}

      {/* DIVIDER */}
      {t === 'divider' && (
        <Field label="Section number"><input className="inp" value={d.sectionNum} onChange={e => setField('sectionNum', e.target.value)} /></Field>
      )}

      {/* PILLARS */}
      {t === 'pillars' && (
        <RowList items={d.items} addLabel="Add pillar" min={1} max={3}
          onAdd={() => setArr('items', [...d.items, { icon: 'cs-star', title: 'New pillar', body: 'Short description of this pillar.', tag: 'Tag · Tag' }])}
          onRemove={(i) => setArr('items', d.items.filter((_, j) => j !== i))}>
          {(i) => <div className="rl-name">{d.items[i].title}</div>}
        </RowList>
      )}

      {/* SUMMARY */}
      {t === 'summary' && (
        <RowList items={d.paragraphs} addLabel="Add paragraph" min={1} max={6}
          onAdd={() => setArr('paragraphs', [...d.paragraphs, 'New paragraph of body copy.'])}
          onRemove={(i) => setArr('paragraphs', d.paragraphs.filter((_, j) => j !== i))}>
          {(i) => <div className="rl-name">Paragraph {i + 1}</div>}
        </RowList>
      )}

      {/* BAR CHART */}
      {t === 'barchart' && (
        <>
          <Field label="Value prefix"><input className="inp" value={d.prefix} onChange={e => setField('prefix', e.target.value)} placeholder="$ , %, …" /></Field>
          <div className="sub-h">Bars ({d.seriesA} / {d.seriesB})</div>
          <RowList items={d.bars} addLabel="Add bar" min={1} max={8}
            onAdd={() => setArr('bars', [...d.bars, { label: 'New', a: 100, b: 110 }])}
            onRemove={(i) => setArr('bars', d.bars.filter((_, j) => j !== i))}>
            {(i) => (
              <div className="bar-edit">
                <input className="inp xs" value={d.bars[i].label} onChange={e => setArr('bars', d.bars.map((b, j) => j === i ? { ...b, label: e.target.value } : b))} />
                <input className="inp xs num" type="number" value={d.bars[i].a} onChange={e => setArr('bars', d.bars.map((b, j) => j === i ? { ...b, a: +e.target.value } : b))} />
                <input className="inp xs num" type="number" value={d.bars[i].b} onChange={e => setArr('bars', d.bars.map((b, j) => j === i ? { ...b, b: +e.target.value } : b))} />
              </div>
            )}
          </RowList>
          <div className="sub-h">Side metrics</div>
          <RowList items={d.kpis} addLabel="Add metric" min={1} max={3}
            onAdd={() => setArr('kpis', [...d.kpis, { eyebrow: 'Metric', num: '0', delta: '+0%', cap: 'Caption.' }])}
            onRemove={(i) => setArr('kpis', d.kpis.filter((_, j) => j !== i))}>
            {(i) => <div className="rl-name">{d.kpis[i].eyebrow}</div>}
          </RowList>
        </>
      )}

      {/* KPI */}
      {t === 'kpi' && (
        <>
          <RowList items={d.cards} addLabel="Add metric" min={1} max={4}
            onAdd={() => setArr('cards', [...d.cards, { label: 'Metric', value: '0', delta: '+0%', foot: 'caption' }])}
            onRemove={(i) => setArr('cards', d.cards.filter((_, j) => j !== i))}>
            {(i) => <div className="rl-name">{d.cards[i].label}</div>}
          </RowList>
          <Field label="Trend points (comma-separated, 0–140; lower = higher on chart)">
            <input className="inp" value={(d.trend || []).join(',')}
              onChange={e => setField('trend', e.target.value.split(',').map(x => Math.max(0, Math.min(140, +x.trim() || 0))))} />
          </Field>
        </>
      )}

      {/* TIMELINE */}
      {t === 'timeline' && (
        <RowList items={d.steps} addLabel="Add milestone" min={2} max={6}
          onAdd={() => setArr('steps', [...d.steps, { date: 'Date', label: 'Milestone', desc: 'Description.', state: 'future' }])}
          onRemove={(i) => setArr('steps', d.steps.filter((_, j) => j !== i))}>
          {(i) => (
            <div>
              <div className="rl-name">{d.steps[i].label}</div>
              <Seg value={d.steps[i].state} options={['done', 'current', 'future']}
                onChange={(v) => setArr('steps', d.steps.map((s, j) => j === i ? { ...s, state: v } : s))} />
            </div>
          )}
        </RowList>
      )}

      {/* MOCKUP */}
      {t === 'mockup' && (
        <RowList items={d.list} addLabel="Add point" min={1} max={6}
          onAdd={() => setArr('list', [...d.list, { lead: 'New point', rest: ' — detail.' }])}
          onRemove={(i) => setArr('list', d.list.filter((_, j) => j !== i))}>
          {(i) => <div className="rl-name">{d.list[i].lead}</div>}
        </RowList>
      )}

      {/* COMPARISON */}
      {t === 'comparison' && (
        <>
          <Field label="Highlight column">
            <Seg value={String(d.highlightCol)} options={d.columns.slice(1).map((_, i) => String(i + 1))}
              labels={Object.fromEntries(d.columns.slice(1).map((c, i) => [String(i + 1), c]))}
              onChange={(v) => setField('highlightCol', +v)} />
          </Field>
          <Field label="Highlight badge"><input className="inp" value={d.highlightPill} onChange={e => setField('highlightPill', e.target.value)} /></Field>
          <div className="hint-row">Tip: type ✓ or — in a cell for a check / dash mark.</div>
          <RowList items={d.rows} addLabel="Add row" min={1} max={8}
            onAdd={() => setArr('rows', [...d.rows, d.columns.map((_, i) => i === 0 ? 'New capability' : '—')])}
            onRemove={(i) => setArr('rows', d.rows.filter((_, j) => j !== i))}>
            {(i) => <div className="rl-name">{d.rows[i][0]}</div>}
          </RowList>
        </>
      )}

      {/* TEAM */}
      {t === 'team' && (
        <RowList items={d.members} addLabel="Add person" min={1} max={4}
          onAdd={() => setArr('members', [...d.members, { initials: 'NN', role: 'Role', name: 'New name', bio: 'Short bio.', image: { kind: 'none' } }])}
          onRemove={(i) => setArr('members', d.members.filter((_, j) => j !== i))}>
          {(i) => <div className="rl-name">{d.members[i].name}</div>}
        </RowList>
      )}

      {/* CLOSING */}
      {t === 'closing' && (
        <RowList items={d.steps} addLabel="Add action" min={1} max={5}
          onAdd={() => setArr('steps', [...d.steps, { text: 'New action item.', meta: 'Owner · Date' }])}
          onRemove={(i) => setArr('steps', d.steps.filter((_, j) => j !== i))}>
          {(i) => <div className="rl-name">{d.steps[i].text}</div>}
        </RowList>
      )}

      <div className="insp-tip">Click any text on the slide to edit it. Click icons or image areas to swap them.</div>
    </div>
  );
}

/* ============================================================
   Present overlay
   ============================================================ */
function Present({ deck, start, onClose }) {
  const [i, setI] = useState(start);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { setI(x => Math.min(x + 1, deck.slides.length - 1)); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { setI(x => Math.max(x - 1, 0)); }
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [deck.slides.length, onClose]);
  const s = deck.slides[i];
  return (
    <div className="present">
      <div className="present-stage" style={{ width: 1920 * scale, height: 1080 * scale }}>
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <SlideView slide={s} editable={false} pageNum={i + 1} total={deck.slides.length} />
        </div>
      </div>
      <div className="present-bar" onMouseDown={e => e.stopPropagation()}>
        <button onClick={() => setI(x => Math.max(x - 1, 0))} disabled={i === 0}>‹</button>
        <span>{i + 1} / {deck.slides.length}</span>
        <button onClick={() => setI(x => Math.min(x + 1, deck.slides.length - 1))} disabled={i === deck.slides.length - 1}>›</button>
        <button className="present-x" onClick={onClose}>Exit ✕</button>
      </div>
      <div className="present-tap left" onClick={() => setI(x => Math.max(x - 1, 0))} />
      <div className="present-tap right" onClick={() => setI(x => Math.min(x + 1, deck.slides.length - 1))} />
    </div>
  );
}

/* ============================================================
   Add-slide gallery
   ============================================================ */
function AddGallery({ onPick, onClose }) {
  const groups = ['Open', 'Content', 'Data', 'Close'];
  return (
    <Modal title="Add a slide" onClose={onClose} wide>
      {groups.map(g => (
        <div key={g} className="gal-group">
          <div className="gal-h">{g}</div>
          <div className="gal-grid">
            {SLIDE_TYPES.filter(s => s.group === g).map(s => (
              <button key={s.type} className="gal-cell" onClick={() => { onPick(s.type); onClose(); }}>
                <div className="gal-thumb"><MiniSlide slide={makeSlide(s.type)} /></div>
                <div className="gal-name">{s.name}</div>
                <div className="gal-hint">{s.hint}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  );
}

/* Scaled, non-interactive slide preview */
function MiniSlide({ slide, w = 240 }) {
  const scale = w / 1920;
  return (
    <div className="mini" style={{ width: w, height: 1080 * scale }}>
      <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
        <SlideView slide={slide} editable={false} pageNum={1} total={1} />
      </div>
    </div>
  );
}

/* ============================================================
   Main App
   ============================================================ */
function App() {
  const [deck, setDeck] = useState(loadDeck);
  const [sel, setSel] = useState(0);
  const [adding, setAdding] = useState(false);
  const [present, setPresent] = useState(false);
  const [picker, setPicker] = useState(null); // {kind:'icon'|'image', apply, allowNone}
  const [scale, setScale] = useState(0.4);
  const [exporting, setExporting] = useState('');
  const [toast, setToast] = useState('');
  const canvasRef = useRef(null);
  const printRef = useRef(null);

  // autosave
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(deck)); } catch (e) {}
  }, [deck]);

  // fit canvas
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const fit = () => {
      const pad = 64;
      const w = el.clientWidth - pad, h = el.clientHeight - pad;
      setScale(Math.max(0.1, Math.min(w / 1920, h / 1080)));
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };
  const slides = deck.slides;
  const cur = slides[sel];

  const updateSlideData = (newData) => setDeck(d => ({ ...d, slides: d.slides.map((s, i) => i === sel ? { ...s, data: newData } : s) }));
  const patch = (fn) => updateSlideData(fn(cur.data));

  const addSlide = (type) => {
    const ns = makeSlide(type);
    setDeck(d => { const arr = d.slides.slice(); arr.splice(sel + 1, 0, ns); return { ...d, slides: arr }; });
    setSel(sel + 1);
  };
  const move = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= slides.length) return;
    setDeck(d => { const arr = d.slides.slice(); const [x] = arr.splice(i, 1); arr.splice(j, 0, x); return { ...d, slides: arr }; });
    setSel(j);
  };
  const dup = (i) => {
    setDeck(d => { const arr = d.slides.slice(); arr.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(arr[i])), id: 'd' + Date.now().toString(36) }); return { ...d, slides: arr }; });
    setSel(i + 1);
  };
  const del = (i) => {
    if (slides.length <= 1) return;
    setDeck(d => ({ ...d, slides: d.slides.filter((_, j) => j !== i) }));
    setSel(Math.max(0, i - (i === slides.length - 1 ? 1 : 0)));
  };

  // pickers
  const requestIcon = (current, apply) => setPicker({ kind: 'icon', apply });
  const requestImage = (current, apply, allowNone) => setPicker({ kind: 'image', apply, allowNone });

  // share link
  const shareLink = () => {
    try {
      const json = JSON.stringify(deck);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      location.hash = 'd=' + b64;
      const url = location.href;
      navigator.clipboard && navigator.clipboard.writeText(url);
      flash(url.length > 8000 ? 'Link copied — note: large (uploaded images make long links)' : 'Share link copied to clipboard');
    } catch (e) { flash('Could not create link'); }
  };

  // PDF via print
  const exportPDF = () => { document.body.classList.add('printing'); setTimeout(() => { window.print(); document.body.classList.remove('printing'); }, 60); };

  // PPTX via screenshots
  const exportPPTX = async () => {
    if (typeof PptxGenJS === 'undefined' || typeof htmlToImage === 'undefined') { flash('Export library still loading — try again in a moment'); return; }
    setExporting('Rendering slides…');
    try {
      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: 'C', width: 13.333, height: 7.5 });
      pptx.layout = 'C';
      const nodes = printRef.current.querySelectorAll('.print-slide');
      for (let k = 0; k < nodes.length; k++) {
        setExporting(`Rendering slide ${k + 1} of ${nodes.length}…`);
        const dataUrl = await htmlToImage.toPng(nodes[k], { width: 1920, height: 1080, pixelRatio: 1, cacheBust: true });
        const sl = pptx.addSlide();
        sl.addImage({ data: dataUrl, x: 0, y: 0, w: 13.333, h: 7.5 });
      }
      setExporting('Building file…');
      await pptx.writeFile({ fileName: (deck.title || 'Covetrus deck') + '.pptx' });
      setExporting('');
      flash('PowerPoint exported');
    } catch (e) { setExporting(''); flash('Export failed: ' + e.message); }
  };

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <img className="tb-logo" src="assets/logos/Covetrus_RGB.svg" alt="Covetrus" />
        <span className="tb-div" />
        <input className="tb-title" value={deck.title} onChange={e => setDeck(d => ({ ...d, title: e.target.value }))} spellCheck={false} />
        <span className="tb-meta">{slides.length} slides · saved locally</span>
        <div className="tb-actions">
          <button className="btn ghost" onClick={shareLink}>Share link</button>
          <div className="menu">
            <button className="btn ghost">Export ▾</button>
            <div className="menu-pop">
              <button onClick={exportPPTX}>PowerPoint (.pptx)</button>
              <button onClick={exportPDF}>PDF (print)</button>
            </div>
          </div>
          <button className="btn primary" onClick={() => setPresent(true)}>▶ Present</button>
        </div>
      </header>

      <div className="main">
        {/* Rail */}
        <aside className="rail">
          <button className="add-slide" onClick={() => setAdding(true)}>+ Add slide</button>
          <div className="rail-list">
            {slides.map((s, i) => (
              <div key={s.id} className={'rail-item' + (i === sel ? ' sel' : '')} onClick={() => setSel(i)}>
                <span className="rail-num">{i + 1}</span>
                <div className="rail-thumb"><MiniSlide slide={s} w={150} /></div>
                <div className="rail-tools" onClick={e => e.stopPropagation()}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} title="Move down">↓</button>
                  <button onClick={() => dup(i)} title="Duplicate">⧉</button>
                  <button onClick={() => del(i)} disabled={slides.length <= 1} title="Delete">✕</button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <main className="canvas" ref={canvasRef}>
          <div className="stage" style={{ width: 1920 * scale, height: 1080 * scale }}>
            <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <SlideView slide={cur} editable={true} onChange={updateSlideData}
                requestIcon={requestIcon} requestImage={requestImage} pageNum={sel + 1} total={slides.length} />
            </div>
          </div>
        </main>

        {/* Inspector */}
        <aside className="panel">
          <Inspector slide={cur} patch={patch} key={cur.id} />
        </aside>
      </div>

      {/* Hidden full-size render for export */}
      <div className="print-root" ref={printRef} aria-hidden="true">
        {slides.map((s, i) => (
          <div className="print-slide" key={s.id}>
            <SlideView slide={s} editable={false} pageNum={i + 1} total={slides.length} />
          </div>
        ))}
      </div>

      {adding && <AddGallery onPick={addSlide} onClose={() => setAdding(false)} />}
      {present && <Present deck={deck} start={sel} onClose={() => setPresent(false)} />}
      {picker && picker.kind === 'icon' && <IconPicker onPick={(name) => picker.apply(name)} onClose={() => setPicker(null)} />}
      {picker && picker.kind === 'image' && <ImagePicker onPick={(img) => picker.apply(img)} onClose={() => setPicker(null)} allowNone={picker.allowNone} />}

      {exporting && <div className="overlay-msg"><div className="spinner" />{exporting}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
