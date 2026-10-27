/**
 * YoungMark Global Advisory - 100% Comprehensive Universal CMS Hydrator & Visual Inspector
 * Dynamically binds every section, text, card, metric, pillar, platform, industry, and color
 * across all pages with zero-latency bidirectional live preview sync.
 */
(function () {
  'use strict';

  let currentContent = null;

  // 1. Initialize Content
  function initContent() {
    const isInsideAdminIframe = window.parent && window.parent !== window;
    let localData = null;

    try {
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

    // Listen for Real-Time Live Message from Admin Studio Iframe
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.type === 'YM_CMS_PREVIEW_UPDATE') {
        currentContent = event.data.payload;
        applyContent(currentContent);
      }
    });
  }

  function setText(selector, text) {
    if (text === undefined || text === null) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.textContent = text;
  }

  function setHtml(selector, html) {
    if (html === undefined || html === null) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.innerHTML = html;
  }

  // 2. Master Hydration Function Covering 100% of the Website
  function applyContent(data) {
    if (!data) return;
    const root = document.documentElement;

    // A. Apply Theme Colors
    if (data.theme) {
      const t = data.theme;
      if (t.cForestDark) root.style.setProperty('--c-forest-green', t.cForestDark);
      if (t.cKombuGreen) root.style.setProperty('--c-kombu-green', t.cKombuGreen);
      if (t.cLeafGreen) root.style.setProperty('--c-leaf-green', t.cLeafGreen);
      if (t.cSageGreen) root.style.setProperty('--c-sage-green', t.cSageGreen);
      if (t.cLemonCream) {
        root.style.setProperty('--c-lemon-cream', t.cLemonCream);
        root.style.setProperty('--c-lemon-pastel', t.cLemonCream);
      }
      if (t.cGoldGlow) root.style.setProperty('--c-gold-glow', t.cGoldGlow);
      if (t.bgDark) root.style.setProperty('--bg-base', t.bgDark);
      if (t.bgSurface) root.style.setProperty('--bg-surface', t.bgSurface);
      if (t.bgCard) root.style.setProperty('--bg-card', t.bgCard);
      if (t.gridDotColor) root.style.setProperty('--grid-dot-color', t.gridDotColor);
      if (t.gridLineColor) root.style.setProperty('--grid-line-color', t.gridLineColor);
      if (t.gridSpotlightDot) root.style.setProperty('--grid-spotlight-dot', t.gridSpotlightDot);
      if (t.gridSpotlightLine) root.style.setProperty('--grid-spotlight-line', t.gridSpotlightLine);
      if (t.gridOpacity !== undefined) root.style.setProperty('--grid-opacity', t.gridOpacity);
      if (t.textPrimary) root.style.setProperty('--text-primary', t.textPrimary);
      if (t.textSecondary) root.style.setProperty('--text-secondary', t.textSecondary);
    }

    // B. Apply Brand & Header
    if (data.brand) {
      const b = data.brand;
      if (b.logoUrl) {
        document.querySelectorAll('.brand-logo-img, .footer-logo-img, #intro-logo-img').forEach((img) => {
          img.src = b.logoUrl;
        });
      }
      document.querySelectorAll('.brand-title').forEach((el) => {
        el.textContent = b.title || 'YOUNGMARK';
      });
      document.querySelectorAll('.brand-subtitle').forEach((el) => {
        el.textContent = b.subtitle || 'Global Advisory';
      });

      const navCta = document.querySelector('.site-header .btn-cta, .nav-actions .btn-cta');
      if (navCta && b.headerCtaText) {
        navCta.textContent = b.headerCtaText;
        if (b.headerCtaLink) navCta.href = b.headerCtaLink;
      }

      // Nav Links
      if (b.navLinks && Array.isArray(b.navLinks)) {
        const navLinkEls = document.querySelectorAll('.nav-links .nav-link');
        b.navLinks.forEach((link, idx) => {
          if (navLinkEls[idx]) {
            navLinkEls[idx].textContent = link.label;
            navLinkEls[idx].href = link.url;
          }
        });
      }
    }

    // C. Apply Hero Section
    if (data.hero) {
      const h = data.hero;
      const badgePill = document.querySelector('.hero-section .badge-pill');
      if (badgePill && h.badgeText) {
        const dot = badgePill.querySelector('.badge-dot');
        badgePill.innerHTML = '';
        if (dot) badgePill.appendChild(dot);
        badgePill.appendChild(document.createTextNode(' ' + h.badgeText));
      }

      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle && h.titleHighlight) {
        heroTitle.innerHTML = `${h.titlePrefix || 'Strategic Financial'} <span class="text-brand-gradient">${h.titleHighlight}</span> ${h.titleSuffix || '& Fiduciary Precision'}`;
      }

      if (h.subtitle) setText('.hero-subtitle', h.subtitle);

      const heroPrimary = document.querySelector('.hero-actions .btn-primary, .hero-actions .btn-brand');
      if (heroPrimary && h.primaryCtaText) {
        heroPrimary.textContent = h.primaryCtaText;
        if (h.primaryCtaLink) heroPrimary.href = h.primaryCtaLink;
      }
      const heroSecondary = document.querySelector('.hero-actions .btn-glass, .hero-actions .btn-secondary');
      if (heroSecondary && h.secondaryCtaText) {
        heroSecondary.textContent = h.secondaryCtaText;
        if (h.secondaryCtaLink) heroSecondary.href = h.secondaryCtaLink;
      }
    }

    // D. How We Help (Pillars)
    if (data.howWeHelp) {
      const hwh = data.howWeHelp;
      setText('.how-we-help-section .section-tag', hwh.sectionTag);
      setText('.how-we-help-section .section-title', hwh.sectionTitle);
      setText('.how-we-help-section .section-subtitle', hwh.sectionSubtitle);

      if (hwh.pillars && Array.isArray(hwh.pillars)) {
        const helpCards = document.querySelectorAll('.help-card');
        hwh.pillars.forEach((p, idx) => {
          const card = helpCards[idx];
          if (card) {
            setText(card.querySelector('.help-card-title'), p.title);
            setText(card.querySelector('.help-card-text'), p.description);

            // Checklist
            if (p.checklist && Array.isArray(p.checklist)) {
              const checkLis = card.querySelectorAll('.help-checklist li');
              p.checklist.forEach((itemText, i) => {
                if (checkLis[i]) {
                  const svg = checkLis[i].querySelector('svg');
                  checkLis[i].innerHTML = '';
                  if (svg) checkLis[i].appendChild(svg);
                  checkLis[i].appendChild(document.createTextNode(' ' + itemText));
                }
              });
            }

            // Visual Box
            if (p.visualTitle) {
              const vTitle = card.querySelector('.help-card-visual span');
              if (vTitle) vTitle.textContent = p.visualTitle;
            }
          }
        });
      }
    }

    // E. Services Section & 8 Practice Cards
    if (data.servicesSection) {
      setText('.services-section .section-tag', data.servicesSection.sectionTag);
      setText('.services-section .section-title', data.servicesSection.sectionTitle);
      setText('.services-section .section-subtitle', data.servicesSection.sectionSubtitle);
    }
    if (data.services && Array.isArray(data.services)) {
      const serviceCards = document.querySelectorAll('.services-carousel-track .service-card');
      data.services.forEach((service, index) => {
        const card = serviceCards[index];
        if (card) {
          setText(card.querySelector('.service-category'), service.category);
          setText(card.querySelector('.service-title'), service.title);
          setText(card.querySelector('.service-brief'), service.brief);

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

    // F. Proven Metrics & Accuracy Banner
    if (data.metricsSection) {
      setText('.expertise-section .section-tag', data.metricsSection.sectionTag);
      setText('.expertise-section .section-title', data.metricsSection.sectionTitle);
      setText('.expertise-section .section-subtitle', data.metricsSection.sectionSubtitle);
    }
    if (data.metrics && Array.isArray(data.metrics)) {
      const statBoxes = document.querySelectorAll('.stat-box');
      data.metrics.forEach((metric, index) => {
        const box = statBoxes[index];
        if (box) {
          const numEl = box.querySelector('.stat-number');
          const labelEl = box.querySelector('.stat-label');
          if (numEl) {
            numEl.setAttribute('data-target', metric.number);
            numEl.textContent = `${metric.prefix || ''}${metric.number}${metric.suffix || ''}`;
          }
          if (labelEl) labelEl.textContent = metric.label;
        }
      });
    }

    if (data.processAccuracyStat && data.processAccuracyStat.text) {
      const bannerText = document.querySelector('.process-stat-banner p');
      if (bannerText) bannerText.innerHTML = data.processAccuracyStat.text;
    }

    // G. Whom We Serve (Industries)
    if (data.industriesSection) {
      const ind = data.industriesSection;
      setText('.industries-section .section-tag', ind.sectionTag);
      setText('.industries-section .section-title', ind.sectionTitle);
      setText('.industries-section .section-subtitle', ind.sectionSubtitle);

      // Custom Box
      setText('.custom-industry-box h4', ind.customBoxTitle);
      setText('.custom-industry-box p', ind.customBoxSubtitle);
      const customCta = document.querySelector('.custom-industry-box .btn-cta');
      if (customCta) {
        if (ind.customBoxCta) customCta.textContent = ind.customBoxCta;
        if (ind.customBoxLink) customCta.href = ind.customBoxLink;
      }
    }

    // H. Platform Ecosystem (12 Software Systems)
    if (data.platformsSection) {
      const pSec = data.platformsSection;
      setText('.tech-solar-section .section-tag', pSec.sectionTag);
      setText('.tech-solar-section .section-title', pSec.sectionTitle);
      setText('.tech-solar-section .section-subtitle', pSec.sectionSubtitle);

      // Solar CTA
      setText('.solar-cta-overlay h3', pSec.ctaTitle);
      const sCta = document.querySelector('.solar-cta-overlay .btn-cta');
      if (sCta) {
        if (pSec.ctaButton) sCta.textContent = pSec.ctaButton;
        if (pSec.ctaLink) sCta.href = pSec.ctaLink;
      }

      if (pSec.platforms && Array.isArray(pSec.platforms)) {
        const pCards = document.querySelectorAll('.platform-eco-card');
        pSec.platforms.forEach((plat, idx) => {
          const c = pCards[idx];
          if (c) {
            setText(c.querySelector('.platform-initials'), plat.initials);
            setText(c.querySelector('.platform-badge-tag'), plat.badge);
            setText(c.querySelector('.platform-name'), plat.name);
            setText(c.querySelector('.platform-desc'), plat.description);
            setText(c.querySelector('.platform-metric'), plat.metric);
          }
        });
      }
    }

    // I. Leadership & Team Overview
    if (data.teamSection) {
      setText('.team-section .section-tag', data.teamSection.sectionTag);
      setText('.team-section .section-title', data.teamSection.sectionTitle);
      setText('.team-section .section-subtitle', data.teamSection.sectionSubtitle);
      const rosterBtn = document.querySelector('.team-section .btn-cta-secondary');
      if (rosterBtn) {
        if (data.teamSection.rosterCta) rosterBtn.textContent = data.teamSection.rosterCta;
        if (data.teamSection.rosterLink) rosterBtn.href = data.teamSection.rosterLink;
      }
    }
    if (data.team && Array.isArray(data.team)) {
      const teamCards = document.querySelectorAll('.team-grid .team-member-card');
      data.team.forEach((member, index) => {
        const card = teamCards[index];
        if (card) {
          setText(card.querySelector('.member-name'), member.name);
          setText(card.querySelector('.member-role'), member.role);
          setText(card.querySelector('.member-snippet'), member.snippet || member.bio);
        }
      });
    }

    // J. FAQs Accordion
    if (data.faqSection) {
      setText('.faq-section .section-tag', data.faqSection.sectionTag);
      setText('.faq-section .section-title', data.faqSection.sectionTitle);
      setText('.faq-section .section-subtitle', data.faqSection.sectionSubtitle);
    }
    if (data.faqs && Array.isArray(data.faqs)) {
      const faqItems = document.querySelectorAll('.faq-item');
      data.faqs.forEach((faq, index) => {
        const item = faqItems[index];
        if (item) {
          setText(item.querySelector('.faq-question-btn span:first-child'), faq.question);
          setText(item.querySelector('.faq-answer-panel p'), faq.answer);
        }
      });
    }

    // K. CTA Banner
    if (data.ctaBanner) {
      setText('.cta-banner-title', data.ctaBanner.title);
      setText('.cta-banner-desc', data.ctaBanner.description);
      const ctaBtn = document.querySelector('.btn-banner');
      if (ctaBtn) {
        if (data.ctaBanner.buttonText) ctaBtn.textContent = data.ctaBanner.buttonText;
        if (data.ctaBanner.buttonLink) ctaBtn.href = data.ctaBanner.buttonLink;
      }
    }

    // L. Deep Footer
    if (data.footer) {
      const f = data.footer;
      setText('.footer-brand-col p', f.brandDescription);
      setText('.footer-address', f.addressText);
      setText('.footer-watermark', f.watermark);

      const copyEl = document.querySelector('.footer-bottom-bar div:first-child');
      if (copyEl && f.copyright) copyEl.textContent = f.copyright;

      const sloganEl = document.querySelector('.footer-bottom-bar div:last-child');
      if (sloganEl && f.slogan) sloganEl.textContent = f.slogan;
    }

    // M. Subpage Legal Policies
    if (data.legal) {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.includes('terms-of-service') && data.legal.termsOfService) {
        const tos = data.legal.termsOfService;
        setText('.legal-effective-date', `Effective Date: ${tos.effectiveDate} | Last Updated: ${tos.lastUpdated}`);
        const sectionsContainer = document.querySelector('.legal-content-body, .terms-sections');
        if (sectionsContainer && tos.sections) {
          sectionsContainer.innerHTML = tos.sections
            .map((sec) => `
              <div class="legal-clause-block" style="margin-bottom: 32px;">
                <h3 style="font-size: 1.35rem; color: #FFFFFF; margin-bottom: 12px; font-weight: 700;">${sec.heading}</h3>
                <p style="color: #D6E3D4; line-height: 1.8; font-size: 1.02rem;">${sec.body}</p>
              </div>
            `).join('');
        }
      }

      if (pathname.includes('privacy-policy') && data.legal.privacyPolicy) {
        const priv = data.legal.privacyPolicy;
        setText('.legal-effective-date', `Effective Date: ${priv.effectiveDate} | Last Updated: ${priv.lastUpdated}`);
        const sectionsContainer = document.querySelector('.legal-content-body, .privacy-sections');
        if (sectionsContainer && priv.sections) {
          sectionsContainer.innerHTML = priv.sections
            .map((sec) => `
              <div class="legal-clause-block" style="margin-bottom: 32px;">
                <h3 style="font-size: 1.35rem; color: #FFFFFF; margin-bottom: 12px; font-weight: 700;">${sec.heading}</h3>
                <p style="color: #D6E3D4; line-height: 1.8; font-size: 1.02rem;">${sec.body}</p>
              </div>
            `).join('');
        }
      }

      if (pathname.includes('cookies') && data.legal.cookiePolicy) {
        const cook = data.legal.cookiePolicy;
        setText('.legal-effective-date', `Effective Date: ${cook.effectiveDate} | Last Updated: ${cook.lastUpdated}`);
      }
    }
  }

  // 3. Visual Click-to-Edit Inspector for Admin Studio Iframe
  function setupVisualInspector() {
    if (window.parent === window) return;

    let visualModeActive = true;

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
      { selector: '.nav-links', tab: 'brand', field: 'brand-nav-links-container', label: '✏️ Edit Navigation Links' },
      { selector: '.hero-section .badge-pill', tab: 'hero', field: 'hero-badge', label: '✏️ Edit Hero Badge' },
      { selector: '.hero-title', tab: 'hero', field: 'hero-title-highlight', label: '✏️ Edit Hero Headline' },
      { selector: '.hero-subtitle', tab: 'hero', field: 'hero-subtitle', label: '✏️ Edit Hero Subtitle' },
      { selector: '.hero-actions .btn-primary, .hero-actions .btn-brand', tab: 'hero', field: 'hero-primary-cta-text', label: '✏️ Edit Primary CTA' },
      { selector: '.hero-actions .btn-glass, .hero-actions .btn-secondary', tab: 'hero', field: 'hero-secondary-cta-text', label: '✏️ Edit Secondary CTA' },
      { selector: '.how-we-help-section .section-header', tab: 'pillars', field: 'pillars-header-title', label: '✏️ Edit Operational Pillars Intro' },
      { selector: '.help-card', tab: 'pillars', field: 'pillars-list-container', label: '✏️ Edit Operational Pillar Card' },
      { selector: '.services-section .section-header', tab: 'services', field: 'services-section-title', label: '✏️ Edit Services Intro' },
      { selector: '.service-card', tab: 'services', field: 'services-list-container', label: '✏️ Edit Service Practice Card' },
      { selector: '.expertise-section .section-header', tab: 'metrics', field: 'metrics-section-title', label: '✏️ Edit Metrics Intro' },
      { selector: '.stat-box', tab: 'metrics', field: 'metrics-list-container', label: '✏️ Edit Proven Metric Stat' },
      { selector: '.process-stat-banner', tab: 'hero', field: 'process-accuracy-stat-text', label: '✏️ Edit Accuracy Stat Banner' },
      { selector: '.industries-section', tab: 'industries', field: 'industries-section-title', label: '✏️ Edit Whom We Serve / Industries' },
      { selector: '.tech-solar-section', tab: 'platforms', field: 'platforms-section-title', label: '✏️ Edit Financial Platforms' },
      { selector: '.team-section', tab: 'team', field: 'team-list-container', label: '✏️ Edit Leadership Roster' },
      { selector: '.faq-section', tab: 'faqs', field: 'faqs-list-container', label: '✏️ Edit FAQ Accordion' },
      { selector: '.cta-banner-section', tab: 'cta', field: 'cta-banner-title', label: '✏️ Edit Call to Action Banner' },
      { selector: '.site-footer', tab: 'footer', field: 'footer-copyright', label: '✏️ Edit Footer Details' },
      { selector: '.legal-content-body', tab: 'legal', field: 'tos-intro', label: '✏️ Edit Legal Policies & Clauses' }
    ];

    function applyInspectorMarkers() {
      if (!visualModeActive) {
        document.querySelectorAll('.ym-cms-highlightable').forEach((el) => {
          el.classList.remove('ym-cms-highlightable');
        });
        return;
      }

      editableMappings.forEach((mapping) => {
        document.querySelectorAll(mapping.selector).forEach((el) => {
          el.classList.add('ym-cms-highlightable');
          el.setAttribute('data-cms-label', mapping.label);
          el.setAttribute('data-cms-tab', mapping.tab);
          el.setAttribute('data-cms-field', mapping.field);

          el.onclick = (e) => {
            if (!visualModeActive) return;
            e.preventDefault();
            e.stopPropagation();

            window.parent.postMessage(
              {
                type: 'YM_CMS_FOCUS_FIELD',
                tab: mapping.tab,
                fieldId: mapping.field,
              },
              '*'
            );
          };
        });
      });
    }

    applyInspectorMarkers();
    setTimeout(applyInspectorMarkers, 600);
    setTimeout(applyInspectorMarkers, 1500);

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

  window.YoungMarkCMS = {
    getContent: () => currentContent,
    applyContent: applyContent,
  };
})();
