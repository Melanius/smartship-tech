-- Add image_url column to technologies table
ALTER TABLE technologies
ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment
COMMENT ON COLUMN technologies.image_url IS 'URL to technology representative image stored in Supabase Storage';
