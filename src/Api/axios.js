import axios from "axios";

const Api = axios.create({
  baseURL: "http://localhost:8080",
});

Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

Api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post("http://localhost:8080/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = res.data.token;

        localStorage.setItem("token", newAccessToken);

        originalRequest.headers.Authorization = "Bearer " + newAccessToken;

        return Api(originalRequest);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default Api;
