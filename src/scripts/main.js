// main.js - Global scripts for Aseven Pile
import { siteConfig } from '../data/site.config';
import {
  captureAttribution,
  createTrackingEvent,
  isRecentWhatsAppClick,
  queueTrackingPayload,
} from './gclid-attribution.js';

document.addEventListener('DOMContentLoaded', () => {

  // Header Scroll Effect (Transparent to Solid)
  const header = document.querySelector('.header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    // Run once on load just in case the page is already scrolled
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Scroll to Top Logic
  const btn = document.getElementById('scrollTop');
  if (btn) {
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile Menu Logic
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const endpoint = siteConfig.gclidEventEndpoint;
  const attributionStorageKey = 'aseven_attribution';
  const readAttribution = () => {
    try {
      return JSON.parse(localStorage.getItem(attributionStorageKey) || 'null');
    } catch (_) {
      return null;
    }
  };
  const now = Date.now();
  const attribution = captureAttribution(window.location.search, now, readAttribution());
  try {
    if (attribution.gclid || attribution.capturedAt) {
      localStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
    } else {
      localStorage.removeItem(attributionStorageKey);
    }
  } catch (_) {}

  const params = new URLSearchParams(window.location.search);
  const hasCurrentAttribution = Boolean(params.get('gclid')) ||
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
      .some((key) => Boolean(params.get(key)));
  const landingAttribution = hasCurrentAttribution
    ? attribution
    : { gclid: '', utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '' };

  const getDeviceLabel = () => {
    const ua = navigator.userAgent;
    let type = 'Desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) type = 'Tablet';
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua)) type = 'Mobile';
    return `${type} (${window.innerWidth}x${window.innerHeight})`;
  };

  const getEventId = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

    // Older browsers use cryptographic bytes where available, with a timestamp/random fallback.
    if (globalThis.crypto?.getRandomValues) {
      const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  };

  const getCachedSameOriginIP = () => {
    try {
      return sessionStorage.getItem('aseven_same_origin_visitor_ip') || '-';
    } catch (_) {
      return '-';
    }
  };

  const createEventDetails = () => ({
    page: window.location.pathname,
    ip: getCachedSameOriginIP(),
    referrer: document.referrer || '',
    device: getDeviceLabel(),
  });

  const sendTrackingEvent = (event, eventAttribution = attribution) => {
    if (!endpoint) return;
    const payload = createTrackingEvent(
      event,
      createEventDetails(),
      eventAttribution,
      Date.now(),
      getEventId(),
    );
    const body = JSON.stringify(payload);
    queueTrackingPayload(endpoint, new Blob([body], { type: 'text/plain' }), {
      sendBeacon: navigator.sendBeacon?.bind(navigator),
      fetchKeepalive: (url, payload) => fetch(url, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'text/plain' },
        keepalive: true,
      }),
    });
  };

  sendTrackingEvent('LANDING', landingAttribution);

  // GTM DataLayer Push
  const pushTrackingEvent = (event, parameters) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...parameters });
  };

  // 4. Deteksi Klik Tombol WhatsApp & Telepon
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const isWhatsApp = href.includes('wa.me') || href.includes('whatsapp.com');
    const isPhone = href.startsWith('tel:');

    if (isWhatsApp) {
      // Debounce klik WA dalam 3 detik untuk mencegah duplicate log saat double-click
      const now = Date.now();
      if (isRecentWhatsAppClick(now, sessionStorage)) return;

      const location = link.classList.contains('fab-wa')
        ? 'floating_button'
        : link.closest('section')?.id || 'content';

      pushTrackingEvent('generate_lead', {
        contact_method: 'whatsapp',
        cta_location: location,
        lead_stage: 'click_intent',
        confirmed_conversation: false,
      });

      sendTrackingEvent('CLICK_WA');
    } else if (isPhone) {
      pushTrackingEvent('phone_click', {
        cta_location: link.closest('section')?.id || 'content'
      });

      sendTrackingEvent('CLICK_PHONE');
    }
  });

  // 5. Deteksi Form Submit Kontak
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form instanceof HTMLFormElement && form.id === 'wa-form') {
      pushTrackingEvent('generate_lead', {
        contact_method: 'whatsapp',
        cta_location: 'contact_form',
        lead_stage: 'click_intent',
        confirmed_conversation: false,
      });

      sendTrackingEvent('CLICK_WA');
    }
  });
});
