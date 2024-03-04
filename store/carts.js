export const state = () => ({
  items: [],
});

export const mutations = {
  addItem(state, id) {
    state.items.push({
      id: id,
      quantity: 1,
    });

    console.log(state.items);
  },
};

export const actions = {
  addToCart({ commit }, id) {
    commit("addItem", id);
  },
};
