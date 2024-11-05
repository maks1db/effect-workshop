import { Context } from 'effect';

interface SideEffectsImpl {
  getLocation: () => ModelLocation;
  getPrimaryStorage: () => ModelStorage;
  getTemporaryStorage: () => ModelStorage;
}

export class SideEffects extends Context.Tag('SideEffects')<
  SideEffects,
  SideEffectsImpl
>() {}

interface ModelStorage {
  getItem(key: string): string | null;

  setItem(key: string, value: string): void;
}

interface ModelLocation {
  hash: string;

  host: string;

  hostname: string;

  href: string;

  pathname: string;

  search: string;

  origin: string;
}
