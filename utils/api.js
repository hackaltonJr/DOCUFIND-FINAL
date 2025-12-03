// utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchDocuments() {
  const res = await fetch(`${API_URL}/documents`);
  return res.json();
}

export async function uploadDocument(formData, token) {
  const res = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return res.json();
}
