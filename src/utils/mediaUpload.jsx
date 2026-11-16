import { createClient } from "@supabase/supabase-js";

const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

let supabase;

export default async function MediaUploader(file) {
  if (!file) {
    throw new Error("No file has been selected");
  }

  // Unique file name
  if (!supabaseUrl || !anonKey) {
    throw new Error("Image uploads are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error("Choose a JPG, PNG, WebP or GIF image smaller than 5 MB.");
  }
  supabase ??= createClient(supabaseUrl, anonKey);
  const timestamp = crypto.randomUUID();

  // File name එක clean කරගන්න
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  const fileName = `${timestamp}-${safeFileName}`;

  // Upload image
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw error;
  }

  console.log("Upload Data:", data);

  // IMPORTANT: මෙතන file.name නෙවෙයි fileName
  const { data: publicData } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}
