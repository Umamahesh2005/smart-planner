-- 1. Create the user_trips table
CREATE TABLE IF NOT EXISTS user_trips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  author_name text,
  phone_number text,
  destination text NOT NULL,
  budget numeric,
  days int,
  people int,
  trip_data jsonb,
  allow_connect boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Create the mutual connections table
CREATE TABLE IF NOT EXISTS buddy_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a uuid REFERENCES auth.users NOT NULL,
  user_b uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'connected', -- for future expansion
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a, user_b)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE user_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_connections ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for user_trips
-- Users can always see their own trips
CREATE POLICY "Users can manage own trips" ON user_trips 
  FOR ALL USING (auth.uid() = user_id);

-- Everyone can see trips where allow_connect is true (Discoverability)
CREATE POLICY "Public trips are discoverable" ON user_trips 
  FOR SELECT USING (allow_connect = true);

-- 5. Create policies for connections
CREATE POLICY "Users can see their own connections" ON buddy_connections
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can initiate connections" ON buddy_connections
  FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- 6. Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_trips_destination ON user_trips (destination);
CREATE INDEX IF NOT EXISTS idx_user_trips_allow_connect ON user_trips (allow_connect);
