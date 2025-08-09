const API_BASE = `${import.meta.env.VITE_BACKEND}/api/ai`;

export async function fetchAiAssistanceEnabled() {
  try {
    const response = await fetch(`${API_BASE}/status`);
    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Error fetching AI status:", error);
    return false;
  }
}

export async function setAiAssistanceEnabled(status: boolean) {
  try {
    const response = await fetch(`${API_BASE}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Error setting AI status:", error);
    return false;
  }
}

export async function generateAIHint(problem:String, code:String) {
  const res = await fetch(`${API_BASE}/generate-hint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ problem, code }),
  });
  if (!res.ok) throw new Error("Failed to generate AI hint");
  const data = await res.json();
  return data.hint || "";
}