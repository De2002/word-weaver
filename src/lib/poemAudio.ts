 import { supabase } from '@/integrations/supabase/client';
 
 interface PoemAudioFile {
   poem_id: string;
   storage_path: string;
 }
 
 /**
  * Fetches audio URLs for a list of poem IDs
  * Returns a Map of poem_id -> public audio URL
  */
 export async function fetchPoemAudioUrls(poemIds: string[]): Promise<Map<string, string>> {
   const audioMap = new Map<string, string>();
   
   if (poemIds.length === 0) return audioMap;
 
   const { data: audioFiles } = await supabase
     .from('poem_audio_files')
     .select('poem_id, storage_path')
     .in('poem_id', poemIds);
 
   if (audioFiles && audioFiles.length > 0) {
     for (const audio of audioFiles as PoemAudioFile[]) {
       const { data: urlData } = supabase.storage
         .from('poem-audio')
         .getPublicUrl(audio.storage_path);
       
       if (urlData?.publicUrl) {
         audioMap.set(audio.poem_id, urlData.publicUrl);
       }
     }
   }
 
   return audioMap;
 }