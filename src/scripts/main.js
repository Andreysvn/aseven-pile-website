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

  // Google Analytics & Google Ads Lead Conversion Tracking (WhatsApp & Phone)
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;
    const link = target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const isWhatsApp = href.includes('wa.me') || href.includes('whatsapp.com');
    const isPhone = href.startsWith('tel:');

    if (isWhatsApp || isPhone) {
      const channel = isPhone ? 'Phone Call' : 'WhatsApp Chat';
      const storedGclid = sessionStorage.getItem('aseven_gclid') || '';

      if (typeof window.gtag === 'function') {
        // Standard Google recommended lead event
        window.gtag('event', 'generate_lead', {
          event_category: 'Contact',
          event_label: channel,
          page_location: window.location.href,
          page_path: window.location.pathname,
          gclid: storedGclid || undefined,
          transport_type: 'beacon'
        });

        // Custom event for granular reporting in GA4
        window.gtag('event', isPhone ? 'click_call' : 'click_whatsapp', {
          event_category: 'Contact',
          event_label: channel,
          page_path: window.location.pathname,
          transport_type: 'beacon'
        });
      }
    }
  });
});

