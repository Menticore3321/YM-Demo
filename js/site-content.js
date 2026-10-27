/**
 * YoungMark Global Advisory - Universal Dynamic Content Hydrator & CMS Sync Engine
 * Enables live updates across all pages from data/site-content.json and real-time Admin Studio preview.
 */
(function () {
  'use strict';

  let currentContent = null;

  // 1. Initialize Content
  function initContent() {
    // Check for admin preview mode or cached staging
    const isInsideAdminIframe = window.parent && window.parent !== window;
    let localData = null;

    try {
      // In preview iframe, prefer live session draft
      const previewKey = isInsideAdminIframe ? 'ym_cms_preview_data' : 'ym_site_content';
      const stored = localStorage.getItem(previewKey) || localStorage.getItem('ym_site_content');
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('YoungMark CMS: LocalStorage read skipped', e);
    }

    if (localData) {
      currentContent = localData;
      applyContent(currentContent);
    } else {
      // Fetch master JSON
      fetch('data/site-content.json')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch data/site-content.json');
          return res.json();
        })
        .then((data) => {
          currentContent = data;
          applyContent(data);
        })
        .catch((err) => {
          console.log('YoungMark CMS: Using static HTML defaults', err.message);
        });
    }

    // 2. Listen for Real-Time Live Message from Admin Studio Iframe
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.type === 'YM_CMS_PREVIEW_UPDATE') {
        currentContent = event.data.payload;
        applyContent(currentContent);
      }
    });
  }

  // Helper safely set text
  function setText(selector, text) {
    if (!text) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.textContent = text;
  }

  function setHtml(selector, html) {
    if (!html) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.innerHTML = html;
  }

  // 3. Master Hydration Function
  function applyContent(data) {
    if (!data) return;

    // A. Apply Theme Colors
    if (data.theme) {
      const root = document.documentElement;
      if (data.theme.cForestDark) root.style.setProperty('--c-forest-green', data.theme.cForestDark);
      if (data.theme.cKombuGreen) root.style.setProperty('--c-kombu-green', data.theme.cKombuGreen);
      if (data.theme.cLeafGreen) root.style.setProperty('--c-leaf-green', data.theme.cLeafGreen);
      if (data.theme.cSageGreen) root.style.setProperty('--c-sage-green', data.theme.cSageGreen);
      if (data.theme.cLemonCream) {
        root.style.setProperty('--c-lemon-cream', data.theme.cLemonCream);
        root.style.setProperty('--c-lemon-pastel', data.theme.cLemonCream);
      }
      if (data.theme.cGoldGlow) root.style.setProperty('--c-gold-glow', data.theme.cGoldGlow);
      if (data.theme.bgDark) root.style.setProperty('--bg-base', data.theme.bgDark);
      if (data.theme.gridDotColor) root.style.setProperty('--grid-dot-color', data.theme.gridDotColor);
      if (data.theme.gridLineColor) root.style.setProperty('--grid-line-color', data.theme.gridLineColor);
      if (data.theme.gridSpotlightDot) root.style.setProperty('--grid-spotlight-dot', data.theme.gridSpotlightDot);
      if (data.theme.gridSpotlightLine) root.style.setProperty('--grid-spotlight-line', data.theme.gridSpotlightLine);
      if (data.theme.gridOpacity !== undefined) root.style.setProperty('--grid-opacity', data.theme.gridOpacity);
    }

    // B. Apply Brand
    if (data.brand) {
      // Logos
      if (data.brand.logoUrl) {
        document.querySelectorAll('.brand-logo-img, .footer-logo-img, #intro-logo-img').forEach((img) => {
          img.src = data.brand.logoUrl;
        });
      }
      // Brand Titles
      document.querySelectorAll('.brand-title').forEach((el) => {
        el.textContent = data.brand.title || 'YoungMark';
      });
      document.querySelectorAll('.brand-subtitle').forEach((el) => {
        el.textContent = data.brand.subtitle || 'Global Advisory';
      });
      // Header CTA
      const navCta = document.querySelector('.site-header .btn-cta, .nav-actions .btn-cta');
      if (navCta && data.brand.headerCtaText) {
        navCta.textContent = data.brand.headerCtaText;
        if (data.brand.headerCtaLink) navCta.href = data.brand.headerCtaLink;
      }
    }

    // C. Apply Hero Section
    if (data.hero) {
      // Badge
      const badgePill = document.querySelector('.hero-section .badge-pill');
      if (badgePill && data.hero.badgeText) {
        const dot = badgePill.querySelector('.badge-dot');
        badgePill.innerHTML = '';
        if (dot) badgePill.appendChild(dot);
        badgePill.appendChild(document.createTextNode(' ' + data.hero.badgeText));
      }

      // Title
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle && data.hero.titleHighlight) {
        heroTitle.innerHTML = `${data.hero.titlePrefix || 'Strategic Financial'} <span class="text-brand-gradient">${data.hero.titleHighlight}</span> ${data.hero.titleSuffix || '& Fiduciary Precision'}`;
      }

      // Subtitle
      if (data.hero.subtitle) {
        setText('.hero-subtitle', data.hero.subtitle);
      }

      // Hero Buttons
      const heroPrimary = document.querySelector('.hero-actions .btn-primary, .hero-actions .btn-brand');
      if (heroPrimary && data.hero.primaryCtaText) {
        heroPrimary.textContent = data.hero.primaryCtaText;
        if (data.hero.primaryCtaLink) heroPrimary.href = data.hero.primaryCtaLink;
      }
      const heroSecondary = document.querySelector('.hero-actions .btn-glass, .hero-actions .btn-secondary');
      if (heroSecondary && data.hero.secondaryCtaText) {
        heroSecondary.textContent = data.hero.secondaryCtaText;
        if (data.hero.secondaryCtaLink) heroSecondary.href = data.hero.secondaryCtaLink;
      }
    }

    // D. Apply Proven Metrics
    if (data.metrics && Array.isArray(data.metrics)) {
      const statBoxes = document.querySelectorAll('.stat-box');
      data.metrics.forEach((metric, index) => {
        const box = statBoxes[index];
        if (box) {
          const numEl = box.querySelector('.stat-number');
          const labelEl = box.querySelector('.stat-label');
          const subEl = box.querySelector('.stat-desc, .stat-subtext, p');
          if (numEl) {
            numEl.setAttribute('data-target', metric.number);
            numEl.textContent = `${metric.prefix || ''}${metric.number}${metric.suffix || ''}`;
          }
          if (labelEl) labelEl.textContent = metric.label;
          if (subEl && subEl !== labelEl) subEl.textContent = metric.subtext;
        }
      });
    }

    // Process Lifecycle Accuracy Stat Banner
    if (data.processAccuracyStat && data.processAccuracyStat.text) {
      const bannerText = document.querySelector('.process-stat-banner p');
      if (bannerText) {
        bannerText.innerHTML = data.processAccuracyStat.text;
      }
    }

    // E. Apply Services Cards
    if (data.services && Array.isArray(data.services)) {
      const serviceCards = document.querySelectorAll('.services-carousel-track .service-card');
      data.services.forEach((service, index) => {
        const card = serviceCards[index];
        if (card) {
          const cat = card.querySelector('.service-category');
          const title = card.querySelector('.service-title');
          const brief = card.querySelector('.service-brief');
          if (cat) cat.textContent = service.category;
          if (title) title.textContent = service.title;
          if (brief) brief.textContent = service.brief;

          // Update onclick modal parameters
          if (service.deliverables) {
            const delivEscaped = JSON.stringify(service.deliverables).replace(/"/g, '&quot;');
            card.setAttribute(
              'onclick',
              `showServiceModal('${service.title.replace(/'/g, "\\'")}', '${service.category.replace(/'/g, "\\'")}', '${service.brief.replace(/'/g, "\\'")}', ${delivEscaped})`
            );
          }
        }
      });
    }

    // F. Apply Team Members
    if (data.team && Array.isArray(data.team)) {
      const teamCards = document.querySelectorAll('.team-grid .team-member-card');
      data.team.forEach((member, index) => {
        const card = teamCards[index];
        if (card) {
          const img = card.querySelector('.member-avatar');
          const name = card.querySelector('.member-name');
          const role = card.querySelector('.member-role');
          const bio = card.querySelector('.member-bio');
          if (img && member.avatar) img.src = member.avatar;
          if (name) name.textContent = member.name;
          if (role) role.textContent = member.role;
          if (bio) bio.textContent = member.bio;
        }
      });
    }

    // G. Apply Careers Job Openings
    if (data.careers && Array.isArray(data.careers)) {
      const careersContainer = document.querySelector('.careers-job-list, .openings-grid, #careers-list');
      if (careersContainer) {
        // If container has children, update them
        const roleCards = careersContainer.querySelectorAll('.job-card, .opening-card');
        if (roleCards.length === data.careers.length) {
          data.careers.forEach((job, index) => {
            const card = roleCards[index];
            if (card) {
              const title = card.querySelector('.job-title, h3');
              const type = card.querySelector('.job-type, .badge');
              const loc = card.querySelector('.job-location');
              const desc = card.querySelector('.job-desc, p');
              if (title) title.textContent = job.title;
              if (type) type.textContent = `${job.department} • ${job.type}`;
              if (loc) loc.textContent = job.location;
              if (desc) desc.textContent = job.description;
            }
          });
        }
      }
    }

    // H. Apply FAQs
    if (data.faqs && Array.isArray(data.faqs)) {
      const faqItems = document.querySelectorAll('.faq-item');
      data.faqs.forEach((faq, index) => {
        const item = faqItems[index];
        if (item) {
          const qText = item.querySelector('.faq-question-text');
          const aText = item.querySelector('.faq-answer-text');
          if (qText) qText.textContent = faq.question;
          if (aText) aText.textContent = faq.answer;
        }
      });
    }

    // I. Apply Contact & Footer
    if (data.contact) {
      if (data.contact.primaryEmail) {
        document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
          if (!a.href.includes('careers')) a.href = 'mailto:' + data.contact.primaryEmail;
        });
        document.querySelectorAll('.contact-email-val').forEach((el) => {
          el.textContent = data.contact.primaryEmail;
        });
      }
      if (data.contact.primaryPhone) {
        document.querySelectorAll('.contact-phone-val').forEach((el) => {
          el.textContent = data.contact.primaryPhone;
        });
      }
      if (data.contact.copyright) {
        const copyEl = document.querySelector('.footer-bottom-copy, .footer-copyright');
        if (copyEl) copyEl.textContent = data.contact.copyright;
      }
    }

    // J. Apply Legal Policies (Terms of Service, Privacy Policy, Cookie Policy)
    if (data.legal) {
      const pathname = window.location.pathname.toLowerCase();

      // Terms of Service Page
      if (pathname.includes('terms-of-service') && data.legal.termsOfService) {
        const tos = data.legal.termsOfService;
        setText('.legal-effective-date', `Effective Date: ${tos.effectiveDate} | Last Updated: ${tos.lastUpdated}`);
        setText('.legal-intro-lead', tos.intro);

        const sectionsContainer = document.querySelector('.legal-content-body, .terms-sections');
        if (sectionsContainer && tos.sections) {
          sectionsContainer.innerHTML = tos.sections
            .map(
              (sec) => `
            <div class="legal-clause-block" style="margin-bottom: 32px;">
              <h3 style="font-size: 1.35rem; color: #FFFFFF; margin-bottom: 12px; font-weight: 700;">${sec.heading}</h3>
              <p style="color: #D6E3D4; line-height: 1.8; font-size: 1.02rem;">${sec.body}</p>
            </div>
          `
            )
            .join('');
        }
      }

      // Privacy Policy Page
      if (pathname.includes('privacy-policy') && data.legal.privacyPolicy) {
        const priv = data.legal.privacyPolicy;
        setText('.legal-effective-date', `Effective Date: ${priv.effectiveDate} | Last Updated: ${priv.lastUpdated}`);
        setText('.legal-intro-lead', priv.intro);

        const sectionsContainer = document.querySelector('.legal-content-body, .privacy-sections');
        if (sectionsContainer && priv.sections) {
          sectionsContainer.innerHTML = priv.sections
            .map(
              (sec) => `
            <div class="legal-clause-block" style="margin-bottom: 32px;">
              <h3 style="font-size: 1.35rem; color: #FFFFFF; margin-bottom: 12px; font-weight: 700;">${sec.heading}</h3>
              <p style="color: #D6E3D4; line-height: 1.8; font-size: 1.02rem;">${sec.body}</p>
            </div>
          `
            )
            .join('');
        }
      }

      // Cookie Policy Page
      if (pathname.includes('cookies') && data.legal.cookiePolicy) {
        const cook = data.legal.cookiePolicy;
        setText('.legal-effective-date', `Effective Date: ${cook.effectiveDate} | Last Updated: ${cook.lastUpdated}`);
        setText('.legal-intro-lead', cook.intro);

        const sectionsContainer = document.querySelector('.legal-content-body, .cookie-sections');
        if (sectionsContainer && cook.sections) {
          sectionsContainer.innerHTML = cook.sections
            .map(
              (sec) => `
            <div class="legal-clause-block" style="margin-bottom: 32px;">
              <h3 style="font-size: 1.35rem; color: #FFFFFF; margin-bottom: 12px; font-weight: 700;">${sec.heading}</h3>
              <p style="color: #D6E3D4; line-height: 1.8; font-size: 1.02rem;">${sec.body}</p>
            </div>
          `
            )
            .join('');
        }
      }
    }
  }

  // 4. Visual Click-to-Edit Inspector for Admin Studio Iframe
  function setupVisualInspector() {
    if (window.parent === window) return; // Only active inside Admin Studio iframe

    let visualModeActive = true;

    // Inject Inspector Highlight Styles
    const style = document.createElement('style');
    style.id = 'ym-cms-inspector-styles';
    style.textContent = `
      .ym-cms-highlightable {
        cursor: pointer !important;
        outline: 1.5px dashed rgba(236, 243, 158, 0.45) !important;
        outline-offset: 3px !important;
        position: relative !important;
        transition: outline 0.15s ease, background 0.15s ease !important;
      }
      .ym-cms-highlightable:hover {
        outline: 2px solid #ECF39E !important;
        background: rgba(236, 243, 158, 0.12) !important;
      }
      .ym-cms-highlightable:hover::after {
        content: attr(data-cms-label);
        position: absolute;
        top: -24px;
        left: 0;
        background: #132A13;
        color: #ECF39E;
        border: 1px solid #ECF39E;
        font-family: sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 999999;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }
    `;
    document.head.appendChild(style);

    const editableMappings = [
      { selector: '.brand-link', tab: 'brand', field: 'brand-title', label: '✏️ Edit Brand Title & Logo' },
      { selector: '.site-header .btn-cta', tab: 'brand', field: 'brand-cta-text', label: '✏️ Edit Header CTA' },
      { selector: '.hero-section .badge-pill', tab: 'hero', field: 'hero-badge', label: '✏️ Edit Hero Badge' },
      { selector: '.hero-title', tab: 'hero', field: 'hero-title-highlight', label: '✏️ Edit Hero Headline' },
      { selector: '.hero-subtitle', tab: 'hero', field: 'hero-subtitle', label: '✏️ Edit Hero Subtitle' },
      { selector: '.hero-actions .btn-primary, .hero-actions .btn-brand', tab: 'hero', field: 'hero-primary-cta-text', label: '✏️ Edit Primary CTA' },
      { selector: '.hero-actions .btn-glass, .hero-actions .btn-secondary', tab: 'hero', field: 'hero-secondary-cta-text', label: '✏️ Edit Secondary CTA' },
      { selector: '.process-stat-banner', tab: 'hero', field: 'process-accuracy-stat-text', label: '✏️ Edit Accuracy Stat Banner' },
      { selector: '.stat-box', tab: 'metrics', field: 'metrics-list-container', label: '✏️ Edit Proven Metrics' },
      { selector: '.service-card', tab: 'services', field: 'services-list-container', label: '✏️ Edit Service Cards' },
      { selector: '.team-member-card', tab: 'team', field: 'team-list-container', label: '✏️ Edit Team Member' },
      { selector: '.job-card, .opening-card', tab: 'careers', field: 'careers-list-container', label: '✏️ Edit Job Opening' },
      { selector: '.faq-item', tab: 'faqs', field: 'faqs-list-container', label: '✏️ Edit FAQ' },
      { selector: '.subpage-hero h1', tab: 'hero', field: 'hero-title-highlight', label: '✏️ Edit Section Title' },
      { selector: '.legal-content-body', tab: 'legal', field: 'tos-intro', label: '✏️ Edit Legal Clauses & T&C' }
    ];

    function applyInspectorMarkers() {
      if (!visualModeActive) {
        document.querySelectorAll('.ym-cms-highlightable').forEach(el => {
          el.classList.remove('ym-cms-highlightable');
        });
        return;
      }

      editableMappings.forEach(mapping => {
        document.querySelectorAll(mapping.selector).forEach(el => {
          el.classList.add('ym-cms-highlightable');
          el.setAttribute('data-cms-label', mapping.label);
          el.setAttribute('data-cms-tab', mapping.tab);
          el.setAttribute('data-cms-field', mapping.field);

          el.onclick = (e) => {
            if (!visualModeActive) return;
            e.preventDefault();
            e.stopPropagation();

            window.parent.postMessage({
              type: 'YM_CMS_FOCUS_FIELD',
              tab: mapping.tab,
              fieldId: mapping.field
            }, '*');
          };
        });
      });
    }

    applyInspectorMarkers();
    setTimeout(applyInspectorMarkers, 600);
    setTimeout(applyInspectorMarkers, 1500);

    // Toggle listener from parent admin
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'YM_CMS_TOGGLE_VISUAL_MODE') {
        visualModeActive = event.data.active;
        applyInspectorMarkers();
      }
    });
  }

  // Self-execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initContent();
      setupVisualInspector();
    });
  } else {
    initContent();
    setupVisualInspector();
  }

  // Export for external callers if needed
  window.YoungMarkCMS = {
    getContent: () => currentContent,
    applyContent: applyContent,
  };
})();
