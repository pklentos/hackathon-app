-- Seed organizer-created projects for the hackathon
-- These projects are marked as is_seeded=true and have no creator_id

INSERT INTO projects (id, title, description, capacity, creator_id, is_seeded, created_at) VALUES
  (
    gen_random_uuid(),
    'Food Loop',
    'Match event kitchens with nearby community fridges so safe surplus meals can be claimed before they become waste.',
    3,
    NULL,
    true,
    now() - INTERVAL '1 day 5 hours'
  ),
  (
    gen_random_uuid(),
    'Water Watch',
    'Make public water-quality readings understandable through neighborhood alerts, plain-language summaries, and historical trends.',
    5,
    NULL,
    true,
    now() - INTERVAL '1 day 26 hours'
  );

-- Note: Additional organizer projects can be added by running similar INSERT statements
-- or by creating a new migration file.
