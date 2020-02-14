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

export function commitAsync(commit: Commit, scope: string = 'async'): CommitAsync {
  return async function<T>(
    commitType: string | PromiseLike<T>,
    payload?: PromiseLike<T> | any,
    meta?: any,
  ): Promise<T> {
    if (typeof commitType !== 'string') {
      meta = payload;
      payload = commitType;
      commitType = scope;
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
  scope?: string,
): ActionHandler<S, R> {
  return function(this: Store<R>, actionContext, payload?: any) {
    const context: AsyncActionContext<S, R> = {
      ...actionContext,
      commitAsync: commitAsync(actionContext.commit, scope),
    };

    return context.commitAsync('async', action.call(this, context, payload));
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
  const wrappedModule: Module<S, R> = { ...mod };

  if (mod.async) {
    wrappedModule.modules = { ...wrappedModule.modules, async: module};
  }

  if (mod.actionsAsync) {
    Object.keys(mod.actionsAsync).forEach(scope => {
      const action: AsyncAction<S, R> = mod.actionsAsync![scope];

      if (typeof action !== 'function') {
        wrappedModule.actions = { ...wrappedModule.actions, [scope]: wrapAction(action.handler as AsyncActionHandler<S, R>, scope) };
        wrappedModule.mutations = { ...wrappedModule.mutations, ...wrapMutation(scope, action) };
      } else {
        wrappedModule.actions = { ...wrappedModule.actions, [scope]: wrapAction(action as AsyncActionHandler<S, R>, scope) };
      }
    });
  }

  if (mod.mutationsAsync) {
    wrappedModule.mutations = { ...wrappedModule.mutations, ...wrapMutations(mod.mutationsAsync) };
  }

  return wrappedModule;
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