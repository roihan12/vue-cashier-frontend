export default function ({ $axios, store, redirect }) {
  let isRefreshing = false; // Tambahkan variabel untuk melacak status refresh token

  $axios.onRequest((config) => {
    if (store.getters["auth/authenticated"]) {
      config.headers[
        "Authorization"
      ] = `Bearer ${store.state.auth.access_token}`;
    }
  });

  $axios.onResponseError((error) => {
    const originalRequest = error.config;
    const statusCode = error.response ? error.response.status : null;

    if (statusCode === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        // Periksa apakah tidak dalam proses refreshing
        isRefreshing = true; // Set isRefreshing menjadi true untuk menandakan sedang dalam proses refreshing

        originalRequest._retry = true;

        return $axios
          .post("/api/auth/refresh-token", {
            refreshToken: store.state.auth.refresh_token,
          })
          .then((response) => {
            const { accessToken, refreshToken } = response.data;

            store.commit("auth/setAccessToken", accessToken);
            store.commit("auth/setRefreshToken", refreshToken);

            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            isRefreshing = false; // Setelah berhasil refresh token, set isRefreshing menjadi false

            return $axios(originalRequest);
          })
          .catch((refreshError) => {
            isRefreshing = false; // Setelah gagal refresh token, set isRefreshing menjadi false

            console.error(refreshError); // Tampilkan error di konsol
            store.commit("auth/logout");
            redirect("/login");
            return Promise.reject(refreshError);
          });
      }
    }

    return Promise.reject(error);
  });
}
