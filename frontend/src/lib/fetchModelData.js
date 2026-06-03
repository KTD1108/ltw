/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET/POST request.
 * @param {object} options  Additional options like method, headers, body.
 */
async function fetchModel(url, options = {}) {
  const BASE_URL = process.env.REACT_APP_API_URL || "";
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const response = await fetch(fullUrl, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.Error || errorData.error || "Có lỗi xảy ra");
  }
  return await response.json();
}

export default fetchModel;
