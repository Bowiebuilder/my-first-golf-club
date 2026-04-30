-- Migration 003: Avatar fields
ALTER TABLE cards ADD COLUMN avatar_id TEXT;
ALTER TABLE cards ADD COLUMN avatar_color TEXT;
