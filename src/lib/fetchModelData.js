const BASE_URL = process.env.REACT_APP_API_URL || "";

async function fetchModel(url, options = {}) {
  const fullUrl = `${BASE_URL}${url}`;
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch ${fullUrl}: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // ignore
    }

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("unauthorized"));
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export default fetchModel;
