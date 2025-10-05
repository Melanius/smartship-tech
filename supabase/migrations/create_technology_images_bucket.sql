-- Create storage bucket for technology images
INSERT INTO storage.buckets (id, name, public)
VALUES ('technology-images', 'technology-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public read access
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'technology-images');

-- Policy: Authenticated users can upload
CREATE POLICY IF NOT EXISTS "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'technology-images');

-- Policy: Authenticated users can update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'technology-images')
WITH CHECK (bucket_id = 'technology-images');

-- Policy: Authenticated users can delete
CREATE POLICY IF NOT EXISTS "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'technology-images');
