export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/images", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Kunne ikke uploade billede");
  }

  return payload.url;
}

export async function uploadImageFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImageFile(file)));
}
