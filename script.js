// ============ AmbitionForge - Complete JavaScript - FINAL ============

// State
let bookmarkedOpps = JSON.parse(localStorage.getItem('af_bookmarked_opps') || '[]');
let learningProgress = JSON.parse(localStorage.getItem('af_learning_progress') || '{}');

// ============ COMMUNITY MEMBERS DATA ============
const communityMembersData = [
    { name: 'Aarav Sharma', college: 'IIT Delhi', interest: 'AI & ML', achievement: 'Top 10 in Kaggle' },
    { name: 'Priya Patel', college: 'BITS Pilani', interest: 'Web Development', achievement: 'Built 3 full-stack apps' },
    { name: 'Rahul Verma', college: 'NIT Trichy', interest: 'Cloud', achievement: 'AWS Certified' },
];

// ============ UTILITY FUNCTIONS ============
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

function showToast(message, type = 'info') {
    const container = $('#toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { 
        success: '<i class="fas fa-check-circle"></i>', 
        error: '<i class="fas fa-exclamation-circle"></i>',
        info: '<i class="fas fa-info-circle"></i>' 
    };
    toast.innerHTML = `${icons[type] || icons.info} ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function openModal(title, content) {
    const overlay = $('#modalOverlay');
    const body = $('#modalBody');
    if (!overlay || !body) return;
    body.innerHTML = `<h3>${title}</h3><div>${content}</div>`;
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeModal() {
    const overlay = $('#modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============ COPY TO CLIPBOARD - Fixed for Mobile ============
function copyToClipboard(text) {
    if (!text || text === '') {
        showToast('Nothing to copy', 'error');
        return;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied!', 'success');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (err) {
        copied = false;
    }
    
    document.body.removeChild(textarea);
    
    if (copied) {
        showToast('Copied!', 'success');
    } else {
        showManualCopyModal(text);
    }
}

function showManualCopyModal(text) {
    openModal('Copy Manually', `
        <p style="font-size:0.9rem; word-break: break-all; background: var(--surface-2); padding: 12px; border-radius: 8px; user-select: all;">
            ${text}
        </p>
        <p style="font-size:0.75rem; color: var(--text-muted); margin-top: 8px;">
            Long press the text above to copy it.
        </p>
        <button class="btn btn-primary mt-16" onclick="closeModal()">Close</button>
    `);
}

// ============ CATEGORY TAG FUNCTION ============
function getCategoryTag(category) {
    const tags = {
        'Workshop': 'tag-blue',
        'Hackathon': 'tag-green',
        'Meetup': 'tag-red',
        'Talk': 'tag-yellow',
        'Competition': 'tag-green',
        'Community': 'tag-red',
        'Product Trial': 'tag-blue',
        'Other': 'tag-blue'
    };
    return tags[category] || 'tag-blue';
}

// ============ DATE FORMAT FUNCTIONS ============
function formatEventMonth(dateStr) {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

function formatEventDay(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '--';
    return String(d.getDate()).padStart(2, '0');
}

function getEventYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    return d.getFullYear();
}

// ============ POSTER FULLSCREEN VIEW ============
function openPosterFullscreen(posterSrc, eventTitle) {
    if (!posterSrc) return;
    const modal = document.createElement('div');
    modal.className = 'poster-modal';
    modal.innerHTML = `
        <img src="${posterSrc}" alt="${eventTitle} Poster">
    `;
    modal.addEventListener('click', () => {
        modal.remove();
        document.body.classList.remove('no-scroll');
    });
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');
}

// ============ EVENT CARD HTML GENERATOR ============
function generateEventCardHTML(event) {
    const isUpcoming = event.status === 'upcoming';
    
    const posterHTML = event.poster 
        ? `<img src="${event.poster}" alt="${event.title} Poster" loading="lazy">`
        : `<div class="event-poster-placeholder"><i class="fas fa-calendar"></i></div>`;
    
    const hasGid = event.gid && event.gid.trim() !== '';
    const hasAmbassador = event.ambassadorEmail && event.ambassadorEmail.trim() !== '';
    
    let formDetailsHTML = '';
    if (hasAmbassador || hasGid) {
        formDetailsHTML = `
            <div class="event-form-details">
                <div class="event-form-section">
                    <span class="event-form-label">Ambassador Details:</span>
                    ${hasAmbassador ? `
                    <div class="event-form-item">
                        <span class="event-form-chip">
                            <i class="fas fa-envelope"></i> Email: ${event.ambassadorEmail}
                        </span>
                        <button class="copy-btn" onclick="copyToClipboard('${event.ambassadorEmail}')" title="Copy Email">
                            <i class="far fa-copy"></i>
                        </button>
                    </div>
                    ` : ''}
                    ${hasGid ? `
                    <div class="event-form-item">
                        <span class="event-form-chip">
                            <i class="fas fa-id-badge"></i> GID: ${event.gid}
                        </span>
                        <button class="copy-btn" onclick="copyToClipboard('${event.gid}')" title="Copy GID">
                            <i class="far fa-copy"></i>
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    return `
        <article class="event-card-poster">
            <div class="event-poster-section" onclick="openPosterFullscreen('${event.poster || ''}', '${event.title}')">
                ${posterHTML}
            </div>
            <div class="event-card-body">
                <span class="tag ${getCategoryTag(event.category)}">${event.category.toUpperCase()}</span>
                <h3>${event.title}</h3>
                <p class="event-description">${event.description}</p>
                
                <div class="event-details-row">
                    <span class="event-detail-chip">
                        <i class="far fa-calendar-alt"></i> ${formatEventMonth(event.date)} ${formatEventDay(event.date)}
                    </span>
                    <span class="event-detail-chip">
                        <i class="far fa-clock"></i> ${event.time}
                    </span>
                    <span class="event-detail-chip">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </span>
                    ${event.host ? `
                    <span class="event-detail-chip">
                        <i class="fas fa-user-tie"></i> Host: ${event.host}
                    </span>
                    ` : ''}
                </div>
                
                <div class="event-divider"></div>
                
                ${formDetailsHTML}
                
                <div class="event-card-footer">
                    <span class="event-organizer">
                        <i class="fas fa-building"></i> ${event.org}
                    </span>
                    ${isUpcoming ? `
                    <a href="${event.link || '#'}" class="enroll-btn" target="_blank">
                        <i class="fas fa-check-circle"></i> Enroll
                    </a>
                    ` : `
                    <span class="enroll-btn completed">
                        <i class="fas fa-check"></i> Completed
                    </span>
                    `}
                </div>
            </div>
        </article>
    `;
}

// ============ RENDER HOMEPAGE EVENTS ============
function renderHomepageEvents() {
    const container = $('#homeEvents');
    if (!container) return;
    
    const upcomingEvents = (typeof eventsData !== 'undefined' ? eventsData : []).filter(e => e.status === 'upcoming');
    
    // Single event center fix
    if (upcomingEvents.length === 1) {
        container.classList.add('single-event');
    } else {
        container.classList.remove('single-event');
    }
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <h3>No upcoming events yet.</h3>
                <p>We're preparing something for the community.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => generateEventCardHTML(event)).join('');
}

// ============ RENDER ALL EVENTS ============
function renderAllEvents() {
    const upcomingContainer = $('#upcomingEvents');
    const pastContainer = $('#pastEvents');
    
    const allEvents = (typeof eventsData !== 'undefined' ? eventsData : []);
    const upcomingEvents = allEvents.filter(e => e.status === 'upcoming');
    const pastEvents = allEvents.filter(e => e.status === 'past');
    
    // Single event center fix
    if (upcomingContainer) {
        if (upcomingEvents.length === 1) {
            upcomingContainer.classList.add('single-event');
        } else {
            upcomingContainer.classList.remove('single-event');
        }
    }
    
    if (pastContainer) {
        if (pastEvents.length === 1) {
            pastContainer.classList.add('single-event');
        } else {
            pastContainer.classList.remove('single-event');
        }
    }
    
    // No events at all
    if (allEvents.length === 0) {
        if (upcomingContainer) {
            upcomingContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <h3>No events yet.</h3>
                    <p>We're preparing something for the community.</p>
                </div>
            `;
        }
        if (pastContainer) {
            pastContainer.innerHTML = '';
        }
        return;
    }
    
    // Upcoming events
    if (upcomingContainer) {
        if (upcomingEvents.length === 0) {
            upcomingContainer.innerHTML = `
                <div class="empty-state" style="padding: 30px 20px;">
                    <i class="fas fa-calendar"></i>
                    <h3>No upcoming events.</h3>
                    <p>New events will be announced soon.</p>
                </div>
            `;
        } else {
            upcomingContainer.innerHTML = upcomingEvents.map(event => generateEventCardHTML(event)).join('');
        }
    }
    
    // Past events
    if (pastContainer) {
        if (pastEvents.length === 0) {
            pastContainer.innerHTML = `
                <div class="empty-state" style="padding: 30px 20px;">
                    <i class="fas fa-history"></i>
                    <h3>No past events yet.</h3>
                    <p>Past events will appear here.</p>
                </div>
            `;
        } else {
            pastContainer.innerHTML = pastEvents.map(event => generateEventCardHTML(event)).join('');
        }
    }
}

// ============ THEME MANAGEMENT ============
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

function applyTheme(theme, showTransition = true) {
    if (!showTransition) {
        document.documentElement.style.transition = 'none';
        document.body.style.transition = 'none';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('af_theme', theme);
    
    const themeIcon = $('#themeIcon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    const mobileThemeIcon = $('#mobileThemeIcon');
    if (mobileThemeIcon) {
        mobileThemeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    const mobileThemeText = $('#mobileThemeText');
    if (mobileThemeText) {
        mobileThemeText.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
    
    if (!showTransition) {
        setTimeout(() => {
            document.documentElement.style.transition = '';
            document.body.style.transition = '';
        }, 50);
    }
}

function initTheme() {
    const themeToggle = $('#themeToggle');
    const mobileThemeToggle = $('#mobileThemeToggle');
    
    // Default dark theme
    const savedTheme = localStorage.getItem('af_theme') || 'dark';
    applyTheme(savedTheme, false);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = getCurrentTheme();
            const newTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme, true);
            showToast(`Theme switched to ${newTheme} mode`, 'info');
        });
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            const current = getCurrentTheme();
            const newTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme, true);
            showToast(`Theme switched to ${newTheme} mode`, 'info');
        });
    }
}
// ============ MOBILE NAVIGATION ============
function initMobileNav() {
    const hamburger = $('#hamburger');
    const mobileNav = $('#mobileNav');
    if (!hamburger || !mobileNav) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    });
    
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('open');
            document.body.classList.remove('no-scroll');
            closeModal();
        }
    });
}

// ============ HEADER SCROLL ============
function initHeaderScroll() {
    const header = $('#header');
    const backToTop = $('#backToTop');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (backToTop) {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
        
        animateReveals();
    });
    
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ============ MODAL ============
function initModal() {
    const modalClose = $('#modalClose');
    const modalOverlay = $('#modalOverlay');
    if (!modalClose || !modalOverlay) return;
    
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// ============ FAQ ACCORDION ============
function initFAQ() {
    const faqItems = $$('.faq-item');
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => faq.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

// ============ SCROLL REVEAL ============
let revealsInitialized = false;

function initReveals() {
    $$('.card, .section-header, .event-card-poster, .faq-item, .empty-state, .value-card, .community-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    revealsInitialized = true;
}

function animateReveals() {
    if (!revealsInitialized) initReveals();
    $$('.card, .section-header, .event-card-poster, .faq-item, .empty-state, .value-card, .community-card').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

// ============ COMMUNITY MEMBERS RENDER ============
function renderCommunity() {
    const grid = $('#communityMembers');
    if (!grid) return;
    grid.innerHTML = communityMembersData.map(m => `
        <div class="card text-center">
            <div class="card-icon blue" style="width:56px;height:56px;border-radius:50%;font-size:1.3rem;margin:0 auto 12px;">${m.name.charAt(0)}</div>
            <h4 style="margin-bottom:2px;">${m.name}</h4>
            <p style="font-size:0.78rem; margin-bottom:4px;">${m.college}</p>
            <p style="font-size:0.78rem; color:var(--text-muted);">${m.interest}</p>
            <p style="font-size:0.75rem; color:var(--blue); font-weight:600;">${m.achievement}</p>
        </div>
    `).join('');
}

// ============ JOIN FORM ============
function initJoinForm() {
    const joinForm = $('#joinForm');
    if (!joinForm) return;
    
    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = $('#joinName') ? $('#joinName').value.trim() : '';
        const email = $('#joinEmail') ? $('#joinEmail').value.trim() : '';
        
        if (!name || !email) {
            showToast('Please fill in your name and email.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }
        
        const members = JSON.parse(localStorage.getItem('af_join_requests') || '[]');
        members.push({
            name: name,
            email: email,
            college: $('#joinCollege') ? $('#joinCollege').value.trim() : 'Not specified',
            date: new Date().toISOString()
        });
        localStorage.setItem('af_join_requests', JSON.stringify(members));
        
        showToast('Welcome to AmbitionForge!', 'success');
        joinForm.reset();
    });
}

// ============ GLOBAL FUNCTIONS ============
window.closeModal = closeModal;
window.copyToClipboard = copyToClipboard;
window.openPosterFullscreen = openPosterFullscreen;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initTheme();
    initMobileNav();
    initHeaderScroll();
    initModal();
    initFAQ();
    initJoinForm();
    
    // Determine current page
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';
    
    // Set active nav link
    $$('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === pageName + '.html' || (pageName === 'index' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Render page-specific content
    if (pageName === 'index' || pageName === '') {
        renderHomepageEvents();
    } else if (pageName === 'community') {
        renderCommunity();
    } else if (pageName === 'events') {
        renderAllEvents();
    }
    
    // Initialize scroll reveals
    setTimeout(() => {
        initReveals();
        animateReveals();
    }, 200);
    
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        $$('.card, .section-header, .event-card-poster, .faq-item, .empty-state, .value-card, .community-card').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.transition = 'none';
        });
        revealsInitialized = true;
    }
    
    window.addEventListener('resize', animateReveals);
    
    console.log('AmbitionForge initialized successfully');
    console.log('Current page:', pageName);
    console.log('Events loaded:', typeof eventsData !== 'undefined' ? eventsData.length : 0);
});