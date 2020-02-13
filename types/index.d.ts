import { Store, ActionContext, ActionHandler, Module, MutationTree, ModuleTree } from 'vuex/types';
import _Vue from "vue";

import './vuex';

export type AsyncState = {
  pending: number;
}

export type AsyncActionHandler<S, R> = (
  this: Store<R>,
  injectee: AsyncActionContext<S, R>,
  payload?: any,
) => PromiseLike<any>;

export type AsyncActionContext<S, R> = ActionContext<S, R>  & {
  commitAsync: CommitAsync;
}

export type AsyncActionTree<S, R> = { [key: string]: AsyncAction<S, R> };

export type AsyncModule<S, R> = Module<S, R> & {
  readonly async?: boolean;
  actionsAsync?: AsyncActionTree<S, R>;
  mutationsAsync?: AsyncMutationTree<S>;
}

export type CommitAsync = {
  <T>(payload: PromiseLike<T>, meta?: any): Promise<T>;
  <T>(type: string, payload: PromiseLike<T>, meta?: any): Promise<T>;
};

export type StateMutation<S> = (state: S, payload: any, meta?: any) => any;

export type AsyncMutation<S> = {
  pending?: (state: S, meta?: any) => any;
  resolved?: (state: S, payload: any, meta?: any) => any;
  rejected?: (state: S, error: any, meta?: any) => any;
  finally?: (state: S, meta?: any) => any;
};

export type AsyncAction<S, R> =
  | AsyncActionHandler<S, R>
  | (AsyncMutation<S> & { handler: AsyncActionHandler<S, R> });

export type AsyncMutationTree<S> = {
  [key: string]: AsyncMutation<S>;
}

export declare function asyncAction<S, R>(
  action: AsyncActionHandler<S, R>,
  defaultType?: string,
): ActionHandler<S, R>;

export declare function asyncMutation<S>(type: string, mutation: AsyncMutation<S>): MutationTree<S>;

export declare function asyncMutationTree<S>(tree: AsyncMutationTree<S>): MutationTree<S>;

export declare function asyncModule<S, R>(mod: AsyncModule<S, R>): Module<S, R>;

export declare function plugin(store: Store<any>): void;

export declare function wrapModules<R>(modules?: ModuleTree<R>): ModuleTree<R> | undefined;

export declare const module: Module<AsyncState, any>;

export default asyncModule;