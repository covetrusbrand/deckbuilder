/* ============================================================
   slides.jsx — renders any slide type. editable=true wires
   inline text editing + click-to-swap icons/images.
   ============================================================ */
/* global React, Editable, ICON_SRC, imageBg, imageSrc */

function getIn(obj, path) { return path.reduce((o, k) => (o == null ? o : o[k]), obj); }
function setIn(obj, path, val) {
  const clone = Array.isArray(obj) ? obj.slice() : { ...obj };
  let cur = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    cur[k] = Array.isArray(cur[k]) ? cur[k].slice() : { ...cur[k] };
    cur = cur[k];
  }
  cur[path[path.length - 1]] = val;
  return clone;
}

const LOGO = 'assets/logos/Covetrus_RGB.svg';
const LOGO_KO = 'assets/logos/Covetrus_RGB_KO.svg';
const BUG_KO = 'assets/logos/Covetrus_Bug_RGB_KO.svg';

/* A cropped/zoomable photo that fills its (relative, overflow-hidden) parent.
   Reads focal point (posX/posY) + zoom from the image field. */
function PhotoLayer({ img }) {
  const src = imageSrc(img);
  if (!src) return null;
  const zoom = (img && img.zoom ? img.zoom : 100) / 100;
  const px = img && img.posX != null ? img.posX : 50;
  const py = img && img.posY != null ? img.posY : 50;
  return (
    <img className="photo-layer" src={src} alt=""
      style={{ objectPosition: `${px}% ${py}%`, transform: `scale(${zoom})`, transformOrigin: `${px}% ${py}%` }} />
  );
}

function SlideView({ slide, editable, onChange, requestIcon, requestImage, pageNum, total }) {
  const data = slide.data;
  const theme = data.theme || 'light';
  const set = (path, val) => onChange(setIn(data, path, val));

  // text helper: inline-editable when editing, static otherwise
  const T = (path, opts = {}) => {
    const { tag = 'div', className, multiline = false, placeholder = '', style, key } = opts;
    const value = getIn(data, path);
    if (!editable) {
      return React.createElement(tag, { key, className, style: multiline ? { whiteSpace: 'pre-wrap', ...style } : style }, value);
    }
    return React.createElement(Editable, { key, value, onChange: (v) => set(path, v), tag, className, multiline, placeholder, style: multiline ? { whiteSpace: 'pre-wrap', ...style } : style });
  };

  const pickIcon = (path) => editable && requestIcon(getIn(data, path), (name) => set(path, name));
  const pickImage = (path, allowNone = true) => editable && requestImage(getIn(data, path), (img) => set(path, img), allowNone);

  const rootCls = ['slide-root', theme === 'navy' ? 'navy' : '', theme === 'muted' ? 'muted-bg' : ''].filter(Boolean).join(' ');
  const pkCls = editable ? ' pk' : '';

  const Footer = () => (
    <div className="footer-bar">
      <img className="brand-mark" src={theme === 'navy' ? LOGO_KO : LOGO} alt="Covetrus" />
      <span className="confidential">Proprietary &amp; Confidential. ©2026</span>
      <div className="meta"><span className="page-num">{pageNum}</span></div>
    </div>
  );

  const Glow = (style) => <div className="teal-glow" style={style} />;

  switch (slide.type) {
    /* ---------------- COVER ---------------- */
    case 'cover': {
      const photo = imageSrc(data.image);
      const rightArt = data.rightArt || (photo ? 'photo' : 'brand');
      const showPhoto = rightArt === 'photo';
      const brandRight = (
        <div className="cover-right">
          {Glow({ top: -200, right: -200 })}{Glow({ bottom: -300, left: -200, width: 600, height: 600 })}
          <img className="bug" src={BUG_KO} alt="" />
        </div>
      );
      let right;
      if (showPhoto && photo) {
        right = (
          <div className={'cover-right has-photo' + pkCls}
            onClick={() => pickImage(['image'])} title={editable ? 'Click to change the image' : undefined}>
            <PhotoLayer img={data.image} />
          </div>
        );
      } else if (showPhoto && editable) {
        right = (
          <div className={'cover-right photo-empty' + pkCls} onClick={() => pickImage(['image'])} title="Click to add a lifestyle image">
            <div className="photo-ph">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.8" />
                <path d="M21 16l-5-5L5 20" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Add a lifestyle image</span>
            </div>
          </div>
        );
      } else {
        right = brandRight;
      }
      return (
        <div className={rootCls}>
          <div className="cover">
            <div className="cover-left">
              <img className="cover-logo" src={theme === 'navy' ? LOGO_KO : LOGO} alt="Covetrus" />
              <div>
                {data.showEyebrow !== false && T(['eyebrow'], { className: 'eyebrow' })}
                {data.showTitle !== false && T(['title'], { tag: 'h1', className: 'display', multiline: true })}
                {data.showLede !== false && T(['lede'], { className: 'lede', multiline: true })}
              </div>
              {data.showDate !== false && (
                <div className="meta-row">
                  {T(['dateMeta'])}
                </div>
              )}
            </div>
            {right}
          </div>
        </div>
      );
    }

    /* ---------------- AGENDA ---------------- */
    case 'agenda':
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="agenda-grid">
            {data.items.map((it, i) => (
              <div className="agenda-item" key={i}>
                {T(['items', i, 'num'], { tag: 'span', className: 'num' })}
                <div>
                  {T(['items', i, 'label'], { className: 'label' })}
                  {T(['items', i, 'desc'], { className: 'desc' })}
                </div>
              </div>
            ))}
          </div>
          <Footer />
        </div></div>
      );

    /* ---------------- DIVIDER ---------------- */
    case 'divider': {
      const photo = imageSrc(data.image);
      return (
        <div className={rootCls}><div className="divider">
          <div className="divider-left">
            {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
            {T(['title'], { tag: 'h2', className: 'section-title', multiline: true })}
          </div>
          <div className={'divider-right' + (photo ? ' has-photo' : '') + pkCls}
            onClick={() => pickImage(['image'])} title={editable ? 'Click to set a section image' : undefined}>
            {photo ? <PhotoLayer img={data.image} /> : <>{Glow({ top: -200, right: -200 })}{Glow({ bottom: -200, left: -200 })}
              <div className="section-num">{editable
                ? <Editable value={data.sectionNum} onChange={(v) => set(['sectionNum'], v)} tag="span" />
                : data.sectionNum}</div></>}
          </div>
        </div></div>
      );
    }

    /* ---------------- PILLARS ---------------- */
    case 'pillars':
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="pillar-grid" data-count={data.items.length}>
            {data.items.map((it, i) => (
              <article className="pillar" key={i}>
                <div className={'icon-wrap' + pkCls} onClick={() => pickIcon(['items', i, 'icon'])} title={editable ? 'Click to change icon' : undefined}>
                  <img src={ICON_SRC(it.icon)} alt="" />
                </div>
                {T(['items', i, 'title'], { tag: 'h3' })}
                {T(['items', i, 'body'], { tag: 'p', multiline: true })}
                {T(['items', i, 'tag'], { className: 'tag' })}
              </article>
            ))}
          </div>
          <Footer />
        </div></div>
      );

    /* ---------------- SUMMARY ---------------- */
    case 'summary':
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="longform">
            <div className="lf-side">
              {T(['sideHead'], { tag: 'h3', className: 'h3' })}
              {T(['sideSub'], { className: 'lf-sub', multiline: true })}
            </div>
            <div className="lf-body">
              {data.paragraphs.map((p, i) => T(['paragraphs', i], { tag: 'p', key: i, multiline: true }))}
            </div>
          </div>
          <Footer />
        </div></div>
      );

    /* ---------------- BAR CHART ---------------- */
    case 'barchart': {
      const maxV = Math.max(...data.bars.flatMap(b => [Number(b.a) || 0, Number(b.b) || 0]), 1);
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="chart-layout">
            <div className="chart-card">
              <div className="ch-head">
                {T(['chartTitle'], { className: 'ch-title' })}
                <div className="ch-legend">
                  <span><span className="dot" style={{ background: '#0055E7' }} />{editable ? <Editable tag="span" value={data.seriesA} onChange={v => set(['seriesA'], v)} /> : data.seriesA}</span>
                  <span><span className="dot" style={{ background: 'var(--teal)' }} />{editable ? <Editable tag="span" value={data.seriesB} onChange={v => set(['seriesB'], v)} /> : data.seriesB}</span>
                </div>
              </div>
              <div className="bar-chart">
                {data.bars.map((b, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar-pair">
                      <div className="bar" style={{ height: ((Number(b.a) || 0) / maxV * 100) + '%' }}><span className="bar-val">{data.prefix}{b.a}</span></div>
                      <div className="bar teal" style={{ height: ((Number(b.b) || 0) / maxV * 100) + '%' }}><span className="bar-val">{data.prefix}{b.b}</span></div>
                    </div>
                    <div className="bar-label">{editable ? <Editable tag="span" value={b.label} onChange={v => set(['bars', i, 'label'], v)} /> : b.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-side">
              {data.kpis.map((k, i) => (
                <div className="kpi-block" key={i}>
                  {T(['kpis', i, 'eyebrow'], { className: 'kpi-eyebrow' })}
                  <div className="kpi-num">{editable ? <Editable tag="span" value={k.num} onChange={v => set(['kpis', i, 'num'], v)} /> : k.num}<span className="delta">{editable ? <Editable tag="span" value={k.delta} onChange={v => set(['kpis', i, 'delta'], v)} /> : k.delta}</span></div>
                  {T(['kpis', i, 'cap'], { className: 'kpi-cap', multiline: true })}
                </div>
              ))}
            </div>
          </div>
          <Footer />
        </div></div>
      );
    }

    /* ---------------- KPI DASHBOARD ---------------- */
    case 'kpi': {
      const pts = data.trend || [];
      const n = Math.max(pts.length - 1, 1);
      const coords = pts.map((v, i) => [i / n * 800, v]);
      const line = coords.map((c, i) => (i ? 'L' : 'M') + c[0].toFixed(0) + ',' + c[1].toFixed(0)).join(' ');
      const area = line + ` L800,140 L0,140 Z`;
      const last = coords[coords.length - 1] || [800, 12];
      const first = coords[0] || [0, 140];
      const pct = (c) => ({ left: (c[0] / 800 * 100) + '%', top: (c[1] / 140 * 100) + '%' });
      const tStartVal = data.trendStartVal ?? '$1.8M';
      const tEndVal = data.trendEndVal ?? '$3.4M';
      const tStartPer = data.trendStartPeriod ?? 'Jul 2025';
      const tEndPer = data.trendEndPeriod ?? 'Jun 2026';
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="kpi-grid">
            {data.cards.map((c, i) => (
              <div className="kpi-card" key={i}>
                {T(['cards', i, 'label'], { className: 'kc-label' })}
                <div className="kc-value">{editable ? <Editable tag="span" value={c.value} onChange={v => set(['cards', i, 'value'], v)} /> : c.value}</div>
                <div className="kc-foot"><span className="delta">{editable ? <Editable tag="span" value={c.delta} onChange={v => set(['cards', i, 'delta'], v)} /> : c.delta}</span>{editable ? <Editable tag="span" value={c.foot} onChange={v => set(['cards', i, 'foot'], v)} /> : c.foot}</div>
              </div>
            ))}
          </div>
          <div className="trend-block size-fill">
            <div className="tb-head">
              {T(['trendHead'], { className: 'h3' })}
              {T(['trendSub'], { tag: 'p', multiline: true })}
            </div>
            <div className="trend-chart">
              <div className="tc-plot">
                <svg className="trend-svg" viewBox="0 0 800 140" preserveAspectRatio="none" aria-hidden="true">
                  <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#27BDBE" stopOpacity="0.35" /><stop offset="100%" stopColor="#27BDBE" stopOpacity="0" /></linearGradient></defs>
                  <path d={area} fill="url(#tg)" />
                  <path d={line} stroke="#27BDBE" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={last[0]} cy={last[1]} r="6" fill="#27BDBE" />
                  <circle cx={last[0]} cy={last[1]} r="11" fill="#27BDBE" fillOpacity="0.25" />
                </svg>
                <span className="tc-val tc-start" style={pct(first)}>
                  {editable ? <Editable tag="span" value={tStartVal} onChange={v => set(['trendStartVal'], v)} /> : tStartVal}
                </span>
                <span className="tc-val tc-end" style={pct(last)}>
                  {editable ? <Editable tag="span" value={tEndVal} onChange={v => set(['trendEndVal'], v)} /> : tEndVal}
                </span>
              </div>
              <div className="tc-axis">
                <span>{editable ? <Editable tag="span" value={tStartPer} onChange={v => set(['trendStartPeriod'], v)} /> : tStartPer}</span>
                <span>{editable ? <Editable tag="span" value={tEndPer} onChange={v => set(['trendEndPeriod'], v)} /> : tEndPer}</span>
              </div>
            </div>
          </div>
          <Footer />
        </div></div>
      );
    }

    /* ---------------- TIMELINE ---------------- */
    case 'timeline': {
      const steps = data.steps || [];
      const lastDone = steps.reduce((acc, s, i) => (s.state === 'done' || s.state === 'current') ? i : acc, 0);
      const prog = steps.length > 1 ? (lastDone / (steps.length - 1)) * 100 : 0;
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="timeline-wrap"><div className="timeline-rail">
            <div className="progress" style={{ width: prog + '%' }} />
            <div className="timeline-row">
              {steps.map((s, i) => {
                const place = i % 2 === 0 ? 'tl-above' : 'tl-below';
                return (
                  <div className={'tl-step ' + (s.state || 'future')} key={i}>
                    <div className={place}>
                      {T(['steps', i, 'date'], { className: 'tl-date' })}
                      {T(['steps', i, 'label'], { className: 'tl-label' })}
                      {T(['steps', i, 'desc'], { className: 'tl-desc', multiline: true })}
                    </div>
                    <div className="dot" />
                  </div>
                );
              })}
            </div>
          </div></div>
          <Footer />
        </div></div>
      );
    }

    /* ---------------- MOCKUP ---------------- */
    case 'mockup': {
      const screen = imageSrc(data.screenImage);
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="mockup-layout">
            <div className="mockup-text">
              {T(['mockHead'], { tag: 'h3', className: 'h3', multiline: true })}
              {T(['body'], { tag: 'p', className: 'ml-body', multiline: true })}
              <div className="ml-list">
                {data.list.map((li, i) => (
                  <div className="mli" key={i}>
                    <span className="mli-bullet" aria-hidden="true" />
                    <div>
                      <strong>{editable ? <Editable tag="span" value={li.lead} onChange={v => set(['list', i, 'lead'], v)} /> : li.lead}</strong>
                      {editable ? <Editable tag="span" value={li.rest} onChange={v => set(['list', i, 'rest'], v)} /> : li.rest}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mockup" role="img" aria-label="Product mockup">
              <div className="mock-bar"><span className="tld" style={{ background: '#FF5F57' }} /><span className="tld" style={{ background: '#FEBC2E' }} /><span className="tld" style={{ background: '#28C840' }} /><div className="mock-url">{editable ? <Editable tag="span" value={data.mockUrl ?? 'covetrus.com/mockup'} onChange={v => set(['mockUrl'], v)} /> : (data.mockUrl ?? 'covetrus.com/mockup')}</div></div>
              {screen ? (
                <div className={'mock-body screenshot' + pkCls} onClick={() => editable && pickImage(['screenImage'])} title={editable ? 'Click to change the screenshot' : undefined}>
                  <img className="mock-shot" src={screen} alt="" />
                </div>
              ) : (
                <div className={'mock-body shot-empty' + pkCls} onClick={() => editable && pickImage(['screenImage'])} title={editable ? 'Click to add a screenshot' : undefined}>
                  <div className="shot-ph">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.8" /><path d="M21 16l-5-5L5 20" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>Add a screenshot</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div></div>
      );
    }

    /* ---------------- QUOTE ---------------- */
    case 'quote': {
      const avBg = imageBg(data.avatarImage);
      return (
        <div className={rootCls}>
          {theme === 'navy' && <>{Glow({ top: -300, right: -200 })}{Glow({ bottom: -300, left: -300 })}</>}
          <div className={'quote-slide' + (theme !== 'navy' ? ' light' : '')}>
            <div className="q-mark">“</div>
            {T(['quote'], { tag: 'blockquote', multiline: true })}
            <div className="q-byline">
              <div className={'q-avatar' + pkCls} style={avBg ? { backgroundImage: avBg } : null} onClick={() => pickImage(['avatarImage'])} title={editable ? 'Click to add a photo' : undefined}>
                {!avBg && (editable ? <Editable tag="span" value={data.avatar} onChange={v => set(['avatar'], v)} /> : data.avatar)}
              </div>
              <div>
                {T(['name'], { className: 'q-name' })}
                {T(['title'], { className: 'q-title' })}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      );
    }

    /* ---------------- COMPARISON ---------------- */
    case 'comparison': {
      const hlSet = new Set(Array.isArray(data.highlightCols)
        ? data.highlightCols
        : (data.highlightCol >= 1 ? [data.highlightCol] : []));
      const badgeOf = (ci) => Array.isArray(data.badges)
        ? (data.badges[ci] || '')
        : (ci === data.highlightCol ? (data.highlightPill || '') : '');
      const setBadge = (ci, v) => {
        const arr = Array.isArray(data.badges)
          ? data.badges.slice()
          : data.columns.map((_, i) => (i === data.highlightCol ? (data.highlightPill || '') : ''));
        arr[ci] = v;
        set(['badges'], arr);
      };
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="comp-table"><table><thead><tr>
            {data.columns.map((c, ci) => (
              <th key={ci} className={(ci === 0 ? 'feature-col' : '') + (hlSet.has(ci) ? ' highlight' : '')}>
                {editable ? <Editable tag="span" value={c} onChange={v => set(['columns', ci], v)} /> : c}
                {hlSet.has(ci) && badgeOf(ci) ? <span className="pill">{editable ? <Editable tag="span" value={badgeOf(ci)} onChange={v => setBadge(ci, v)} /> : badgeOf(ci)}</span> : null}
              </th>
            ))}
          </tr></thead><tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const cls = hlSet.has(ci) ? 'highlight' : '';
                  const isMark = cell === '✓' || cell === '—';
                  return (
                    <td key={ci} className={cls}>
                      {isMark && !editable ? <span className={cell === '✓' ? 'check' : 'dash'}>{cell}</span>
                        : editable ? <Editable tag="span" value={cell} onChange={v => set(['rows', ri, ci], v)} />
                          : (cell === '✓' ? <span className="check">✓</span> : cell === '—' ? <span className="dash">—</span> : cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody></table></div>
          <Footer />
        </div></div>
      );
    }

    /* ---------------- TEAM ---------------- */
    case 'team':
      return (
        <div className={rootCls}><div className="slide-pad flex-start">
          {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
          {T(['title'], { tag: 'h2', className: 'title' })}
          <div className="team-grid" data-count={data.members.length}>
            {data.members.map((m, i) => {
              const photo = imageSrc(m.image);
              return (
                <div className="team-card" key={i}>
                  <div className={'avatar' + pkCls + (photo ? '' : ' avatar-empty')} onClick={() => editable && pickImage(['members', i, 'image'])} title={editable ? 'Click to add a photo' : undefined}>
                    {photo ? <PhotoLayer img={m.image} /> : (
                      <div className="avatar-ph">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <circle cx="8.5" cy="9.5" r="1.8" />
                          <path d="M21 16l-5-5L5 20" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Add an image</span>
                      </div>
                    )}
                  </div>
                  <div className="tc-text">
                    <div>
                      {T(['members', i, 'role'], { className: 'tc-role' })}
                      {T(['members', i, 'name'], { className: 'tc-name' })}
                    </div>
                    {T(['members', i, 'bio'], { tag: 'p', className: 'tc-bio', multiline: true })}
                  </div>
                </div>
              );
            })}
          </div>
          <Footer />
        </div></div>
      );

    /* ---------------- CLOSING ---------------- */
    case 'closing': {
      const photo = imageSrc(data.image);
      const rightArt = data.rightArt || (photo ? 'photo' : 'brand');
      const showPhoto = rightArt === 'photo';
      const brandRight = (
        <div className="closing-right">
          {Glow({ top: -200, right: -200 })}{Glow({ bottom: -200, left: -100 })}
          <img src={BUG_KO} style={{ width: 420, position: 'relative', zIndex: 2 }} alt="" />
        </div>
      );
      let right;
      if (showPhoto && photo) {
        right = (
          <div className={'closing-right has-photo' + pkCls}
            onClick={() => pickImage(['image'])} title={editable ? 'Click to change the image' : undefined}>
            <PhotoLayer img={data.image} />
          </div>
        );
      } else if (showPhoto && editable) {
        right = (
          <div className={'closing-right photo-empty' + pkCls} onClick={() => pickImage(['image'])} title="Click to add an image">
            <div className="photo-ph">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.8" />
                <path d="M21 16l-5-5L5 20" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Add an image</span>
            </div>
          </div>
        );
      } else {
        right = brandRight;
      }
      return (
        <div className={rootCls}><div className="closing">
          <div className="closing-left">
            {data.showEyebrow !== false && T(['eyebrow'], { tag: 'p', className: 'eyebrow' })}
            {T(['title'], { tag: 'h2', className: 'display' })}
            {T(['lede'], { className: 'lede', multiline: true })}
            <div className="next-steps">
              {data.steps.map((s, i) => (
                <div className="next-step" key={i}>
                  <div className="ns-num">{i + 1}</div>
                  <div className="ns-text">
                    {editable ? <Editable tag="span" value={s.text} onChange={v => set(['steps', i, 'text'], v)} /> : s.text}
                    <span className="ns-meta">{editable ? <Editable tag="span" value={s.meta} onChange={v => set(['steps', i, 'meta'], v)} /> : s.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {right}
        </div></div>
      );
    }

    default:
      return <div className={rootCls}><div className="slide-pad"><p className="title">Unknown slide</p></div></div>;
  }
}

Object.assign(window, { SlideView, getIn, setIn });
