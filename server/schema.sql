-- =============================================
-- DataSell Platform - Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by VARCHAR(20),
  balance DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sell orders table
CREATE TABLE IF NOT EXISTS sell_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_gb INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completes_at TIMESTAMP NOT NULL
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  upi_id VARCHAR(100),
  bank_details JSONB,
  method VARCHAR(10) DEFAULT 'upi',
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  rejection_reason VARCHAR(255),
  processed_by UUID REFERENCES admins(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed',
  added_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bonus_amount DECIMAL(10,2) DEFAULT 50,
  status VARCHAR(20) DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin actions audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  action_type VARCHAR(50),
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id INT DEFAULT 1 PRIMARY KEY,
  min_withdrawal DECIMAL(10,2) DEFAULT 200,
  rate_per_gb DECIMAL(10,2) DEFAULT 200,
  sell_hours_per_gb INT DEFAULT 24,
  maintenance_mode BOOLEAN DEFAULT false,
  app_name VARCHAR(100) DEFAULT 'DataSell'
);

-- Insert default settings
INSERT INTO app_settings (id, min_withdrawal, rate_per_gb, sell_hours_per_gb, maintenance_mode, app_name)
VALUES (1, 200, 200, 24, false, 'DataSell')
ON CONFLICT (id) DO NOTHING;
