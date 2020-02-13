import { Store, ActionHandler, MutationTree, Mutation, Commit, ModuleTree, ActionTree } from 'vuex/types';
import { Module } from 'vuex/types';
import module from './module';
import {
  AsyncModule,
  AsyncActionContext,
  AsyncMutation,
  StateMutation,
  CommitAsync,
  AsyncActionHandler,
  AsyncAction,
  AsyncMutationTree,
  AsyncActionHandlerTree,
} from '../types';

export function commitAsync(commit: Commit, defaultType: string = 'async'): CommitAsync {
  return async function<T>(
    commitType: string | PromiseLike<T>,
    payload?: PromiseLike<T> | any,
    meta?: any,
  ): Promise<T> {
    if (typeof commitType !== 'string') {
      meta = payload;
      payload = commitType;
      commitType = defaultType;
    }

    commit(`${commitType}:pending`, { meta });

    try {
      const result = await payload;

      commit(`${commitType}:resolved`, { payload: result, meta });

      return result;
    } catch (e) {
      commit(`${commitType}:rejected`, { payload: e, meta });
      throw e;
    } finally {
      commit(`${commitType}:finally`, { meta });
    }
  };
}

export function wrapAction<S, R>(
  action: AsyncActionHandler<S, R>,
  defaultType?: string,
): ActionHandler<S, R> {
  return function(this: Store<R>, actionContext, payload?: any) {
    const context: AsyncActionContext<S, R> = {
      ...actionContext,
      commitAsync: commitAsync(actionContext.commit, defaultType),
    };

    return context.commitAsync('async', action.call(this, context, payload), undefined);
  };
}

export function wrapActions<S, R>(tree: AsyncActionHandlerTree<S, R>): ActionTree<S, R> {
  return Object.keys(tree).reduce(
    (actions, key) => ({
      ...actions,
      ...wrapAction(tree[key], key),
    }),
    {} as ActionTree<S, R>,
  );
}

function stateMutation<S>(mutation?: StateMutation<S>, metaOnly?: boolean): Mutation<S> {
  return (state: S, { payload, meta }: { payload: any; meta?: any }) => {
    if (metaOnly) {
      mutation?.call(undefined, state, meta);
    } else {
      mutation?.call(undefined, state, payload, meta);
    }
  };
}

export function wrapMutation<S>(type: string, mutation: AsyncMutation<S>): MutationTree<S> {
  return {
    [`${type}:pending`]: stateMutation(mutation.pending, true),
    [`${type}:resolved`]: stateMutation(mutation.resolved),
    [`${type}:rejected`]: stateMutation(mutation.rejected),
    [`${type}:finally`]: stateMutation(mutation.finally, true),
  };
}

export function wrapMutations<S>(tree: AsyncMutationTree<S>): MutationTree<S> {
  return Object.keys(tree).reduce(
    (mutations, key) => ({
      ...mutations,
      ...wrapMutation(key, tree[key]),
    }),
    {} as MutationTree<S>,
  );
}

export function wrapModule<S, R>(mod: AsyncModule<S, R>): Module<S, R> {
  const bound: Module<S, R> = { ...mod };

  if (mod.async) {
    bound.modules = { ...bound.modules, async: module};
  }

  if (mod.actionsAsync) {
    Object.keys(mod.actionsAsync).forEach(key => {
      const action: AsyncAction<S, R> = mod.actionsAsync![key];

      if (typeof action !== 'function') {
        bound.actions = { ...bound.actions, [key]: wrapAction(action.handler, key) };
        bound.mutations = { ...bound.mutations, ...wrapMutation(key, action) };
      } else {
        bound.actions = { ...bound.actions, [key]: wrapAction(action, key) };
      }
    });
  }

  if (mod.mutationsAsync) {
    bound.mutations = { ...bound.mutations, ...wrapMutations(mod.mutationsAsync) };
  }

  return bound;
}

export function wrapModules<R>(modules?: ModuleTree<R>): ModuleTree<R> | undefined {
  if (!modules) return undefined;

  return Object.keys(modules).reduce((mods, key) => {
    let mod = modules[key] as AsyncModule<any, R>;

    if (key !== 'async' && (mod.async || mod.actionsAsync || mod.mutationsAsync)) {
      mod = wrapModule(mod);
    }

    mod.modules = wrapModules(mod.modules);

    return { ...mods, [key]: mod };
  }, {} as ModuleTree<R>)
}