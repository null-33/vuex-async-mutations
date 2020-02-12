import { AsyncState, AsyncModule } from '../types';

const factory = (): AsyncState => ({
  pending: 0,
});

export const module = {
  state: factory,

  mutationsAsync: {
    ['async']: {
      pending(state) {
        state.pending += 1;
      },

      finally(state) {
        state.pending = Math.max(0, state.pending - 1);
      },
    },
  },

  mutations: {
    ['async:reset'](state) {
      Object.assign(state, factory());
    },
  },

  getters: {
    ['isPending'](state) {
      return state.pending > 0;
    },
  },

  actions: {
    ['created']: {
      root: true,
      handler: ({ commit }) => commit('async:reset'),
    },

    ['reset']: {
      root: true,
      handler: ({ commit }) => commit('async:reset'),
    },
  },
} as AsyncModule<AsyncState, any>;

export default module;
