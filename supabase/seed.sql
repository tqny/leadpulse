-- Seed data for LeadPulse
-- Run after creating a user in Supabase Auth and setting OWNER_USER_ID

-- Replace this UUID with your actual user ID from Supabase Auth
-- You can find it in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
  owner_id uuid := '00000000-0000-0000-0000-000000000000'; -- REPLACE with your actual user UUID
BEGIN

-- Leads: mix of statuses with realistic data
INSERT INTO leads (user_id, name, phone, email, city, state, job_type, service_type, message, source, status, estimated_sqft, quote_amount, follow_up_date, created_at) VALUES
  (owner_id, 'Mike Johnson', '(512) 555-0142', 'mike.j@email.com', 'Austin', 'TX', 'Residential Garage', 'Full Flake Epoxy', 'Interested in getting a quote for my 2-car garage. Want something durable.', 'facebook_webhook', 'new', NULL, NULL, NULL, now() - interval '25 minutes'),
  (owner_id, 'Sarah Williams', '(713) 555-0198', NULL, 'Houston', 'TX', 'Residential Garage', 'Metallic Epoxy', NULL, 'facebook_webhook', 'new', NULL, NULL, NULL, now() - interval '6 hours'),
  (owner_id, 'David Martinez', '(214) 555-0276', 'dmartinez@gmail.com', 'Dallas', 'TX', 'Commercial Floor', 'Solid Color Epoxy', 'Looking to redo our warehouse floor. About 3000 sqft.', 'text_paste', 'contacted', 3000, NULL, NULL, now() - interval '2 days'),
  (owner_id, 'Jennifer Brown', '(210) 555-0331', 'jbrown@outlook.com', 'San Antonio', 'TX', 'Patio/Outdoor', 'Polyaspartic Coating', 'Want to update our back patio before summer.', 'facebook_webhook', 'contacted', 400, NULL, (current_date + interval '3 days')::date, now() - interval '3 days'),
  (owner_id, 'Robert Taylor', '(817) 555-0415', NULL, 'Fort Worth', 'TX', 'Basement Floor', 'Epoxy + Polyaspartic', 'How soon can you start? We need this done within 2 weeks.', 'facebook_webhook', 'no_response', 800, NULL, (current_date - interval '1 day')::date, now() - interval '5 days'),
  (owner_id, 'Lisa Anderson', '(480) 555-0523', 'lisa.anderson@email.com', 'Phoenix', 'AZ', 'Commercial Floor', 'Quartz Epoxy', 'Need pricing for our new retail space. Approx 2500 sqft.', 'text_paste', 'proposal', 2500, 8750, (current_date + interval '5 days')::date, now() - interval '7 days'),
  (owner_id, 'James Wilson', '(303) 555-0647', 'jwilson@company.com', 'Denver', 'CO', 'Showroom Floor', 'Metallic Epoxy', 'Want to update our showroom floors before the grand opening next month.', 'facebook_webhook', 'proposal', 1800, 7200, (current_date + interval '2 days')::date, now() - interval '10 days'),
  (owner_id, 'Maria Garcia', '(615) 555-0789', NULL, 'Nashville', 'TN', 'Residential Garage', 'Full Flake Epoxy', 'Saw your work on a neighbors garage. Would love a similar look.', 'facebook_webhook', 'won', 600, 2400, NULL, now() - interval '14 days'),
  (owner_id, 'Chris Thompson', '(704) 555-0812', 'cthompson@email.com', 'Charlotte', 'NC', 'Workshop Floor', 'Solid Color Epoxy', 'Setting up a woodworking shop. Need a tough floor.', 'text_paste', 'lost', 500, 1750, NULL, now() - interval '21 days');

-- Activities spread across leads
INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Called, went to voicemail.', l.created_at + interval '1 hour'
FROM leads l WHERE l.name = 'David Martinez' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'texted', 'Sent intro text with service info.', l.created_at + interval '2 hours'
FROM leads l WHERE l.name = 'David Martinez' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Spoke with David. Interested in solid color for warehouse.', l.created_at + interval '1 day'
FROM leads l WHERE l.name = 'David Martinez' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Left voicemail about patio coating options.', l.created_at + interval '4 hours'
FROM leads l WHERE l.name = 'Jennifer Brown' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'texted', 'Followed up via text. She asked for photos of past work.', l.created_at + interval '1 day'
FROM leads l WHERE l.name = 'Jennifer Brown' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Called twice, no answer.', l.created_at + interval '6 hours'
FROM leads l WHERE l.name = 'Robert Taylor' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'left_voicemail', 'Left voicemail with callback number.', l.created_at + interval '1 day'
FROM leads l WHERE l.name = 'Robert Taylor' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'texted', 'Sent follow-up text. No response yet.', l.created_at + interval '3 days'
FROM leads l WHERE l.name = 'Robert Taylor' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Had a great call. She wants quartz for the retail space.', l.created_at + interval '3 hours'
FROM leads l WHERE l.name = 'Lisa Anderson' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'proposal_sent', 'Sent proposal: 2500 sqft quartz epoxy at $3.50/sqft = $8,750.', l.created_at + interval '2 days'
FROM leads l WHERE l.name = 'Lisa Anderson' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Discussed metallic options for showroom. Very enthusiastic.', l.created_at + interval '1 day'
FROM leads l WHERE l.name = 'James Wilson' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'proposal_sent', 'Sent proposal: 1800 sqft metallic epoxy at $4.00/sqft = $7,200.', l.created_at + interval '3 days'
FROM leads l WHERE l.name = 'James Wilson' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'follow_up_scheduled', 'Following up next week to check on decision.', l.created_at + interval '5 days'
FROM leads l WHERE l.name = 'James Wilson' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Quick call. She loved the neighbor reference. Booked site visit.', l.created_at + interval '2 hours'
FROM leads l WHERE l.name = 'Maria Garcia' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'proposal_sent', 'Proposal sent: 600 sqft full flake at $4.00/sqft = $2,400.', l.created_at + interval '3 days'
FROM leads l WHERE l.name = 'Maria Garcia' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'note', 'Accepted proposal! Scheduled install for next Friday.', l.created_at + interval '5 days'
FROM leads l WHERE l.name = 'Maria Garcia' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'called', 'Talked about workshop needs. Wants basic solid color.', l.created_at + interval '4 hours'
FROM leads l WHERE l.name = 'Chris Thompson' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'proposal_sent', 'Sent quote: $1,750 for 500 sqft solid color.', l.created_at + interval '2 days'
FROM leads l WHERE l.name = 'Chris Thompson' AND l.user_id = owner_id;

INSERT INTO activities (lead_id, user_id, type, content, created_at)
SELECT l.id, owner_id, 'note', 'Decided to go with a local competitor. Price was the factor.', l.created_at + interval '7 days'
FROM leads l WHERE l.name = 'Chris Thompson' AND l.user_id = owner_id;

END $$;
