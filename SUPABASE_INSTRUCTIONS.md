# Supabase Setup Instructions for Profile Feature

This document is for the backend team member to set up the necessary Supabase tables and storage buckets to fully support the new Profile feature. 
The current frontend uses `localStorage` to simulate this behavior for the hackathon presentation. Once you set up the backend, the frontend can be updated to fetch from Supabase.

## 1. Storage Buckets

You need to create a storage bucket to hold user-uploaded images (profile pictures and trip photos).

1. Go to **Storage** in your Supabase Dashboard.
2. Click **New Bucket**.
3. Name the bucket `user-content` (or whatever you prefer, but be sure to update the frontend later).
4. Set it to **Public** so images can be rendered without signed URLs (optional, but easier for hackathons).
5. Add an RLS (Row Level Security) policy for the bucket:
   - Allow `SELECT` for everyone (if public).
   - Allow `INSERT`/`UPDATE` for authenticated users.

## 2. Update `profiles` Table

The current `profiles` table likely only has `id` and `name`. You need to add a column for the avatar URL.

```sql
-- Add avatar_url column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## 3. Create `past_trips` Table

This table will store the user's travel history.

```sql
CREATE TABLE public.past_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  location TEXT NOT NULL,
  trip_date TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.past_trips ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own trips
CREATE POLICY "Users can view their own trips" 
ON public.past_trips FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own trips
CREATE POLICY "Users can insert their own trips" 
ON public.past_trips FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own trips
CREATE POLICY "Users can update their own trips" 
ON public.past_trips FOR UPDATE 
USING (auth.uid() = user_id);
```

## 4. Future Saved Trips

Currently, the future trips are hardcoded in the frontend (`initialTripDays` in `Dashboard.tsx`). To make them dynamic, you would create a `saved_trips` table.

```sql
CREATE TABLE public.saved_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  days_range TEXT NOT NULL,
  city TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add similar policies as past_trips
ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;
```

## Frontend Integration Note

Once these tables are created, the frontend developer will need to:
1. Replace `localStorage` calls with `supabase.from('past_trips').select()` and `.insert()`.
2. Replace local `URL.createObjectURL(file)` with `supabase.storage.from('user-content').upload(...)`.
