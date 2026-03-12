// ===================================
// Portfolio Website - Backend Server
// ===================================
// This Express server provides API endpoints for the admin panel
// Features: Authentication, Project Management, Settings Management, File Upload
// ===================================

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// Middleware Configuration
// ===================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for authentication
app.use(session({
    secret: 'portfolio-admin-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ===================================
// File Upload Configuration (Multer)
// ===================================
// Configure storage for project images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'project-' + uniqueSuffix + ext);
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ===================================
// Data File Paths
// ===================================
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json');

// ===================================
// Helper Functions
// ===================================

// Read JSON file safely
function readJSONFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return null;
    }
}

// Write JSON file safely
function writeJSONFile(filePath, data) {
    try {
        // Ensure data directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized. Please login first.' });
    }
}

// ===================================
// Authentication Routes
// ===================================

// POST /api/auth/login - Admin login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const users = readJSONFile(USERS_FILE);
        if (!users || !users.admin) {
            return res.status(500).json({ error: 'User configuration error' });
        }

        const admin = users.admin;
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        
        if (username === admin.username && isValidPassword) {
            req.session.isAuthenticated = true;
            req.session.username = username;
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// POST /api/auth/logout - Admin logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// GET /api/auth/check - Check authentication status
app.get('/api/auth/check', (req, res) => {
    res.json({ 
        isAuthenticated: !!(req.session && req.session.isAuthenticated),
        username: req.session?.username || null
    });
});

// POST /api/auth/change-password - Change admin password
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        const users = readJSONFile(USERS_FILE);
        const admin = users.admin;

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        users.admin.password = hashedPassword;
        
        if (writeJSONFile(USERS_FILE, users)) {
            res.json({ success: true, message: 'Password changed successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save new password' });
        }
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// Projects API Routes
// ===================================

// GET /api/projects - Get all projects (public)
app.get('/api/projects', (req, res) => {
    const projects = readJSONFile(PROJECTS_FILE);
    res.json(projects || []);
});

// POST /api/projects - Create new project (protected)
app.post('/api/projects', requireAuth, upload.single('image'), (req, res) => {
    try {
        const { title, description, link, technologies, featured } = req.body;
        
        if (!title || !link) {
            return res.status(400).json({ error: 'Title and URL are required' });
        }

        const projects = readJSONFile(PROJECTS_FILE) || [];
        
        // Parse technologies from comma-separated string or JSON
        let techArray = [];
        if (technologies) {
            if (typeof technologies === 'string') {
                techArray = technologies.split(',').map(t => t.trim()).filter(t => t);
            } else {
                techArray = technologies;
            }
        }

        // Create new project object
        const newProject = {
            id: Date.now().toString(),
            title,
            description: description || '',
            image: req.file ? `/uploads/${req.file.filename}` : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
            technologies: techArray,
            link,
            featured: featured === 'true' || featured === true,
            order: projects.length,
            createdAt: new Date().toISOString()
        };

        projects.push(newProject);
        
        if (writeJSONFile(PROJECTS_FILE, projects)) {
            res.json({ success: true, project: newProject });
        } else {
            res.status(500).json({ error: 'Failed to save project' });
        }
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/projects/:id - Update project (protected)
app.put('/api/projects/:id', requireAuth, upload.single('image'), (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link, technologies, featured } = req.body;
        
        const projects = readJSONFile(PROJECTS_FILE) || [];
        const projectIndex = projects.findIndex(p => p.id === id);
        
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Parse technologies
        let techArray = projects[projectIndex].technologies;
        if (technologies) {
            if (typeof technologies === 'string') {
                techArray = technologies.split(',').map(t => t.trim()).filter(t => t);
            } else {
                techArray = technologies;
            }
        }

        // Update project
        projects[projectIndex] = {
            ...projects[projectIndex],
            title: title || projects[projectIndex].title,
            description: description !== undefined ? description : projects[projectIndex].description,
            link: link || projects[projectIndex].link,
            technologies: techArray,
            featured: featured === 'true' || featured === true,
            image: req.file ? `/uploads/${req.file.filename}` : projects[projectIndex].image,
            updatedAt: new Date().toISOString()
        };

        if (writeJSONFile(PROJECTS_FILE, projects)) {
            res.json({ success: true, project: projects[projectIndex] });
        } else {
            res.status(500).json({ error: 'Failed to update project' });
        }
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/projects/:id - Delete project (protected)
app.delete('/api/projects/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        
        const projects = readJSONFile(PROJECTS_FILE) || [];
        const projectIndex = projects.findIndex(p => p.id === id);
        
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete associated image file if it's a local upload
        const project = projects[projectIndex];
        if (project.image && project.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, project.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        projects.splice(projectIndex, 1);
        
        // Update order numbers
        projects.forEach((p, i) => p.order = i);
        
        if (writeJSONFile(PROJECTS_FILE, projects)) {
            res.json({ success: true, message: 'Project deleted' });
        } else {
            res.status(500).json({ error: 'Failed to delete project' });
        }
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/projects/reorder - Reorder projects (protected)
app.put('/api/projects/reorder', requireAuth, (req, res) => {
    try {
        const { projectIds } = req.body;
        
        if (!Array.isArray(projectIds)) {
            return res.status(400).json({ error: 'projectIds must be an array' });
        }

        const projects = readJSONFile(PROJECTS_FILE) || [];
        
        // Create a map for quick lookup
        const projectMap = new Map(projects.map(p => [p.id, p]));
        
        // Reorder projects based on the new order
        const reorderedProjects = projectIds
            .map((id, index) => {
                const project = projectMap.get(id);
                if (project) {
                    return { ...project, order: index };
                }
                return null;
            })
            .filter(p => p !== null);

        // Add any projects not in the reorder list at the end
        projects.forEach(p => {
            if (!projectIds.includes(p.id)) {
                reorderedProjects.push({ ...p, order: reorderedProjects.length });
            }
        });

        if (writeJSONFile(PROJECTS_FILE, reorderedProjects)) {
            res.json({ success: true, projects: reorderedProjects });
        } else {
            res.status(500).json({ error: 'Failed to reorder projects' });
        }
    } catch (error) {
        console.error('Reorder projects error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// Skills API Routes
// ===================================

// GET /api/skills - Get all available skills (public)
app.get('/api/skills', (req, res) => {
    try {
        const skillsData = readJSONFile(SKILLS_FILE);
        res.json(skillsData?.skills || []);
    } catch (error) {
        console.error('Error loading skills:', error);
        res.status(500).json({ error: 'Failed to load skills' });
    }
});

// POST /api/skills - Add a new skill (protected)
app.post('/api/skills', requireAuth, (req, res) => {
    try {
        const { skill } = req.body;
        
        if (!skill || typeof skill !== 'string' || skill.trim() === '') {
            return res.status(400).json({ error: 'Skill name is required' });
        }
        
        const skillName = skill.trim();
        const skillsData = readJSONFile(SKILLS_FILE) || { skills: [] };
        
        // Check if skill already exists (case-insensitive)
        const exists = skillsData.skills.some(
            s => s.toLowerCase() === skillName.toLowerCase()
        );
        
        if (exists) {
            return res.status(400).json({ error: 'Skill already exists' });
        }
        
        skillsData.skills.push(skillName);
        skillsData.skills.sort((a, b) => a.localeCompare(b)); // Sort alphabetically
        skillsData.updatedAt = new Date().toISOString();
        
        if (writeJSONFile(SKILLS_FILE, skillsData)) {
            res.json({ success: true, skills: skillsData.skills });
        } else {
            res.status(500).json({ error: 'Failed to save skill' });
        }
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/skills/:skillName - Delete a skill (protected)
app.delete('/api/skills/:skillName', requireAuth, (req, res) => {
    try {
        const skillName = decodeURIComponent(req.params.skillName);
        
        const skillsData = readJSONFile(SKILLS_FILE) || { skills: [] };
        
        const initialLength = skillsData.skills.length;
        skillsData.skills = skillsData.skills.filter(
            s => s.toLowerCase() !== skillName.toLowerCase()
        );
        
        if (skillsData.skills.length === initialLength) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        
        skillsData.updatedAt = new Date().toISOString();
        
        if (writeJSONFile(SKILLS_FILE, skillsData)) {
            res.json({ success: true, skills: skillsData.skills });
        } else {
            res.status(500).json({ error: 'Failed to delete skill' });
        }
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// Settings API Routes
// ===================================

// GET /api/settings - Get all settings (public for theme)
app.get('/api/settings', (req, res) => {
    const settings = readJSONFile(SETTINGS_FILE);
    res.json(settings || {});
});

// PUT /api/settings - Update settings (protected)
app.put('/api/settings', requireAuth, (req, res) => {
    try {
        const { theme, contact } = req.body;
        
        const currentSettings = readJSONFile(SETTINGS_FILE) || {};
        
        const updatedSettings = {
            ...currentSettings,
            theme: theme ? { ...currentSettings.theme, ...theme } : currentSettings.theme,
            contact: contact ? { ...currentSettings.contact, ...contact } : currentSettings.contact,
            updatedAt: new Date().toISOString()
        };

        if (writeJSONFile(SETTINGS_FILE, updatedSettings)) {
            res.json({ success: true, settings: updatedSettings });
        } else {
            res.status(500).json({ error: 'Failed to save settings' });
        }
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// Dashboard Stats API
// ===================================

// GET /api/stats - Get dashboard statistics (protected)
app.get('/api/stats', requireAuth, (req, res) => {
    try {
        const projects = readJSONFile(PROJECTS_FILE) || [];
        const settings = readJSONFile(SETTINGS_FILE) || {};
        
        res.json({
            totalProjects: projects.length,
            featuredProjects: projects.filter(p => p.featured).length,
            lastUpdated: settings.updatedAt || null,
            primaryColor: settings.theme?.primaryColor || '#3d003b'
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// Routes for serving HTML pages
// ===================================

// Admin login page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Admin dashboard (redirect to login if not authenticated)
app.get('/admin/dashboard', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
    } else {
        res.redirect('/admin');
    }
});

// Main portfolio page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===================================
// Error Handling Middleware
// ===================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: 'File upload error' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// ===================================
// Start Server
// ===================================
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Portfolio Server Running                             ║
║                                                           ║
║   Main Site:     http://localhost:${PORT}                   ║
║   Admin Panel:   http://localhost:${PORT}/admin             ║
║                                                           ║
║   Default Login:                                          ║
║   Username: admin                                         ║
║   Password: admin123                                      ║
║                                                           ║
║   ⚠️  Change the password after first login!              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
