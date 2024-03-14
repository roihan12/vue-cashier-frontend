export const state = () => ({
  products: [],

  categories: [
    {
      id: 0,
      title: "All",
    },
  ],
  categoryId: false,
});

export const mutations = {
  updateCategoryId(state, categoryId) {
    state.categoryId = categoryId;
  },
  updateProducts(state, products) {
    state.products = products;
  },
  updateCategories(state, categories) {
    state.categories.push(...categories);
  },
};

export const actions = {
  updateCategoryId({ commit }, categoryId) {
    commit("updateCategoryId", categoryId);
  },
  async fetchProducts({ commit }) {
    return await this.$axios.$get("/api/products").then((response) => {
      commit("updateProducts", response.data);
      console.log(response.data);
    });
  },

  async fetchCategories({ commit }) {
    return await this.$axios.$get("/api/categories").then((response) => {
      commit("updateCategories", response.data);
      console.log(response.data);
    });
  },
};
