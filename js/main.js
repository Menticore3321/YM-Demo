/**
 * YoungMark Global Advisory - Main Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBrandIntro();
  initNavigation();
  initScrollProgress();
  initCursorGlow();
  initTiltAndSpotlightCards();
  initScrollReveal();
  initHeroParallax();
  initHowWeHelp();
  initServicesCarousel();
  initExpertiseCounter();
  initIndustries();
  initPlatformFilter();
  initFaqAccordion();
  initModals();
  initContactForms();
});

/* ==========================================================================
   1. Theme Management (Luxury Warm Ivory Light Theme)
   ========================================================================== */
function initTheme() {
  try {
    localStorage.removeItem('ym-theme');
    localStorage.removeItem('ym_theme');
    const stored = localStorage.getItem('ym_site_content');
    if (stored && (stored.includes('#131614') || stored.includes('#0A110B') || stored.includes('#161A17') || stored.includes('#1e2420'))) {
      localStorage.removeItem('ym_site_content');
      localStorage.removeItem('ym_cms_preview_data');
    }
  } catch (e) {
    /* ignore storage access restrictions */
  }
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.style.backgroundColor = '#FBF9F4';
  if (document.body) document.body.style.backgroundColor = '#FBF9F4';
}

/* ==========================================================================
   2. Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('open') && !mobileDrawer.contains(e.target) && !mobileBtn.contains(e.target)) {
        mobileDrawer.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Highlight active page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Dynamic header scrolled shadow
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
}

/* ==========================================================================
   3. "How We Help" Interactive Tabs
   ========================================================================== */
function initHowWeHelp() {
  const tabBtns = document.querySelectorAll('.help-tab-btn');
  const cards = document.querySelectorAll('.help-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => b.classList.remove('active'));
      cards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        targetCard.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. Services Carousel (Smooth Fluid Edge-Fade, Drag Physics & Discrete Step)
   ========================================================================== */
function initServicesCarousel() {
  const track = document.querySelector('.services-carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || !prevBtn || !nextBtn) return;

  function getStepWidth() {
    const firstCard = track.querySelector('.service-card');
    if (!firstCard) return 364;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 24;
    return firstCard.offsetWidth + gap;
  }

  function updateCarouselState() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 8) {
      track.classList.add('mask-none');
      track.classList.remove('mask-both', 'mask-end');
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    track.classList.remove('mask-none');

    const atStart = track.scrollLeft <= 16;
    const atEnd = track.scrollLeft >= maxScroll - 16;

    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;

    if (atStart) {
      track.classList.remove('mask-both', 'mask-end');
    } else if (atEnd) {
      track.classList.remove('mask-both');
      track.classList.add('mask-end');
    } else {
      track.classList.remove('mask-end');
      track.classList.add('mask-both');
    }
  }

  function scrollToStep(direction) {
    const step = getStepWidth();
    const currentScroll = track.scrollLeft;
    let targetIndex;

    if (direction === 'next') {
      targetIndex = Math.floor((currentScroll + 15) / step) + 1;
    } else {
      targetIndex = Math.ceil((currentScroll - 15) / step) - 1;
    }

    const targetScroll = Math.max(0, Math.min(targetIndex * step, track.scrollWidth - track.clientWidth));
    track.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToStep('prev');
  });

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToStep('next');
  });

  // Passive scroll listener for edge fade mask and button sync
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    updateCarouselState();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCarouselState, 60);
  }, { passive: true });

  window.addEventListener('resize', updateCarouselState, { passive: true });

  // Tactile Mouse Drag-to-Scroll for Desktop
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let hasDragged = false;

  track.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only primary mouse button
    isDown = true;
    hasDragged = false;
    track.classList.add('is-dragging');
    startX = e.pageX - track.offsetLeft;
    scrollStart = track.scrollLeft;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.25;
    if (Math.abs(x - startX) > 6) {
      hasDragged = true;
    }
    track.scrollLeft = scrollStart - walk;
    updateCarouselState();
  });

  const stopDrag = () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
    updateCarouselState();
  };

  window.addEventListener('mouseup', stopDrag);
  track.addEventListener('mouseleave', stopDrag);

  // Suppress accidental modal popups if user was dragging
  track.addEventListener('click', (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged = false;
    }
  }, true);

  // Initial state check after layout settle
  setTimeout(updateCarouselState, 150);
}

/* ==========================================================================
   5. "Our Expertise" Animated Counters
   ========================================================================== */
function initExpertiseCounter() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  let triggered = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const suffix = counter.getAttribute('data-suffix') || '';
          animateCounter(counter, target, suffix);
        });
      }
    });
  }, { threshold: 0.3 });

  const section = document.querySelector('.expertise-section');
  if (section) observer.observe(section);
}

function animateCounter(el, target, suffix) {
  let start = 0;
  const duration = 1800;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quad
    const easeProgress = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(easeProgress * target);

    el.textContent = current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = target.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(updateCount);
}

/* ==========================================================================
   6. "Whom We Serve" Industry Tab Switcher
   ========================================================================== */
const industryData = {
  realestate: {
    title: 'Real Estate & Property Developers',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`,
    desc: 'End-to-end financial operations and portfolio accounting for asset managers, REITs, general partners, and property operators. We architect automated property accounting, rent roll reconciliations, and custom Yardi ledger management.',
    tags: [
      'Full-Cycle Property Accounting',
      'Yardi Voyager & Breeze Setup',
      'CAM & Lease Reconciliations',
      'Portfolio Level KPI Dashboards',
      'Lease & Escrow Accounting',
      'Investor Distribution Modeling'
    ]
  },
  tech: {
    title: 'Technology & SaaS Enterprises',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    desc: 'Strategic financial infrastructure and automated billing for fast-scaling technology startups and subscription businesses. We implement ASC 606 revenue recognition, stripe reconciliations, and unit economics metrics.',
    tags: [
      'ASC 606 Revenue Recognition',
      'SaaS Metrics (CAC, LTV, NDR)',
      'Automated Billing & Stripe Sync',
      'Runway & Burn Modeling',
      'Burn Rate & Capital Strategy',
      'Fundraising Due Diligence'
    ]
  },
  healthcare: {
    title: 'Healthcare & Clinical Groups',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    desc: 'HIPAA-compliant financial operations, physician practice analytics, and insurance receivables management designed to maintain tight internal controls and predictable cash flow for medical organizations.',
    tags: [
      'HIPAA-Compliant Reporting',
      'Insurance & Patient AR Cycle',
      'Provider Compensation Models',
      'Multi-Clinic Consolidation',
      'Medical Supplies AP Audit',
      'Capital Equipment Planning'
    ]
  },
  ecommerce: {
    title: 'E-Commerce & Omnichannel Retail',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
    desc: 'High-volume multichannel reconciliations (Shopify, Amazon, Walmart) paired with real-time inventory costing (COGS), payout reconciliations, and sales tax compliance across multiple jurisdictions.',
    tags: [
      'Multichannel Payout Clearing',
      'Real-Time COGS & Inventory Valuation',
      'Multi-State Sales Tax Filing',
      'Payment Gateway Reconciliations',
      'Ad Spend ROI & Unit Margin Analysis',
      'Omnichannel COGS Reconciliation'
    ]
  },
  professional: {
    title: 'Professional Services & Consultancies',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
    desc: 'Project-based financial intelligence, billable utilization tracking, and streamlined quote-to-cash workflows for law firms, creative agencies, engineering practices, and advisory firms.',
    tags: [
      'Project Profitability Audits',
      'Utilization & Realization Rates',
      'Automated Retainer Invoicing',
      'Time-Tracking Tool Integrations',
      'Partner Profit-Sharing Models',
      'Strategic Cash Reserves Planning'
    ]
  },
  hospitality: {
    title: 'Hospitality & Franchise Chains',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    desc: 'Daily flash reporting, POS revenue clearing, vendor payment scheduling, and labor cost optimization for boutique hotels, restaurant groups, and franchisee networks.',
    tags: [
      'POS Integration & Daily Audit',
      'Prime Cost & Food Waste Analytics',
      'Franchise Royalty Accounting',
      'Multi-Unit Ledger Consolidation',
      'Tip Allocation & Payroll Processing',
      'Working Capital Management'
    ]
  }
};

function initIndustries() {
  const buttons = document.querySelectorAll('.industry-tab-btn');
  const card = document.getElementById('industry-active-card');
  if (!card || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-industry');
      const data = industryData[key];
      if (!data) return;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      card.innerHTML = `
        <div class="industry-card-header">
          <div class="industry-icon-pill">${data.icon}</div>
          <h3 class="industry-card-title">${data.title}</h3>
        </div>
        <p class="industry-card-desc">${data.desc}</p>
        <div class="industry-tags-grid">
          ${data.tags.map(tag => `
            <div class="industry-feature-tag">
              <span class="tag-pulsing-dot"></span>
              <span>${tag}</span>
            </div>
          `).join('')}
        </div>
      `;
    });
  });
}

/* ==========================================================================
   7. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other items
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('active', !isActive);
      btn.setAttribute('aria-expanded', !isActive);
    });
  });
}

/* ==========================================================================
   8. Modal Dialog Management
   ========================================================================== */
function initModals() {
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtns = document.querySelectorAll('.modal-close-btn');

  if (!backdrop) return;

  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

function openModal(contentHtml) {
  const backdrop = document.getElementById('modal-backdrop');
  const body = document.getElementById('modal-body-content');
  if (!backdrop || !body) return;

  body.innerHTML = contentHtml;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (!backdrop) return;

  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

/* Service Detail Modal */
window.showServiceModal = function(title, category, fullDesc, features) {
  const html = `
    <div style="margin-bottom: 20px;">
      <span class="service-category">${category}</span>
      <h2 style="font-size: 2rem; margin: 8px 0 16px;">${title}</h2>
      <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px;">${fullDesc}</p>
      <h4 style="font-size: 1.15rem; margin-bottom: 12px;">Core Capabilities & Deliverables:</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;">
        ${features.map(f => `
          <li style="display: flex; align-items: center; gap: 10px; font-weight: 500;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--c-leaf-green); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg>
            <span>${f}</span>
          </li>
        `).join('')}
      </ul>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="contact.html?service=${encodeURIComponent(title)}" class="btn-cta" style="padding: 12px 28px; width: 100%; text-align: center;">Request Consultation for ${title}</a>
      </div>
    </div>
  `;
  openModal(html);
};

/* Team Member Bio Modal */
window.showTeamModal = function(name, role, credentials, bio, specialties) {
  const html = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div class="member-avatar-wrap" style="margin: 0 auto 16px; width: 110px; height: 110px;">
        <div style="width: 100%; height: 100%; border-radius: 9999px; background: linear-gradient(135deg, var(--c-forest-green), var(--c-leaf-green)); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: 800;">
          ${name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>
      <h2 style="font-size: 1.8rem; margin-bottom: 4px;">${name}</h2>
      <p style="font-size: 0.95rem; font-weight: 700; color: var(--c-forest-green); margin-bottom: 4px;">${role}</p>
      ${credentials ? `<p style="font-size: 0.82rem; color: var(--text-muted);">${credentials}</p>` : ''}
    </div>
    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 1.1rem; margin-bottom: 8px;">Executive Profile</h4>
      <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 20px;">${bio}</p>
      ${specialties && specialties.length ? `
        <h4 style="font-size: 1.1rem; margin-bottom: 8px;">Areas of Specialization</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${specialties.map(s => `
            <span style="font-size: 0.82rem; font-weight: 600; padding: 6px 14px; border-radius: 9999px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-primary);">${s}</span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
  openModal(html);
};

/* Job Application Modal */
window.openJobModal = function(jobTitle, department) {
  const html = `
    <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Apply for Role</h2>
    <p style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 24px;">Position: <strong>${jobTitle}</strong> (${department})</p>
    <form id="job-apply-form" onsubmit="handleJobSubmit(event)">
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" class="form-input" required placeholder="John Doe">
      </div>
      <div class="form-group">
        <label class="form-label">Email Address *</label>
        <input type="email" class="form-input" required placeholder="john@example.com">
      </div>
      <div class="form-group">
        <label class="form-label">Phone Number *</label>
        <input type="tel" class="form-input" required placeholder="+1 (555) 000-0000">
      </div>
      <div class="form-group">
        <label class="form-label">LinkedIn or Portfolio URL</label>
        <input type="url" class="form-input" placeholder="https://linkedin.com/in/username">
      </div>
      <div class="form-group">
        <label class="form-label">Brief Introduction & Why YoungMark</label>
        <textarea class="form-textarea" rows="3" placeholder="Tell us what excites you about this opportunity..."></textarea>
      </div>
      <button type="submit" class="btn-cta" style="width: 100%; padding: 14px;">Submit Application</button>
    </form>
  `;
  openModal(html);
};

window.handleJobSubmit = function(e) {
  e.preventDefault();
  closeModal();
  showToast('Application submitted successfully! Our recruiting team will review your profile.');
};

/* ==========================================================================
   9. Forms & Toasts
   ========================================================================== */
function initContactForms() {
  const forms = document.querySelectorAll('form[data-ajax-form]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.textContent : '';

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Submitting...';
      }

      setTimeout(() => {
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
        showToast('Thank you! Your inquiry has been dispatched to our advisory partners.');
      }, 700);
    });
  });

  // Auto-select practice from URL query (?service=...)
  try {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
      const select = document.getElementById('practice-focus');
      if (select) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value.toLowerCase().includes(serviceParam.toLowerCase()) ||
              serviceParam.toLowerCase().includes(select.options[i].value.toLowerCase())) {
            select.selectedIndex = i;
            break;
          }
        }
      }
    }
  } catch (err) {
    /* ignore search param errors */
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}

/* ==========================================================================
   10. Reading Scroll Progress Bar
   ========================================================================== */
function initScrollProgress() {
  let progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.prepend(progressBar);
  }

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });
}

/* ==========================================================================
   11. Ambient Mouse Cursor Glow & Matrix Grid: Disabled per User Preference
   ========================================================================== */
function initCursorGlow() {
  // Completely remove any existing grid or vignette elements
  const existingGrid = document.querySelector('.matrix-grid-bg');
  if (existingGrid) existingGrid.remove();
  const existingVignette = document.querySelector('.site-vignette');
  if (existingVignette) existingVignette.remove();
  const existingGlow = document.querySelector('.cursor-glow');
  if (existingGlow) existingGlow.remove();
}

/* ==========================================================================
   12. High-Performance 3D Card Tilt & Interactive Cursor Border Glow
   ========================================================================== */
function initTiltAndSpotlightCards() {
  const cards = document.querySelectorAll(
    '.service-card, .spotlight-card, .platform-eco-card, .team-member-card, .help-card, .info-item-card, .contact-card-box, .tilt-card'
  );

  cards.forEach(card => {
    let bounds = null;
    let isHovering = false;
    let rafId = null;

    const updateBounds = () => {
      bounds = card.getBoundingClientRect();
    };

    const onPointerEnter = (e) => {
      if (e.pointerType === 'touch') return;
      updateBounds();
      isHovering = true;
      card.style.transition = 'transform 0.12s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s ease';
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      if (!isHovering || !bounds) {
        updateBounds();
        isHovering = true;
      }

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      // Update cursor coordinates for dynamic masked border glow & surface bloom
      card.style.setProperty('--mouse-x', `${mouseX.toFixed(1)}px`);
      card.style.setProperty('--mouse-y', `${mouseY.toFixed(1)}px`);

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const width = bounds.width;
        const height = bounds.height;
        // Calculate punchy, responsive 3D tilt angles (-8 to +8 deg)
        const rotateY = ((mouseX / width) - 0.5) * 16;
        const rotateX = ((mouseY / height) - 0.5) * -16;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.025, 1.025, 1.025)`;
      });
    };

    const onPointerLeave = (e) => {
      if (e.pointerType === 'touch') return;
      isHovering = false;
      if (rafId) cancelAnimationFrame(rafId);
      card.style.setProperty('--mouse-x', '-500px');
      card.style.setProperty('--mouse-y', '-500px');
      card.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
    };

    card.addEventListener('pointerenter', onPointerEnter, { passive: true });
    card.addEventListener('pointermove', onPointerMove, { passive: true });
    card.addEventListener('pointerleave', onPointerLeave, { passive: true });
  });
}

/* ==========================================================================
   14. Scroll-Driven Reveal System (Apple / Linear Cascade Effect)
   ========================================================================== */
function initScrollReveal() {
  // 1. Group-based cascading stagger for all card and grid children
  const cardContainers = [
    '.stats-grid',
    '.services-carousel-track',
    '.platforms-ecosystem-grid',
    '.team-grid',
    '.faq-accordion',
    '.services-pillars-grid',
    '.services-process-grid',
    '.about-mission-grid',
    '.about-values-grid',
    '.careers-culture-grid',
    '.contact-channels-grid',
    '.careers-hero-split-grid',
    '.industry-tags-grid'
  ];

  cardContainers.forEach(containerSelector => {
    document.querySelectorAll(containerSelector).forEach(container => {
      const children = Array.from(container.children);
      children.forEach((child, idx) => {
        if (!child.classList.contains('reveal-on-scroll')) {
          child.classList.add('reveal-on-scroll');
          child.classList.add(`stagger-${(idx % 6) + 1}`);
        }
      });
    });
  });

  // 2. Standalone headers, showcase boxes and banners
  const standaloneSelectors = [
    '.section-header',
    '.help-showcase-container',
    '.industry-card-active',
    '.custom-industry-box',
    '.process-flow-container',
    '.cta-banner-box',
    '.contact-card-box',
    '.contact-confidentiality-card',
    '.info-item-card',
    '.faq-item'
  ];

  standaloneSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (!el.classList.contains('reveal-on-scroll')) {
        el.classList.add('reveal-on-scroll');
        el.classList.add('stagger-1');
      }
    });
  });

  const reveals = document.querySelectorAll('.reveal-on-scroll, .reveal-scale');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.06,
    rootMargin: '0px 0px -30px 0px'
  });

  reveals.forEach(el => observer.observe(el));

  // If user swipes horizontally on mobile, ensure off-screen cards are immediately visible
  const horizontalSliders = document.querySelectorAll(
    '.services-pillars-grid, .services-process-grid, .platforms-ecosystem-grid, .team-grid, .about-mission-grid, .about-values-grid, .careers-culture-grid, .stats-grid, .services-carousel-track'
  );
  horizontalSliders.forEach(slider => {
    slider.addEventListener('scroll', () => {
      Array.from(slider.children).forEach(c => c.classList.add('is-revealed'));
    }, { passive: true, once: true });
  });
}

/* ==========================================================================
   15. Hero Parallax Mouse Motion (Supports both landing hero & subpage heroes)
   ========================================================================== */
function initHeroParallax() {
  const heroes = document.querySelectorAll('.hero-section, .subpage-hero');
  if (!heroes.length || !window.matchMedia('(pointer: fine)').matches) return;

  heroes.forEach(hero => {
    const spotlight = hero.querySelector('.spotlight-radial');
    const orbs = hero.querySelectorAll('.ambient-orb');
    const ultravibeWrapper = hero.querySelector('.ultravibe-bg-wrapper');
    const auroraBeam = hero.querySelector('.ultravibe-aurora-beam');

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const x = mouseX / rect.width - 0.5;
      const y = mouseY / rect.height - 0.5;

      // Set cursor coordinates for dynamic arc shine flare
      hero.style.setProperty('--cursor-x', `${mouseX}px`);
      hero.style.setProperty('--cursor-y', `${mouseY}px`);

      if (spotlight) {
        spotlight.style.transform = `translateX(calc(-50% + ${x * 40}px)) translateY(${y * 30}px)`;
      }

      // ultravibeWrapper remains fixed at center bottom to ensure cursor spotlight coordinates stay 100% aligned with the arc art
      if (auroraBeam) {
        auroraBeam.style.transform = `translate3d(${x * 35}px, ${y * 18}px, 0)`;
      }

      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 20;
        orb.style.transform = `translate3d(${-x * factor}px, ${-y * factor}px, 0)`;
      });
    });

    hero.addEventListener('mouseleave', () => {
      hero.style.setProperty('--cursor-x', '-500px');
      hero.style.setProperty('--cursor-y', '-500px');
      if (spotlight) {
        spotlight.style.transform = 'translateX(-50%) translateY(0)';
      }
      if (auroraBeam) {
        auroraBeam.style.transform = '';
      }
      orbs.forEach(orb => {
        orb.style.transform = '';
      });
    });
  });
}

/* ==========================================================================
   16. Financial Platforms Interactive Category Filter
   ========================================================================== */
function initPlatformFilter() {
  const tabBtns = document.querySelectorAll('.platform-tab-btn');
  const cards = document.querySelectorAll('.platform-eco-card');
  if (!tabBtns.length || !cards.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-platform-filter');
      const grid = document.querySelector('.platforms-ecosystem-grid');
      if (grid) {
        grid.scrollTo({ left: 0, behavior: 'smooth' });
      }

      cards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px) scale(0.96)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   17. Signature Luxury Brand Intro Animation Sequence
   ========================================================================== */
function initBrandIntro() {
  const introLoader = document.getElementById('intro-loader');
  const stage = document.getElementById('intro-brand-stage');
  const logoImg = document.getElementById('intro-logo-img');
  const textReveal = document.getElementById('intro-text-reveal');
  const navBrand = document.getElementById('brand-home-link');
  const curtain = document.getElementById('intro-curtain');
  const ambient = document.getElementById('intro-ambient');

  if (!introLoader || !stage || !logoImg || !textReveal || !navBrand || !curtain) return;

  // Check if intro has already run in this session (unless forced via ?intro=1)
  const isForced = window.location.search.includes('intro=1');
  let hasPlayed = false;
  try {
    hasPlayed = sessionStorage.getItem('ym_intro_played') === 'true';
  } catch (e) {
    /* ignore session access restrictions */
  }

  if (hasPlayed && !isForced) {
    introLoader.remove();
    return;
  }

  // Active intro state: lock scroll and keep site hidden behind dark curtain
  document.body.classList.add('intro-active');

  // Safety fallback: if anything prevents the timeline from finishing, guarantee cleanup after 5s
  const safetyTimer = setTimeout(completeIntro, 5000);

  function completeIntro() {
    clearTimeout(safetyTimer);
    document.body.classList.remove('intro-active', 'intro-docked');
    if (navBrand) {
      navBrand.style.opacity = '1';
      navBrand.style.visibility = 'visible';
    }
    if (introLoader && introLoader.parentNode) {
      introLoader.remove();
    }
    try {
      sessionStorage.setItem('ym_intro_played', 'true');
    } catch (e) {
      /* ignore */
    }
  }

  // Step 1: Reveal logo with golden aura in center (140ms)
  setTimeout(() => {
    logoImg.classList.add('is-visible');
  }, 140);

  // Step 2: Reveal typography smoothly from the side of the logo (780ms)
  setTimeout(() => {
    textReveal.classList.add('is-revealed');
  }, 780);

  // Step 3: Fly from center directly into the navigation bar logo position (1850ms)
  // NOTICE: Curtain stays pitch dark so user clearly watches the logo travel and dock into navbar
  setTimeout(() => {
    const targetRect = navBrand.getBoundingClientRect();
    const currentRect = stage.getBoundingClientRect();

    if (targetRect.width > 0 && targetRect.height > 0) {
      // Lock stage to exact current rendered screen coordinates
      stage.style.position = 'fixed';
      stage.style.left = `${currentRect.left}px`;
      stage.style.top = `${currentRect.top}px`;
      stage.style.margin = '0';
      stage.style.transformOrigin = '0 0';
      stage.style.transform = 'scale(1.4)';

      // Force browser reflow to register fixed coordinates
      void stage.offsetWidth;

      // Animate smoothly to target navbar position and scale down to 1.0
      const deltaX = targetRect.left - currentRect.left;
      const deltaY = targetRect.top - currentRect.top;

      stage.style.transition = 'transform 1.05s cubic-bezier(0.16, 1, 0.3, 1)';
      stage.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1)`;
    } else {
      stage.style.transition = 'transform 0.9s ease, opacity 0.8s ease';
      stage.style.transform = 'translate3d(0, -120px, 0) scale(0.7)';
      stage.style.opacity = '0';
    }
  }, 1850);

  // Step 4: The Docking Moment (2950ms)
  // Logo has now arrived at the nav bar. Now it settles, and the entire website reveals slowly.
  setTimeout(() => {
    stage.classList.add('is-docked');
    document.body.classList.add('intro-docked');

    // Fade out ambient aura and dark curtain smoothly (1.25s)
    if (ambient) {
      ambient.style.transition = 'opacity 0.7s ease';
      ambient.style.opacity = '0';
    }
    curtain.style.transition = 'opacity 1.25s cubic-bezier(0.16, 1, 0.3, 1)';
    curtain.style.opacity = '0';
  }, 2950);

  // Step 5: Clean hand-off after site has fully revealed (4200ms)
  setTimeout(completeIntro, 4200);
}





