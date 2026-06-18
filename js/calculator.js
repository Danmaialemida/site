// ── State ───────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 6;
let currentStep = 1;

// ── DOM refs ────────────────────────────────────────────────────────────────
const progressFill  = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const backBtn       = document.getElementById('backBtn');
const nextBtn       = document.getElementById('nextBtn');
const stepNav       = document.getElementById('stepNav');
const stepError     = document.getElementById('stepError');
const resultsEl     = document.getElementById('results');
const wizardSection = document.querySelector('.wizard-section');

// ── Progress ────────────────────────────────────────────────────────────────
function updateProgress(step) {
  const pct = ((step - 1) / TOTAL_STEPS) * 100;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `Step ${step} of ${TOTAL_STEPS}`;
}

// ── Show / Hide step panels ─────────────────────────────────────────────────
function showStep(n) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));

  const isDisclaimer = (n === TOTAL_STEPS + 1);
  const panelId = isDisclaimer ? 'stepDisclaimer' : `step${n}`;
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.remove('hidden');

  // Back button
  backBtn.classList.toggle('hidden', n <= 1);

  // Next button: hide on auto-next steps and disclaimer
  const autoNextSteps = [1, 3, 4, 5];
  const hideNext = autoNextSteps.includes(n) || isDisclaimer;
  nextBtn.classList.toggle('hidden', hideNext);

  // Hide nav on disclaimer step
  stepNav.classList.toggle('hidden', isDisclaimer);

  clearError();
  updateProgress(Math.min(n, TOTAL_STEPS));
  currentStep = n;
}

// ── Validation per step ──────────────────────────────────────────────────────
function validateStep(n) {
  switch (n) {
    case 1: {
      const v = getRadio('terminated');
      if (!v) return 'Please select an option.';
      if (v === 'no') {
        document.getElementById('notTerminatedMsg').classList.remove('hidden');
        return 'BLOCK'; // stop navigation
      }
      return null;
    }
    case 2: {
      const v = document.getElementById('province').value;
      if (!v) return 'Please select your province or territory.';
      return null;
    }
    case 3: {
      if (!getRadio('yearsRange')) return 'Please select your length of employment.';
      return null;
    }
    case 4: {
      if (!getRadio('ageRange')) return 'Please select your age range.';
      return null;
    }
    case 5: {
      if (!getRadio('jobType')) return 'Please select your job type.';
      return null;
    }
    case 6: {
      const s = parseFloat(document.getElementById('salary').value);
      if (!s || s <= 0) return 'Please enter your annual salary.';
      return null;
    }
  }
  return null;
}

// ── Next / Back ──────────────────────────────────────────────────────────────
nextBtn.addEventListener('click', () => advanceStep());
backBtn.addEventListener('click', () => {
  if (currentStep > 1) showStep(currentStep - 1);
});

function advanceStep() {
  const err = validateStep(currentStep);
  if (err === 'BLOCK') return;
  if (err) { showError(err); return; }

  if (currentStep < TOTAL_STEPS) {
    showStep(currentStep + 1);
  } else {
    // Last data step → show disclaimer
    showStep(TOTAL_STEPS + 1);
  }
}

// ── Auto-advance on radio select ─────────────────────────────────────────────
document.querySelectorAll('.option-card[data-auto-next] input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    // Visual feedback first, then advance
    setTimeout(() => {
      const err = validateStep(currentStep);
      if (err === 'BLOCK') return;
      if (!err) advanceStep();
    }, 280);
  });
});

// ── "I Understand" button on disclaimer ──────────────────────────────────────
document.getElementById('agreeBtn').addEventListener('click', () => {
  calculate();
});

// ── Recalculate ───────────────────────────────────────────────────────────────
document.getElementById('recalcBtn').addEventListener('click', () => {
  resultsEl.classList.add('hidden');
  wizardSection.classList.remove('hidden');
  document.getElementById('wizardProgress').classList.remove('hidden');
  // Reset form
  document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
  document.getElementById('province').value = '';
  document.getElementById('salary').value = '';
  document.getElementById('notTerminatedMsg').classList.add('hidden');
  showStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Calculation ───────────────────────────────────────────────────────────────
function calculate() {
  const province  = document.getElementById('province').value;
  const years     = parseFloat(getRadio('yearsRange'));
  const age       = parseInt(getRadio('ageRange'), 10);
  const position  = getRadio('jobType');
  const salary    = parseFloat(document.getElementById('salary').value);

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
  const gapMin    = Math.max(0, clMin - esaTotal);
  const gapMax    = Math.max(0, clMax - esaTotal);

  renderESA(prov, termWeeks, termAmt, sevWeeks, sevAmt);
  renderCL(clRange, clMin, clMax);
  renderGap(gapMin, gapMax, esaTotal, clMin, clMax);

  wizardSection.classList.add('hidden');
  document.getElementById('wizardProgress').classList.add('hidden');
  resultsEl.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Render helpers ────────────────────────────────────────────────────────────
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
    el.innerHTML = `<div class="result-note warning">⚠️ Based on your employment length, you may not yet qualify for termination pay under ${prov.name}'s ESA (minimum service: ${prov.minServiceMonths} months). Common law may still apply — consult a lawyer.</div>`;
    return;
  }
  let html = row('Province / Act', prov.name);
  html += row('Termination Pay', `${termWeeks} week${termWeeks !== 1 ? 's' : ''} &nbsp;<strong>${formatCAD(termAmt)}</strong>`);
  if (sevWeeks > 0) {
    html += row('+ Severance Pay <span class="tag">Ontario</span>', `${sevWeeks} weeks &nbsp;<strong>${formatCAD(sevAmt)}</strong>`);
  }
  html += `<div class="result-row result-total">
    <span class="result-label">ESA Total</span>
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
    <div class="result-note">Based on Bardal factors from Canadian case law. Older employees and specialized roles tend toward the upper end. Ontario courts have been awarding significantly higher amounts in recent years (+51% avg. since 2021).</div>`;
}

function renderGap(gapMin, gapMax, esaTotal, clMin, clMax) {
  const el = document.getElementById('gapContent');
  if (gapMax <= 0) {
    el.innerHTML = `<div class="result-note">Your ESA minimum is close to the common law estimate — this is uncommon. Consult a lawyer to verify your exact entitlements.</div>`;
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
    ${row('Common law is', `${multLow}× to ${multHigh}× the ESA minimum`)}`;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function getRadio(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || null;
}
function showError(msg) {
  stepError.textContent = msg;
  stepError.classList.remove('hidden');
}
function clearError() {
  stepError.classList.add('hidden');
  stepError.textContent = '';
}

// ── Init ──────────────────────────────────────────────────────────────────────
showStep(1);
