-- Migration: Add used_prompt and template columns to public.visitor_posters
-- Safe to re-run thanks to IF NOT EXISTS

alter table if exists public.visitor_posters
  add column if not exists used_prompt text,
  add column if not exists template text;

-- Optional: no indexes needed for these text fields right now
-- RLS: existing policies continue to apply


