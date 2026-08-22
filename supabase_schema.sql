-- Sample Supabase Schema for Travel Dashboard

-- 1. Trips Table
-- Stores the core details of each trip, including embedded JSON lists for itineraries and to-dos.
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date_range VARCHAR(255),
    status VARCHAR(50) DEFAULT 'upcoming',
    image_url TEXT,
    itinerary JSONB DEFAULT '[]'::jsonb, -- Stores day-wise checklist items
    todos JSONB DEFAULT '[]'::jsonb,     -- Stores pre-trip to-do items
    budget_limit NUMERIC DEFAULT 0,      -- Overall budget limit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Expenses Table
-- Tracks individual expenses linked to specific trips.
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Notes Table
-- Stores user notes linked to a trip.
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id VARCHAR(255) DEFAULT 'default', -- Can be linked to trip UUID later
    trip_name VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Documents Table (Optional, for storing external file references)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Row Level Security (RLS) is assumed to be enabled on all tables 
-- so that users can only select/insert/update their own data (where auth.uid() = user_id).
