import mod from './module';
import { asyncModule } from './async';

export * from './async';
export * from './plugin';

export const module = asyncModule(mod);

export default asyncModule;
