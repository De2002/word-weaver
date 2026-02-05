-- Make poem-audio bucket public for audio playback
UPDATE storage.buckets 
SET public = true 
WHERE id = 'poem-audio';

-- Add policy for public read access to poem audio files
CREATE POLICY "Poem audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'poem-audio');