-- Shipping details schema migration
-- Run this in Supabase SQL editor AFTER customer-auth.sql

-- Add shipping fields to customer_profiles
alter table public.customer_profiles
  add column if not exists shipping_address text,
  add column if not exists shipping_apartment text,
  add column if not exists shipping_city text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_phone text;
