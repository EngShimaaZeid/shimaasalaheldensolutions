// ===================================
// Portfolio Website - JavaScript
// ===================================
// This file now integrates with the Admin Panel API
// Projects and settings are loaded dynamically from the server
// ===================================

// ===================================
// PROJECTS DATA - Now loaded from API
// Fallback data if API is unavailable
// ===================================
let projects = [];

// Fallback projects (used when server is not running)
const fallbackProjects = [
    {
        title: "Digital Marketing Agency",
        description: "My professional digital marketing website offering comprehensive SEO, social media marketing, and web development services to help businesses grow online.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
        technologies: ["Wix", "SEO", "Digital Marketing", "Branding"],
        link: "https://shimaasalahelden19.wixsite.com/eldemardash/%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%D9%86%D8%A7",
        featured: true
    },
    {
        title: "AI Gen-Z Style Todo List",
        description: "A modern, AI-inspired todo list application with beautiful animations and a clean dark theme interface for managing tasks efficiently.",
        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
        technologies: ["HTML5", "CSS3", "JavaScript"],
        link: "https://aigenzstyletodolist.netlify.app/"
    },
    {
        title: "Farming Company Website",
        description: "A professional website for an agricultural company showcasing their services, products, and commitment to sustainable farming practices.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop",
        technologies: ["HTML5", "CSS3", "Bootstrap", "SEO"],
        link: "https://farmingcompany.netlify.app/"
    },
    {
        title: "AI Boho Style Todo List",
        description: "An elegant todo list application featuring a beautiful bohemian aesthetic design with warm colors and artistic elements.",
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop",
        technologies: ["HTML5", "CSS3", "JavaScript"],
        link: "https://aibohostyletpdplist.netlify.app/"
    },
    {
        title: "Engineering Website",
        description: "A fully responsive professional engineering website built with Bootstrap framework, featuring clean design and modern layouts.",
        image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=400&fit=crop",
        technologies: ["Bootstrap", "HTML5", "CSS3", "JavaScript"],
        link: "https://bootstrapwsite.netlify.app/"
    },
    {
        title: "AI Modern Todo List",
        description: "A sleek and modern todo list application with AI-inspired design elements and intuitive user experience for productivity.",
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
        technologies: ["HTML5", "CSS3", "JavaScript"],
        link: "https://aimoderntodolist.netlify.app/"
    },
    {
        title: "Dr. Asmaa Hammad Portfolio",
        description: "A professional portfolio website showcasing medical expertise and services with elegant design and comprehensive information.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
        technologies: ["Wix", "Web Design", "SEO"],
        link: "https://shimaasalahelden19.wixsite.com/drasmaahammad"
    },
    {
        title: "Liverpool FC Fan Website",
        description: "A dynamic React-based website dedicated to Liverpool Football Club fans, featuring news, match updates, and team information.",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&h=400&fit=crop",
        technologies: ["React", "JavaScript", "CSS3", "API"],
        link: "https://liverpool-react.netlify.app/"
    },
    {
        title: "Al Nur Sprouts School",
        description: "An educational institution website with a modern and engaging design, providing information about programs, admissions, and school activities.",
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop",
        technologies: ["HTML5", "CSS3", "JavaScript", "SEO"],
        link: "https://alnursproutsschool.netlify.app/"
    }
];

// ===================================
// API Integration Functions
// ===================================

/**
 * Load projects from API
 * Falls back to hardcoded data if server is unavailable
 */
async function loadProjectsFromAPI() {
    try {
        const response = await fetch('/api/projects');
        if (response.ok) {
            const data = await response.json();
            // Sort by order
            projects = data.sort((a, b) => (a.order || 0) - (b.order || 0));
            console.log('Projects loaded from API');
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.log('Using fallback projects (server not running)');
        projects = fallbackProjects;
    }
    renderProjects();
}

/**
 * Load settings from API and apply theme
 * Applies dynamic theme color from admin panel
 */
async function loadSettingsFromAPI() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const settings = await response.json();
            
            // Apply full color palette
            if (settings.theme) {
                applyColorPalette(settings.theme);
            }
            
            // Apply contact info
            if (settings.contact) {
                applyContactInfo(settings.contact);
            }
            
            console.log('Settings loaded from API');
        }
    } catch (error) {
        console.log('Using default settings (server not running)');
        // Apply default elegant palette
        applyColorPalette({
            primaryColor: '#6C2F4E',
            secondaryColor: '#5B5A3C',
            accentColor: '#9A7C7C',
            backgroundColor: '#E0DCD9',
            whiteColor: '#FFFFFF'
        });
    }
}

/**
 * Apply full color palette to CSS custom properties
 * @param {object} theme - Theme object with color values
 */
function applyColorPalette(theme) {
    const primary = theme.primaryColor || '#6C2F4E';
    const secondary = theme.secondaryColor || '#5B5A3C';
    const accent = theme.accentColor || '#9A7C7C';
    const background = theme.backgroundColor || '#E0DCD9';
    const white = theme.whiteColor || '#FFFFFF';
    const primaryHover = theme.primaryColorHover || lightenColor(primary, 15);
    const secondaryHover = theme.secondaryColorHover || lightenColor(secondary, 15);
    
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --color-primary: ${primary};
            --color-primary-hover: ${primaryHover};
            --color-secondary: ${secondary};
            --color-secondary-hover: ${secondaryHover};
            --color-accent: ${accent};
            --color-background: ${background};
            --color-white: ${white};
        }
        
        /* ===== PRIMARY COLOR OVERRIDES ===== */
        .bg-accent, .bg-primary-theme { background-color: ${primary} !important; }
        .text-accent, .text-primary-theme { color: ${primary} !important; }
        .border-accent { border-color: ${primary} !important; }
        .hover\\:bg-accent-hover:hover, .hover\\:bg-primary-theme-hover:hover { background-color: ${primaryHover} !important; }
        .hover\\:text-accent:hover { color: ${primary} !important; }
        
        /* Hero section */
        .bg-\\[\\#3d003b\\], .bg-\\[\\#6C2F4E\\], #hero-section { background-color: ${primary} !important; }
        .text-\\[\\#3d003b\\], .text-\\[\\#6C2F4E\\] { color: ${primary} !important; }
        .hover\\:bg-\\[\\#5a0058\\]:hover, .hover\\:bg-\\[\\#8A3D65\\]:hover { background-color: ${primaryHover} !important; }
        
        /* ===== SECONDARY COLOR OVERRIDES ===== */
        .bg-secondary-theme { background-color: ${secondary} !important; }
        .text-secondary-theme { color: ${secondary} !important; }
        .border-secondary-theme { border-color: ${secondary} !important; }
        .hover\\:bg-secondary-theme-hover:hover { background-color: ${secondaryHover} !important; }
        
        /* Secondary buttons */
        .btn-secondary { 
            background-color: ${secondary} !important; 
            color: ${white} !important;
        }
        .btn-secondary:hover { background-color: ${secondaryHover} !important; }
        
        /* ===== ACCENT COLOR OVERRIDES ===== */
        .bg-accent-theme { background-color: ${accent} !important; }
        .text-accent-theme { color: ${accent} !important; }
        .border-accent-theme { border-color: ${accent} !important; }
        
        /* Accent borders and hover states */
        .border-\\[\\#9A7C7C\\] { border-color: ${accent} !important; }
        .hover\\:border-accent-theme:hover { border-color: ${accent} !important; }
        
        /* ===== BACKGROUND COLOR OVERRIDES ===== */
        .bg-background-theme, .section-bg { background-color: ${background} !important; }
        .bg-primary { background-color: ${background} !important; }
        body { background-color: ${background} !important; }
        
        /* Cards and sections */
        .card-bg { background-color: ${white} !important; }
        
        /* ===== WHITE/CLEAN SPACES ===== */
        .bg-white-theme { background-color: ${white} !important; }
        .text-white-theme { color: ${white} !important; }
        
        /* ===== GRADIENT & SPECIAL EFFECTS ===== */
        .gradient-text {
            background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Nav link underline */
        .nav-link::after {
            background-color: ${primary};
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar-thumb {
            background-color: ${accent};
        }
        ::-webkit-scrollbar-thumb:hover {
            background-color: ${primary};
        }
        
        /* Tech badge - secondary color */
        .tech-badge {
            background-color: ${secondary}1f;
            border-color: ${secondary}40;
            color: ${secondary};
        }
        .tech-badge:hover {
            background-color: ${secondary}33;
            border-color: ${secondary}66;
            color: ${secondary};
        }
        
        /* Focus rings */
        .focus\\:ring-accent:focus { --tw-ring-color: ${primary}40 !important; }
        .ring-\\[\\#3d003b\\]\\/10 { --tw-ring-color: ${primary}1a !important; }
        
        /* Borders with opacity */
        .border-\\[\\#3d003b\\]\\/30 { border-color: ${primary}4d !important; }
        .border-accent\\/30 { border-color: ${accent}4d !important; }
        
        /* Project cards */
        .project-card:hover {
            border-color: ${accent};
            box-shadow: 0 10px 40px ${accent}20;
        }
        
        /* Skill tags */
        .skill-tag {
            background-color: ${background};
            color: ${primary};
            border-color: ${accent}40;
        }
        .skill-tag:hover {
            background-color: ${accent}20;
            border-color: ${accent};
        }
        
        /* Contact section buttons */
        .contact-btn {
            background-color: ${secondary};
            color: ${white};
        }
        .contact-btn:hover {
            background-color: ${secondaryHover};
        }
        
        /* Social links */
        .social-link:hover {
            color: ${primary};
            background-color: ${accent}20;
        }
    `;
    
    // Remove any existing theme style
    const existingStyle = document.getElementById('dynamic-theme');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    style.id = 'dynamic-theme';
    document.head.appendChild(style);
}

/**
 * Legacy function for backward compatibility
 */
function applyThemeColor(color) {
    applyColorPalette({ primaryColor: color });
}

/**
 * Apply contact information to the page
 * @param {object} contact - Contact info object
 */
function applyContactInfo(contact) {
    // Update contact links if they exist
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    const linkedinLinks = document.querySelectorAll('a[href*="linkedin"]');
    const githubLinks = document.querySelectorAll('a[href*="github"]');
    
    if (contact.email) {
        emailLinks.forEach(link => {
            link.href = `mailto:${contact.email}`;
            // Update the displayed email text
            const textEl = link.querySelector('.font-semibold');
            if (textEl && textEl.textContent.includes('@')) {
                textEl.textContent = contact.email;
            }
        });
    }
    
    if (contact.phone) {
        phoneLinks.forEach(link => {
            link.href = `tel:${contact.phone.replace(/\s/g, '')}`;
            // Update the displayed phone number text
            const textEl = link.querySelector('.font-semibold');
            if (textEl && textEl.textContent.match(/[\d\s\+\-\(\)]+/)) {
                textEl.textContent = contact.phone;
            }
        });
    }
    
    if (contact.whatsapp) {
        // Remove all non-numeric characters except + for the WhatsApp link
        const whatsappNumber = contact.whatsapp.replace(/[^\d]/g, '');
        whatsappLinks.forEach(link => {
            link.href = `https://wa.me/${whatsappNumber}`;
            // Update the displayed WhatsApp number text
            const textEl = link.querySelector('.font-semibold');
            if (textEl && textEl.textContent.match(/[\d\s\+\-\(\)]+/)) {
                textEl.textContent = contact.whatsapp;
            }
        });
    }
    
    if (contact.linkedin) {
        linkedinLinks.forEach(link => {
            link.href = contact.linkedin;
            // Update LinkedIn display text (extract username from URL)
            const textEl = link.querySelector('.font-semibold');
            if (textEl) {
                const username = contact.linkedin.split('/').filter(Boolean).pop() || 'LinkedIn';
                textEl.textContent = username;
            }
        });
    }
    
    if (contact.github) {
        githubLinks.forEach(link => {
            link.href = contact.github;
            // Update GitHub display text (extract username from URL)
            const textEl = link.querySelector('.font-semibold');
            if (textEl) {
                const username = contact.github.split('/').filter(Boolean).pop() || 'GitHub';
                textEl.textContent = username;
            }
        });
    }
}

/**
 * Lighten a hex color
 * @param {string} color - The hex color
 * @param {number} percent - The percentage to lighten
 */
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ===================================
// DOM Elements
// ===================================
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const projectsGrid = document.getElementById('projects-grid');
const contactForm = document.getElementById('contact-form');
const navLinks = document.querySelectorAll('.nav-link');

// ===================================
// Initialize App
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    // Load data from API (with fallback to hardcoded data)
    await loadSettingsFromAPI();
    await loadProjectsFromAPI();
    
    // Initialize UI components
    initScrollAnimations();
    initNavbarScroll();
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
    initActiveNavigation();
    lazyLoadImages();
});

// ===================================
// Render Projects
// ===================================
function renderProjects() {
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = projects.map((project, index) => {
        const isFeatured = project.featured === true;
        
        return `
        <article class="project-card group ${isFeatured ? 'md:col-span-2 lg:col-span-3' : ''} bg-white rounded-xl overflow-hidden border ${isFeatured ? 'border-[#3d003b]/30 ring-1 ring-[#3d003b]/10' : 'border-[#e8e8e8]'} hover:border-[#3d003b]/30 reveal hover:shadow-lg ${isFeatured ? 'relative' : ''}" style="transition-delay: ${index * 100}ms">
            ${isFeatured ? `
            <!-- Featured Badge -->
            <div class="absolute top-4 left-4 z-10 bg-[#3d003b] text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                My Digital Marketing Agency
            </div>
            ` : ''}
            
            <!-- Project Content -->
            <div class="${isFeatured ? 'grid md:grid-cols-2 gap-0' : ''}">
                <!-- Project Image -->
                <div class="relative ${isFeatured ? 'h-64 md:h-full' : 'h-52'} overflow-hidden">
                    <img 
                        src="${project.image}" 
                        alt="${project.title}" 
                        class="project-image w-full h-full object-cover lazy-image"
                        loading="lazy"
                        onload="this.classList.add('loaded')"
                    >
                    ${!isFeatured ? `
                    <!-- Overlay -->
                    <div class="project-overlay absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent flex items-end p-4">
                        <a href="${project.link}" target="_blank" rel="noopener" 
                            class="w-full bg-[#3d003b] hover:bg-[#5a0058] text-white py-2 rounded-lg font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2">
                            <span>View Live Site</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                        </a>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Project Info -->
                <div class="p-5 ${isFeatured ? 'md:p-8 flex flex-col justify-center' : ''}">
                    <h3 class="${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg'} font-bold text-[#1a1a1a] mb-2 group-hover:text-[#3d003b] transition-colors">
                        ${project.title}
                    </h3>
                    <p class="text-[#666666] ${isFeatured ? 'text-base md:text-lg mb-6' : 'text-sm mb-4'} ${isFeatured ? '' : 'line-clamp-2'}">
                        ${project.description}
                    </p>
                    
                    <!-- Technologies -->
                    <div class="flex flex-wrap gap-2 ${isFeatured ? 'mb-6' : ''}">
                        ${project.technologies.map(tech => `
                            <span class="tech-badge ${isFeatured ? 'text-sm px-4 py-1.5' : ''}">${tech}</span>
                        `).join('')}
                    </div>
                    
                    ${isFeatured ? `
                    <!-- CTA Button for Featured -->
                    <a href="${project.link}" target="_blank" rel="noopener" 
                        class="inline-flex items-center justify-center gap-2 bg-[#3d003b] hover:bg-[#5a0058] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 w-full md:w-auto">
                        <span>Visit My Agency Website</span>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </a>
                    ` : ''}
                </div>
            </div>
        </article>
    `}).join('');
    
    // Re-initialize scroll animations for new elements
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
}

// ===================================
// Scroll Animations
// ===================================
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => observer.observe(el));
}

// ===================================
// Navbar Scroll Effect
// ===================================
function initNavbarScroll() {
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// Mobile Menu
// ===================================
function initMobileMenu() {
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('open');
        
        // Animate hamburger icon
        const icon = mobileMenuBtn.querySelector('path');
        if (mobileMenu.classList.contains('open')) {
            icon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
        } else {
            icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        }
    });
    
    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('open');
            const icon = mobileMenuBtn.querySelector('path');
            icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        });
    });
}

// ===================================
// Smooth Scroll
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// Active Navigation
// ===================================
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        const navbarHeight = navbar.offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ===================================
// Contact Form
// ===================================
function initContactForm() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Sending...</span>
        `;
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Reset form and show success
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
    });
}

// ===================================
// Toast Notification
// ===================================
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            ${type === 'success' 
                ? '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
                : '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
            }
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===================================
// Lazy Load Images
// ===================================
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
            img.classList.add('loaded');
        });
    }
}

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance
function debounce(func, wait = 20) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===================================
// Add More Projects Easily
// ===================================
// To add a new project, simply add it to the projects array above:
//
// {
//     title: "Your Project Name",
//     description: "Brief description of your project",
//     image: "https://your-image-url.com/image.jpg",
//     technologies: ["Tech1", "Tech2", "Tech3"],
//     link: "https://your-project-url.com"
// }
//
// The website will automatically display the new project!
