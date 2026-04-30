-- ============================================
-- Migration 002: New card fields for redesigned form
-- ============================================
-- Run via: wrangler d1 execute mfgc-db --remote --file=db/migration-002-card-fields.sql

-- Card design extras
ALTER TABLE cards ADD COLUMN border_style TEXT DEFAULT 'gold';

-- Nationality (separate from location)
ALTER TABLE cards ADD COLUMN nationality TEXT;
ALTER TABLE cards ADD COLUMN nationality_code TEXT;

-- First course geo data (from Mapbox)
ALTER TABLE cards ADD COLUMN first_course_country TEXT;
ALTER TABLE cards ADD COLUMN first_course_lat REAL;
ALTER TABLE cards ADD COLUMN first_course_lon REAL;

-- Local / home course
ALTER TABLE cards ADD COLUMN local_course TEXT;
ALTER TABLE cards ADD COLUMN local_course_lat REAL;
ALTER TABLE cards ADD COLUMN local_course_lon REAL;

-- Dream round fields
ALTER TABLE cards ADD COLUMN dream_partner TEXT;
ALTER TABLE cards ADD COLUMN dream_course TEXT;
