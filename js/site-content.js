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

  // Self-execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContent);
  } else {
    initContent();
  }

  // Export for external callers if needed
  window.YoungMarkCMS = {
    getContent: () => currentContent,
    applyContent: applyContent,
  };
})();
