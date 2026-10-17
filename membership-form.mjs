import { MEMBERSHIP_ENDPOINT } from './membership-config.mjs';
import {
  CLUB_PLANS,
  CLUB_PRICES,
  CLUB_VEHICLES,
  CLUB_DAYS,
  CLUB_TIMES,
  clubQuote,
} from './membership-utils.mjs';
const arrow = /* HTML */ `<svg
  class="icon icon-arrow"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  aria-hidden="true"
  focusable="false"
>
  <path d="M5 19 19 5M5 5h14v14" />
</svg>`;
const escape = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const options = (rows) =>
  rows
    .map(
      ([value, label]) => /* HTML */ `<option value="${escape(value)}">${escape(label)}</option>`,
    )
    .join('');
const checks = (rows, name) =>
  rows
    .map(
      (value) =>
        /* HTML */ `<label class="booking-choice"
          ><input
            type="checkbox"
            name="${name}"
            value="${escape(value)}"
          /><span>${escape(value)}</span></label
        >`,
    )
    .join('');

export function setupMembershipClub(onEvent) {
  const host = document.querySelector('[data-club-application]');
  if (!host) return;
  const preview = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
  host.innerHTML = /* HTML */ `${preview ? /* HTML */ `<p class="club-preview-label"><strong>LOCAL PREVIEW</strong> — Try the application below. No application will be saved and no text will be sent.</p>` : ''}
    <form
      class="custom-booking-form club-application-form"
      aria-label="Membership Club application"
    >
      <div class="booking-form-section">
        <span class="eyebrow">01 / YOUR ROUTINE</span>
        <div class="booking-fields">
          <label for="club-plan"
            >Membership plan<select
              id="club-plan"
              name="plan"
              required
            >
              <option value="">Choose your rhythm</option>
              ${options(Object.entries(CLUB_PLANS).map(([key, label]) => [key, label + ' visits']))}
            </select></label
          >
          <label for="club-vehicle"
            >Vehicle size<select
              id="club-vehicle"
              name="vehicle"
              required
            >
              <option value="">Select your vehicle size</option>
              ${options(Object.entries(CLUB_VEHICLES).map(([key, v]) => [key, v.label]))}
            </select></label
          >
          <label
            class="booking-wide"
            for="club-model"
            >Year, make &amp; model<input
              id="club-model"
              name="model"
              required
              maxlength="100"
              placeholder="e.g. 2022 Mercedes-Benz C300"
              autocomplete="off"
          /></label>
        </div>
        <p
          class="club-application-summary"
          data-club-summary
          aria-live="polite"
        >
          Choose a plan and vehicle size to see your monthly membership price.
        </p>
      </div>
      <div class="booking-form-section">
        <span class="eyebrow">02 / A LITTLE ABOUT YOU</span>
        <div class="booking-fields">
          <label for="club-name"
            >Your name<input
              id="club-name"
              name="name"
              autocomplete="name"
              required
              maxlength="80"
              placeholder="First and last name"
          /></label>
          <label for="club-phone"
            >Phone number<input
              id="club-phone"
              name="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              required
              maxlength="30"
              placeholder="(352) 555-0123"
          /></label>
          <label
            class="booking-wide"
            for="club-email"
            >Email <span class="field-optional">(optional)</span
            ><input
              id="club-email"
              name="email"
              type="email"
              autocomplete="email"
              maxlength="120"
              placeholder="you@example.com"
          /></label>
          <label for="club-area"
            >Service area<select
              id="club-area"
              name="area"
              required
            >
              <option value="">Choose your area</option>
              ${options(['Gainesville', 'Haile Plantation', 'Tioga', 'UF area'].map((a) => [a, a]))}
            </select></label
          >
          <label for="club-customer"
            >Have we detailed for you before?<select
              id="club-customer"
              name="customer"
              required
            >
              <option value="">Choose an option</option>
              <option value="Returning customer">Yes, I’m a returning customer</option>
              <option value="New customer">Not yet—this is my first time</option>
            </select></label
          >
        </div>
      </div>
      <div class="booking-form-section">
        <span class="eyebrow">03 / YOUR SCHEDULE</span>
        <fieldset>
          <legend>Which days usually work for you?</legend>
          <p class="field-hint">
            Choose one or more. We’ll confirm availability with you personally.
          </p>
          <div class="booking-choices booking-days">${checks(CLUB_DAYS, 'days')}</div>
        </fieldset>
        <fieldset>
          <legend>What time windows fit your routine?</legend>
          <div class="booking-choices booking-times">${checks(CLUB_TIMES, 'times')}</div>
        </fieldset>
        <label
          for="club-notes"
          style="margin-top:24px"
          >Anything else we should know? <span class="field-optional">(optional)</span
          ><textarea
            id="club-notes"
            name="notes"
            rows="3"
            maxlength="1000"
            placeholder="Your maintenance goals, vehicle condition, or scheduling preferences"
          ></textarea>
        </label>
      </div>
      <div
        class="booking-honeypot"
        aria-hidden="true"
      >
        <label
          >Leave this empty<input
            name="website"
            tabindex="-1"
            autocomplete="off"
        /></label>
      </div>
      <label class="booking-consent"
        ><input
          type="checkbox"
          name="consent"
          required
        /><span
          >I agree to receive texts from GLAD Detailing confirming receipt and following up about
          this membership application. Message and data rates may apply.
          <a href="privacy.html">Privacy policy</a>.</span
        ></label
      >
      <p
        class="booking-form-error"
        role="alert"
        tabindex="-1"
        hidden
      ></p>
      <button
        class="button booking-submit"
        type="submit"
      >
        ${preview ? 'Preview application' : 'Submit my application'} ${arrow}
      </button>
      <p class="booking-submit-note">
        Application first. Personal follow-up next. No payment is collected, and membership begins
        only after we confirm the details together.
      </p>
    </form>
    <section
      class="booking-success club-application-success"
      tabindex="-1"
      role="status"
      hidden
    >
      ${preview ? /* HTML */ `<p class="club-preview-label"><strong>PREVIEW ONLY</strong> — No application was saved and no text was sent.</p>` : ''}<span
        class="eyebrow"
        >${preview ? 'APPLICATION PREVIEW' : 'APPLICATION RECEIVED'}</span
      >
      <h3>A better routine<br />starts with a hello.</h3>
      <p>
        ${preview ? 'This is the confirmation applicants will see after a successful submission.' : 'Your application has been saved. You’ll receive a text acknowledging it, and Miguel will follow up personally to discuss your plan and availability.'}
      </p>
      <p class="booking-submit-note">
        Your membership is pending review. No appointment or membership has been activated.
      </p>
      <a
        class="text-link"
        href="sms:5615077747"
        >Have a question? Text Miguel ${arrow}</a
      >${
        preview
          ? /* HTML */ `<button
              type="button"
              class="text-link club-reset-preview"
            >
              Back to the preview form
            </button>`
          : ''
      }
    </section>`;
  const form = host.querySelector('form'),
    summary = host.querySelector('[data-club-summary]'),
    error = host.querySelector('.booking-form-error'),
    button = host.querySelector('[type="submit"]'),
    success = host.querySelector('.booking-success');
  let requestId = '',
    challenge = '',
    initializing = null,
    sending = false,
    started = false;
  const track = (name, plan) =>
    onEvent?.(name, { membership_plan: Object.hasOwn(CLUB_PLANS, plan) ? plan : 'unspecified' });
  function updateSummary() {
    const plan = form.elements.namedItem('plan').value,
      vehicle = form.elements.namedItem('vehicle').value;
    const price = clubQuote(plan, vehicle);
    summary.textContent =
      !Object.hasOwn(CLUB_PLANS, plan) || !Object.hasOwn(CLUB_VEHICLES, vehicle)
        ? 'Choose a plan and vehicle size to see your monthly membership price.'
        : price === null
          ? `${CLUB_PLANS[plan]} plan · We’ll confirm pricing for your vehicle personally.`
          : `${CLUB_PLANS[plan]} plan · ${CLUB_VEHICLES[vehicle].label} · $${price} / month. Your plan and starting rate are confirmed before membership begins.`;
  }
  function updatePricing() {
    const size = document.querySelector('input[name="club-size"]:checked')?.value || 'sedan';
    const tier = { sedan: 0, suv: 1, truck: 2 }[size],
      label = { sedan: 'Sedan / coupe', suv: 'SUV (2 rows)', truck: 'Truck / large SUV' }[size];
    document
      .querySelectorAll('[data-club-price]')
      .forEach((el) => (el.textContent = '$' + CLUB_PRICES[el.dataset.clubPrice][tier]));
    document.querySelectorAll('[data-club-vehicle]').forEach((el) => (el.textContent = label));
  }
  async function init() {
    if (preview) return;
    if (!MEMBERSHIP_ENDPOINT)
      throw new Error(
        'Online applications are being prepared. Please text (561) 507-7747 for help.',
      );
    if (!requestId) requestId = crypto.randomUUID();
    if (!initializing)
      initializing = (async () => {
        const url = new URL(MEMBERSHIP_ENDPOINT);
        url.searchParams.set('kind', 'membership');
        url.searchParams.set('action', 'init');
        url.searchParams.set('requestId', requestId);
        const r = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(25000) }),
          data = await r.json();
        if (!r.ok || !data.ok || !data.challenge)
          throw new Error('We could not connect. Please reload the form or text (561) 507-7747.');
        challenge = data.challenge;
      })().catch((err) => {
        initializing = null;
        throw err;
      });
    return initializing;
  }
  form.addEventListener(
    'focusin',
    () => {
      if (!started) {
        started = true;
        track('membership_application_start', form.elements.namedItem('plan').value);
      }
      init().catch(() => {});
    },
    { once: true },
  );
  form.addEventListener('change', updateSummary);
  document
    .querySelectorAll('input[name="club-size"]')
    .forEach((input) => input.addEventListener('change', updatePricing));
  document.querySelectorAll('[data-club-plan]').forEach((link) =>
    link.addEventListener('click', () => {
      if (success.hidden) {
        if (Object.hasOwn(CLUB_PLANS, link.dataset.clubPlan))
          form.elements.namedItem('plan').value = link.dataset.clubPlan;
        const size = document.querySelector('input[name="club-size"]:checked')?.value;
        if (size === 'sedan' || size === 'suv') form.elements.namedItem('vehicle').value = size;
        else if (size === 'truck') form.elements.namedItem('vehicle').value = '';
        updateSummary();
      }
      init().catch(() => {});
    }),
  );
  host.querySelector('.club-reset-preview')?.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    button.focus();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    error.hidden = true;
    const data = new FormData(form),
      phone = String(data.get('phone') || '')
        .replace(/\D/g, '')
        .replace(/^1(?=\d{10}$)/, '');
    const fail = (message) => {
      error.textContent = message;
      error.hidden = false;
      error.focus();
    };
    if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(phone))
      return fail('Please enter a valid US phone number so we can acknowledge your application.');
    if (!data.getAll('days').length || !data.getAll('times').length)
      return fail('Please choose at least one day and one time window.');
    if (!form.reportValidity()) return;
    if (preview) {
      form.hidden = true;
      success.hidden = false;
      success.focus();
      return;
    }
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending your application…';
    try {
      await init();
      const payload = {
        requestId,
        challenge,
        name: String(data.get('name') || '').trim(),
        phone: '+1' + phone,
        email: String(data.get('email') || '').trim(),
        plan: String(data.get('plan')),
        vehicle: String(data.get('vehicle')),
        model: String(data.get('model') || '').trim(),
        area: String(data.get('area')),
        days: data.getAll('days'),
        times: data.getAll('times'),
        customer: String(data.get('customer')),
        notes: String(data.get('notes') || '').trim(),
        consent: data.get('consent') === 'on',
        website: String(data.get('website') || ''),
      };
      const r = await fetch(MEMBERSHIP_ENDPOINT, {
          method: 'POST',
          credentials: 'omit',
          signal: AbortSignal.timeout(25000),
          body: new URLSearchParams({ kind: 'membership', payload: JSON.stringify(payload) }),
        }),
        result = await r.json();
      if (!r.ok || !result.ok || result.requestId !== requestId)
        throw new Error(
          result.message ||
            'We could not confirm receipt. Please text (561) 507-7747 before trying again.',
        );
      form.hidden = true;
      success.hidden = false;
      success.focus();
      track('membership_application_submitted', payload.plan);
    } catch (err) {
      const safe = /^(Please |Your form |This application |We |Online applications)/.test(
        err.message || '',
      );
      fail(
        safe
          ? err.message
          : 'We could not confirm receipt. Your application may have arrived. Please text (561) 507-7747 before submitting again.',
      );
    } finally {
      sending = false;
      button.disabled = false;
      button.innerHTML = 'Submit my application ' + arrow;
    }
  });
  updateSummary();
  updatePricing();
}
