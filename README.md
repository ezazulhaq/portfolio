# Ezazul Haq Abdul — AI Engineer, Agentic Architect & Lead Full-Stack Developer

A modern, accessible, and high-performance developer portfolio website built with **Angular 21**, featuring Server-Side Rendering (SSR), Static Site Generation (Prerendering), responsive design, and smooth animations.

🌐 **Live Website**: [https://portfolio-ezaz.web.app](https://portfolio-ezaz.web.app)

---

## Key Features

- **Angular 21 Application Builder**: Built using the modern `@angular/build:application` toolchain with prerendering and SSR.
- **Server-Side Rendering (SSR) & Prerendering**: Fast initial load times, zero layout shifts, and SEO-optimized static HTML generation.
- **Accessibility First (WCAG 2.1 AA Compliant)**:
  - Skip to main content link for keyboard navigators.
  - Accessible mobile drawer with `aria-expanded`, backdrop dismissal, and `Escape` key listeners.
  - Synchronized form validation states matching native `:user-invalid` and `aria-errormessage`.
  - Visible focus rings (`:focus-visible`) across all interactive elements.
- **Categorized Technical Skills Matrix**: Grouped by domain (*Generative AI & Agentic Architecture*, *Backend & Microservices*, *Frontend & UI*, *Cloud & DevOps*, *Database & Integrations*) with proficiency tags and animated progress bars covering RAG, Model Context Protocol (MCP), Google Agent SDK, LangChain/LangGraph, and Skill Architecture & Harness.
- **Interactive Experience & Project Showcase**: Detailed timeline covering 10+ years of enterprise engineering (Genpact, TCS) alongside featured live production projects including [The Taqwa Tracker](https://thetaqwatracker.com/) (an AI-powered Islamic companion PWA), [VividSpend](https://vividspend.chotabuziness.com) (a collaborative expense tracker & budget planner), and [Madarasa Al-Jamiya](https://aljamiyadarulsuffa.web.app).
- **Interactive Contact Workflow**: Direct links for phone, email, and Google Maps, paired with an accessible contact form supporting instant email client launch and clipboard copying.
- **Mobile-First Responsive Design**: Fluid layout styled with SCSS, Bootstrap 5, custom CSS variables, and sleek custom scrollbars.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **AI & Agentic Systems** | RAG, Model Context Protocol (MCP), Google Agent SDK, LangChain & LangGraph, Agentic Skill Architecture & Harness |
| **Framework** | [Angular 21](https://angular.dev/) (Standalone Components, Signals & Change Detection) |
| **Rendering** | `@angular/ssr` with Express.js server & static pre-rendering |
| **Backend & Cloud** | Java 21, Spring Boot, FastAPI, Python, Docker, Kubernetes, AWS, GCP, Cloud Firestore |
| **Styling** | SCSS, [Bootstrap 5.3](https://getbootstrap.com/), CSS Custom Properties |
| **Icons** | [Bootstrap Icons](https://icons.getbootstrap.com/), [Boxicons](https://boxicons.com/) |
| **Animations** | [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/) |
| **Hosting & CI/CD** | [Firebase Hosting](https://firebase.google.com/docs/hosting) |

---

## Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **Angular CLI**: Optional global install (`npm install -g @angular/cli@latest`)

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/ezazulhaq/portfolio.git
cd portfolio
npm install
```

### 2. Development Server

Start the local development server (configured on port **4201**):

```bash
npm start
# or
ng serve
```

Open your browser at `http://localhost:4201/`. The app will automatically hot-reload upon saving changes.

### 3. Production Build & Prerender

Generate optimized client bundles and prerendered static routes:

```bash
npm run build
```

Build outputs are generated in the `dist/portfolio` directory:
- `dist/portfolio/browser/`: Static client assets and prerendered HTML.
- `dist/portfolio/server/`: Node.js SSR server bundle.

### 4. Local SSR Preview

Test the Node.js SSR server locally:

```bash
npm run serve:ssr:portfolio
```

### 5. Watch Mode

Continuously build in development mode:

```bash
npm run watch
```

---

## Testing

Run unit tests via Karma and Jasmine:

```bash
npm test
```

---

## Deployment

The application is deployed on Firebase Hosting:

1. Install the Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Authenticate with Firebase:
   ```bash
   firebase login
   ```
3. Build and deploy in a single command:
   ```bash
   npm run deploy
   ```
   *(Runs `ng build && firebase deploy`)*

---

## Project Structure

```
portfolio/
├── angular.json                 # Angular build, prerender, and serve configurations
├── firebase.json                # Firebase Hosting rewrites and deployment rules
├── package.json                 # Dependencies and npm scripts
├── server.ts                    # Express.js server entry for SSR
├── src/
│   ├── index.html               # Main HTML entry with SEO and Google Fonts
│   ├── main.ts                  # Client bootstrap entry
│   ├── main.server.ts           # Server bootstrap entry for SSR
│   ├── styles.scss              # Global styles, variables, scrollbar, focus states
│   ├── app/
│   │   ├── app.component.*      # Root component, skip-link, mobile drawer & back-to-top
│   │   ├── header/              # Sidebar header, navigation links & social icons
│   │   ├── hero/                # Hero section with role typing animation & CTAs
│   │   ├── about/               # Bio, career metrics, and quick contact details
│   │   ├── skills/              # Categorized skills matrix & progress bars
│   │   ├── resume/              # Professional experience, projects, education & print CTA
│   │   ├── contact/             # Contact info cards, Google Maps & interactive form
│   │   └── footer/              # Dynamic copyright footer
│   └── assets/
│       ├── css/style.css        # Base theme CSS
│       ├── img/                 # Images & icons
│       └── js/main.js           # Client scrollspy and AOS triggers
```

---

## License

This project is licensed under the [MIT License](LICENSE).
