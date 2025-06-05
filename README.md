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
- **Internal linking** with `[[wikilinks]]` syntax
- **Interactive graph view** for visualizing relationships between entries
- **Modern glassmorphism UI**, dark/light themes, and complete theming engine
- **Progressive Web App (PWA)** installable on any device
- **Zero telemetry, zero vendor lock-in**

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

### Installation

```bash
git clone https://github.com/your-org/inkrypt.git
cd inkrypt
npm install
```

### Development

Run the following commands to lint, build, and start the application:

```bash
npm run lint      # check code quality
npm run build     # create a production build
npm run dev       # start the development server
```
