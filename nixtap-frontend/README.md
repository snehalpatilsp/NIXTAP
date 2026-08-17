# NIXTAP — React Frontend Application

The **NIXTAP Frontend** is a modern, responsive single-page web application built with **React 18**, **Vite**, **Bootstrap 5**, and **React Router v6**. It provides an interactive client portal for digital business cards, profile editing, NFC pairing, portfolio management, analytics visualizer, QR code rendering, appointment bookings, and feedback collection.

---

## ✨ Features & Functionality

* 🔐 **Authentication**: User Registration, Login, Session Management, JWT storage, Automatic Token Refresh via Axios Interceptors.
* 💳 **Digital Business Cards**: Interactive digital business card builder with customizable themes and NFC connectivity.
* 👤 **User Profiles**: Manage profile avatars, contact details, bio, and social media links.
* 🖼️ **Portfolio Management**: Showcase projects, skills, media attachments, and work highlights.
* 📱 **QR Code Generation**: Dynamic QR codes powered by `qrcode` for quick card sharing and scanning.
* 📊 **Analytics Dashboard**: Engagement metrics, page views, and interactions visualizer.
* 📅 **Meetings & Appointments**: Book time slots, manage schedules, and client availability.
* 💬 **Feedback & Reviews**: Submit and display user reviews and ratings.
* 🛠️ **Admin Portal**: Platform statistics, user auditing, and administrative management.

---

## 🛠️ Technology Stack & Dependencies

| Technology | Version / Tool | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 18 (`react`, `react-dom`) | UI Component Architecture |
| **Build Tool** | Vite 6 | Rapid Development Server & Bundler |
| **Routing** | React Router DOM v6 | Single Page Application Navigation & Protected Routes |
| **HTTP Client** | Axios | API Client with Request/Response Interceptors |
| **Styling** | Bootstrap 5 & Bootstrap Icons | Responsive UI Layouts & Iconography |
| **Utilities** | qrcode | Dynamic Client-Side QR Generation |

---

## 📁 Directory Structure

```
nixtap-frontend/
├── index.html              # HTML Entry Point
├── package.json            # NPM Dependencies & Scripts
├── vite.config.js          # Vite Configuration & Dev Proxy Setup
└── src/
    ├── main.jsx            # React Entry Point & Global Mount
    ├── App.jsx             # Route Definitions & Main Layout
    ├── index.css           # Global Styles & Custom CSS Tokens
    ├── api/                # Axios Instances & Service Interceptors
    ├── components/         # Reusable UI Components (Navbar, Cards, Modals)
    ├── context/            # React Contexts (AuthContext, ThemeContext)
    └── pages/              # Application Pages (Login, Dashboard, Profile, etc.)
```

---

## ⚙️ Development Setup & Installation

### Prerequisites
* **Node.js**: v18+ or v20+ recommended
* **npm**: v9+ or v10+

### 1. Install Dependencies
Navigate into the `nixtap-frontend` directory and install the required npm packages:

```bash
cd nixtap-frontend
npm install
```

### 2. Configure Backend Proxy
The Vite development server is pre-configured in `vite.config.js` to proxy `/api` requests to the Spring Cloud API Gateway at `http://localhost:8080`.

Ensure the **NIXTAP Backend** (API Gateway and required microservices) is running before launching the frontend.

### 3. Run Development Server
Start the local development server:

```bash
npm run dev
```

The application will launch on `http://localhost:3000` (or `http://localhost:5173`).

---

## 📦 Production Build & Preview

To create an optimized production build:

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

---

## 📜 Available NPM Scripts

* `npm run dev`: Launches Vite dev server with Hot Module Replacement (HMR).
* `npm run build`: Bundles assets into the `dist/` directory for production deployment.
* `npm run preview`: Spins up a local server to preview the built `dist/` files.

---

## 📄 License

Internal / Proprietary project for **NIXTAP Platform**.
