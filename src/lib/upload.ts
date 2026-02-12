import apiClient from "@/lib/api-client";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}
