
-- User memories table for persistent AI memory
CREATE TABLE public.user_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, memory_key)
);

ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memories" ON public.user_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own memories" ON public.user_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memories" ON public.user_memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own memories" ON public.user_memories FOR DELETE USING (auth.uid() = user_id);

-- Site settings table for admin controls (shutdown, notifications)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site settings (for shutdown check)
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT TO public USING (true);

-- Ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ratings" ON public.ratings FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert their own ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES 
  ('site_shutdown', '{"enabled": false, "message": "", "title": ""}'::jsonb),
  ('notification', '{"enabled": false, "title": "", "message": "", "textColor": "#ffffff", "bgColor": "#3B82F6"}'::jsonb);
