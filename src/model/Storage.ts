/* eslint-disable @typescript-eslint/no-use-before-define */
import { Context, Effect, Layer } from 'effect';
import { SideEffects } from './SideEffects.js';

interface StorageImpl {
  getToken: () => Effect.Effect<string | null, never, never>;
  saveToken: (token: string) => Effect.Effect<void, never, never>;
  getRedirectUrl: () => Effect.Effect<string | null, never, never>;
  setRedirectUrl: (url: string) => Effect.Effect<void, never, never>;
}

export class Storage extends Context.Tag('Storage')<Storage, StorageImpl>() {
  static readonly Live = Layer.effect(
    this,
    Effect.map(SideEffects, s => ({
      getRedirectUrl() {
        return Effect.succeed(
          s.getTemporaryStorage().getItem(REDIRECT_URL_KEY),
        );
      },
      getToken() {
        return Effect.succeed(s.getPrimaryStorage().getItem(TOKEN_KEY));
      },
      saveToken(token) {
        return Effect.sync(() =>
          s.getPrimaryStorage().setItem(TOKEN_KEY, token),
        );
      },
      setRedirectUrl(url) {
        return Effect.sync(() =>
          s.getTemporaryStorage().setItem(REDIRECT_URL_KEY, url),
        );
      },
    })),
  );
}

const TOKEN_KEY = '__IS_TOKEN_KEY';
const REDIRECT_URL_KEY = '__IS_REDIRECT_URL_KEY';
