import { CommitAsync } from '.';

declare module 'vuex/types' {
  interface Store<S> {
    commitAsync: CommitAsync;
  }
}