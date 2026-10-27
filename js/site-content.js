/**
 * YoungMark Global Advisory - 100% Comprehensive Universal CMS Hydrator & Visual Inspector
 * Dynamically binds every section, text, card, metric, pillar, platform, industry, and color
 * across all pages with zero-latency bidirectional live preview sync.
 */
(function () {
  'use strict';

  let currentContent = null;

  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    const output = Array.isArray(target) ? [...target] : Object.assign({}, target);
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = deepMerge(target && target[key] ? target[key] : {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
    }
    return output;
  }

  // 1. Initialize Content
  function initContent() {
    const isInsideAdminIframe = window.parent && window.parent !== window;
    const previewKey = isInsideAdminIframe ? 'ym_cms_preview_data' : 'ym_site_content';

    // Fetch baseline JSON first to guarantee complete schema
    fetch('data/site-content.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data/site-content.json');
        return res.json();
      })
      .then((defaultData) => {
        let merged = defaultData;
        try {
          const stored = localStorage.getItem(previewKey) || localStorage.getItem('ym_site_content');
          if (stored) {
            const parsed = JSON.parse(stored);
            merged = deepMerge(defaultData, parsed);
          }
        } catch (e) {
          console.warn('YoungMark CMS: Storage parse warning', e);
        }
        currentContent = merged;
        applyContent(currentContent);
      })
      .catch((err) => {
        console.warn('YoungMark CMS: Fetch failed, checking localStorage fallback', err);
        try {
          const stored = localStorage.getItem(previewKey) || localStorage.getItem('ym_site_content');
          if (stored) {
            currentContent = JSON.parse(stored);
            applyContent(currentContent);
          }
        } catch (e) {}
      });

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
      if (t.bgDark) {
        root.style.setProperty('--bg-base', t.bgDark);
        root.style.setProperty('--bg-primary', t.bgDark);
        document.documentElement.style.backgroundColor = t.bgDark;
      }
      if (t.bgSurface) {
        root.style.setProperty('--bg-surface', t.bgSurface);
        root.style.setProperty('--bg-tertiary', t.bgSurface);
      }
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

      // Nav Links (both desktop .nav-links and mobile .mobile-nav-drawer .nav-links)
      if (b.navLinks && Array.isArray(b.navLinks)) {
        const navContainers = document.querySelectorAll('.nav-links');
        navContainers.forEach((container) => {
          const isUl = container.tagName === 'UL';
          if (isUl) {
            container.innerHTML = b.navLinks
              .map((link) => `<li><a href="${link.url}" class="nav-link">${link.label}</a></li>`)
              .join('');
          } else {
            container.innerHTML = b.navLinks
              .map((link) => `<a href="${link.url}" class="nav-link">${link.label}</a>`)
              .join('');
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
        const tabBtns = document.querySelectorAll('.help-tab-btn');
        const helpCards = document.querySelectorAll('.help-card');
        hwh.pillars.forEach((p, idx) => {
          if (tabBtns[idx] && p.tabLabel) {
            const numSpan = tabBtns[idx].querySelector('span');
            tabBtns[idx].innerHTML = '';
            if (numSpan) tabBtns[idx].appendChild(numSpan);
            tabBtns[idx].appendChild(document.createTextNode(' ' + p.tabLabel));
          }

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

            // Visual Box Badge, Title & Metric
            if (p.visualTitle) {
              const vTitle = card.querySelector('.help-card-visual span, .help-visual-metric .metric-lbl');
              if (vTitle) vTitle.textContent = p.visualTitle;
            }
            if (p.metric) {
              const vMetric = card.querySelector('.help-visual-metric .metric-val');
              if (vMetric) vMetric.textContent = p.metric;
            }
          }
        });
      }
    }

    // E. Services Section & Dynamic Carousel Cards
    if (data.servicesSection) {
      setText('.services-section .section-tag', data.servicesSection.sectionTag);
      setText('.services-section .section-title', data.servicesSection.sectionTitle);
      setText('.services-section .section-subtitle', data.servicesSection.sectionSubtitle);
    }
    const serviceTrack = document.querySelector('.services-carousel-track');
    if (serviceTrack && data.services && Array.isArray(data.services)) {
      serviceTrack.innerHTML = data.services
        .map((service, index) => {
          const delivEscaped = JSON.stringify(service.deliverables || []).replace(/"/g, '&quot;');
          const numStr = String(index + 1).padStart(2, '0');
          return `
            <div class="service-card" onclick="showServiceModal('${(service.title || '').replace(/'/g, "\\'")}', '${(service.category || '').replace(/'/g, "\\'")}', '${(service.brief || '').replace(/'/g, "\\'")}', ${delivEscaped})">
              <div class="service-card-top">
                <span class="service-number">${numStr}</span>
                <span class="service-category">${service.category}</span>
              </div>
              <h3 class="service-title">${service.title}</h3>
              <p class="service-brief">${service.brief}</p>
              <div class="service-card-cta">
                <span>Explore Deliverables</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          `;
        })
        .join('');

      if (window.updateCarouselState) {
        window.updateCarouselState();
      }
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
          const subtextEl = box.querySelector('.stat-subtext');
          if (numEl) {
            numEl.setAttribute('data-target', metric.number);
            numEl.textContent = `${metric.prefix || ''}${metric.number}${metric.suffix || ''}`;
          }
          if (labelEl) labelEl.textContent = metric.label;
          if (subtextEl && metric.subtext) subtextEl.textContent = metric.subtext;
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

      // Rebind industry tab clicks to live data
      const buttons = document.querySelectorAll('.industry-tab-btn');
      const card = document.getElementById('industry-active-card');
      const industriesList = ind.industries || [];

      if (buttons.length && industriesList.length) {
        buttons.forEach((btn, idx) => {
          const itemData = industriesList[idx];
          if (itemData) {
            const svg = btn.querySelector('svg');
            btn.innerHTML = '';
            if (svg) btn.appendChild(svg);
            btn.appendChild(document.createTextNode(' ' + itemData.name));

            btn.onclick = () => {
              buttons.forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
              if (card) {
                card.innerHTML = `
                  <div class="industry-card-header">
                    <h3 class="industry-card-title">${itemData.name}</h3>
                  </div>
                  <p class="industry-card-desc">${itemData.description}</p>
                  <div class="industry-tags-grid">
                    ${(itemData.tags || [])
                      .map(
                        (tag) => `
                        <div class="industry-feature-tag">
                          <span class="tag-pulsing-dot"></span>
                          <span>${tag}</span>
                        </div>
                      `
                      )
                      .join('')}
                  </div>
                `;
              }
            };
          }
        });

        // Trigger active tab to refresh active card view
        const activeBtn = document.querySelector('.industry-tab-btn.active') || buttons[0];
        if (activeBtn) activeBtn.click();
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
    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid && data.team && Array.isArray(data.team)) {
      teamGrid.innerHTML = data.team
        .map((m) => {
          const avatarHtml =
            m.avatar && (m.avatar.startsWith('http') || m.avatar.startsWith('assets/'))
              ? `<img src="${m.avatar}" alt="${m.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 9999px;">`
              : `<div style="width: 100%; height: 100%; border-radius: 9999px; background: linear-gradient(135deg, var(--c-dark-green), var(--c-forest-green)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.5rem;">${m.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}</div>`;

          const bioEscaped = (m.bio || m.snippet || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
          const roleEscaped = (m.role || '').replace(/'/g, "\\'");
          const nameEscaped = (m.name || '').replace(/'/g, "\\'");
          const competenciesEscaped = JSON.stringify(
            m.competencies || ['Corporate Financial Strategy', 'Fiduciary Advisory']
          ).replace(/"/g, '&quot;');

          return `
            <div class="team-member-card" onclick="showTeamModal('${nameEscaped}', '${roleEscaped}', '${roleEscaped}', '${bioEscaped}', ${competenciesEscaped})">
              <div class="member-avatar-wrap">
                ${avatarHtml}
              </div>
              <h3 class="member-name">${m.name}</h3>
              <p class="member-role">${m.role}</p>
              <p class="member-snippet">${m.snippet || m.bio || ''}</p>
              <span class="member-view-bio">Read Profile &rarr;</span>
            </div>
          `;
        })
        .join('');
    }

    // J. FAQs Accordion Dynamic Re-render & Bind
    if (data.faqSection) {
      setText('.faq-section .section-tag', data.faqSection.sectionTag);
      setText('.faq-section .section-title', data.faqSection.sectionTitle);
      setText('.faq-section .section-subtitle', data.faqSection.sectionSubtitle);
    }
    const faqContainer = document.querySelector('.faq-accordion');
    if (faqContainer && data.faqs && Array.isArray(data.faqs)) {
      faqContainer.innerHTML = data.faqs
        .map(
          (faq) => `
          <div class="faq-item">
            <button class="faq-question-btn" aria-expanded="false">
              <span>${faq.question}</span>
              <span class="faq-toggle-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            <div class="faq-answer-panel">
              <p>${faq.answer}</p>
            </div>
          </div>
        `
        )
        .join('');

      faqContainer.querySelectorAll('.faq-item').forEach((item) => {
        const btn = item.querySelector('.faq-question-btn');
        if (btn) {
          btn.onclick = () => {
            const isActive = item.classList.contains('active');
            faqContainer.querySelectorAll('.faq-item').forEach((i) => {
              i.classList.remove('active');
              const b = i.querySelector('.faq-question-btn');
              if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
              item.classList.add('active');
              btn.setAttribute('aria-expanded', 'true');
            }
          };
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

      // Footer Navigation Columns
      const cols = document.querySelectorAll('.footer-top-grid .footer-links-col');
      if (cols.length >= 3) {
        if (f.solutionLinks && Array.isArray(f.solutionLinks)) {
          const ul = cols[0].querySelector('ul');
          if (ul) {
            ul.innerHTML = f.solutionLinks.map((l) => `<li><a href="${l.url}">${l.label}</a></li>`).join('');
          }
        }
        if (f.firmLinks && Array.isArray(f.firmLinks)) {
          const ul = cols[1].querySelector('ul');
          if (ul) {
            ul.innerHTML = f.firmLinks.map((l) => `<li><a href="${l.url}">${l.label}</a></li>`).join('');
          }
        }
        if (f.legalLinks && Array.isArray(f.legalLinks)) {
          const ul = cols[2].querySelector('ul');
          if (ul) {
            ul.innerHTML = f.legalLinks.map((l) => `<li><a href="${l.url}">${l.label}</a></li>`).join('');
          }
        }
      }
    }

    // M. Subpage Careers (careers.html)
    const careersGrid = document.querySelector('.careers-openings-grid');
    if (careersGrid && data.careers && Array.isArray(data.careers)) {
      careersGrid.innerHTML = data.careers
        .map(
          (job) => `
          <div class="spotlight-card tilt-card" style="background: #141E15; border: 1px solid rgba(236, 243, 158, 0.18); border-radius: 16px; padding: 28px; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 10px;">
                <span style="font-size: 0.75rem; font-weight: 700; background: rgba(79, 119, 45, 0.25); color: #ECF39E; border: 1px solid rgba(236, 243, 158, 0.3); padding: 4px 10px; border-radius: 9999px;">${job.department || 'Advisory'}</span>
                <span style="font-size: 0.8rem; color: #90A955; font-weight: 600;">${job.type || 'Full-Time'}</span>
              </div>
              <h3 style="font-size: 1.3rem; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">${job.title}</h3>
              <p style="font-size: 0.85rem; color: #D6E3D4; margin-bottom: 12px; line-height: 1.5;">${job.location || 'Remote / Hybrid'} • ${job.experience || '3+ Years'}</p>
              <p style="color: #CAD5C5; font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px;">${job.description}</p>
              ${job.perks ? `<div style="font-size: 0.85rem; color: #ECF39E; background: rgba(236, 243, 158, 0.08); padding: 8px 12px; border-radius: 8px; margin-bottom: 20px;">✦ ${job.perks}</div>` : ''}
            </div>
            <a href="contact.html?role=${encodeURIComponent(job.title)}" class="btn-cta" style="text-align: center; font-size: 0.9rem; padding: 10px 18px;">Apply for Role &rarr;</a>
          </div>
        `
        )
        .join('');
    }

    // N. Subpage About (about.html)
    if (data.about) {
      const ab = data.about;
      const missionP = document.querySelector('.about-mission-grid > div:first-child p');
      if (missionP && ab.mission) missionP.textContent = ab.mission;
      const visionP = document.querySelector('.about-mission-grid > div:last-child p');
      if (visionP && ab.vision) visionP.textContent = ab.vision;

      const valuesGrid = document.querySelector('.about-values-grid');
      if (valuesGrid && ab.fiduciaryPrinciples && Array.isArray(ab.fiduciaryPrinciples)) {
        valuesGrid.innerHTML = ab.fiduciaryPrinciples
          .map(
            (p) => `
            <div style="background: #FFFFFF; border: 1px solid rgba(19, 42, 19, 0.12); border-radius: var(--radius-lg); padding: 32px; box-shadow: 0 4px 18px rgba(19, 42, 19, 0.06); transition: var(--transition);">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                <div style="width: 10px; height: 10px; border-radius: 9999px; background: var(--c-leaf-green);"></div>
                <h3 style="font-size: 1.35rem; font-weight: 700; color: #132A13;">${p.title}</h3>
              </div>
              <p style="color: #243823; font-size: 0.95rem; font-weight: 500; line-height: 1.68; margin: 0;">${p.description}</p>
            </div>
          `
          )
          .join('');
      }
    }

    // O. Subpage Contact (contact.html)
    if (data.contact) {
      const c = data.contact;
      if (c.primaryPhone) {
        document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
          el.textContent = c.primaryPhone;
          el.href = `tel:${c.primaryPhone.replace(/[^0-9+]/g, '')}`;
        });
      }
      if (c.primaryEmail) {
        document.querySelectorAll('a[href^="mailto:info@"]').forEach((el) => {
          el.textContent = c.primaryEmail;
          el.href = `mailto:${c.primaryEmail}`;
        });
      }
    }

    // P. Subpage Legal Policies
    if (data.legal) {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.includes('terms-of-service') && data.legal.termsOfService) {
        const tos = data.legal.termsOfService;
        setText('.legal-effective-date', `Effective Date: ${tos.effectiveDate} | Last Updated: ${tos.lastUpdated}`);
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

      if (pathname.includes('privacy-policy') && data.legal.privacyPolicy) {
        const priv = data.legal.privacyPolicy;
        setText('.legal-effective-date', `Effective Date: ${priv.effectiveDate} | Last Updated: ${priv.lastUpdated}`);
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
      { selector: '.services-section .section-header', tab: 'services', field: 'services-list-container', label: '✏️ Edit Services Intro' },
      { selector: '.service-card', tab: 'services', field: 'services-list-container', label: '✏️ Edit Service Practice Card' },
      { selector: '.expertise-section .section-header', tab: 'metrics', field: 'metrics-list-container', label: '✏️ Edit Metrics Intro' },
      { selector: '.stat-box', tab: 'metrics', field: 'metrics-list-container', label: '✏️ Edit Proven Metric Stat' },
      { selector: '.process-stat-banner', tab: 'hero', field: 'process-accuracy-stat-text', label: '✏️ Edit Accuracy Stat Banner' },
      { selector: '.industries-section', tab: 'industries', field: 'industries-section-title', label: '✏️ Edit Whom We Serve / Industries' },
      { selector: '.tech-solar-section', tab: 'platforms', field: 'platforms-section-title', label: '✏️ Edit Financial Platforms' },
      { selector: '.team-section', tab: 'team', field: 'team-list-container', label: '✏️ Edit Leadership Roster' },
      { selector: '.faq-section', tab: 'faqs', field: 'faqs-list-container', label: '✏️ Edit FAQ Accordion' },
      { selector: '.cta-banner-section', tab: 'cta', field: 'cta-banner-title', label: '✏️ Edit Call to Action Banner' },
      { selector: '.site-footer', tab: 'footer', field: 'footer-copyright', label: '✏️ Edit Footer Details' },
      { selector: '.careers-openings-section', tab: 'careers', field: 'careers-list-container', label: '✏️ Edit Job Openings' },
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
