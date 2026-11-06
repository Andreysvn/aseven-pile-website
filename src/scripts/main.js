// main.js - Global scripts for Aseven Pile
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

  // Capture Google Ads Click ID (gclid) for Offline Conversion Tracking
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid');
    if (gclid) {
      sessionStorage.setItem('aseven_gclid', gclid);
    }
  } catch (err) {}

  const pushTrackingEvent = (event, parameters) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...parameters });
  };

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const isWhatsApp = href.includes('wa.me') || href.includes('whatsapp.com');
    const isPhone = href.startsWith('tel:');

    if (isWhatsApp) {
      const location = link.classList.contains('fab-wa')
        ? 'floating_button'
        : link.closest('section')?.id || 'content';

      pushTrackingEvent('generate_lead', {
        contact_method: 'whatsapp',
        cta_location: location
      });
    } else if (isPhone) {
      pushTrackingEvent('phone_click', {
        cta_location: link.closest('section')?.id || 'content'
      });
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form instanceof HTMLFormElement && form.id === 'wa-form') {
      pushTrackingEvent('generate_lead', {
        contact_method: 'whatsapp',
        cta_location: 'contact_form'
      });
    }
  });
});
