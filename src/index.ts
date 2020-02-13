import mod from './module';
import { wrapModule } from './async';

export * from './async';
export * from './plugin';

export const module = mod;

export default wrapModule;
