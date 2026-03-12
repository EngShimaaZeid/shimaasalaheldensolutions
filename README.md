# Professional Portfolio Website

A modern, clean, and minimal portfolio website for Web Developers. Built with HTML, Tailwind CSS, and vanilla JavaScript.

## Features

- **Modern Design**: Clean, professional, and minimal design
- **Fully Responsive**: Optimized for all screen sizes
- **Smooth Animations**: Subtle scroll-triggered animations
- **Easy to Customize**: Just edit the projects array to add new projects
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Fast Loading**: Uses Tailwind CSS via CDN, lazy loading for images
- **Mobile-First**: Responsive navigation with mobile menu

## Sections

1. **Hero Section** - Introduction with CTA buttons
2. **Projects Section** - Showcase of your work in a card grid
3. **Skills Section** - Your technical skills with icons
4. **About Section** - Information about you
5. **Contact Section** - Contact methods and form

## How to Run

### Option 1: Open Directly
Simply double-click `index.html` to open it in your browser.

### Option 2: Use Live Server (Recommended)
1. Install VS Code extension "Live Server"
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Use Python HTTP Server
```bash
# Navigate to project folder
cd portfolio-website

# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

### Option 4: Use Node.js HTTP Server
```bash
# Install serve globally
npm install -g serve

# Run server
serve .

# Then open the provided URL
```

## How to Add New Projects

Open `script.js` and add a new object to the `projects` array:

```javascript
const projects = [
    // ... existing projects
    
    // Add your new project here:
    {
        title: "Your Project Name",
        description: "Brief description of your project",
        image: "https://your-image-url.com/image.jpg",  // or "./images/project.jpg"
        technologies: ["React", "Tailwind CSS", "Node.js"],
        link: "https://your-project-live-url.com"
    }
];
```

The website will automatically display your new project!

## Customization

### Change Colors
Edit the Tailwind config in `index.html`:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#0f172a',      // Main background
                secondary: '#1e293b',    // Card/section background
                accent: '#3b82f6',       // Accent color (blue)
                'accent-hover': '#2563eb', // Accent hover state
            }
        }
    }
}
```

### Update Contact Information
Find and replace in `index.html`:
- Phone: `+1 (234) 567-890`
- WhatsApp link: `https://wa.me/1234567890`
- Email: `hello@example.com`

### Change Profile Information
Edit these sections in `index.html`:
- Hero section title and description
- About section content
- Stats numbers (years, projects, satisfaction)

## File Structure

```
portfolio-website/
├── index.html      # Main HTML file
├── styles.css      # Custom CSS styles & animations
├── script.js       # JavaScript (projects data & interactivity)
├── README.md       # This file
└── images/         # (Optional) Local images folder
```

## Deployment

### Deploy to Netlify (Free)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Done! Your site is live.

### Deploy to GitHub Pages (Free)
1. Create a GitHub repository
2. Push your code
3. Go to Settings → Pages
4. Select "main" branch and save
5. Your site will be live at `https://yourusername.github.io/repo-name`

### Deploy to Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy with one click

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Tips for Best Results

1. **Use High-Quality Images**: Project screenshots should be at least 600x400px
2. **Write Clear Descriptions**: Keep project descriptions concise but informative
3. **Update Regularly**: Add new projects as you complete them
4. **Test on Mobile**: Always verify the mobile experience

## License

Feel free to use this template for your personal portfolio!

---

Built with ❤️ using HTML, Tailwind CSS, and JavaScript
