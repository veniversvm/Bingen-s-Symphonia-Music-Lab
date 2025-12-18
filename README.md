# 🎻 Bingen's Symphonia Music Lab

> **An offline-first, interactive music theory platform built with SolidJS, NestJS, and VexFlow.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-SolidJS_|_NestJS_|_TypeScript-355C7D)
![Status](https://img.shields.io/badge/status-Alpha-orange)

**Bingen's Symphonia** bridges the gap between theoretical study and interactive practice. Unlike static flashcards, it uses a **Hybrid Generation Engine** to create infinite musical exercises (Chords, Intervals, Melodic Dictation) that adapt to the user's skill level.

It runs smoothly at 60fps on mobile devices thanks to **SolidJS** fine-grained reactivity and features a full **Offline Mode** via PWA and IndexedDB.

---

## 🚀 Key Features

*   **🎼 Real-Time Notation:** Dynamic rendering of staves and notes using **VexFlow**, reacting instantly to user input.
*   **🎹 In-Browser Synthesis:** High-quality audio generation with **Tone.js** (no static mp3 files required).
*   **⚡ Offline-First Architecture:**
    *   Exercises are generated locally if the network is down.
    *   Progress is saved to **Dexie.js (IndexedDB)** and synced with the backend when online.
*   **🎨 Adaptive UI:** A "Music Paper" aesthetic (Light Mode) and "Cyberpunk/Nocturne" mode (Dark Mode) powered by **Tailwind CSS v4** and **DaisyUI**.
*   **🧠 Smart Analytics:** The backend tracks specific error patterns (e.g., *Perfect 4th vs Perfect 5th confusion*) to tailor future challenges.

---

## 🏗 Architecture (Monorepo)

This project uses **Yarn Workspaces** to share logic between the Server and the Client.

| Workspace | Technology | Description |
| :--- | :--- | :--- |
| **`packages/core`** | TypeScript | **Shared Logic.** Contains music theory algorithms, types, and the Exercise Generator. Used by both API and Web. |
| **`apps/web`** | SolidJS + Vite | **Frontend.** The PWA interface. Handles VexFlow rendering, Audio, and Local State. |
| **`apps/api`** | NestJS + Prisma | **Backend.** REST API for user auth, data synchronization, and heavy analytics. |

### The Hybrid Strategy
1.  **Online:** The API generates challenges based on the user's global ELO score.
2.  **Offline:** The Frontend imports the generator from `@bingens/core` and creates challenges locally.

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js v18+
*   Yarn (`npm i -g yarn`)
*   Docker (Optional, for PostgreSQL)

### Installation

1.  **Clone the repository**
    ```bash
    git clone git@github.com:veniversvm/Bingen-s-Symphonia-Music-Lab.git
    cd bingens-symphonia-music-lab
    ```

2.  **Install Dependencies (Monorepo root)**
    ```bash
    yarn install
    ```

3.  **Start Database (Docker)**
    ```bash
    docker-compose up -d
    ```

4.  **Run Development Environment**
    This command starts the Shared Core (watch mode), Backend, and Frontend simultaneously.
    ```bash
    yarn dev
    ```

    *   **Frontend:** http://localhost:3001
    *   **Backend:** http://localhost:3000

---

## 📦 Deployment

### Frontend (Vercel)
The web app is optimized for Vercel.
*   **Root Directory:** `apps/web`
*   **Build Command:** `cd ../.. && yarn install && yarn workspace @bingens/core build && cd apps/web && yarn build`
*   **Output Directory:** `dist`

### Backend (Railway/Docker)
The backend uses a multi-stage Dockerfile located in the root to access the shared packages.
*   **Root Directory:** `/` (Project Root)
*   **Dockerfile:** `Dockerfile`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <i>Developed with ❤️ by Veniversum for Music Students everywhere.</i>
</p>