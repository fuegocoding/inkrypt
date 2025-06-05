# Inkrypt

**Inkrypt** is an open-source, privacy-first journaling application built for the modern user. Inspired by [Obsidian](https://obsidian.md), it brings powerful Markdown editing, local encrypted storage, graph-based navigation, and full offline capabilities—all within a cross-platform, web-based experience.

> **Built with:** TypeScript • React • Vite • TailwindCSS • IndexedDB • Web Crypto API  
> **Deployment targets:** PWA • Desktop (Electron/Tauri) • Mobile (Capacitor)

---

## 🛡️ Purpose

Inkrypt is designed to be your **personal journaling sanctuary**—an encrypted, extensible space that never stores your data in the cloud by default. All entries are written in Markdown and stored **locally**, with optional user-controlled export or sync.

---

## ✨ Key Features

- **Markdown-based journaling** with live preview
- **End-to-end local encryption** using AES-256 (Web Crypto API)
- **Local-first file system** with folders and nested structure (IndexedDB or File System Access API)
- **Custom templates** for recurring entries
- **Tagging, calendar view, and timeline navigation**
- **Built-in templates** for quick daily or gratitude notes
- **Export notes** to JSON
- **Tag filtering** and search
- **Internal linking** with `[[wikilinks]]` syntax *(implemented)*
- **Interactive graph view** for visualizing relationships between entries *(experimental)*
- **Modern glassmorphism UI**, dark/light themes, and complete theming engine
- **Progressive Web App (PWA)** installable on any device
- **Zero telemetry, zero vendor lock-in**

### ⚠️ Disclaimer
The encryption in Inkrypt has **not** been professionally audited. Use it for personal purposes at your own risk.

---

## 🧱 Tech Stack

| Layer            | Technology                                     |
|------------------|------------------------------------------------|
| Language         | TypeScript                                     |
| Frontend         | React + Vite                                   |
| State Management | Zustand                                        |
| Styling          | TailwindCSS                                    |
| Storage          | IndexedDB (Dexie.js or idb)                    |
| Encryption       | Web Crypto API (AES-GCM 256)                   |
| Graph View       | D3.js or Cytoscape.js                          |
| Packaging        | PWA, Electron, Tauri, or Capacitor (optional)  |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x (or `pnpm` / `yarn`)
- Git

### Installation

```bash
git clone https://github.com/fuegocoding/inkrypt.git
cd inkrypt
npm install
```

### Development

```bash
npm run dev
```

Start the development server and open <http://localhost:5173> in your browser.

On first launch you'll be prompted to **set a passphrase**. This passphrase is
used to encrypt your journal locally. Enter the same value in both fields to
continue. Subsequent launches will ask for this passphrase to unlock your notes.

### Linting
Run ESLint to check code quality.

```bash
npm run lint
```

### Build
Build the app for production.

```bash
npm run build
```

### Preview
Serve the production build locally.

```bash
npm run preview
```

### Theming
Use the dropdown in the header to switch between built-in themes. Selecting **Custom** exposes a JSON editor where you can define your own CSS variables, which are saved to local storage.

### Templates and Export
Use the "Insert Template" dropdown to start a note from a built-in template. Notes can be exported at any time via the **Export** button in the header, which downloads a `inkrypt-notes.json` file.

## 🌐 Deployment

After running `npm run build`, the compiled files are placed in the `dist/` directory. Host these static files at the root of your domain so that the PWA manifest's `start_url` of `/` resolves correctly.

### Nginx

1. Copy the contents of `dist/` to your web server.
2. Configure Nginx to serve the directory:

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/inkrypt/dist;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Vercel

1. Install the [Vercel CLI](https://vercel.com/docs/cli) and run `vercel` in the project root.
2. When prompted for the output directory, enter `dist`.
3. The site will be deployed to a Vercel URL that can be mapped to your custom domain.
