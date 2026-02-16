import apiClient from "@/lib/api-client";

export interface UploadResult {
  url: string;
  blob_id: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return { url: data.url, blob_id: data.blob_id };
}
