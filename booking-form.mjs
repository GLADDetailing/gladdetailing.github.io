import { PACKAGES, VEHICLES, normalizeSelection } from './booking-utils.mjs';
import { BOOKING_ENDPOINT } from './booking-config.mjs';

const arrow = '<svg class="icon icon-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const times = ['Morning (8 AM to 11 AM)', 'Afternoon (12 PM to 4 PM)', 'Evening (5 PM to 7 PM)'];
const addons = ['Pet hair removal', 'Leather cleaning & conditioning', 'UV trim protection', 'Engine bay detail', 'Clay & seal', 'Carpet & upholstery extraction', 'Spot stain removal'];
const escapeHTML = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const options = (values) => values.map(([value, text]) => `<option value="${escapeHTML(value)}">${escapeHTML(text)}</option>`).join('');
const checks = (values, name) => values.map((value) => `<label class="booking-choice"><input type="checkbox" name="${name}" value="${escapeHTML(value)}"><span>${escapeHTML(value)}</span></label>`).join('');
const states = new WeakMap();

export function applyBookingSelection(host, selection) {
  const form = host?.querySelector('form');
  if (!form || form.hidden) return;
  const chosen = normalizeSelection(selection);
  if (chosen.package) form.elements.namedItem('package').value = chosen.package;
  if (chosen.vehicle && chosen.vehicle !== 'truck-or-large-suv') form.elements.namedItem('vehicle').value = chosen.vehicle;
}

async function initialize(form) {
  if (!BOOKING_ENDPOINT) throw new Error('Online booking is being updated. Please text (561) 507-7747 to request your detail.');
  const state = states.get(form);
  if (!state.requestId) state.requestId = crypto.randomUUID();
  if (!state.initializing) {
    state.initializing = (async () => {
      const url = new URL(BOOKING_ENDPOINT);
      url.searchParams.set('action', 'init');
      url.searchParams.set('requestId', state.requestId);
      const response = await fetch(url, { credentials: 'omit', redirect: 'follow', signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error('We could not connect. Please try again or text (561) 507-7747.');
      const result = await response.json();
      if (!result.ok || !result.challenge) throw new Error('We could not connect. Please try again or text (561) 507-7747.');
      state.challenge = result.challenge;
    })().catch((error) => { state.initializing = null; throw error; });
  }
  return state.initializing;
}

export function setupBookingForms(onSubmitted) {
  document.querySelectorAll('[data-booking-form]').forEach((host, index) => {
    const prefix = 'glad-booking-' + index;
    host.innerHTML = `<form class="custom-booking-form" aria-label="Detailing booking request">
      <div class="booking-form-section"><span class="eyebrow">01 / YOUR DETAIL</span><div class="booking-fields">
        <label for="${prefix}-package">Choose your detail<select id="${prefix}-package" name="package" required><option value="">Select a package</option>${options(PACKAGES.map((p) => [p, p]))}</select></label>
        <label for="${prefix}-vehicle">Vehicle size<select id="${prefix}-vehicle" name="vehicle" required><option value="">Select vehicle size</option>${options(Object.entries(VEHICLES).filter(([key]) => key !== 'truck-or-large-suv').map(([key, item]) => [key, item.label]))}<option value="unique">Something unique</option></select></label>
        <label class="booking-wide" for="${prefix}-model">Year, make &amp; model <span class="field-optional">(optional)</span><input id="${prefix}-model" name="model" maxlength="100" placeholder="e.g. 2022 Toyota Camry" autocomplete="off"></label>
      </div></div>
      <div class="booking-form-section"><span class="eyebrow">02 / THE DETAILS</span><div class="booking-fields">
        <label for="${prefix}-name">Your name<input id="${prefix}-name" name="name" autocomplete="name" required maxlength="80" placeholder="First and last name"></label>
        <label for="${prefix}-phone">Phone number<input id="${prefix}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="30" placeholder="(352) 555-0123"><span class="field-hint">Miguel will text you about your request.</span></label>
        <label class="booking-wide" for="${prefix}-area">Where should we come to you?<select id="${prefix}-area" name="area" required><option value="">Choose your service area</option>${options(['Gainesville', 'Haile Plantation', 'Tioga', 'UF area'].map((a) => [a, a]))}</select></label>
      </div>
      <fieldset><legend>Which days work for you?</legend><p class="field-hint">Choose one or more. We’ll confirm a specific date by text.</p><div class="booking-choices booking-days">${checks(days, 'days')}</div></fieldset>
      <fieldset><legend>What time works best?</legend><div class="booking-choices booking-times">${checks(times, 'times')}</div></fieldset>
      <details class="booking-extras"><summary>Add-ons &amp; special requests <span aria-hidden="true">+</span></summary><fieldset><legend class="sr-only">Optional add-ons</legend><div class="booking-choices booking-addon-options">${checks(addons, 'addons')}</div></fieldset><label for="${prefix}-comments">Anything else we should know? <span class="field-optional">(optional)</span><textarea id="${prefix}-comments" name="comments" maxlength="1200" rows="3" placeholder="Vehicle condition, specific concerns, or scheduling details"></textarea></label><p class="field-hint">Add-on pricing and your final quote are confirmed with Miguel.</p></details>
      </div>
      <div class="booking-honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <label class="booking-consent"><input type="checkbox" name="consent" required><span>I agree to receive texts from GLAD Detailing at the number above about this booking request. Message and data rates may apply. <a href="privacy.html">Privacy policy</a>.</span></label>
      <p class="booking-form-error" role="alert" tabindex="-1" hidden></p>
      <button class="button booking-submit" type="submit">Send booking request ${arrow}</button>
      <p class="booking-submit-note">A request starts the conversation. Your appointment is confirmed after we agree on a time.</p>
    </form><section class="booking-success" tabindex="-1" role="status" hidden><span class="eyebrow">REQUEST RECEIVED</span><h3>You’re one step closer<br>to that fresh-car feeling.</h3><p>Your details are saved. Miguel will reach out by text to discuss your request and confirm availability.</p><p class="booking-submit-note">Your appointment is pending until we agree on a time.</p><a class="text-link" href="sms:5615077747">Need to add something? Text Miguel ${arrow}</a></section>`;
    const form = host.querySelector('form');
    states.set(form, { requestId: '', challenge: '', initializing: null, submitting: false });
    const warmup = () => { initialize(form).catch(() => {}); };
    form.addEventListener('focusin', warmup, { once: true });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const state = states.get(form);
      if (state.submitting) return;
      const error = form.querySelector('.booking-form-error');
      error.hidden = true;
      const data = new FormData(form);
      const phone = String(data.get('phone') || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
      const fail = (message) => { error.textContent = message; error.hidden = false; error.focus(); };
      if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(phone)) return fail('Please enter a valid US phone number so we can text you.');
      if (!data.getAll('days').length || !data.getAll('times').length) return fail('Please choose at least one day and one time window.');
      if (!form.reportValidity()) return;
      const button = form.querySelector('[type="submit"]');
      state.submitting = true;
      button.disabled = true;
      button.textContent = 'Sending your request…';
      try {
        await initialize(form);
        const selectedVehicle = String(data.get('vehicle'));
        const payload = {
          requestId: state.requestId, challenge: state.challenge,
          name: String(data.get('name') || '').trim(), phone: '+1' + phone,
          package: String(data.get('package')), vehicle: selectedVehicle === 'unique' ? 'Something unique' : VEHICLES[selectedVehicle].formValue,
          model: String(data.get('model') || '').trim(), area: String(data.get('area')),
          days: data.getAll('days'), times: data.getAll('times'), addons: data.getAll('addons'),
          comments: String(data.get('comments') || '').trim(), consent: data.get('consent') === 'on', website: String(data.get('website') || '')
        };
        const response = await fetch(BOOKING_ENDPOINT, { method: 'POST', credentials: 'omit', redirect: 'follow', signal: AbortSignal.timeout(25000), body: new URLSearchParams({ payload: JSON.stringify(payload) }) });
        if (!response.ok) throw new Error('We could not confirm receipt. Please try again or text (561) 507-7747.');
        const result = await response.json();
        if (!result.ok || result.requestId !== state.requestId) throw new Error(result.message || 'We could not confirm receipt. Please text (561) 507-7747.');
        form.hidden = true;
        const success = host.querySelector('.booking-success');
        success.hidden = false;
        success.focus();
        onSubmitted?.({ package: payload.package, vehicle: selectedVehicle }, host.dataset.bookingForm || 'page');
      } catch (err) {
        const uncertain = 'We could not confirm receipt. Your request may have arrived. Please text (561) 507-7747 before submitting a second request.';
        const safeMessage = /^(Please |Your form |This request |We |Online booking)/.test(err.message || '') && !['AbortError', 'TimeoutError'].includes(err.name);
        fail(safeMessage ? err.message : uncertain);
      } finally {
        state.submitting = false;
        button.disabled = false;
        button.innerHTML = 'Send booking request ' + arrow;
      }
    });
  });
}
