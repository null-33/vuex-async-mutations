import { Store, ActionHandler, MutationTree, Mutation, Commit, ModuleTree } from 'vuex/types';
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

export function asyncAction<S, R>(
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

function stateMutation<S>(mutation?: StateMutation<S>, metaOnly?: boolean): Mutation<S> {
  return (state: S, { payload, meta }: { payload: any; meta?: any }) => {
    if (metaOnly) {
      mutation?.call(undefined, state, meta);
    } else {
      mutation?.call(undefined, state, payload, meta);
    }
  };
}

export function asyncMutation<S>(type: string, mutation: AsyncMutation<S>): MutationTree<S> {
  return {
    [`${type}:pending`]: stateMutation(mutation.pending, true),
    [`${type}:resolved`]: stateMutation(mutation.resolved),
    [`${type}:rejected`]: stateMutation(mutation.rejected),
    [`${type}:finally`]: stateMutation(mutation.finally, true),
  };
}

export function asyncMutationTree<S>(tree: AsyncMutationTree<S>): MutationTree<S> {
  return Object.keys(tree).reduce(
    (mutations, key) => ({
      ...mutations,
      ...asyncMutation(key, tree[key]),
    }),
    {} as MutationTree<S>,
  );
}

export function asyncModule<S, R>(mod: AsyncModule<S, R>): Module<S, R> {
  const bound: Module<S, R> = { ...mod };

  if (mod.namespaced) {
    bound.modules = { ...bound.modules, async: asyncModule(module) };
  }

  if (mod.actionsAsync) {
    Object.keys(mod.actionsAsync).forEach(key => {
      const action: AsyncAction<S, R> = mod.actionsAsync![key];

      if (typeof action !== 'function') {
        bound.actions = { ...bound.actions, [key]: asyncAction(action.handler, key) };
        bound.mutations = { ...bound.mutations, ...asyncMutation(key, action) };
      } else {
        bound.actions = { ...bound.actions, [key]: asyncAction(action, key) };
      }
    });
  }

  if (mod.mutationsAsync) {
    bound.mutations = { ...bound.mutations, ...asyncMutationTree(mod.mutationsAsync) };
  }

  return bound;
}

export function wrapModules<R>(modules?: ModuleTree<R>): ModuleTree<R> | undefined {
  if (!modules) return undefined;

  return Object.keys(modules).reduce((mods, key) => {
    let mod = modules[key] as AsyncModule<any, R>;

    if (mod.async || mod.actionsAsync || mod.mutationsAsync) {
      mod = asyncModule(mod);
    }

    mod.modules = wrapModules(mod.modules);

    return { ...mods, [key]: mod };
  }, {} as ModuleTree<R>)
}