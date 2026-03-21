# Mnada Web Application

Mnada is a modern, full-stack e-commerce platform designed for curated fashion, craft, and lifestyle products. Built with a focus on speed, aesthetics, and user experience, it features a dynamic storefront and a robust administrative dashboard for comprehensive business management.

## 🚀 Features

### Storefront
- **Dynamic Catalog**: Browse products across various categories with deep filtering.
- **Mnada Journal**: A dedicated space for stories on craft, style, and movement.
- **Account Management**: Secure user profiles, order history, and shipping management.
- **Interactive Checkout**: Seamless checkout process with order reference generation.

### Admin Dashboard
- **Product Management**: Full CRUD operations for products with image gallery support via Supabase Storage.
- **Order Tracking**: Real-time order status management with automated customer SMS notifications via Tilil.
- **Journal Editor**: Integrated blog/article management for the store's journal.
- **Category Management**: Dynamic organization of the store's inventory.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Email**: [Resend](https://resend.com)
- **SMS Notifications**: [Tilil](https://tililtech.com)
- **Icons**: [Iconify](https://iconify.design)

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account and project

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mnada-webapp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_key
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Synchronize Auth**:
   Run the sync script to set up your initial admin credentials:
   ```bash
   npm run sync:auth
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

## 📄 License

This project is proprietary and for internal use by Mnada.

