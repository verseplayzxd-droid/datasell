# DataSell Platform — Full-Stack Web Application

A decentralized data marketplace where users sell unused mobile data and earn money.

**Total Cost: ₹0/month Forever** — Supabase Free + Render Free + Netlify Free

---

## 🏗️ Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React.js + Vite + Tailwind CSS v3 | Netlify |
| Backend | Node.js + Express.js | Render.com |
| Database | PostgreSQL | Supabase (Free) |
| Auth | JWT (7-day user / 24-hour admin) | — |
| Jobs | node-cron (every 5 min) | — |

---

## 📂 Project Structure

```
datasell/
├── client/                    # React frontend (Vite)
│   ├── public/
│   │   └── hero-phone.png
│   ├── src/
│   │   ├── api/axios.js       # Axios instances (user + admin)
│   │   ├── config/supabase.js # Frontend Supabase client
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, TopBar, BottomNav, Footer
│   │   │   ├── ui/            # AdZone, Skeleton
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SellDataPage.jsx
│   │   │   ├── WalletPage.jsx
│   │   │   ├── WithdrawalSuccessPage.jsx
│   │   │   ├── ReferralPage.jsx
│   │   │   ├── TransactionHistoryPage.jsx
│   │   │   └── admin/         # 8 admin pages
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env
│   ├── netlify.toml
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                    # Express backend
│   ├── config/supabase.js     # Supabase service client
│   ├── middleware/
│   │   ├── auth.js            # User JWT middleware
│   │   └── adminAuth.js       # Admin JWT middleware
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── sellController.js
│   │   ├── walletController.js
│   │   ├── referralController.js
│   │   └── adminController.js
│   ├── routes/                # API endpoints
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── sell.js
│   │   ├── wallet.js
│   │   ├── referral.js
│   │   └── admin.js
│   ├── cron/sellOrderCron.js  # Auto-complete job (every 5 min)
│   ├── utils/helpers.js
│   ├── index.js               # Server entry point
│   ├── schema.sql             # Supabase SQL schema
│   ├── render.yaml
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🚀 Deployment Guide (Step-by-Step)

### STEP 1 — Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Copy your **Project URL** and **anon key** (from Settings → API)
3. Copy your **service_role key** (from Settings → API → service_role)
4. Go to **SQL Editor**
5. Paste and run the entire contents of `server/schema.sql`
6. Done! Your database is ready.

### STEP 2 — GitHub

1. Create a new repo on [github.com](https://github.com)
2. Push the entire `datasell/` folder to the repo:
```bash
cd datasell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/datasell.git
git push -u origin main
```

### STEP 3 — Render (Backend)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Add **Environment Variables**:
   ```
   PORT = 5000
   SUPABASE_URL = your-supabase-project-url
   SUPABASE_SERVICE_KEY = your-service-role-key
   JWT_SECRET = datasell_super_secret_2024
   ADMIN_JWT_SECRET = datasell_admin_secret_2024
   ADMIN_EMAIL = aryanispro@gmail.com
   ADMIN_PASSWORD = @Aryanoo1pro
   CLIENT_URL = https://your-app.netlify.app
   ```
5. Deploy → Copy your **Render URL** (e.g. `https://datasell-backend.onrender.com`)

### STEP 4 — Netlify (Frontend)

1. Go to [netlify.com](https://netlify.com) → **Add new site** → Import from Git
2. Connect your GitHub repo
3. Set:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Add **Environment Variables**:
   ```
   VITE_API_URL = https://your-app.onrender.com
   VITE_SUPABASE_URL = your-supabase-project-url
   VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```
5. Deploy!

### STEP 5 — You're Live!

| Service | URL |
|---------|-----|
| User Site | `https://yourapp.netlify.app` |
| Admin Panel | `https://yourapp.netlify.app/admin/login` |
| Backend API | `https://yourapp.onrender.com` |

---

## 🔑 Admin Credentials

- **Email**: `aryanispro@gmail.com`
- **Password**: `@Aryanoo1pro`

---

## 📱 All Pages

### User Pages
| Route | Page |
|-------|------|
| `/` | Landing Page (hero, calculator, FAQ) |
| `/auth` | Login / Register with tabs |
| `/dashboard` | Stats, active order, transactions |
| `/sell` | 3-step sell flow (Select → Connect → Confirm) |
| `/wallet` | Balance, withdrawal form (UPI/Bank) |
| `/withdrawal-success` | Confetti + success animation |
| `/referrals` | Invite code, share, stats |
| `/history` | Transaction table with filters + CSV export |

### Admin Pages
| Route | Page |
|-------|------|
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Stats overview + recent activity |
| `/admin/users` | User management (search, ban, delete, add money) |
| `/admin/add-money` | Search user + add funds |
| `/admin/withdrawals` | Approve/reject withdrawals + bulk actions |
| `/admin/sell-orders` | View/force-complete sell orders |
| `/admin/transactions` | All transactions with filters + CSV |
| `/admin/announcements` | Create/toggle announcements |
| `/admin/settings` | Min withdrawal, rate, maintenance mode |

---

## 💰 Business Logic

- **Pricing**: ₹200 per GB (configurable in admin settings)
- **Completion Times**: 1GB=24h, 2GB=48h, 5GB=120h, 10GB=240h
- **Min Withdrawal**: ₹200 (configurable)
- **Referral Bonus**: ₹50 per friend
- **CRON**: Runs every 5 minutes, auto-completes orders + credits users

---

## 💸 Total Cost = ₹0/month FOREVER

| Service | Free Tier |
|---------|-----------|
| Supabase | 500MB database ✅ |
| Render | 750 hrs/month ✅ |
| Netlify | 100GB bandwidth ✅ |
