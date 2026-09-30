# Khmer-Fresh Food Shop 🥗

A full-stack restaurant ordering system with a customer storefront and an admin dashboard (POS, orders, products, reservations and more). This repository contains the **React frontend**.

🔗 **Live Demo:** https://food-shop-api.vercel.app

> ⏳ The API is hosted on a free plan. If the backend has been idle, the first load can take about 50 seconds while the server wakes up.

🧩 **Backend repository:** https://github.com/Chana758/Food_Shop_Backend

![Home page](docs/screenshots/home.png)

## Demo accounts

| Role  | Email                    | Password          |
| ----- | ------------------------ | ----------------- |
| Admin | `demo-admin@example.com` | `<demo-password>` |
| User  | `demo-user@example.com`  | `<demo-password>` |

## Features

### Customer

- Browse the menu with category filters, price range, search and sorting
- Category pages and product detail pages
- Ratings and reviews (with verified purchase badge)
- Favorites and shopping cart
- Table reservation
- Khmer / English language switch
- Register, log in and manage a profile

### Admin

- Dashboard with sales, orders, customers and low-stock alerts
- POS terminal: cash, card, KHQR and demo payments, receipt printing
- Manage products, categories, orders, delivery, tables and reservations
- Manage staff, customers, reviews, contacts and payments
- Reports, backup, trash and site settings

## Screenshots

| Home | Categories | Admin dashboard |
| ---- | ---------- | --------------- |
| ![Home](docs/screenshots/home.png) | ![Categories](docs/screenshots/category.png) | ![Dashboard](docs/screenshots/dashboard.png) |

## Tech stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React, Vite, Tailwind CSS, React Router       |
| Data       | Axios, custom hooks, react-i18next            |
| UI         | react-icons, react-hot-toast, AOS             |
| Backend    | Laravel (PHP), see the backend repository     |
| Database   | Supabase (PostgreSQL)                         |
| Deployment | Vercel (frontend), Docker on Render (backend) |

## Getting started

```bash
git clone https://github.com/Chana758/Food_Shop_API.git
cd Food_Shop_API
npm install
npm run dev
```

Optional `.env.local` to use a local backend:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If these are not set, the app uses the hosted backend on Render.

## Author

**Chana** · [GitHub](https://github.com/Chana758)
