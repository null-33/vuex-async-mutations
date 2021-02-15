import mod from './module';
import { wrapModule } from './async';

export * from './async';
export * from './plugin';

import './vuex-ts';

export const module = mod;

export default wrapModule;
