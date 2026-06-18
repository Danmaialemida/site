// Results page — reads wizard state from sessionStorage and renders results

(function () {
  const province  = sessionStorage.getItem('province');
  const years     = parseFloat(sessionStorage.getItem('yearsRange'));
  const age       = parseInt(sessionStorage.getItem('ageRange'), 10);
  const position  = sessionStorage.getItem('jobType');
  const salary    = parseFloat(sessionStorage.getItem('salary'));

  if (!province || !years || !age || !position || !salary) {
    window.location.href = 'index.html';
    return;
  }

  const prov    = ESA_DATA[province];
  const weekly  = salary / 52;
  const monthly = salary / 12;

  const termWeeks = prov.getTerminationWeeks(years);
  const sevWeeks  = prov.getSeveranceWeeks(years);
  const termAmt   = termWeeks * weekly;
  const sevAmt    = sevWeeks  * weekly;
  const esaTotal  = termAmt + sevAmt;

  const clRange = getCommonLawRange(position, years, age);
  const clMin   = clRange.min * monthly;
  const clMax   = clRange.max * monthly;
  const gapMin  = Math.max(0, clMin - esaTotal);
  const gapMax  = Math.max(0, clMax - esaTotal);

  renderESA(prov, termWeeks, termAmt, sevWeeks, sevAmt);
  renderCL(clRange, clMin, clMax);
  renderGap(gapMin, gapMax, esaTotal, clMin, clMax);

  document.getElementById('recalcBtn').addEventListener('click', () => {
    clearState();
    window.location.href = 'index.html';
  });

  function formatCAD(n) {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
    }).format(n);
  }

  function row(label, value) {
    return `<div class="result-row">
      <span class="result-label">${label}</span>
      <span class="result-value">${value}</span>
    </div>`;
  }

  function renderESA(prov, termWeeks, termAmt, sevWeeks, sevAmt) {
    const el = document.getElementById('esaContent');
    if (termWeeks === 0) {
      el.innerHTML = `<div class="result-note warning">Based on your employment length, you may not yet qualify for termination pay under ${prov.name}'s ESA (minimum service: ${prov.minServiceMonths} months). Common law may still apply — consult a lawyer.</div>`;
      return;
    }
    let html = row('Province / Act', prov.name);
    html += row('Termination Pay', `${termWeeks} week${termWeeks !== 1 ? 's' : ''} &nbsp;<strong>${formatCAD(termAmt)}</strong>`);
    if (sevWeeks > 0) {
      html += row('+ Severance Pay <span class="tag">Ontario only</span>', `${sevWeeks} weeks &nbsp;<strong>${formatCAD(sevAmt)}</strong>`);
    }
    html += `<div class="result-row result-total">
      <span class="result-label">ESA Total (legal minimum)</span>
      <span class="result-value">${formatCAD(termAmt + sevAmt)}</span>
    </div>`;
    if (prov.severanceNote) html += `<div class="result-note">* ${prov.severanceNote}</div>`;
    if (prov.note)          html += `<div class="result-note">${prov.note}</div>`;
    el.innerHTML = html;
  }

  function renderCL(clRange, clMin, clMax) {
    const el = document.getElementById('clContent');
    el.innerHTML = `
      <div class="cl-big">
        <div class="cl-big-months">${clRange.min} to ${clRange.max} months notice</div>
        <div class="cl-big-value">${formatCAD(clMin)} – ${formatCAD(clMax)}</div>
      </div>
      ${row('Lower estimate', `${clRange.min} months &nbsp;<strong>${formatCAD(clMin)}</strong>`)}
      ${row('Upper estimate', `${clRange.max} months &nbsp;<strong>${formatCAD(clMax)}</strong>`)}
      <div class="result-note">Based on Bardal factors from Canadian case law. Older employees and senior roles tend toward the upper end. Average court awards have increased 51% since 2021.</div>`;
  }

  function renderGap(gapMin, gapMax, esaTotal, clMin, clMax) {
    const el = document.getElementById('gapContent');
    if (gapMax <= 0) {
      el.innerHTML = `<div class="result-note">Your ESA minimum is close to the common law estimate. Consult a lawyer to verify your exact entitlements.</div>`;
      return;
    }
    const multLow  = esaTotal > 0 ? (clMin / esaTotal).toFixed(1) : '—';
    const multHigh = esaTotal > 0 ? (clMax / esaTotal).toFixed(1) : '—';
    el.innerHTML = `
      <div class="gap-big">
        <div class="gap-big-label">Amount potentially left on the table:</div>
        <div class="gap-big-amount">${formatCAD(gapMin)} – ${formatCAD(gapMax)}</div>
      </div>
      ${row("ESA offer (employer's legal minimum)", formatCAD(esaTotal))}
      ${row('Common law entitlement (negotiable)', `${formatCAD(clMin)} – ${formatCAD(clMax)}`)}
      ${row('Common law is', `${multLow}x to ${multHigh}x the ESA minimum`)}`;
  }
})();
