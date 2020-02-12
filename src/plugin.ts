import { Store } from 'vuex/types';
import { commitAsync } from '.';

export const plugin = (store: Store<any>): void => {
  store.commitAsync = commitAsync(store.commit);
};
