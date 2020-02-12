import { Store, ActionContext } from 'vuex/types';
import { Module } from 'vuex/types';

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
