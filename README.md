# Khmer-Fresh Food Shop 🥗

A full-stack restaurant ordering system for a Cambodian food shop: a customer storefront with cart and checkout, plus an admin dashboard with a POS terminal, orders, delivery and reports. This repository contains the **React frontend**.

> ⚠️ **Practice / portfolio project.** All data is fake. Payments are simulated.

🔗 **Live demo:** https://food-shop-api.vercel.app

⏳ The backend runs on a free plan. If it has been idle, the first load can take about 50 seconds while the server wakes up.

🧩 **Backend repository:** https://github.com/Chana758/Food_Shop_Backend

![Home](docs/screenshots/home.png)

## ⚠️ Demo notice

- This is a demo with **fake data**. Data may be reset or deleted at any time.
- **Do not use real accounts.** Please don't register with your real email, phone number, address or password. Use the demo accounts below.
- **KHQR is demo only.** The QR code uses a fake merchant ID, so no real payment can be made or confirmed. Please do not try to pay with a real bank app. Use **Cash on Delivery** to test checkout.

## Demo accounts

| Role  | Email                    | Password        |
| ----- | ------------------------ | --------------- |
| Admin | `demo-admin@example.com` | `DemoAdmin@2026` |
| Staff | `demo-staff@example.com` | `DemoStaff@2026` |
| User  | `demo-user@example.com`  | `DemoUser@2026`  |

These passwords are for this demo only.

## Features

### Customer
- Browse the menu by category, with search, price range and sorting
- Product pages with discounts and customer reviews
- Favorites, shopping cart and checkout (Cash on Delivery; KHQR is demo only)
- Table reservation
- Khmer / English language switch

### Staff
- Dashboard with sales, orders, low-stock alerts and live order queues
- POS terminal with cash, card and KHQR (demo) payment and receipt printing
- Handle orders and table reservations
- Read customer contacts and reviews
- View payments

### Admin
Everything Staff can do, plus:
- Manage products, categories, delivery and tables
- Manage staff and customers
- Reports, scheduled backups, trash and site settings

## Screenshots

| Categories | Admin dashboard |
| --- | --- |
| ![Categories](docs/screenshots/category.png) | ![Dashboard](docs/screenshots/dashboard.png) |

## Tech stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | React, Vite, Tailwind CSS, React Router      |
| Data       | Axios, custom hooks, react-i18next           |
| Payments   | KHQR (Bakong), demo mode only                |
| Backend    | Laravel (PHP)                                |
| Database   | Supabase (PostgreSQL)                        |
| Deployment | Vercel (frontend), Docker on Render (backend) |

## Getting started

```bash
git clone https://github.com/Chana758/Food_Shop_API.git
cd Food_Shop_API
npm install
npm run dev
```

By default the app uses the hosted backend. To use a local Laravel backend, create `.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Author

**Chana** · [GitHub](https://github.com/Chana758)