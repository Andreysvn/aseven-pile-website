// main.js - Global scripts for Aseven Pile
import { siteConfig } from '../data/site.config';
import {
  captureAttribution,
  createTrackingEvent,
  isRecentWhatsAppClick,
  queueTrackingPayload,
} from './gclid-attribution.js';

document.addEventListener('DOMContentLoaded', () => {

  const TRACKING_WEBHOOK_URL = siteConfig.gclidEventEndpoint;

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

  // Helper to determine page topic for contextual WhatsApp messages
  const getPageTopic = () => {
    const path = window.location.pathname.replace(/\/$/, '');
    
    // 1. Diameter pages
    const diameterMatch = path.match(/\/diameter\/(\d+)/);
    if (diameterMatch) {
      if (path.includes('strauss-pile')) {
        return `Jasa Strauss Pile Diameter ${diameterMatch[1]} cm`;
      }
      return `Jasa Bore Pile Diameter ${diameterMatch[1]} cm`;
    }
    
    // 2. Bore pile city pages
    if (path.includes('/bore-pile/jakarta-selatan')) return 'Jasa Bore Pile Jakarta Selatan';
    if (path.includes('/bore-pile/tangerang-selatan')) return 'Jasa Bore Pile Tangerang Selatan';
    if (path.includes('/bore-pile/jakarta')) return 'Jasa Bore Pile Jakarta';
    if (path.includes('/bore-pile/bekasi')) return 'Jasa Bore Pile Bekasi';
    if (path.includes('/bore-pile/bogor')) return 'Jasa Bore Pile Bogor';
    if (path.includes('/bore-pile/depok')) return 'Jasa Bore Pile Depok';
    if (path.includes('/bore-pile/tangerang')) return 'Jasa Bore Pile Tangerang';
    
    // 3. Strauss pile city pages
    if (path.includes('/strauss-pile/jakarta')) return 'Jasa Strauss Pile Jakarta';
    if (path.includes('/strauss-pile/bekasi')) return 'Jasa Strauss Pile Bekasi';
    if (path.includes('/strauss-pile')) return 'Jasa Strauss Pile Manual';
    
    // 4. Layanan spesifik
    if (path.includes('/bore-pile-mesin')) return 'Jasa Bore Pile Mesin (Mini Crane)';
    if (path.includes('/bore-pile-gawangan')) return 'Jasa Bore Pile Gawangan';
    if (path.includes('/strauss-pile-manual')) return 'Jasa Strauss Pile Manual';
    const areaCityMatch = path.match(/\/area-layanan\/([a-z-]+)$/);
    if (areaCityMatch) {
      const formattedCity = areaCityMatch[1].split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      return `Layanan Pondasi di ${formattedCity}`;
    }
    if (path.includes('/area-layanan')) return 'Area Layanan Jasa Bore Pile';
    if (path.includes('/harga')) return 'Biaya & Harga Jasa Bore Pile';
    if (path.includes('/galeri')) return 'Dokumentasi Proyek Bore Pile';
    if (path.includes('/tentang-kami')) return 'Layanan Aseven Pile';
    if (path.includes('/kontak')) return 'Jasa Bore Pile & Strauss Pile';
    
    return 'jasa pondasi bore pile & strauss pile';
  };

  // Dynamically set floating WhatsApp button message based on current page
  const fabWa = document.querySelector('.fab-wa');
  if (fabWa) {
    const topic = getPageTopic();
    const text = `Halo Aseven Pile, saya dari website ingin menanyakan terkait ${topic}.`;
    fabWa.setAttribute('href', `https://wa.me/6285814173761?text=${encodeURIComponent(text)}`);
  }

  const getDeviceLabel = () => {
    const ua = navigator.userAgent;
    let type = 'Desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) type = 'Tablet';
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua)) type = 'Mobile';
    return `${type} (${window.innerWidth}x${window.innerHeight})`;
  };

  const readStoredAttribution = () => {
    try {
      const saved = localStorage.getItem('aseven_attribution');
      if (saved) return JSON.parse(saved);

      const legacy = {
        gclid: localStorage.getItem('aseven_gclid') || '',
        utmSource: localStorage.getItem('aseven_utm_source') || '',
        utmMedium: localStorage.getItem('aseven_utm_medium') || '',
        utmCampaign: localStorage.getItem('aseven_utm_campaign') || '',
        utmTerm: localStorage.getItem('aseven_utm_term') || '',
        utmContent: localStorage.getItem('aseven_utm_content') || '',
      };
      if (Object.values(legacy).some(Boolean)) {
        const savedDate = Date.parse(localStorage.getItem('aseven_gclid_date') || '');
        return { ...legacy, capturedAt: Number.isFinite(savedDate) ? savedDate : Date.now() };
      }
    } catch (_) {}
    return null;
  };

  const initTrafficParams = () => {
    const now = Date.now();
    const attribution = captureAttribution(window.location.search, now, readStoredAttribution());
    try {
      localStorage.setItem('aseven_attribution', JSON.stringify(attribution));
      if (document.referrer && !document.referrer.includes(window.location.hostname)) {
        sessionStorage.setItem('aseven_referrer', document.referrer);
      }
    } catch (_) {}
    return attribution;
  };
  const attribution = initTrafficParams();

  let maxScrollPct = 0;
  const updateScrollDepth = () => {
    const docEl = document.documentElement;
    const scrollHeight = docEl.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      const isAtBottom = (window.innerHeight + window.scrollY) >= (docEl.scrollHeight - 20);
      let pct = Math.min(100, Math.round((window.scrollY / scrollHeight) * 100));
      if (isAtBottom || pct >= 97) pct = 100;
      if (pct > maxScrollPct) maxScrollPct = pct;
    }
  };
  window.addEventListener('scroll', updateScrollDepth, { passive: true });

  const sendTrackingLog = (event) => {
    try {
      updateScrollDepth();
      const scrollSuffix = maxScrollPct > 0 ? ` · Scroll ${maxScrollPct}%` : '';
      const payload = createTrackingEvent(event, {
        page: window.location.pathname,
        ip: '-',
        referrer: sessionStorage.getItem('aseven_referrer') || document.referrer || '-',
        device: `${getDeviceLabel()}${scrollSuffix}`,
      }, attribution, Date.now(), window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      const payloadString = JSON.stringify(payload);
      queueTrackingPayload(TRACKING_WEBHOOK_URL, payloadString, {
        sendBeacon: navigator.sendBeacon
          ? (url, body) => navigator.sendBeacon(url, body)
          : null,
        fetchKeepalive: (url, body) => fetch(url, {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'text/plain' },
          keepalive: true,
          mode: 'no-cors',
        }),
      });
    } catch (_) {}
  };

  // Catat landing (0% baru buka) untuk semua sumber (Ads, SEO, Medsos, Direct) sekali per halaman per sesi browser.
  try {
    const pageKey = 'aseven_landed_' + (window.location.pathname || '/');
    const alreadyLoggedLanding = sessionStorage.getItem(pageKey);
    if (!alreadyLoggedLanding) {
      sessionStorage.setItem(pageKey, '1');
      sendTrackingLog('LANDING');
    }
  } catch (err) {}

  // GTM DataLayer Push
  const pushTrackingEvent = (event, parameters) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...parameters });
  };

  // 3. Deteksi Scroll Depth (GTM DataLayer Push untuk 25%, 50%, 75%, 90%, 100% mentok footer)
  const trackedScrollDepths = new Set();
  const scrollThresholds = [25, 50, 75, 90, 100];

  const handleScrollDepth = () => {
    const docEl = document.documentElement;
    const scrollHeight = docEl.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    
    // Hitung persentase scroll, jika sudah mentok paling bawah (selisih <= 15px) jadikan 100%
    const isAtBottom = (window.innerHeight + window.scrollY) >= (docEl.scrollHeight - 15);
    let currentPercent = Math.min(100, Math.round((window.scrollY / scrollHeight) * 100));
    if (isAtBottom || currentPercent >= 98) currentPercent = 100;

    for (let i = 0; i < scrollThresholds.length; i++) {
      const threshold = scrollThresholds[i];
      if (currentPercent >= threshold && !trackedScrollDepths.has(threshold)) {
        trackedScrollDepths.add(threshold);

        // Format standar GA4 / Google Tag Manager
        pushTrackingEvent('scroll', {
          percent_scrolled: threshold,
          scroll_depth_threshold: threshold,
          page_location: window.location.href,
          page_path: window.location.pathname
        });

        // Format Custom Event untuk GTM tag spesifik
        pushTrackingEvent('scroll_depth', {
          percent: threshold,
          depth: threshold,
          page_path: window.location.pathname
        });

        if (threshold === 25) {
          pushTrackingEvent('scroll_25', {
            percent: 25,
            page_path: window.location.pathname
          });
          sendTrackingLog('SCROLL_25');
        } else if (threshold === 50) {
          pushTrackingEvent('scroll_50', {
            percent: 50,
            page_path: window.location.pathname
          });
          sendTrackingLog('SCROLL_50');
        } else if (threshold === 75) {
          pushTrackingEvent('scroll_75', {
            percent: 75,
            page_path: window.location.pathname
          });
          sendTrackingLog('SCROLL_75');
        } else if (threshold === 90) {
          pushTrackingEvent('scroll_90', {
            percent: 90,
            page_path: window.location.pathname
          });
          sendTrackingLog('SCROLL_90');
        } else if (threshold === 100) {
          pushTrackingEvent('scroll_100', {
            percent: 100,
            page_path: window.location.pathname
          });
          sendTrackingLog('SCROLL_100');
        }
      }
    }

    if (trackedScrollDepths.size === scrollThresholds.length) {
      window.removeEventListener('scroll', handleScrollDepth);
    }
  };

  window.addEventListener('scroll', handleScrollDepth, { passive: true });
  setTimeout(handleScrollDepth, 500);

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
      if (isRecentWhatsAppClick(Date.now(), sessionStorage)) return;

      const location = link.classList.contains('fab-wa')
        ? 'floating_button'
        : link.closest('section')?.id || 'content';

      // Push GTM
      pushTrackingEvent('generate_lead', {
        contact_method: 'whatsapp',
        cta_location: location
      });

      // Kirim Log Siluman ke Google Sheet Webhook (sendBeacon)
      sendTrackingLog('CLICK_WA');
    } else if (isPhone) {
      pushTrackingEvent('phone_click', {
        cta_location: link.closest('section')?.id || 'content'
      });

      sendTrackingLog('CLICK_PHONE');
    }
  });

  // 5. Deteksi Form Submit Kontak
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form instanceof HTMLFormElement && form.id === 'wa-form') {
      pushTrackingEvent('generate_lead', {
        contact_method: 'whatsapp',
        cta_location: 'contact_form'
      });

      sendTrackingLog('CLICK_WA');
    }
  });
});
