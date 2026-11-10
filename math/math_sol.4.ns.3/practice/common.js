// Shared save/load for Sheenaz's practice sheets.
(function () {
  const sheetId = document.body.dataset.sheet || 'default';
  const storageKey = 'sheenaz-4ns3-' + sheetId;

  function fields() {
    return document.querySelectorAll('input.ans, textarea.ans, input[type=radio], input[type=checkbox]');
  }

  function save() {
    const data = {};
    fields().forEach((el, i) => {
      const key = el.name || el.dataset.key || ('f' + i);
      if (el.type === 'radio' || el.type === 'checkbox') {
        data[key + '::' + el.value] = el.checked;
      } else {
        data[key] = el.value;
      }
    });
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setStatus('Saved ✓');
    } catch (e) {
      setStatus('Could not save: ' + e.message);
    }
  }

  function load() {
    let data;
    try { data = JSON.parse(localStorage.getItem(storageKey) || '{}'); }
    catch { data = {}; }
    fields().forEach((el, i) => {
      const key = el.name || el.dataset.key || ('f' + i);
      if (el.type === 'radio' || el.type === 'checkbox') {
        const k = key + '::' + el.value;
        if (data[k] !== undefined) el.checked = !!data[k];
      } else if (data[key] !== undefined) {
        el.value = data[key];
      }
    });
    syncChoices();
  }

  function clearAll() {
    if (!confirm('Erase all your answers on this page?')) return;
    localStorage.removeItem(storageKey);
    fields().forEach(el => {
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
      else el.value = '';
    });
    syncChoices();
    setStatus('Cleared.');
  }

  function syncChoices() {
    document.querySelectorAll('.choice').forEach(c => {
      const input = c.querySelector('input');
      if (input) c.classList.toggle('checked', !!input.checked);
    });
  }

  function setStatus(msg) {
    const s = document.getElementById('status');
    if (!s) return;
    s.textContent = msg;
    clearTimeout(setStatus._t);
    setStatus._t = setTimeout(() => { s.textContent = ''; }, 2500);
  }

  let autosaveTimer;
  document.addEventListener('input', () => {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(save, 500);
  });
  document.addEventListener('change', () => {
    syncChoices();
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(save, 200);
  });

  document.addEventListener('DOMContentLoaded', () => {
    load();
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const printBtn = document.getElementById('printBtn');
    if (saveBtn) saveBtn.addEventListener('click', save);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (printBtn) printBtn.addEventListener('click', () => window.print());
  });
})();
