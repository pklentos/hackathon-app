-- Create participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 1 AND 40),
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 60),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 300),
  capacity INTEGER NOT NULL CHECK (capacity BETWEEN 2 AND 8),
  creator_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  is_seeded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Enforce one membership per participant
  UNIQUE(participant_id)
);

-- Create indexes for common queries

-- Index for finding projects by creator
CREATE INDEX idx_projects_creator_id ON projects(creator_id);

-- Index for ordering projects (newest first)
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Index for finding memberships by project
CREATE INDEX idx_memberships_project_id ON memberships(project_id);

-- Index for finding membership by participant (also enforced by UNIQUE constraint)
CREATE INDEX idx_memberships_participant_id ON memberships(participant_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for project catalog with computed fields
CREATE VIEW project_catalog AS
SELECT 
  p.id,
  p.title,
  p.description,
  p.capacity,
  p.creator_id,
  p.is_seeded,
  p.created_at,
  p.updated_at,
  COALESCE(COUNT(m.id), 0)::INTEGER AS member_count,
  CASE 
    WHEN COALESCE(COUNT(m.id), 0) >= p.capacity THEN 'full'
    ELSE 'open'
  END AS status
FROM projects p
LEFT JOIN memberships m ON p.id = m.project_id
GROUP BY p.id, p.title, p.description, p.capacity, p.creator_id, p.is_seeded, p.created_at, p.updated_at;

-- Enable Row Level Security on all tables
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participants table
-- Allow anyone to read participant display names (needed for showing team members)
CREATE POLICY "Allow public read access to participants"
  ON participants FOR SELECT
  USING (true);

-- Prevent direct inserts/updates/deletes (these will be handled by functions)
CREATE POLICY "Prevent direct participant modifications"
  ON participants FOR ALL
  USING (false);

-- RLS Policies for projects table
-- Allow anyone to read projects
CREATE POLICY "Allow public read access to projects"
  ON projects FOR SELECT
  USING (true);

-- Prevent direct inserts/updates/deletes (these will be handled by functions)
CREATE POLICY "Prevent direct project modifications"
  ON projects FOR ALL
  USING (false);

-- RLS Policies for memberships table
-- Allow anyone to read memberships (needed for showing team composition)
CREATE POLICY "Allow public read access to memberships"
  ON memberships FOR SELECT
  USING (true);

-- Prevent direct inserts/updates/deletes (these will be handled by functions)
CREATE POLICY "Prevent direct membership modifications"
  ON memberships FOR ALL
  USING (false);

-- Note: Later migrations will add authenticated functions for:
-- - Participant registration
-- - Project creation/editing/deletion
-- - Joining/leaving/switching projects
-- These functions will bypass RLS and enforce proper authorization
