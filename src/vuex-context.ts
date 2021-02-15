import Vue from 'vue';
import _ from 'lodash'
import { Module, MutationTree, ActionTree, GetterTree, Plugin, StoreOptions } from "vuex/types";
import Vuex, { Store } from 'vuex';

Vue.use(Vuex);

export type Accessors<T> = {
  [K in keyof T]: (() => T[K]);
};

export type MutationOrAction = () => any;
export type MutationPendingFinally<M> = (meta: M) => void;
export type MutationResolved<T, M> = (result: T, meta: M) => void;
export type MutationRejected<M> = (error: Error, meta: M) => void;
export type AsyncMutation<T, M> = { pending?: MutationPendingFinally<M>, resolved?: MutationResolved<T, M>, rejected?: MutationRejected<M>; finally?: MutationPendingFinally<M> };

type DefaultGetters = { [key: string]: () => any };
type DefaultMutations = { [key: string]: (...args: any[]) => void };
type DefaultMutationsAsync = { [key: string]: AsyncMutation<any, any> };
type DefaultActions = { [key: string]: (...args: any[]) => Promise<any> };
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends MutationOrAction ? never : K }[keyof T];
type NonFunctionScope<T> = { [K in NonFunctionPropertyNames<T>]: T[K] };
type NonFunctionScopeTree<T> = { [K in keyof T]: NonFunctionScope<T[K]> };
type ReadonlyTree<T> = Readonly<T> & { [K in keyof T]: ReadonlyTree<T[K]> };
type ContextualActions<T, Context> = { [K in keyof T]: (context: Context) => () => any };

type Async = <T, M>(mutation: AsyncMutation<T, M>, promise: PromiseLike<T>, meta?: M) => Promise<T>;

export type CombinedModuleInstance<
  State,
  Modules,
  Mutations,
  Getters,
  Actions
> = ReadonlyTree<State> & Modules & Actions & Mutations & ReadonlyTree<Getters>;

export interface ModuleOptions<
  State,
  Modules,
  Mutations,
  MutationsAsync,
  Getters,
  Actions,
  > {
  path?: string[];
  state?: State;
  modules?: Modules;
  mutations?: Mutations & DefaultMutations & ThisType<State>;
  mutationsAsync?: MutationsAsync & DefaultMutationsAsync & ThisType<State>;
  getters?: Accessors<Getters> & DefaultGetters & ThisType<ReadonlyTree<State> & ReadonlyTree<Getters> & ReadonlyTree<NonFunctionScopeTree<Modules>>>;
  actions?: ContextualActions<Actions, Mutations> & DefaultActions
}

export interface RootModuleOptions<
  State,
  Modules,
  Mutations,
  MutationsAync,
  Getters,
  Actions> extends ModuleOptions<
  State,
  Modules,
  Mutations,
  MutationsAync,
  Getters,
  Actions> {
  plugins?: Plugin<any>[];
}

const createModule = function <State, Modules, Mutations, MutationsAsync, Getters, Actions>(proxy:Record<string, any>, options: ModuleOptions<State, Modules, Mutations, MutationsAsync, Getters, Actions>):Module<any, any> {
  const actions = Object.keys(options.actions || {}).reduce((acts, key): ActionTree<any, any> => ({ ...acts, [key]: (context, payload = []) => options.actions![key].apply(proxy, payload) }), {});
  const mutations = Object.keys(options.mutations || {}).reduce((muts, key): MutationTree<any> => ({ ...muts, [key]: (state, payload = []) => options.mutations![key].apply(proxy, payload) }), {});
  const getters = Object.keys(options.getters || {}).reduce((gets, key): GetterTree<any, any> => ({ ...gets, [key]: () => options.getters![key].apply(proxy) }), {});
  const mutationsAsync = Object.keys(options.mutationsAsync || {}).reduce((muts, key): MutationTree<any> =>
    ({
      ...muts,
      [`${key}:pending`]: (state, payload = []) => options.mutationsAsync![key].pending?.apply(proxy, payload),
      [`${key}:resolved`]: (state, payload = []) => options.mutationsAsync![key].resolved?.apply(proxy, payload),
      [`${key}:rejected`]: (state, payload = []) => options.mutationsAsync![key].rejected?.apply(proxy, payload),
      [`${key}:finally`]: (state, payload = []) => options.mutationsAsync![key].finally?.apply(proxy, payload),
    }), {});

  return {
    state: options.state,
    getters,
    namespaced: true,
    mutations: {...mutations, ...mutationsAsync },
    actions,
  }
}

let store: Store<any>;

const injectPath = function (path: string[], modules: Record<string, any> = {}) {
  Object.keys(modules).forEach(key => {
    if (!modules[key].path) {
      modules[key].path = [...path, key];
      injectPath([...path, key], modules[key].modules);
    }
  })
};

const commitAsync: Async = async (mutation, promise, meta) => {
  mutation.pending!(meta!);

  try {
    const r = await promise;

    mutation.resolved!(r, meta!);
  } catch (e) {
    mutation.rejected!(e, meta!);
  } finally {
    mutation.finally!(meta!);
  }

  return promise;
}

const extend = function <State, Modules, Mutations, MutationsAsync, Getters, Actions>(options: ModuleOptions<State, Modules, Mutations, MutationsAsync, Getters, Actions>) {
  const state: object = options.state || {};
  const mutations: object = options.mutations || {};
  const mutationsAsync: object = options.mutationsAsync || {};
  const modules: object = options.modules || {};
  const getters: DefaultGetters = options.getters || {};
  const actions: object = options.actions || {};

  const proxy: Record<string, any> = {
    path: options.path,
    modules,
    ...modules,
  };

  Object.keys(getters).forEach(key => {
    Object.defineProperty(proxy, key, {
      get() {
        return store.getters[[...proxy.path, key].join('/')];
      }
    })
  })

  Object.keys(state).forEach(key => {
    Object.defineProperty(proxy, key, {
      get() {
        return _.get(store.state, [...proxy.path, key]);
      },

      set(val) {
        Vue.set(proxy.path.length ? _.get(store.state, proxy.path) : store.state, key, val);
      }
    })
  })

  Object.keys(actions).forEach(key => {
    Object.defineProperty(proxy, key, {
      value: (...args: any[]) => store.dispatch([...proxy.path, key].join('/'), args),
    })
  })

  Object.keys(mutations).forEach(key => {
    Object.defineProperty(proxy, key, {
      value: (...args: any[]) => store.commit([...proxy.path, key].join('/'), args),
    })
  })

  Object.keys(mutationsAsync).forEach(key => {
    Object.defineProperty(proxy, key, {
      value: {
        pending: (...args: any[]) => store.commit([...proxy.path, `${key}:pending`].join('/'), args),
        resolved: (...args: any[]) => store.commit([...proxy.path, `${key}:resolved`].join('/'), args),
        rejected: (...args: any[]) => store.commit([...proxy.path, `${key}:rejected`].join('/'), args),
        finally: (...args: any[]) => store.commit([...proxy.path, `${key}:finally`].join('/'), args)
      },
    })
  })

  Object.defineProperty(proxy, '$store', {
    get() {
      return store;
    },
  })

  Object.defineProperty(proxy, 'commitAsync', {
    get() {
      return commitAsync;
    },
  })

  Object.assign(proxy, createModule(proxy, options));

  if (options.path) {
    injectPath(options.path, modules);
  }

  return proxy as CombinedModuleInstance<State, Modules, Mutations, Getters, Actions>;
};

const rootModule = extend({
  state: {
    propA: "propA",
    propB: "propB",
    propC: []
  },

  modules: {
    moduleA: extend({
      state: {
        propA: 'moduleA.propA',
        propB: "moduleA.propB",
      },

      modules: {
        moduleB: extend({
          getters: {
            getterA() {
              return 'moduleA.moduleB.getterA';
            }
          },

          actions: {
            
          }
        })
      },
      
      getters: {
        getterA(): string {
          return 'moduleA.getterA';
        }
      },
      actions: {
        actionA(context):string {
          contextx 
        }
      }
    }),
  },

  mutations: {
    mutationA() {
      this.propA = "blarp";
    },

    asyncMutationA(a: string, id: number) {
      this.propA = a;
    }
  },

  mutationsAsync: {
    asyncMutationB: {
      pending([b, c]: [string, number]) {
//
      },

      resolved(a: string, [b, c]: [string, number]) {
        console.log(this.propA);
          // this.propA = a;
        }
    },
    
    asyncMutationC: {
      rejected(e: Error) {
        //
      }
    }
  },

  getters: {
    getterA(): string {
      return 'asdfasdf:' + scopedStore.root.propA;
      // return this.moduleA.getterA;
    },

    getterB(): string {
      return this.getterC;
    },

    getterC(): string {
      
      return this.propA;
    },
  },
  
  actions: {
  }
});

export function createStore<State, Modules, Mutations, MutationsAsync, Getters, Actions>(rootModule: RootModuleOptions<State, Modules, Mutations, MutationsAsync, Getters, Actions>): {
  store: Store<any>;
  root: CombinedModuleInstance<State, Modules, Mutations, Getters, Actions>;
} {
  const root = extend(rootModule as ModuleOptions<State, Modules, Mutations, MutationsAsync, Getters, Actions>);
  
  return {
    store: new Store({...root, plugins: rootModule.plugins }),
    root,
  }
}

var scopedStore = createStore({
  state: {
    propA: 'root.propA',
    propB: {
      fieldA: 'asdf',
      fieldB: {
        fieldC: 'asdf',
        fieldD: {
          fieldE: 'asdf',
        }
      }
    }
  },

  modules: {
    rootModule,
  },

  path: [],

  getters: {
    getterA():string {
      return this.propA;
    }
  },

  mutationsAsync: {
    asyncMutationB: {
      pending([b, c]: [string, number]) {
        //
      },

      resolved(a: string, [b, c]: [string, number]) {
        console.log(this.propA);
        this.propA = a;
      }
    },
  },

  actions: {
  },

  plugins: [
    (sstore: Store<any>) => store = sstore
  ]
});
