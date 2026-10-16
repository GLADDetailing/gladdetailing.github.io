import { setupBookingForms, applyBookingSelection } from './booking-form.mjs';
import { readSelection, buildBookingPageURL, VEHICLES, PACKAGES } from './booking-utils.mjs';
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  // Lead-intent events only. No successful form submission is inferred from a click.
  const trackIntent = (event, selection = {}, context = '') => {
    const parameters = {
      detail_package: PACKAGES.includes(selection.package) ? selection.package : 'unspecified',
      vehicle_category: Object.hasOwn(VEHICLES, selection.vehicle) ? selection.vehicle : 'unspecified',
      cta_location: context,
      page_path: window.location.pathname
    };
    if (window.GLAD_ANALYTICS?.enabled) {
      window.GLAD_ANALYTICS.trackEvent(event, parameters);
    } else {
      // Local-only diagnostics; analytics.js does not load Google's tag on preview hosts.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event, ...parameters, is_preview: true });
    }
  };
  const contextFor = (element) => {
    if (element.closest('.header')) return 'header';
    if (element.closest('.mobile-dock')) return 'mobile_bar';
    if (element.closest('.package-card')) return 'package_card';
    if (element.closest('.hero')) return 'hero';
    if (element.closest('.service-landing, .service-quote, .local-coverage')) return 'service_content';
    if (element.closest('dialog')) return 'booking_dialog';
    return 'page_content';
  };
  const pageSelection = readSelection(location.search);
  const selectedOnPage = (packageName = '') => {
    const vehicleInput = $('input[name="vehicle"]:checked');
    return {
      package: packageName || pageSelection.package,
      vehicle: vehicleInput ? ['sedan', 'suv', 'truck-or-large-suv'][Number(vehicleInput.value)] : pageSelection.vehicle
    };
  };
  const refreshBookingLinks = () => {
    document.querySelectorAll('[data-book]').forEach((link) => {
      link.href = buildBookingPageURL(selectedOnPage(link.dataset.book));
    });
  };
  const menu = $('.menu-toggle');
  const navigation = $('#navigation');
  function closeMenu() {
    navigation?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('open', open);
  });
  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.07 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    document.documentElement.classList.add('motion-ready');
  }
  document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });

  document.querySelectorAll('input[name="vehicle"]').forEach((input) => {
    input.addEventListener('change', () => {
      refreshBookingLinks();
      trackIntent('package_vehicle_selected', selectedOnPage(), 'vehicle_selector');
      const size = Number(input.value);
      document.querySelectorAll('[data-prices]').forEach((price) => {
        price.textContent = '$' + price.dataset.prices.split(',')[size];
        price.nextElementSibling.textContent = '/ ' + ['sedan', 'SUV', 'truck / L SUV'][size];
      });
    });
  });

  const bookingModal = $('#booking-modal');
  const nudge = $('.booking-nudge');
  let returnFocus;
  let engaged = false;
  const nudgeStorage = {
    get() { try { return sessionStorage.getItem('glad-nudge-dismissed') === '1'; } catch { return false; } },
    set() { try { sessionStorage.setItem('glad-nudge-dismissed', '1'); } catch { /* Storage is optional. */ } }
  };
  function dismissNudge() { if (nudge) nudge.hidden = true; nudgeStorage.set(); }
  setupBookingForms((selection, context) => trackIntent('generate_lead', selection, context === 'booking_dialog' ? 'booking_dialog' : 'booking_page'));
  const pageForm = $('#booking-page-form');
  const describeSelection = (selection) => {
    const parts = [selection.package, VEHICLES[selection.vehicle]?.label].filter(Boolean);
    return parts.length
      ? parts.join(' · ') + (selection.vehicle === 'truck-or-large-suv' ? '. Choose your exact vehicle size below.' : '. Your selection is filled in below.') + ' We’ll text you to confirm.'
      : 'Request a time. We’ll text you to confirm your appointment.';
  };
  if (pageForm) {
    applyBookingSelection(pageForm, pageSelection);
    $('#page-booking-selection').textContent = describeSelection(pageSelection);
    trackIntent('booking_form_view', pageSelection, 'booking_page');
  }
  refreshBookingLinks();
  document.querySelectorAll('[data-book]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const selection = selectedOnPage(link.dataset.book);
      link.href = buildBookingPageURL(selection);
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      trackIntent('booking_start', selection, contextFor(link));
      if (pageForm) {
        event.preventDefault();
        if (link.dataset.book) {
          applyBookingSelection(pageForm, selection);
          $('#page-booking-selection').textContent = describeSelection(selection);
        }
        $('#request-form').scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
        return;
      }
      if (!bookingModal?.showModal) return;
      event.preventDefault();
      engaged = true;
      dismissNudge();
      closeMenu();
      returnFocus = link;
      $('#selected-package').textContent = describeSelection(selection);
      applyBookingSelection(bookingModal, selection);
      bookingModal.showModal();
    });
  });
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.getAttribute('href')?.startsWith('tel:')) trackIntent('call_click', {}, contextFor(link));
    if (link.getAttribute('href')?.startsWith('sms:')) trackIntent('text_click', {}, contextFor(link));
    if (link.hasAttribute('data-form-external')) trackIntent('booking_form_external_click', {}, contextFor(link));
  });
  function closeBooking() { bookingModal.close(); }
  $('.close-modal')?.addEventListener('click', closeBooking);
  bookingModal?.addEventListener('close', () => returnFocus?.focus({ preventScroll: true }));
  bookingModal?.addEventListener('click', (event) => {
    const rect = bookingModal.getBoundingClientRect();
    if (event.target === bookingModal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeBooking();
  });

  const photoModal = $('#photo-modal');
  let photoReturnFocus;
  document.querySelectorAll('[data-photo]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!photoModal?.showModal) { window.location.href = button.dataset.photo; return; }
      photoReturnFocus = button;
      photoModal.querySelector('img').src = button.dataset.photo;
      photoModal.querySelector('img').alt = button.dataset.caption;
      photoModal.querySelector('p').textContent = button.dataset.caption;
      photoModal.showModal();
    });
  });
  $('.close-photo')?.addEventListener('click', () => photoModal.close());
  photoModal?.addEventListener('close', () => photoReturnFocus?.focus({ preventScroll: true }));
  photoModal?.addEventListener('click', (event) => {
    const rect = photoModal.getBoundingClientRect();
    if (event.target === photoModal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) photoModal.close();
  });

  // Rotate real gallery photos around the stationary Instagram invitation.
  const showcase = $('.gallery-showcase');
  const motionToggle = $('.gallery-motion-toggle');
  if (showcase && motionToggle) {
    const tiles = [...showcase.querySelectorAll('[data-photo]')];
    const photos = tiles.map((tile) => {
      const img = tile.querySelector('img');
      return { src: tile.dataset.photo, caption: tile.dataset.caption, srcset: img.srcset, sizes: img.sizes, width: Number(img.getAttribute('width')), height: Number(img.getAttribute('height')), alt: img.alt };
    });
    let motionEnabled = !reduceMotion;
    let offset = 0;
    let generation = 0;
    const updateMotionControl = () => {
      motionToggle.textContent = motionEnabled ? 'Pause photo motion' : 'Play photo motion';
      motionToggle.setAttribute('aria-pressed', String(!motionEnabled));
    };
    motionToggle.hidden = false;
    updateMotionControl();
    motionToggle.addEventListener('click', () => {
      motionEnabled = !motionEnabled;
      generation += 1;
      tiles.forEach((tile) => tile.classList.remove('is-changing'));
      updateMotionControl();
    });
    window.setInterval(() => {
      if (!motionEnabled || document.hidden || showcase.matches(':hover, :focus-within') || document.querySelector('dialog[open]')) return;
      const rect = showcase.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      offset = (offset + 1) % photos.length;
      const currentGeneration = ++generation;
      tiles.forEach(async (tile, index) => {
        const next = photos[(index + offset) % photos.length];
        const preload = new Image();
        preload.sizes = next.sizes;
        preload.srcset = next.srcset;
        preload.src = next.src;
        try { await preload.decode(); } catch { return; }
        if (!motionEnabled || currentGeneration !== generation) return;
        tile.classList.add('is-changing');
        window.setTimeout(() => {
          if (!motionEnabled || currentGeneration !== generation) return;
          tile.dataset.photo = next.src;
          tile.dataset.caption = next.caption;
          tile.setAttribute('aria-label', 'View photo: ' + next.caption);
          const img = tile.querySelector('img');
          img.srcset = next.srcset;
          img.sizes = next.sizes;
          img.width = next.width;
          img.height = next.height;
          img.src = next.src;
          img.alt = next.alt;
          tile.querySelector('span').firstChild.textContent = next.caption + ' ';
          tile.classList.remove('is-changing');
        }, 650);
      });
    }, 7000);
  }

  $('.nudge-close')?.addEventListener('click', dismissNudge);
  // One quiet prompt per browser session, after the visitor has explored the page.
  let nudgeReady = false;
  window.setTimeout(() => { nudgeReady = true; }, 35000);
  const offerHelp = () => {
    if (pageForm || !nudgeReady || engaged || nudgeStorage.get() || document.querySelector('dialog[open]')) return;
    const progress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const booking = $('#booking');
    const bookingVisible = booking && booking.getBoundingClientRect().top < window.innerHeight && booking.getBoundingClientRect().bottom > 0;
    if (progress > 0.3 && !bookingVisible) { nudge.hidden = false; nudgeReady = false; window.removeEventListener('scroll', offerHelp); }
  };
  window.addEventListener('scroll', offerHelp, { passive: true });
  // Direct booking links remain useful when shared or opened from an older page.
  if (location.hash === '#booking') $('#booking')?.scrollIntoView({ behavior: 'instant' });
})();
