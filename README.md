# 🏠 RuralSync - Client Portal

> Customer-facing web application for discovering and booking rural services.

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)

🔗 **Live Demo:** [https://ruralsync.vercel.app/](https://ruralsync.vercel.app/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Related Projects](#related-projects)

---

## 🎯 Overview

RuralSync Client is the customer-facing portal of the RuralSync platform - a marketplace connecting rural communities with local service providers. Customers can discover services, book appointments, track their bookings, and leave reviews.

---

## ✨ Features

### 🔍 Service Discovery
- **Smart Search** - Find services by name, category, or description
- **Location-Based Search** - Discover services near you with geo-location
- **Advanced Filters** - Filter by price range, rating, category, and distance
- **Provider Profiles** - View detailed information about service providers

### 📅 Booking Management
- **Easy Booking** - Book services with preferred date and time
- **Availability Check** - Real-time availability checking
- **Booking History** - View past and upcoming bookings
- **Booking Status** - Track booking progress (Pending → Confirmed → In Progress → Completed)

### 👤 User Features
- **Secure Authentication** - JWT-based auth with HTTP-only cookies
- **Profile Management** - Update personal information and profile image
- **Reviews & Ratings** - Rate and review completed services
- **Password Management** - Change password securely

### 🎨 User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode** - Toggle between light and dark themes
- **Modern UI** - Beautiful interface built with shadcn/ui components

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI component library |
| **Zustand** | State management |
| **React Hot Toast** | Notifications |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RS-Monolith/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
client/
├── app/                    # Next.js App Router pages
│   ├── book/              # Booking flow
│   ├── bookings/          # User bookings list
│   ├── dashboard/         # User dashboard
│   ├── login/             # Authentication
│   ├── register/          # User registration
│   ├── search/            # Service search
│   ├── services/          # Service listings
│   └── providers/         # Provider profiles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── map/              # Map components
│   └── ...               # Feature components
├── lib/                   # Utilities
│   ├── api-service.ts    # API client
│   └── utils.ts          # Helper functions
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── public/               # Static assets
```

---

## 🔗 Related Projects

| Project | Description | Link |
|---------|-------------|------|
| **RuralSync API** | Backend API server | [https://ruralsyncapi.vercel.app/](https://ruralsyncapi.vercel.app/) |
| **Provider Portal** | Service provider dashboard | [https://ruralsync-service-provider.vercel.app/](https://ruralsync-service-provider.vercel.app/) |
| **Agent App** | Agent mobile/web app | [https://agent-rural-sync.vercel.app/](https://agent-rural-sync.vercel.app/) |

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of the RuralSync platform.

---

<p align="center">
  Made with ❤️ for Rural Communities
</p>
