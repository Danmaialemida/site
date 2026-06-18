// Shared wizard state and navigation

const WIZARD_TOTAL = 6;

const STEP_URLS = {
  0: 'index.html',
  1: 'step1.html',
  2: 'step2.html',
  3: 'step3.html',
  4: 'step4.html',
  5: 'step5.html',
  6: 'step6.html',
  7: 'disclaimer.html',
  8: 'results.html',
};

function getState(key) { return sessionStorage.getItem(key); }
function setState(key, value) { sessionStorage.setItem(key, value); }
function clearState() {
  ['terminated','province','yearsRange','ageRange','jobType','salary']
    .forEach(k => sessionStorage.removeItem(k));
}

function goToPage(n) {
  window.location.href = STEP_URLS[n] || 'index.html';
}

function setProgress(current) {
  const fill  = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');
  if (fill)  fill.style.width = ((current - 1) / WIZARD_TOTAL * 100) + '%';
  if (label) label.textContent = `Step ${current} of ${WIZARD_TOTAL}`;
}

// Auto-advance: save selection and go to next page after short delay
function bindAutoAdvance(radioName, storageKey, nextPage) {
  document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
    radio.addEventListener('change', function () {
      setState(storageKey, this.value);
      setTimeout(() => goToPage(nextPage), 300);
    });
  });
}

// Restore previously selected radio on back-navigation
function restoreRadio(radioName, storageKey) {
  const saved = getState(storageKey);
  if (!saved) return;
  const el = document.querySelector(`input[name="${radioName}"][value="${saved}"]`);
  if (el) el.checked = true;
}
