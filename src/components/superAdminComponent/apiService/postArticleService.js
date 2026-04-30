import { api } from "../../../constant";

export const postArticleApi = async (url, data, options = {}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `POST ${url} failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  // Try to parse JSON, fallback to text
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
};


export const fetchAllPost = async (setArticles) => {
  try {
    const response = await fetch(api.postArticle); // Replace with your API endpoint

    const data = await response.json();
    setArticles(data)
  } catch (err) {
    // setError("Error fetching data");
    // setLoading(false);
  }
};

export const deletePostArticle = async (id) => {
  try {
    const response = await fetch(`${api.postArticle}?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete post article");
    }

    return true; // Indicate successful deletion
  } catch (err) {
    console.error("Error deleting post article:", err);
    return false; // Indicate failure
  }
}

