const form       = document.getElementById('calcForm');
const resultsEl  = document.getElementById('results');
const calcCard   = document.querySelector('.calculator-card');
const formErrEl  = document.getElementById('formError');

// ── Formatting ─────────────────────────────────────────────────────────────
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

// ── Validation ──────────────────────────────────────────────────────────────
function validate(province, years, age, salary, position) {
  if (!province)            return 'Please select your province or territory.';
  if (!years || years <= 0) return 'Please enter your years of service.';
  if (!age || age < 18 || age > 80) return 'Please enter a valid age (18–80).';
  if (!salary || salary <= 0) return 'Please enter your annual salary.';
  if (!position)            return 'Please select your position level.';
  return null;
}

// ── Render ESA ──────────────────────────────────────────────────────────────
function renderESA(prov, termWeeks, termAmt, sevWeeks, sevAmt) {
  const el = document.getElementById('esaContent');

  if (termWeeks === 0) {
    el.innerHTML = `<div class="result-note warning">
      ⚠️ Based on your years of service, you may not yet qualify for termination
      pay under ${prov.name}'s ESA (minimum service: ${prov.minServiceMonths} months).
      Common law may still entitle you to notice pay — consult a lawyer.
    </div>`;
    return;
  }

  let html = row('Province / Act', prov.name);
  html += row('Termination Pay', `${termWeeks} week${termWeeks !== 1 ? 's' : ''} &nbsp;<strong>${formatCAD(termAmt)}</strong>`);

  if (sevWeeks > 0) {
    html += row('+ Severance Pay <span class="tag">Ontario</span>', `${sevWeeks} weeks &nbsp;<strong>${formatCAD(sevAmt)}</strong>`);
  }

  const total = termAmt + sevAmt;
  html += `<div class="result-row result-total">
    <span class="result-label">ESA Total</span>
    <span class="result-value">${formatCAD(total)}</span>
  </div>`;

  if (prov.severanceNote) {
    html += `<div class="result-note">* ${prov.severanceNote}</div>`;
  }
  if (prov.note) {
    html += `<div class="result-note">${prov.note}</div>`;
  }

  el.innerHTML = html;
}

// ── Render Common Law ───────────────────────────────────────────────────────
function renderCL(clRange, clMin, clMax) {
  const el = document.getElementById('clContent');
  el.innerHTML = `
    <div class="cl-range">
      <div class="cl-months">${clRange.min} to ${clRange.max} months notice</div>
      <div class="cl-value">${formatCAD(clMin)} – ${formatCAD(clMax)}</div>
    </div>
    ${row('Lower estimate', `${clRange.min} months &nbsp;<strong>${formatCAD(clMin)}</strong>`)}
    ${row('Upper estimate', `${clRange.max} months &nbsp;<strong>${formatCAD(clMax)}</strong>`)}
    <div class="result-note">
      Based on Bardal factors from Canadian case law. Older employees and those in
      specialized roles tend toward the upper end. Ontario courts have been awarding
      significantly higher amounts in recent years (avg. +51% since 2021).
    </div>`;
}

// ── Render Gap ──────────────────────────────────────────────────────────────
function renderGap(gapMin, gapMax, esaTotal, clMin, clMax) {
  const el = document.getElementById('gapContent');

  if (gapMax <= 0) {
    el.innerHTML = `<div class="result-note">Your ESA minimum is close to or above the common law estimate — this is uncommon. Consult a lawyer to verify your exact entitlements.</div>`;
    return;
  }

  const multLow  = esaTotal > 0 ? (clMin / esaTotal).toFixed(1) : '—';
  const multHigh = esaTotal > 0 ? (clMax / esaTotal).toFixed(1) : '—';

  el.innerHTML = `
    <div class="gap-highlight">
      <div class="gap-label">Amount potentially left on the table:</div>
      <div class="gap-amount">${formatCAD(gapMin)} – ${formatCAD(gapMax)}</div>
    </div>
    ${row("ESA offer (employer's legal minimum)", formatCAD(esaTotal))}
    ${row('Common law entitlement (negotiable)', `${formatCAD(clMin)} – ${formatCAD(clMax)}`)}
    ${row('Common law is', `${multLow}× to ${multHigh}× the ESA minimum`)}`;
}

// ── Main handler ────────────────────────────────────────────────────────────
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const province = document.getElementById('province').value;
  const years    = parseFloat(document.getElementById('years').value);
  const age      = parseInt(document.getElementById('age').value, 10);
  const salary   = parseFloat(document.getElementById('salary').value);
  const position = document.querySelector('input[name="position"]:checked')?.value;

  const err = validate(province, years, age, salary, position);
  if (err) {
    formErrEl.textContent = err;
    formErrEl.classList.remove('hidden');
    return;
  }
  formErrEl.classList.add('hidden');

  const prov      = ESA_DATA[province];
  const weekly    = salary / 52;
  const monthly   = salary / 12;

  const termWeeks = prov.getTerminationWeeks(years);
  const sevWeeks  = prov.getSeveranceWeeks(years);
  const termAmt   = termWeeks * weekly;
  const sevAmt    = sevWeeks  * weekly;
  const esaTotal  = termAmt + sevAmt;

  const clRange   = getCommonLawRange(position, years, age);
  const clMin     = clRange.min * monthly;
  const clMax     = clRange.max * monthly;

  const gapMin = Math.max(0, clMin - esaTotal);
  const gapMax = Math.max(0, clMax - esaTotal);

  renderESA(prov, termWeeks, termAmt, sevWeeks, sevAmt);
  renderCL(clRange, clMin, clMax);
  renderGap(gapMin, gapMax, esaTotal, clMin, clMax);

  calcCard.classList.add('hidden');
  resultsEl.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('recalcBtn').addEventListener('click', function () {
  resultsEl.classList.add('hidden');
  calcCard.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
