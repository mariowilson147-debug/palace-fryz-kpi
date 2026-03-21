# Palace Frys Management System (PFMS)

PFMS is an exclusive, single-owner luxury executive dashboard designed for managing multiple branches of Palace Frys. It captures sales across different payment methods, logs operational expenses, records waste, and provides high-level key performance indicators (KPIs) through interactive charts and PDF/CSV reports.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Black/Gold Premium Theme)
- **Database Backend**: Supabase (PostgreSQL)
- **Analytics**: Recharts
- **PDF Generation**: HTML2Canvas & jsPDF

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mariowilson147-debug/palace-fryz-kpi.git
   cd palace-fryz-kpi
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file with the following keys. Refer to `.env.example` if applicable.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   ADMIN_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret
   ```

4. **Initialize Database:**
   Apply the SQL script in `supabase/schema.sql` to your Supabase project via the Supabase SQL Editor.

5. **Run the Application Locally:**
   ```bash
   npm run dev
   ```

## Key Features
- **Environment-based Access**: Simple, secure single-user login for the absolute owner utilizing HttpOnly cookies.
- **Branches Module**: Register unlimited branches categorized by 'Single' or 'Dual' shift operations.
- **Sales & Expense Trackers**: Real-time sales categorization (Cash, M-Pesa, Credit) and expense description.
- **Waste Logger**: Master-detail module to track the volume and value of waste.
- **Executive Reports**: Dynamic Recharts rendering daily trends, achievement matrices, and single-click PDF exporting.
- **Audit Logs**: Automatic PostgreSQL triggers logging every mutation (`create`, `update`, `delete`) directly within the database for immutable history.

## Deployment
This project is deployment-ready for platforms like Vercel, Netlify, or any Node.js environment. Ensure all environment variables are populated safely in the production environment.
