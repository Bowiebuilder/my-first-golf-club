-- Migration 004: Optional social media links
ALTER TABLE cards ADD COLUMN social_instagram TEXT;
ALTER TABLE cards ADD COLUMN social_x TEXT;
ALTER TABLE cards ADD COLUMN social_facebook TEXT;
ALTER TABLE cards ADD COLUMN social_linkedin TEXT;
