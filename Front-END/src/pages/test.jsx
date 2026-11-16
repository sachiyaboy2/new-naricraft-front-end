import { useState } from "react";
import MediaUploader from "../utils/mediaUpload";

export default function TestPage() {
  const [file, setFile] = useState(null);

  async function uploadImage() {
    try {
      if (!file) {
        console.log("Please select a file first");
        return;
      }

      const link = await MediaUploader(file);

      console.log("Uploaded Image URL:", link);
    } catch (error) {
      console.error("Upload Failed:", error);
    }
  }

  return (
    <div className="w-full min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto max-w-md surface p-6">
        <h1 className="font-display text-xl font-bold text-ink">Media upload test</h1>

        <div className="mt-5">
          <label htmlFor="test-upload" className="label">
            Image file
          </label>

          <input
            id="test-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
            }}
            className="field"
          />
        </div>

        <button
          type="button"
          onClick={uploadImage}
          className="btn btn-primary mt-5 w-44"
        >
          Upload Image
        </button>
      </div>
    </div>
  );
}
