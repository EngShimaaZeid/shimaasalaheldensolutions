// ===================================
// Admin Panel JavaScript
// ===================================
// Handles all admin panel functionality:
// - Authentication
// - Project CRUD operations
// - Drag & drop reordering
// - Theme customization
// - Contact info management
// ===================================

// ===================================
// Global State
// ===================================
let projects = [];
let settings = {};
let skills = [];
let sortableInstance = null;

// ===================================
// Initialize Admin Panel
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    initMobileMenu();
    initThemeForm();
    initContactForm();
    initPasswordForm();
    initImageUpload();
    loadDashboardData();
});

// ===================================
// Authentication Functions
// ===================================

/**
 * Check if user is authenticated
 * Redirects to login if not authenticated
 */
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.isAuthenticated) {
            window.location.href = '/admin';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin';
    }
}

/**
 * Logout user and redirect to login page
 */
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/admin';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/admin';
    }
}

// ===================================
// Navigation Functions
// ===================================

/**
 * Show a specific section and hide others
 * @param {string} sectionName - The section to show
 */
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'projects': 'Manage Projects',
        'theme': 'Theme Customization',
        'skills': 'Manage Skills',
        'contact': 'Contact Information',
        'settings': 'Account Settings'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';
    
    // Close mobile sidebar
    closeMobileSidebar();
    
    // Load section-specific data
    if (sectionName === 'projects') {
        loadProjects();
    } else if (sectionName === 'theme' || sectionName === 'contact') {
        loadSettings();
    } else if (sectionName === 'skills') {
        loadSkillsSection();
    }
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    toggleBtn?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', closeMobileSidebar);
}

/**
 * Toggle sidebar visibility on mobile
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('open');
    overlay.classList.add('hidden');
}

// ===================================
// Dashboard Functions
// ===================================

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadProjects(),
        loadSettings()
    ]);
}

/**
 * Load dashboard statistics
 */
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        // Update stats display
        document.getElementById('stat-total-projects').textContent = stats.totalProjects || 0;
        document.getElementById('stat-featured-projects').textContent = stats.featuredProjects || 0;
        document.getElementById('stat-theme-color').textContent = stats.primaryColor || '#3d003b';
        document.getElementById('theme-color-preview').style.backgroundColor = stats.primaryColor || '#3d003b';
        
        // Format last updated
        if (stats.lastUpdated) {
            const date = new Date(stats.lastUpdated);
            document.getElementById('stat-last-updated').textContent = date.toLocaleDateString();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ===================================
// Projects Functions
// ===================================

/**
 * Load all projects from API
 */
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        projects = await response.json();
        
        // Sort by order
        projects.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        renderProjects();
        renderRecentProjects();
        initSortable();
    } catch (error) {
        console.error('Error loading projects:', error);
        showToast('Failed to load projects', 'error');
    }
}

/**
 * Render projects list with drag handles
 */
function renderProjects() {
    const container = document.getElementById('projects-list');
    const emptyState = document.getElementById('projects-empty');
    
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '';
        emptyState?.classList.remove('hidden');
        return;
    }
    
    emptyState?.classList.add('hidden');
    
    container.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <!-- Drag Handle -->
            <div class="drag-handle">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                </svg>
            </div>
            
            <!-- Thumbnail -->
            <img src="${project.image}" alt="${project.title}" class="project-thumbnail" onerror="this.src='https://via.placeholder.com/80x60?text=No+Image'">
            
            <!-- Info -->
            <div class="project-info">
                <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="project-title">${escapeHtml(project.title)}</h4>
                    ${project.featured ? '<span class="featured-badge"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Featured</span>' : ''}
                </div>
                <a href="${project.link}" target="_blank" class="project-link hover:text-primary">${project.link}</a>
            </div>
            
            <!-- Actions -->
            <div class="project-actions">
                <button onclick="editProject('${project.id}')" class="action-btn edit" title="Edit">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
                <button onclick="openDeleteModal('${project.id}')" class="action-btn delete" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Render recent projects on dashboard
 */
function renderRecentProjects() {
    const container = document.getElementById('recent-projects');
    if (!container) return;
    
    const recentProjects = projects.slice(0, 5);
    
    if (recentProjects.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No projects yet</p>';
        return;
    }
    
    container.innerHTML = recentProjects.map(project => `
        <div class="recent-project-item">
            <img src="${project.image}" alt="${project.title}" class="recent-project-thumb" onerror="this.src='https://via.placeholder.com/48x36?text=No+Image'">
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-800 truncate">${escapeHtml(project.title)}</h4>
                <p class="text-xs text-gray-500 truncate">${project.link}</p>
            </div>
            ${project.featured ? '<span class="text-yellow-500"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>' : ''}
        </div>
    `).join('');
}

/**
 * Initialize SortableJS for drag and drop reordering
 */
function initSortable() {
    const container = document.getElementById('projects-list');
    if (!container || projects.length === 0) return;
    
    // Destroy existing instance
    if (sortableInstance) {
        sortableInstance.destroy();
    }
    
    // Create new Sortable instance
    sortableInstance = new Sortable(container, {
        handle: '.drag-handle',
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: async function(evt) {
            // Get new order of project IDs
            const projectIds = Array.from(container.children).map(el => el.dataset.id);
            
            try {
                const response = await fetch('/api/projects/reorder', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectIds })
                });
                
                if (response.ok) {
                    showToast('Projects reordered successfully', 'success');
                    loadProjects(); // Reload to get updated order
                } else {
                    showToast('Failed to reorder projects', 'error');
                }
            } catch (error) {
                console.error('Reorder error:', error);
                showToast('Failed to reorder projects', 'error');
            }
        }
    });
}

// ===================================
// Project Modal Functions
// ===================================

/**
 * Open project modal for adding new project
 */
async function openProjectModal() {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    
    // Load skills and render checkboxes
    await loadSkills();
    renderSkillsCheckboxes([]);
    
    // Reset form
    form.reset();
    document.getElementById('project-id').value = '';
    document.getElementById('modal-title').textContent = 'Add New Project';
    document.getElementById('save-btn-text').textContent = 'Save Project';
    
    // Reset image preview
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('upload-placeholder').classList.remove('hidden');
    
    modal.classList.remove('hidden');
}

/**
 * Open project modal for editing existing project
 * @param {string} projectId - The project ID to edit
 */
async function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('project-modal');
    
    // Load skills and render checkboxes with project's technologies selected
    await loadSkills();
    renderSkillsCheckboxes(project.technologies || []);
    
    // Fill form with project data
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-link').value = project.link;
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('project-featured').checked = project.featured || false;
    
    // Show current image
    const previewImg = document.getElementById('preview-img');
    const imagePreview = document.getElementById('image-preview');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    
    previewImg.src = project.image;
    imagePreview.classList.remove('hidden');
    uploadPlaceholder.classList.add('hidden');
    
    document.getElementById('modal-title').textContent = 'Edit Project';
    document.getElementById('save-btn-text').textContent = 'Update Project';
    
    modal.classList.remove('hidden');
}

/**
 * Close project modal
 */
function closeProjectModal() {
    document.getElementById('project-modal').classList.add('hidden');
}

/**
 * Save project (create or update)
 */
async function saveProject() {
    const projectId = document.getElementById('project-id').value;
    const title = document.getElementById('project-title').value.trim();
    const link = document.getElementById('project-link').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const technologies = getSelectedSkills(); // Get technologies from checkboxes
    const featured = document.getElementById('project-featured').checked;
    const imageInput = document.getElementById('project-image');
    
    // Validation
    if (!title) {
        showToast('Project name is required', 'error');
        return;
    }
    
    if (!link) {
        showToast('Project URL is required', 'error');
        return;
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('link', link);
    formData.append('description', description);
    formData.append('technologies', technologies.join(',')); // Convert array to comma-separated string
    formData.append('featured', featured);
    
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }
    
    try {
        const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(projectId ? 'Project updated successfully' : 'Project created successfully', 'success');
            closeProjectModal();
            loadProjects();
            loadStats();
        } else {
            showToast(data.error || 'Failed to save project', 'error');
        }
    } catch (error) {
        console.error('Save project error:', error);
        showToast('Failed to save project', 'error');
    }
}

/**
 * Initialize image upload area
 */
function initImageUpload() {
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('project-image');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleImageSelect(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageSelect(e.target.files[0]);
        }
    });
    
    function handleImageSelect(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// ===================================
// Delete Functions
// ===================================

/**
 * Open delete confirmation modal
 * @param {string} projectId - The project ID to delete
 */
function openDeleteModal(projectId) {
    console.log('Opening delete modal for project:', projectId);
    const modal = document.getElementById('delete-modal');
    const hiddenInput = document.getElementById('delete-project-id');
    
    if (!modal || !hiddenInput) {
        console.error('Delete modal elements not found');
        showToast('Error: Delete modal not found', 'error');
        return;
    }
    
    hiddenInput.value = projectId;
    modal.classList.remove('hidden');
}

/**
 * Close delete confirmation modal
 */
function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Confirm and execute project deletion
 */
async function confirmDelete() {
    const projectId = document.getElementById('delete-project-id').value;
    
    if (!projectId) {
        showToast('No project selected for deletion', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            showToast('Project deleted successfully', 'success');
            closeDeleteModal();
            loadProjects();
            loadStats();
        } else {
            let errorMessage = 'Failed to delete project';
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch (e) {
                // Response may not be JSON
            }
            
            if (response.status === 401) {
                showToast('Session expired. Please login again.', 'error');
                setTimeout(() => window.location.href = '/admin', 2000);
                return;
            }
            
            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete project. Check your connection.', 'error');
    }
}

// ===================================
// Skills Management Functions
// ===================================

/**
 * Load skills from API
 */
async function loadSkills() {
    try {
        const response = await fetch('/api/skills');
        skills = await response.json();
        return skills;
    } catch (error) {
        console.error('Error loading skills:', error);
        return [];
    }
}

/**
 * Load skills for the Skills Management section
 */
async function loadSkillsSection() {
    await loadSkills();
    renderSkillsList();
}

/**
 * Render skills list in the Skills Management section
 */
function renderSkillsList() {
    const container = document.getElementById('skills-list');
    const countEl = document.getElementById('skills-count');
    const emptyEl = document.getElementById('skills-empty');
    
    if (!container) return;
    
    countEl.textContent = skills.length;
    
    if (skills.length === 0) {
        container.innerHTML = '';
        emptyEl?.classList.remove('hidden');
        return;
    }
    
    emptyEl?.classList.add('hidden');
    
    container.innerHTML = skills.map(skill => `
        <span class="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm group transition-colors">
            <span>${skill}</span>
            <button onclick="deleteSkill('${skill.replace(/'/g, "\\'")}')" class="text-gray-400 hover:text-red-500 transition-colors" title="Delete skill">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </span>
    `).join('');
}

/**
 * Add a new skill from the Skills Management section
 */
async function addSkill() {
    const input = document.getElementById('new-skill-input');
    const skillName = input.value.trim();
    
    if (!skillName) {
        showToast('Please enter a skill name', 'error');
        return;
    }
    
    if (skills.includes(skillName)) {
        showToast('This skill already exists', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skillName })
        });
        
        if (response.ok) {
            input.value = '';
            await loadSkillsSection();
            showToast('Skill added successfully', 'success');
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to add skill', 'error');
        }
    } catch (error) {
        console.error('Error adding skill:', error);
        showToast('Failed to add skill', 'error');
    }
}

/**
 * Delete a skill
 */
async function deleteSkill(skillName) {
    if (!confirm(`Are you sure you want to delete "${skillName}"?`)) return;
    
    try {
        const response = await fetch(`/api/skills/${encodeURIComponent(skillName)}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            await loadSkillsSection();
            showToast('Skill deleted successfully', 'success');
        } else {
            let errorMessage = 'Failed to delete skill';
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch (e) {
                // Response may not be JSON
            }
            
            if (response.status === 401) {
                showToast('Session expired. Please login again.', 'error');
                setTimeout(() => window.location.href = '/admin', 2000);
                return;
            }
            
            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error deleting skill:', error);
        showToast('Failed to delete skill. Check your connection.', 'error');
    }
}

/**
 * Render skills checkboxes in the project modal
 * @param {Array} selectedSkills - Array of skills to pre-select
 */
function renderSkillsCheckboxes(selectedSkills = []) {
    const container = document.getElementById('skills-checkbox-container');
    if (!container) return;
    
    if (skills.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm col-span-full">No skills available. Add skills in the Skills section.</p>';
        return;
    }
    
    container.innerHTML = skills.map(skill => {
        const isChecked = selectedSkills.includes(skill);
        const escapedSkill = skill.replace(/"/g, '&quot;');
        return `
            <label class="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                <input type="checkbox" name="project-skills" value="${escapedSkill}" ${isChecked ? 'checked' : ''} 
                    class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
                <span>${skill}</span>
            </label>
        `;
    }).join('');
}

/**
 * Get selected skills from checkboxes
 */
function getSelectedSkills() {
    const checkboxes = document.querySelectorAll('input[name="project-skills"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Add a new skill inline from the project modal
 */
async function addSkillFromModal() {
    const input = document.getElementById('inline-skill-input');
    const skillName = input.value.trim();
    
    if (!skillName) return;
    
    if (skills.includes(skillName)) {
        showToast('This skill already exists', 'error');
        input.value = '';
        return;
    }
    
    try {
        const response = await fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skillName })
        });
        
        if (response.ok) {
            await loadSkills();
            // Get currently selected skills and add the new one
            const currentSelected = getSelectedSkills();
            currentSelected.push(skillName);
            renderSkillsCheckboxes(currentSelected);
            input.value = '';
            showToast('Skill added', 'success');
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to add skill', 'error');
        }
    } catch (error) {
        console.error('Error adding skill:', error);
        showToast('Failed to add skill', 'error');
    }
}

// ===================================
// Settings Functions
// ===================================

/**
 * Load settings from API
 */
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        settings = await response.json();
        
        // Update theme form with full palette
        if (settings.theme) {
            const palette = {
                primary: settings.theme.primaryColor || '#6C2F4E',
                secondary: settings.theme.secondaryColor || '#5B5A3C',
                accent: settings.theme.accentColor || '#9A7C7C',
                background: settings.theme.backgroundColor || '#E0DCD9',
                white: settings.theme.whiteColor || '#FFFFFF'
            };
            
            // Set color pickers and hex inputs
            Object.keys(palette).forEach(key => {
                const picker = document.getElementById(`${key}-color-picker`);
                const hex = document.getElementById(`${key}-color-hex`);
                const dot = document.getElementById(`${key}-dot`);
                
                if (picker) picker.value = palette[key];
                if (hex) hex.value = palette[key];
                if (dot) dot.style.backgroundColor = palette[key];
            });
            
            updatePalettePreview(palette);
        }
        
        // Update contact form
        if (settings.contact) {
            document.getElementById('contact-email').value = settings.contact.email || '';
            document.getElementById('contact-phone').value = settings.contact.phone || '';
            document.getElementById('contact-whatsapp').value = settings.contact.whatsapp || '';
            document.getElementById('contact-linkedin').value = settings.contact.linkedin || '';
            document.getElementById('contact-github').value = settings.contact.github || '';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Initialize theme form handlers for full color palette
 */
function initThemeForm() {
    const themeForm = document.getElementById('theme-form');
    const colorKeys = ['primary', 'secondary', 'accent', 'background', 'white'];
    
    // Set up each color picker and hex input pair
    colorKeys.forEach(key => {
        const picker = document.getElementById(`${key}-color-picker`);
        const hex = document.getElementById(`${key}-color-hex`);
        const dot = document.getElementById(`${key}-dot`);
        
        // Sync color picker to hex input
        picker?.addEventListener('input', (e) => {
            hex.value = e.target.value;
            if (dot) dot.style.backgroundColor = e.target.value;
            updatePalettePreviewFromInputs();
        });
        
        // Sync hex input to color picker
        hex?.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase();
            if (!value.startsWith('#')) {
                value = '#' + value;
            }
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                picker.value = value;
                if (dot) dot.style.backgroundColor = value;
                updatePalettePreviewFromInputs();
            }
        });
    });
    
    // Handle form submission
    themeForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const palette = getPaletteFromInputs();
        
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme: {
                        primaryColor: palette.primary,
                        secondaryColor: palette.secondary,
                        accentColor: palette.accent,
                        backgroundColor: palette.background,
                        whiteColor: palette.white,
                        primaryColorHover: lightenColor(palette.primary, 15),
                        secondaryColorHover: lightenColor(palette.secondary, 15)
                    }
                })
            });
            
            if (response.ok) {
                showToast('Color palette updated successfully', 'success');
                loadStats();
            } else {
                showToast('Failed to update color palette', 'error');
            }
        } catch (error) {
            console.error('Theme update error:', error);
            showToast('Failed to update color palette', 'error');
        }
    });
}

/**
 * Get current palette values from form inputs
 */
function getPaletteFromInputs() {
    return {
        primary: document.getElementById('primary-color-hex')?.value || '#6C2F4E',
        secondary: document.getElementById('secondary-color-hex')?.value || '#5B5A3C',
        accent: document.getElementById('accent-color-hex')?.value || '#9A7C7C',
        background: document.getElementById('background-color-hex')?.value || '#E0DCD9',
        white: document.getElementById('white-color-hex')?.value || '#FFFFFF'
    };
}

/**
 * Update preview using current input values
 */
function updatePalettePreviewFromInputs() {
    const palette = getPaletteFromInputs();
    updatePalettePreview(palette);
}

/**
 * Update the live preview with palette colors
 */
function updatePalettePreview(palette) {
    // Hero section
    const hero = document.getElementById('preview-hero');
    const heroText = document.getElementById('preview-hero-text');
    const primaryBtn = document.getElementById('preview-primary-btn');
    
    if (hero) hero.style.backgroundColor = palette.primary;
    if (heroText) heroText.style.color = palette.white;
    if (primaryBtn) {
        primaryBtn.style.backgroundColor = palette.white;
        primaryBtn.style.color = palette.primary;
    }
    
    // Section background
    const section = document.getElementById('preview-section');
    if (section) section.style.backgroundColor = palette.background;
    
    // Secondary button
    const secondaryBtn = document.getElementById('preview-secondary-btn');
    if (secondaryBtn) {
        secondaryBtn.style.backgroundColor = palette.secondary;
        secondaryBtn.style.color = palette.white;
    }
    
    // Accent button
    const accentBtn = document.getElementById('preview-accent-btn');
    if (accentBtn) {
        accentBtn.style.backgroundColor = 'transparent';
        accentBtn.style.color = palette.accent;
        accentBtn.style.borderColor = palette.accent;
    }
    
    // Card
    const card = document.getElementById('preview-card');
    if (card) card.style.backgroundColor = palette.white;
    
    // Badge
    const badge = document.getElementById('preview-badge');
    if (badge) {
        badge.style.backgroundColor = palette.accent;
        badge.style.color = palette.white;
    }
}

/**
 * Apply preset color palette
 */
function applyPresetPalette(presetName) {
    const presets = {
        elegant: {
            primary: '#6C2F4E',
            secondary: '#5B5A3C',
            accent: '#9A7C7C',
            background: '#E0DCD9',
            white: '#FFFFFF'
        },
        modern: {
            primary: '#1a1a2e',
            secondary: '#16213e',
            accent: '#0f3460',
            background: '#e8e8e8',
            white: '#FFFFFF'
        },
        ocean: {
            primary: '#0f766e',
            secondary: '#115e59',
            accent: '#5eead4',
            background: '#f0fdfa',
            white: '#FFFFFF'
        },
        sunset: {
            primary: '#be185d',
            secondary: '#9d174d',
            accent: '#f9a8d4',
            background: '#fdf2f8',
            white: '#FFFFFF'
        }
    };
    
    const palette = presets[presetName];
    if (!palette) return;
    
    // Update all inputs
    Object.keys(palette).forEach(key => {
        const picker = document.getElementById(`${key}-color-picker`);
        const hex = document.getElementById(`${key}-color-hex`);
        const dot = document.getElementById(`${key}-dot`);
        
        if (picker) picker.value = palette[key];
        if (hex) hex.value = palette[key];
        if (dot) dot.style.backgroundColor = palette[key];
    });
    
    updatePalettePreview(palette);
    showToast(`Applied "${presetName}" palette. Click Save to apply.`, 'info');
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

/**
 * Initialize contact form handlers
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const contact = {
            email: document.getElementById('contact-email').value.trim(),
            phone: document.getElementById('contact-phone').value.trim(),
            whatsapp: document.getElementById('contact-whatsapp').value.trim(),
            linkedin: document.getElementById('contact-linkedin').value.trim(),
            github: document.getElementById('contact-github').value.trim()
        };
        
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact })
            });
            
            if (response.ok) {
                showToast('Contact information updated successfully', 'success');
            } else {
                showToast('Failed to update contact information', 'error');
            }
        } catch (error) {
            console.error('Contact update error:', error);
            showToast('Failed to update contact information', 'error');
        }
    });
}

/**
 * Initialize password form handlers
 */
function initPasswordForm() {
    const passwordForm = document.getElementById('password-form');
    
    passwordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validation
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast('Password changed successfully', 'success');
                passwordForm.reset();
            } else {
                showToast(data.error || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Password change error:', error);
            showToast('Failed to change password', 'error');
        }
    });
}

// ===================================
// Utility Functions
// ===================================

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type: 'success', 'error', or 'info'
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon and style based on type
    toast.className = toast.className.replace(/toast-\w+/g, '');
    toast.classList.add(`toast-${type}`);
    
    const icons = {
        success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
        error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
        info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };
    
    const colors = {
        success: 'bg-green-100 text-green-600',
        error: 'bg-red-100 text-red-600',
        info: 'bg-blue-100 text-blue-600'
    };
    
    toastIcon.innerHTML = icons[type] || icons.info;
    toastIcon.className = `w-8 h-8 rounded-full flex items-center justify-center ${colors[type] || colors.info}`;
    
    // Show toast
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('toast-show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('toast-show');
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - The text to escape
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// Expose functions to global scope for onclick handlers
// ===================================
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.deleteSkill = deleteSkill;
window.editProject = editProject;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.saveProject = saveProject;
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
