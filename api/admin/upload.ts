// Server-side upload endpoint for admin to use the Supabase service role key.
// Expects JSON: { fileName: string, fileType: string, contentBase64: string }

import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileName, fileType, contentBase64 } = req.body ?? {};
  if (!fileName || !contentBase64) return res.status(400).json({ error: 'Missing fileName or contentBase64' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) return res.status(500).json({ error: 'Supabase service not configured' });

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { global: { headers: { 'x-upsert': 'false' } } });

    // try upload
    const buffer = Buffer.from(contentBase64, 'base64');

    let uploadRes = await sb.storage.from('admission-documents').upload(fileName, buffer, { contentType: fileType });

    if (uploadRes.error) {
      // if bucket not found, attempt to create it then retry
      if (uploadRes.error.status === 404 || /bucket/i.test(uploadRes.error.message || '')) {
        try {
          const create = await sb.storage.createBucket('admission-documents', { public: false });
          if (create.error) {
            console.error('create bucket error', create.error);
            return res.status(500).json({ error: 'Failed to create storage bucket', details: create.error });
          }
          uploadRes = await sb.storage.from('admission-documents').upload(fileName, buffer, { contentType: fileType });
          if (uploadRes.error) return res.status(500).json({ error: 'Upload failed after creating bucket', details: uploadRes.error });
        } catch (e: any) {
          console.error('bucket create exception', e);
          return res.status(500).json({ error: 'Bucket create error', details: e?.message });
        }
      } else {
        console.error('upload error', uploadRes.error);
        return res.status(500).json({ error: 'Upload failed', details: uploadRes.error });
      }
    }

    return res.status(200).json({ ok: true, path: uploadRes.data?.path ?? null });
  } catch (err: any) {
    console.error('server upload handler', err);
    return res.status(500).json({ error: err.message ?? 'server upload failed' });
  }
}
