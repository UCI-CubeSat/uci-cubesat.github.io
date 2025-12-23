# UCI CubeSat Website 🛰️

This repository contains the official website for UCI CubeSat, built using React, TypeScript, and Vite. The website showcases our mission, team members, and ongoing projects in space technology development.

**Live Site:** [ucicubesat.space](https://ucicubesat.space)

## 🚀 Development Setup

1. Clone the repository:
```bash
git clone https://github.com/UCI-CubeSat/uci-cubesat.github.io.git
cd uci-cubesat.github.io
```

2. Install dependencies (using pnpm):
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Build for production:
```bash
pnpm build
```

> **Note:** This project uses [pnpm](https://pnpm.io/) as the package manager. If you don't have it installed, run `npm install -g pnpm` first.

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components (Navbar, Footer, Layout)
├── pages/          # Page components
│   ├── home/       # Home page
│   ├── aboutus/    # About Us pages (What We Do, Meet the Team)
│   └── contact/    # Contact page
├── assets/         # Static assets
└── index.css       # Global styles
public/
├── images/         # Logos and background images
├── photos/         # Team and subsystem photos
└── Headshots/      # Team member headshots
```

## 🚢 Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

## 🤝 Contributing

This is a repository for UCI CubeSat members. Please contact the webmaster team for access and contribution guidelines.
