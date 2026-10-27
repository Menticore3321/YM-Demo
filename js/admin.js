/**
 * YoungMark Global Advisory - Executive Admin Studio & Visual CMS Controller
 * Real-time split-screen live preview, granular site editing, and GitHub commit engine.
 */

(function () {
  'use strict';

  let siteData = null;
  const previewIframe = document.getElementById('preview-iframe');

  // 1. Initialize Studio
  async function initStudio() {
    setupTabSwitching();
    setupDeviceSwitching();
    setupPageSelector();
    setupModalHandlers();
    setupVisualClickToEdit();

    // Load initial data
    try {
      const stored = localStorage.getItem('ym_site_content');
      if (stored) {
        siteData = JSON.parse(stored);
      } else {
        const res = await fetch('data/site-content.json');
        siteData = await res.json();
      }
    } catch (e) {
      console.warn('Admin CMS: Error loading data, fetching default', e);
      const res = await fetch('data/site-content.json');
      siteData = await res.json();
    }

    // Populate all form fields
    populateAllForms();

    // Trigger initial iframe sync once iframe loads
    previewIframe.addEventListener('load', () => {
      broadcastPreviewUpdate();
    });

    // Also broadcast after short delay to ensure DOM is ready
    setTimeout(broadcastPreviewUpdate, 600);
  }

  // 2. Real-Time Broadcast to Preview Iframe & LocalStorage
  function broadcastPreviewUpdate() {
    if (!siteData) return;

    // Save staging draft locally
    try {
      localStorage.setItem('ym_site_content', JSON.stringify(siteData));
      localStorage.setItem('ym_cms_preview_data', JSON.stringify(siteData));
    } catch (e) {
      console.warn('Admin CMS: Storage save warning', e);
    }

    // Post message into preview iframe
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage(
        {
          type: 'YM_CMS_PREVIEW_UPDATE',
          payload: siteData,
        },
        '*'
      );
    }

    // Update status indicator
    const statusText = document.getElementById('admin-status-text');
    if (statusText) {
      statusText.textContent = 'Staging Draft (Preview Live)';
    }
  }

  // 3. Tab Switching
  function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.admin-tab-panel');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach((b) => b.classList.remove('active'));
        tabPanels.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPanel = document.getElementById(`panel-${targetTab}`);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  // 4. Device Switcher
  function setupDeviceSwitching() {
    const deviceBtns = document.querySelectorAll('.device-btn');
    const deviceFrame = document.getElementById('preview-device-frame');

    deviceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        deviceBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const device = btn.getAttribute('data-device');
        deviceFrame.className = 'preview-device-frame';
        if (device === 'tablet') deviceFrame.classList.add('device-tablet');
        if (device === 'mobile') deviceFrame.classList.add('device-mobile');
      });
    });
  }

  // 5. Page Selector
  function setupPageSelector() {
    const pageSelect = document.getElementById('preview-page-select');
    if (pageSelect) {
      pageSelect.addEventListener('change', (e) => {
        const targetUrl = e.target.value;
        previewIframe.src = targetUrl;
      });
    }

    const refreshBtn = document.getElementById('btn-preview-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        previewIframe.contentWindow.location.reload();
      });
    }
  }

  // 5b. Visual Click-to-Edit Inspector Bridge
  function setupVisualClickToEdit() {
    let isVisualActive = true;
    const toggleBtn = document.getElementById('btn-toggle-visual-edit');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isVisualActive = !isVisualActive;
        toggleBtn.className = isVisualActive ? 'btn-visual-mode active' : 'btn-visual-mode inactive';
        toggleBtn.innerHTML = isVisualActive ? '✏️ Click-to-Edit: ON' : '👁️ Click-to-Edit: OFF';

        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(
            {
              type: 'YM_CMS_TOGGLE_VISUAL_MODE',
              active: isVisualActive,
            },
            '*'
          );
        }
      });
    }

    // Listen for direct clicks on elements inside the preview iframe
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.type === 'YM_CMS_FOCUS_FIELD') {
        const { tab, fieldId } = event.data;

        // 1. Switch to the matching tab
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();

        // 2. Find and highlight the exact field
        setTimeout(() => {
          const targetEl = document.getElementById(fieldId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.classList.add('admin-field-focused');

            if (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA') {
              targetEl.focus();
            }

            setTimeout(() => {
              targetEl.classList.remove('admin-field-focused');
            }, 2400);
          }
        }, 120);
      }
    });
  }

  // 6. Populate Forms
  function populateAllForms() {
    if (!siteData) return;

    populateBrandForm();
    populateThemeForm();
    populateHeroForm();
    populateMetricsForm();
    populateServicesForm();
    populateTeamForm();
    populateCareersForm();
    populateAboutForm();
    populateFaqsForm();
    populateContactForm();
    populateLegalForm();
  }

  // A. Brand & Header Form
  function populateBrandForm() {
    const b = siteData.brand || {};
    bindInput('brand-title', b.title, (v) => { b.title = v; broadcastPreviewUpdate(); });
    bindInput('brand-subtitle', b.subtitle, (v) => { b.subtitle = v; broadcastPreviewUpdate(); });
    bindInput('brand-tagline', b.tagline, (v) => { b.tagline = v; broadcastPreviewUpdate(); });
    bindInput('brand-logo-url', b.logoUrl, (v) => { b.logoUrl = v; broadcastPreviewUpdate(); });
    bindInput('brand-cta-text', b.headerCtaText, (v) => { b.headerCtaText = v; broadcastPreviewUpdate(); });
    bindInput('brand-cta-link', b.headerCtaLink, (v) => { b.headerCtaLink = v; broadcastPreviewUpdate(); });
  }

  // B. Theme & Colors Form
  function populateThemeForm() {
    const t = siteData.theme || {};
    bindColorPicker('theme-forest-dark', 'theme-forest-dark-hex', t.cForestDark, (v) => { t.cForestDark = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-kombu-green', 'theme-kombu-green-hex', t.cKombuGreen, (v) => { t.cKombuGreen = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-leaf-green', 'theme-leaf-green-hex', t.cLeafGreen, (v) => { t.cLeafGreen = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-sage-green', 'theme-sage-green-hex', t.cSageGreen, (v) => { t.cSageGreen = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-lemon-cream', 'theme-lemon-cream-hex', t.cLemonCream, (v) => { t.cLemonCream = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-gold-glow', 'theme-gold-glow-hex', t.cGoldGlow, (v) => { t.cGoldGlow = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-bg-dark', 'theme-bg-dark-hex', t.bgDark, (v) => { t.bgDark = v; broadcastPreviewUpdate(); });

    // Grid Geometry & Dot-Matrix
    bindColorPicker('theme-grid-dot', 'theme-grid-dot-hex', t.gridDotColor || '#D4A017', (v) => { t.gridDotColor = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-grid-line', 'theme-grid-line-hex', t.gridLineColor || '#6B500F', (v) => { t.gridLineColor = v; broadcastPreviewUpdate(); });
    bindColorPicker('theme-grid-spotlight', 'theme-grid-spotlight-hex', t.gridSpotlightDot || '#E5B020', (v) => { t.gridSpotlightDot = v; broadcastPreviewUpdate(); });

    const opacitySlider = document.getElementById('theme-grid-opacity');
    const opacityValText = document.getElementById('theme-grid-opacity-val');
    if (opacitySlider) {
      opacitySlider.value = t.gridOpacity !== undefined ? t.gridOpacity : 0.8;
      if (opacityValText) opacityValText.textContent = Math.round(opacitySlider.value * 100) + '%';
      opacitySlider.oninput = (e) => {
        const val = parseFloat(e.target.value);
        t.gridOpacity = val;
        if (opacityValText) opacityValText.textContent = Math.round(val * 100) + '%';
        broadcastPreviewUpdate();
      };
    }
  }

  // C. Hero Form
  function populateHeroForm() {
    const h = siteData.hero || {};
    bindInput('hero-badge', h.badgeText, (v) => { h.badgeText = v; broadcastPreviewUpdate(); });
    bindInput('hero-title-prefix', h.titlePrefix, (v) => { h.titlePrefix = v; broadcastPreviewUpdate(); });
    bindInput('hero-title-highlight', h.titleHighlight, (v) => { h.titleHighlight = v; broadcastPreviewUpdate(); });
    bindInput('hero-title-suffix', h.titleSuffix, (v) => { h.titleSuffix = v; broadcastPreviewUpdate(); });
    bindInput('hero-subtitle', h.subtitle, (v) => { h.subtitle = v; broadcastPreviewUpdate(); });
    bindInput('hero-primary-cta-text', h.primaryCtaText, (v) => { h.primaryCtaText = v; broadcastPreviewUpdate(); });
    bindInput('hero-primary-cta-link', h.primaryCtaLink, (v) => { h.primaryCtaLink = v; broadcastPreviewUpdate(); });
    bindInput('hero-secondary-cta-text', h.secondaryCtaText, (v) => { h.secondaryCtaText = v; broadcastPreviewUpdate(); });
    bindInput('hero-secondary-cta-link', h.secondaryCtaLink, (v) => { h.secondaryCtaLink = v; broadcastPreviewUpdate(); });
    
    // Process Stat Banner
    const pStat = siteData.processAccuracyStat || {};
    bindInput('process-accuracy-stat-text', pStat.text, (v) => { pStat.text = v; broadcastPreviewUpdate(); });
  }

  // D. Proven Metrics Form
  function populateMetricsForm() {
    const container = document.getElementById('metrics-list-container');
    if (!container) return;
    container.innerHTML = '';

    (siteData.metrics || []).forEach((metric, index) => {
      const box = document.createElement('div');
      box.className = 'card-item-box';
      box.innerHTML = `
        <div class="card-item-header">
          <span class="card-item-title">Metric #${index + 1}: ${metric.label}</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Number Value</label>
            <input type="number" step="any" class="form-input metric-num" value="${metric.number}">
          </div>
          <div class="form-group">
            <label class="form-label">Prefix / Suffix</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input metric-prefix" placeholder="Prefix ($)" value="${metric.prefix || ''}" style="width: 70px;">
              <input type="text" class="form-input metric-suffix" placeholder="Suffix (%, B+)" value="${metric.suffix || ''}">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Metric Label</label>
          <input type="text" class="form-input metric-label" value="${metric.label}">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Supporting Description</label>
          <input type="text" class="form-input metric-subtext" value="${metric.subtext || ''}">
        </div>
      `;

      box.querySelector('.metric-num').addEventListener('input', (e) => {
        metric.number = parseFloat(e.target.value) || 0;
        broadcastPreviewUpdate();
      });
      box.querySelector('.metric-prefix').addEventListener('input', (e) => {
        metric.prefix = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.metric-suffix').addEventListener('input', (e) => {
        metric.suffix = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.metric-label').addEventListener('input', (e) => {
        metric.label = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.metric-subtext').addEventListener('input', (e) => {
        metric.subtext = e.target.value;
        broadcastPreviewUpdate();
      });

      container.appendChild(box);
    });
  }

  // E. Services Cards Form
  function populateServicesForm() {
    const container = document.getElementById('services-list-container');
    if (!container) return;
    container.innerHTML = '';

    (siteData.services || []).forEach((service, index) => {
      const box = document.createElement('div');
      box.className = 'card-item-box';
      const deliverablesStr = (service.deliverables || []).join('\n');

      box.innerHTML = `
        <div class="card-item-header">
          <span class="card-item-title">${service.category} • ${service.title}</span>
          <div class="card-item-actions">
            <button class="btn-icon-danger btn-delete-service" title="Delete Card">&times;</button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category Tag</label>
            <input type="text" class="form-input s-category" value="${service.category}">
          </div>
          <div class="form-group">
            <label class="form-label">Service Title</label>
            <input type="text" class="form-input s-title" value="${service.title}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Card Brief Description</label>
          <textarea class="form-textarea s-brief">${service.brief}</textarea>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Modal Deliverables <span class="form-label-hint">One item per line</span></label>
          <textarea class="form-textarea s-deliverables" rows="4">${deliverablesStr}</textarea>
        </div>
      `;

      box.querySelector('.s-category').addEventListener('input', (e) => {
        service.category = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.s-title').addEventListener('input', (e) => {
        service.title = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.s-brief').addEventListener('input', (e) => {
        service.brief = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.s-deliverables').addEventListener('input', (e) => {
        service.deliverables = e.target.value.split('\n').filter((l) => l.trim().length > 0);
        broadcastPreviewUpdate();
      });

      box.querySelector('.btn-delete-service').addEventListener('click', () => {
        if (confirm(`Delete service card "${service.title}"?`)) {
          siteData.services.splice(index, 1);
          populateServicesForm();
          broadcastPreviewUpdate();
        }
      });

      container.appendChild(box);
    });

    const addBtn = document.getElementById('btn-add-service');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = 'true';
      addBtn.addEventListener('click', () => {
        siteData.services.push({
          id: 'service-' + Date.now(),
          category: 'New Practice',
          title: 'Specialized Financial Advisory',
          brief: 'High-value executive accounting and fiduciary counsel for modern corporations.',
          deliverables: ['Audit Schedule Preparation', 'Executive Monthly Reporting', 'Statutory Compliance Filings']
        });
        populateServicesForm();
        broadcastPreviewUpdate();
      });
    }
  }

  // F. Team & Leadership Form
  function populateTeamForm() {
    const container = document.getElementById('team-list-container');
    if (!container) return;
    container.innerHTML = '';

    (siteData.team || []).forEach((member, index) => {
      const box = document.createElement('div');
      box.className = 'card-item-box';
      box.innerHTML = `
        <div class="card-item-header">
          <span class="card-item-title">${member.name} (${member.role})</span>
          <div class="card-item-actions">
            <button class="btn-icon-danger btn-delete-team" title="Delete Member">&times;</button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input t-name" value="${member.name}">
          </div>
          <div class="form-group">
            <label class="form-label">Designation / Role</label>
            <input type="text" class="form-input t-role" value="${member.role}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Profile Image URL</label>
          <input type="text" class="form-input t-avatar" value="${member.avatar}">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Executive Biography</label>
          <textarea class="form-textarea t-bio">${member.bio}</textarea>
        </div>
      `;

      box.querySelector('.t-name').addEventListener('input', (e) => {
        member.name = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.t-role').addEventListener('input', (e) => {
        member.role = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.t-avatar').addEventListener('input', (e) => {
        member.avatar = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.t-bio').addEventListener('input', (e) => {
        member.bio = e.target.value;
        broadcastPreviewUpdate();
      });

      box.querySelector('.btn-delete-team').addEventListener('click', () => {
        if (confirm(`Delete team member "${member.name}"?`)) {
          siteData.team.splice(index, 1);
          populateTeamForm();
          broadcastPreviewUpdate();
        }
      });

      container.appendChild(box);
    });

    const addBtn = document.getElementById('btn-add-team');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = 'true';
      addBtn.addEventListener('click', () => {
        siteData.team.push({
          id: 'team-' + Date.now(),
          name: 'New Advisory Partner',
          role: 'Senior Financial Director',
          bio: 'Seasoned Chartered Accountant specializing in corporate financial systems and institutional governance.',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          linkedin: 'https://linkedin.com'
        });
        populateTeamForm();
        broadcastPreviewUpdate();
      });
    }
  }

  // G. Careers Openings Form
  function populateCareersForm() {
    const container = document.getElementById('careers-list-container');
    if (!container) return;
    container.innerHTML = '';

    (siteData.careers || []).forEach((job, index) => {
      const box = document.createElement('div');
      box.className = 'card-item-box';
      box.innerHTML = `
        <div class="card-item-header">
          <span class="card-item-title">${job.title}</span>
          <div class="card-item-actions">
            <button class="btn-icon-danger btn-delete-career" title="Delete Role">&times;</button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Position Title</label>
            <input type="text" class="form-input c-title" value="${job.title}">
          </div>
          <div class="form-group">
            <label class="form-label">Department & Type</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input c-dept" placeholder="Dept" value="${job.department}">
              <input type="text" class="form-input c-type" placeholder="Type" value="${job.type}">
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Location / Mode</label>
            <input type="text" class="form-input c-location" value="${job.location}">
          </div>
          <div class="form-group">
            <label class="form-label">Experience Required</label>
            <input type="text" class="form-input c-exp" value="${job.experience}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Role Overview & Responsibilities</label>
          <textarea class="form-textarea c-desc">${job.description}</textarea>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Compensation & Perks</label>
          <input type="text" class="form-input c-perks" value="${job.perks}">
        </div>
      `;

      box.querySelector('.c-title').addEventListener('input', (e) => {
        job.title = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.c-dept').addEventListener('input', (e) => {
        job.department = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.c-type').addEventListener('input', (e) => {
        job.type = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.c-location').addEventListener('input', (e) => {
        job.location = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.c-exp').addEventListener('input', (e) => {
        job.experience = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.c-desc').addEventListener('input', (e) => {
        job.description = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.c-perks').addEventListener('input', (e) => {
        job.perks = e.target.value;
        broadcastPreviewUpdate();
      });

      box.querySelector('.btn-delete-career').addEventListener('click', () => {
        if (confirm(`Delete opening "${job.title}"?`)) {
          siteData.careers.splice(index, 1);
          populateCareersForm();
          broadcastPreviewUpdate();
        }
      });

      container.appendChild(box);
    });

    const addBtn = document.getElementById('btn-add-career');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = 'true';
      addBtn.addEventListener('click', () => {
        siteData.careers.push({
          id: 'job-' + Date.now(),
          title: 'Senior Financial Analyst',
          department: 'Corporate Advisory',
          type: 'Full-Time',
          location: 'Remote / Hybrid',
          experience: '3+ Years',
          description: 'Construct 3-statement models, perform cash flow analysis, and assist in executive board reports.',
          perks: 'Competitive Base, Health Insurance, 401(k) Matching, Performance Bonus.'
        });
        populateCareersForm();
        broadcastPreviewUpdate();
      });
    }
  }

  // H. About Section Form
  function populateAboutForm() {
    const ab = siteData.about || {};
    bindInput('about-mission', ab.mission, (v) => { ab.mission = v; broadcastPreviewUpdate(); });
    bindInput('about-vision', ab.vision, (v) => { ab.vision = v; broadcastPreviewUpdate(); });

    // Fiduciary principles
    const pContainer = document.getElementById('about-principles-container');
    if (pContainer) {
      pContainer.innerHTML = '';
      (ab.fiduciaryPrinciples || []).forEach((principle) => {
        const itemBox = document.createElement('div');
        itemBox.className = 'card-item-box';
        itemBox.innerHTML = `
          <div class="form-group">
            <label class="form-label">Principle Title</label>
            <input type="text" class="form-input p-title" value="${principle.title}">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Description</label>
            <textarea class="form-textarea p-desc">${principle.description}</textarea>
          </div>
        `;
        itemBox.querySelector('.p-title').addEventListener('input', (e) => {
          principle.title = e.target.value;
          broadcastPreviewUpdate();
        });
        itemBox.querySelector('.p-desc').addEventListener('input', (e) => {
          principle.description = e.target.value;
          broadcastPreviewUpdate();
        });
        pContainer.appendChild(itemBox);
      });
    }
  }

  // I. FAQs Form
  function populateFaqsForm() {
    const container = document.getElementById('faqs-list-container');
    if (!container) return;
    container.innerHTML = '';

    (siteData.faqs || []).forEach((faq, index) => {
      const box = document.createElement('div');
      box.className = 'card-item-box';
      box.innerHTML = `
        <div class="card-item-header">
          <span class="card-item-title">Question #${index + 1}</span>
          <div class="card-item-actions">
            <button class="btn-icon-danger btn-delete-faq" title="Delete FAQ">&times;</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Question Text</label>
          <input type="text" class="form-input f-q" value="${faq.question}">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Detailed Answer</label>
          <textarea class="form-textarea f-a" rows="3">${faq.answer}</textarea>
        </div>
      `;

      box.querySelector('.f-q').addEventListener('input', (e) => {
        faq.question = e.target.value;
        broadcastPreviewUpdate();
      });
      box.querySelector('.f-a').addEventListener('input', (e) => {
        faq.answer = e.target.value;
        broadcastPreviewUpdate();
      });

      box.querySelector('.btn-delete-faq').addEventListener('click', () => {
        if (confirm('Delete this FAQ question?')) {
          siteData.faqs.splice(index, 1);
          populateFaqsForm();
          broadcastPreviewUpdate();
        }
      });

      container.appendChild(box);
    });

    const addBtn = document.getElementById('btn-add-faq');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = 'true';
      addBtn.addEventListener('click', () => {
        siteData.faqs.push({
          id: 'faq-' + Date.now(),
          question: 'What is YoungMark\'s security and confidentiality protocol?',
          answer: 'All corporate transactional records are secured using AES-256 bit encryption and strict multi-factor role authorization under binding fiduciary non-disclosure agreements.'
        });
        populateFaqsForm();
        broadcastPreviewUpdate();
      });
    }
  }

  // J. Contact & Footer Form
  function populateContactForm() {
    const c = siteData.contact || {};
    bindInput('contact-primary-email', c.primaryEmail, (v) => { c.primaryEmail = v; broadcastPreviewUpdate(); });
    bindInput('contact-support-email', c.supportEmail, (v) => { c.supportEmail = v; broadcastPreviewUpdate(); });
    bindInput('contact-careers-email', c.careersEmail, (v) => { c.careersEmail = v; broadcastPreviewUpdate(); });
    bindInput('contact-primary-phone', c.primaryPhone, (v) => { c.primaryPhone = v; broadcastPreviewUpdate(); });
    bindInput('contact-intl-phone', c.internationalPhone, (v) => { c.internationalPhone = v; broadcastPreviewUpdate(); });
    bindInput('contact-copyright', c.copyright, (v) => { c.copyright = v; broadcastPreviewUpdate(); });

    // Global Offices
    const offContainer = document.getElementById('contact-offices-container');
    if (offContainer) {
      offContainer.innerHTML = '';
      (c.offices || []).forEach((off, index) => {
        const offBox = document.createElement('div');
        offBox.className = 'card-item-box';
        offBox.innerHTML = `
          <div class="card-item-header">
            <span class="card-item-title">${off.city} Office</span>
            <button class="btn-icon-danger btn-delete-office">&times;</button>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" class="form-input o-city" value="${off.city}">
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" class="form-input o-phone" value="${off.phone}">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Physical Address</label>
            <input type="text" class="form-input o-address" value="${off.address}">
          </div>
        `;
        offBox.querySelector('.o-city').addEventListener('input', (e) => { off.city = e.target.value; broadcastPreviewUpdate(); });
        offBox.querySelector('.o-phone').addEventListener('input', (e) => { off.phone = e.target.value; broadcastPreviewUpdate(); });
        offBox.querySelector('.o-address').addEventListener('input', (e) => { off.address = e.target.value; broadcastPreviewUpdate(); });
        offBox.querySelector('.btn-delete-office').addEventListener('click', () => {
          c.offices.splice(index, 1);
          populateContactForm();
          broadcastPreviewUpdate();
        });
        offContainer.appendChild(offBox);
      });
    }
  }

  // K. Legal Policies Form (Terms of Service, Privacy Policy, Cookie Policy)
  function populateLegalForm() {
    const leg = siteData.legal || {};

    // 1. Terms of Service
    const tos = leg.termsOfService || {};
    bindInput('tos-effective-date', tos.effectiveDate, (v) => { tos.effectiveDate = v; broadcastPreviewUpdate(); });
    bindInput('tos-last-updated', tos.lastUpdated, (v) => { tos.lastUpdated = v; broadcastPreviewUpdate(); });
    bindInput('tos-intro', tos.intro, (v) => { tos.intro = v; broadcastPreviewUpdate(); });

    const tosContainer = document.getElementById('tos-clauses-container');
    if (tosContainer) {
      tosContainer.innerHTML = '';
      (tos.sections || []).forEach((sec, idx) => {
        const secBox = document.createElement('div');
        secBox.className = 'card-item-box';
        secBox.innerHTML = `
          <div class="card-item-header">
            <span class="card-item-title">Clause #${idx + 1}</span>
            <button class="btn-icon-danger btn-delete-tos-clause">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">Clause Heading</label>
            <input type="text" class="form-input sec-head" value="${sec.heading}">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Clause Content</label>
            <textarea class="form-textarea sec-body">${sec.body}</textarea>
          </div>
        `;
        secBox.querySelector('.sec-head').addEventListener('input', (e) => { sec.heading = e.target.value; broadcastPreviewUpdate(); });
        secBox.querySelector('.sec-body').addEventListener('input', (e) => { sec.body = e.target.value; broadcastPreviewUpdate(); });
        secBox.querySelector('.btn-delete-tos-clause').addEventListener('click', () => {
          tos.sections.splice(idx, 1);
          populateLegalForm();
          broadcastPreviewUpdate();
        });
        tosContainer.appendChild(secBox);
      });
    }

    // 2. Privacy Policy
    const priv = leg.privacyPolicy || {};
    bindInput('priv-effective-date', priv.effectiveDate, (v) => { priv.effectiveDate = v; broadcastPreviewUpdate(); });
    bindInput('priv-intro', priv.intro, (v) => { priv.intro = v; broadcastPreviewUpdate(); });

    const privContainer = document.getElementById('priv-clauses-container');
    if (privContainer) {
      privContainer.innerHTML = '';
      (priv.sections || []).forEach((sec, idx) => {
        const secBox = document.createElement('div');
        secBox.className = 'card-item-box';
        secBox.innerHTML = `
          <div class="card-item-header">
            <span class="card-item-title">Clause #${idx + 1}</span>
            <button class="btn-icon-danger btn-delete-priv-clause">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">Clause Heading</label>
            <input type="text" class="form-input psec-head" value="${sec.heading}">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Clause Content</label>
            <textarea class="form-textarea psec-body">${sec.body}</textarea>
          </div>
        `;
        secBox.querySelector('.psec-head').addEventListener('input', (e) => { sec.heading = e.target.value; broadcastPreviewUpdate(); });
        secBox.querySelector('.psec-body').addEventListener('input', (e) => { sec.body = e.target.value; broadcastPreviewUpdate(); });
        secBox.querySelector('.btn-delete-priv-clause').addEventListener('click', () => {
          priv.sections.splice(idx, 1);
          populateLegalForm();
          broadcastPreviewUpdate();
        });
        privContainer.appendChild(secBox);
      });
    }

    // 3. Cookie Policy
    const cook = leg.cookiePolicy || {};
    bindInput('cook-effective-date', cook.effectiveDate, (v) => { cook.effectiveDate = v; broadcastPreviewUpdate(); });
    bindInput('cook-intro', cook.intro, (v) => { cook.intro = v; broadcastPreviewUpdate(); });
  }

  // Helper Bind Input
  function bindInput(id, initialVal, onInput) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = initialVal || '';
    el.oninput = (e) => onInput(e.target.value);
  }

  // Helper Bind Color Picker
  function bindColorPicker(pickerId, hexId, initialVal, onChange) {
    const picker = document.getElementById(pickerId);
    const hexInput = document.getElementById(hexId);
    if (!picker || !hexInput) return;

    picker.value = initialVal || '#000000';
    hexInput.value = initialVal || '#000000';

    picker.oninput = (e) => {
      hexInput.value = e.target.value;
      onChange(e.target.value);
    };

    hexInput.oninput = (e) => {
      picker.value = e.target.value;
      onChange(e.target.value);
    };
  }

  // 7. Modals & Actions
  function setupModalHandlers() {
    // Publish Modal
    const publishBtn = document.getElementById('btn-open-publish-modal');
    const modal = document.getElementById('publish-modal');
    const closeBtn = document.getElementById('btn-close-publish-modal');

    if (publishBtn && modal) {
      publishBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    // Export JSON Backup
    const exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonStr = JSON.stringify(siteData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youngmark-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Reset to Defaults
    const resetBtn = document.getElementById('btn-reset-defaults');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('Reset all staging edits to default production content?')) {
          localStorage.removeItem('ym_site_content');
          localStorage.removeItem('ym_cms_preview_data');
          const res = await fetch('data/site-content.json');
          siteData = await res.json();
          populateAllForms();
          broadcastPreviewUpdate();
          alert('Staging reset to default content successfully!');
        }
      });
    }

    // GitHub Direct Commit Trigger
    const executeCommitBtn = document.getElementById('btn-execute-commit');
    if (executeCommitBtn) {
      executeCommitBtn.addEventListener('click', executeGitHubCommit);
    }
  }

  // 8. GitHub REST API Direct Commit Engine
  async function executeGitHubCommit() {
    const tokenInput = document.getElementById('gh-token-input');
    const repoInput = document.getElementById('gh-repo-input');
    const branchInput = document.getElementById('gh-branch-input');
    const commitLog = document.getElementById('commit-log');
    const token = tokenInput ? tokenInput.value.trim() : '';
    const repo = (repoInput ? repoInput.value.trim() : '') || 'Menticore3321/YM-Demo';
    const branch = (branchInput ? branchInput.value.trim() : '') || 'main';

    commitLog.style.display = 'block';
    commitLog.innerHTML = 'Connecting to GitHub REST API...\n';

    if (!token) {
      commitLog.innerHTML += 'ℹ️ No GitHub Personal Access Token provided.\n';
      commitLog.innerHTML += '📥 Saving updated data/site-content.json locally & triggering direct download...\n';

      // Download file directly
      const jsonStr = JSON.stringify(siteData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'site-content.json';
      a.click();
      URL.revokeObjectURL(url);

      commitLog.innerHTML += '✅ Staging saved in browser session. To publish to Vercel without a token, simply place this downloaded file in the /data directory or paste your GitHub Personal Access Token above for 1-click cloud commit!\n';
      return;
    }

    try {
      commitLog.innerHTML += `Fetching current SHA for data/site-content.json in ${repo}...\n`;
      const filePath = 'data/site-content.json';
      const getUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;

      const getRes = await fetch(getUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      let sha = null;
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
        commitLog.innerHTML += `Found existing file SHA: ${sha.slice(0, 7)}\n`;
      } else {
        commitLog.innerHTML += 'Creating new file on GitHub...\n';
      }

      // Encode UTF-8 content to base64
      const contentJson = JSON.stringify(siteData, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(contentJson)));

      commitLog.innerHTML += `Committing changes to branch "${branch}" with automated Vercel webhook trigger...\n`;

      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `chore(cms): update website content & metrics via YoungMark Admin Studio [${new Date().toISOString()}]`,
          content: base64Content,
          sha: sha || undefined,
          branch: branch,
        }),
      });

      if (!putRes.ok) {
        const errJson = await putRes.json();
        throw new Error(errJson.message || 'GitHub commit failed');
      }

      const putData = await putRes.json();
      commitLog.innerHTML += `🎉 Commit created successfully! Hash: ${putData.commit.sha.slice(0, 7)}\n`;
      commitLog.innerHTML += '🚀 Vercel build triggered automatically! Live website will be fully updated across all worldwide CDNs in ~15 seconds.\n';
      alert('Changes successfully committed to GitHub! Vercel is now deploying your live website.');
    } catch (err) {
      commitLog.innerHTML += `❌ Error: ${err.message}\n`;
    }
  }

  // Self-execute
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }
})();
