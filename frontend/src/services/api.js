const BASE_URL = "http://localhost:5000/api";

const request = async (method, path, body = null, options = {}) => {
  const url = `${BASE_URL}${path}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Get token from localStorage and append to headers if available
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...options,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${method} ${path}:`, error);
    throw error;
  }
};

const api = {
  get: (path, options) => request("GET", path, null, options),
  post: (path, body, options) => request("POST", path, body, options),
  put: (path, body, options) => request("PUT", path, body, options),
  delete: (path, options) => request("DELETE", path, null, options),
};

export default api;
