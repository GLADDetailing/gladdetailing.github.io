(() => {
  'use strict';
  if (window.GLAD_ANALYTICS) return;

  const measurementId = 'G-1G04ECDY81';
  const productionHosts = ['gladdetailing.com', 'www.gladdetailing.com'];
  const production = window.location.protocol === 'https:' && productionHosts.includes(window.location.hostname);
  const disabled = !production || window['ga-disable-' + measurementId] === true;
  const events = new Set([
    'booking_start', 'booking_form_view', 'package_vehicle_selected',
    'booking_form_external_click', 'call_click', 'text_click', 'generate_lead', 'membership_application_start', 'membership_application_submitted'
  ]);
  const packages = ['In & Out', 'Interior Focused', 'Exterior Focused', 'Full Detail'];
  const vehicles = ['sedan', 'suv', 'large-suv', 'truck', 'truck-or-large-suv'];
  const contexts = ['header', 'mobile_bar', 'package_card', 'hero', 'service_content', 'booking_dialog', 'page_content', 'vehicle_selector', 'booking_page', 'membership_club'];
  const paths = new Set([
    '/', '/index.html', '/packages.html', '/gallery.html', '/about.html', '/about-me.html',
    '/privacy.html', '/book.html', '/membership.html', '/in-and-out-detailing-gainesville.html',
    '/interior-car-detailing-gainesville.html', '/exterior-car-detailing-gainesville.html',
    '/full-car-detailing-gainesville.html', '/404.html'
  ]);
  const pagePath = paths.has(window.location.pathname) ? window.location.pathname : '/404.html';
  window.dataLayer = window.dataLayer || [];

  // Leave local reviews and non-production deployments out of live analytics.
  if (!production) window['ga-disable-' + measurementId] = true;
  if (disabled) {
    window.GLAD_ANALYTICS = Object.freeze({ measurementId, enabled: false, trackEvent: () => false });
    return;
  }

  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const pageURL = new URL(window.location.origin + pagePath);
  // Keep campaign attribution while excluding form fields and arbitrary query parameters.
  const query = new URLSearchParams(window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = query.get(key);
    if (value && value.length <= 100 && /^[a-zA-Z0-9 _./~-]+$/.test(value)) pageURL.searchParams.set(key, value);
  }
  let referrer = '';
  try { if (document.referrer) referrer = new URL(document.referrer).origin + '/'; } catch { /* An absent or invalid referrer is optional. */ }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    page_location: pageURL.href,
    page_path: pagePath,
    page_referrer: referrer,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  window.GLAD_ANALYTICS = Object.freeze({
    measurementId,
    enabled: true,
    trackEvent(event, parameters = {}) {
      if (!events.has(event)) return false;
      // Only approved service categories are sent; customer form contents never enter this payload.
      window.gtag('event', event, {
        send_to: measurementId,
        ...(event.startsWith('membership_') ? { membership_plan: ['monthly', 'biweekly', 'weekly'].includes(parameters.membership_plan) ? parameters.membership_plan : 'unspecified' } : {}),
        detail_package: packages.includes(parameters.detail_package) ? parameters.detail_package : 'unspecified',
        vehicle_category: vehicles.includes(parameters.vehicle_category) ? parameters.vehicle_category : 'unspecified',
        cta_location: contexts.includes(parameters.cta_location) ? parameters.cta_location : 'page_content',
        page_path: pagePath,
        page_location: pageURL.href
      });
      return true;
    }
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(script);
})();
