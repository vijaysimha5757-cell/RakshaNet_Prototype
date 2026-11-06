const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const STORE = { alerts: 'rakshanet_vijaysimha_alerts_v1', contacts: 'rakshanet_vijaysimha_contacts_v1', children: 'rakshanet_vijaysimha_children_v1' };
let currentLocation = null;
let toastTimer;

function load(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(message, error = false) {
  const el = $('#toast'); el.textContent = message; el.classList.toggle('error', error); el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
}
function timestamp() { return new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
function refresh() {
  const alerts = load(STORE.alerts), contacts = load(STORE.contacts);
  $('#stat-alerts').textContent = alerts.length;
  $('#stat-contacts').textContent = contacts.length;
  const recent = $('#recent-alerts');
  if (!alerts.length) recent.innerHTML = '<div class="empty-state">No alerts yet. Demo activity will appear here.</div>';
  else recent.innerHTML = alerts.slice(0,3).map(a => `<div class="alert-row"><span class="alert-dot"></span><div><strong>${escapeHTML(a.type)} alert</strong><small>${escapeHTML(a.time)}</small></div><span class="alert-status">DEMO</span></div>`).join('');
}
function createAlert(type) {
  const alerts = load(STORE.alerts);
  alerts.unshift({ id: Date.now(), type, time: timestamp(), location: currentLocation });
  save(STORE.alerts, alerts); refresh();
  toast(`${type} demo alert recorded locally. No messages were sent.`);
}
function getLocation() {
  if (!navigator.geolocation) { toast('This browser does not support geolocation.', true); return; }
  $('#location-message').textContent = 'Requesting location permission…';
  navigator.geolocation.getCurrentPosition(pos => {
    currentLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) };
    $('#stat-location').textContent = 'Available';
    $('#location-detail').textContent = `Accuracy ±${currentLocation.accuracy} m`;
    $('#location-message').textContent = `Coordinates: ${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)} · Accuracy ±${currentLocation.accuracy} m. Not sent to anyone.`;
    $('#map-label').textContent = 'Location obtained on this device';
    $('#map-placeholder').style.background = '#e9f6ef';
    toast('Location obtained. It has not been sent to anyone.');
  }, err => {
    const msg = err.code === 1 ? 'Location permission denied. Allow it in browser settings to test this feature.' : err.code === 2 ? 'Location unavailable. Try again or use a supported device.' : 'Location request timed out. Please try again.';
    $('#location-message').textContent = msg; toast(msg, true);
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
}
function showPage(target) {
  const workspace = $('#workspace');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === target));
  if (target === 'overview') { workspace.classList.add('hidden'); $('#page-title').textContent = 'Overview'; window.scrollTo({top:0,behavior:'smooth'}); return; }
  workspace.classList.remove('hidden');
  const titles = { women:"Women's Safety", child:'Child Protection', contacts:'Trusted Contacts', history:'Alert History', about:'About RakshaNet' };
  $('#page-title').textContent = titles[target] || 'Overview';
  if (target === 'women') workspace.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">WOMEN'S SAFETY</p><h3>Personal safety actions</h3></div><span class="mode-icon pink">♡</span></div><p class="muted">Use the demo alert to record an emergency event. You can request location separately; this prototype does not contact responders.</p><div class="location-actions"><button class="button primary" id="women-sos">Create SOS demo alert</button><button class="button secondary" id="women-location">Get current location</button></div><p class="footer-note">Project Lead: Vijaysimha. For real deployment, add secure accounts, consent controls, and verified notification integrations.</p>`;
  else if (target === 'child') workspace.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">CHILD PROTECTION</p><h3>Guardian check-in</h3></div><span class="mode-icon blue">♧</span></div><p class="muted">This demo stores child check-in notes locally. Enter fictional data during the hackathon.</p><div class="field-grid"><div class="field"><label for="child-name">Child nickname (demo)</label><input id="child-name" maxlength="50" placeholder="e.g. Student A"></div><div class="field"><label for="child-place">Check-in location / school</label><input id="child-place" maxlength="80" placeholder="e.g. School gate"></div></div><div class="field"><label for="child-note">Pickup / check-in note</label><input id="child-note" maxlength="160" placeholder="e.g. Arrived at school at 8:30 AM"></div><button class="button primary" id="save-child">Save demo check-in</button><div id="child-list"></div><p class="footer-note">This is not live tracking. Guardian access control and verified pickup workflows are needed before real-world use.</p>`;
  else if (target === 'contacts') workspace.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">TRUSTED SUPPORT</p><h3>Manage trusted contacts</h3></div><span class="mode-icon pink">◎</span></div><p class="muted">Add fictional contacts for the demo. Details stay in this browser and are not messaged.</p><div class="field-grid"><div class="field"><label for="contact-name">Contact name</label><input id="contact-name" maxlength="60" placeholder="e.g. Trusted Contact 1"></div><div class="field"><label for="contact-phone">Phone number (demo)</label><input id="contact-phone" maxlength="25" placeholder="e.g. 9000000000" inputmode="tel"></div></div><button class="button primary" id="add-contact">Add contact</button><div id="contact-list"></div><p class="footer-note">Real alerts require a backend and a consent-based messaging service. Never rely on this local prototype for emergencies.</p>`;
  else if (target === 'history') workspace.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">RECORDED EVENTS</p><h3>Alert history</h3></div><button class="button secondary" id="clear-history">Clear history</button></div><div id="history-list"></div><p class="footer-note">History is stored only in this browser's local storage.</p>`;
  else if (target === 'about') workspace.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">PROJECT INFORMATION</p><h3>RakshaNet</h3></div><span class="brand-mark">R</span></div><p class="muted">RakshaNet is a hackathon prototype focused on women's safety and child protection through quick demo alerts, location awareness, trusted contact records, and guardian check-ins.</p><div class="field-grid"><div class="stat-card"><div><span>Group Leader</span><strong>Vijaysimha</strong><small>Project lead</small></div></div><div class="stat-card"><div><span>Technology</span><strong>HTML · CSS · JS</strong><small>Browser-based prototype</small></div></div></div><p class="footer-note">Current limitations: alerts are local only; no real messages or emergency dispatch; child check-ins are not live tracking. This honest scope is part of the demonstration.</p>`;
  if (target === 'contacts') renderContacts();
  if (target === 'child') renderChildren();
  if (target === 'history') renderHistory();
  workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderContacts() {
  const contacts = load(STORE.contacts), el = $('#contact-list'); if (!el) return;
  el.innerHTML = contacts.length ? contacts.map(c => `<div class="contact-row"><div><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.phone)}</small></div><button class="small-danger" data-remove-contact="${c.id}">Remove</button></div>`).join('') : '<div class="empty-state" style="margin-top:12px">No demo contacts added yet.</div>';
}
function renderChildren() {
  const children = load(STORE.children), el = $('#child-list'); if (!el) return;
  el.innerHTML = children.length ? children.map(c => `<div class="child-row"><div><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.place)} · ${escapeHTML(c.note)} · ${escapeHTML(c.time)}</small></div><span class="tag">Saved locally</span></div>`).join('') : '<div class="empty-state" style="margin-top:12px">No check-ins saved yet.</div>';
}
function renderHistory() {
  const alerts = load(STORE.alerts), el = $('#history-list'); if (!el) return;
  el.innerHTML = alerts.length ? alerts.map(a => `<div class="alert-row"><span class="alert-dot"></span><div><strong>${escapeHTML(a.type)} alert</strong><small>${escapeHTML(a.time)}${a.location ? ` · ${a.location.latitude.toFixed(5)}, ${a.location.longitude.toFixed(5)}` : ''}</small></div><span class="alert-status">DEMO</span></div>`).join('') : '<div class="empty-state">No alerts recorded.</div>';
}
document.addEventListener('click', e => {
  const nav = e.target.closest('[data-page]'); if (nav) { e.preventDefault(); showPage(nav.dataset.page); return; }
  if (e.target.closest('#sos-button')) { if (confirm('Create a DEMO SOS alert? This will not contact anyone.')) createAlert('Emergency SOS'); }
  if (e.target.closest('#location-button')) getLocation();
  if (e.target.closest('#clear-location')) { currentLocation = null; $('#stat-location').textContent = 'Not requested'; $('#location-detail').textContent = 'Permission required'; $('#location-message').textContent = 'Location display cleared.'; $('#map-label').textContent = 'Location not requested'; $('#map-placeholder').style.background = '#f0f3f9'; toast('Location display cleared.'); }
  if (e.target.closest('#women-sos')) { if (confirm('Create a DEMO SOS alert? This will not contact anyone.')) createAlert('Women safety SOS'); }
  if (e.target.closest('#women-location')) getLocation();
  if (e.target.closest('#add-contact')) {
    const name = $('#contact-name').value.trim(), phone = $('#contact-phone').value.trim();
    if (!name || !phone) { toast('Enter both a name and phone number for the demo.', true); return; }
    const contacts = load(STORE.contacts); contacts.push({ id: Date.now(), name, phone }); save(STORE.contacts, contacts);
    $('#contact-name').value = ''; $('#contact-phone').value = ''; renderContacts(); refresh(); toast('Demo contact saved locally.');
  }
  const remove = e.target.closest('[data-remove-contact]'); if (remove) { save(STORE.contacts, load(STORE.contacts).filter(c => c.id !== Number(remove.dataset.removeContact))); renderContacts(); refresh(); toast('Demo contact removed.'); }
  if (e.target.closest('#save-child')) {
    const name = $('#child-name').value.trim(), place = $('#child-place').value.trim(), note = $('#child-note').value.trim();
    if (!name || !place || !note) { toast('Complete all check-in fields.', true); return; }
    const children = load(STORE.children); children.unshift({ id: Date.now(), name, place, note, time: timestamp() }); save(STORE.children, children);
    $('#child-name').value = ''; $('#child-place').value = ''; $('#child-note').value = ''; renderChildren(); toast('Demo check-in saved locally.');
  }
  if (e.target.closest('#clear-history')) { if (confirm('Clear all demo alert history from this browser?')) { save(STORE.alerts, []); refresh(); renderHistory(); toast('Demo alert history cleared.'); } }
});
refresh();
