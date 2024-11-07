/* eslint-disable @typescript-eslint/no-use-before-define */
import { Context, Effect, Layer } from 'effect';
import { SideEffects } from './SideEffects.js';
import { Url } from './Url.js';

interface StorageImpl {
  getToken: () => Effect.Effect<string | null, never, never>;
  saveToken: (token: string) => Effect.Effect<void, never, never>;
  getRedirectUrl: () => Effect.Effect<string | null, never, never>;
  setRedirectUrl: () => Effect.Effect<void, never, never>;
}

export class Storage extends Context.Tag('Storage')<Storage, StorageImpl>() {
  static readonly Live = Layer.effect(
    this,
    Effect.map(Effect.all([SideEffects, Url]), ([s, urlService]) => ({
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
      setRedirectUrl() {
        return urlService
          .getRedirectUrl()
          .pipe(
            Effect.tap(url =>
              Effect.sync(() =>
                s.getTemporaryStorage().setItem(REDIRECT_URL_KEY, url),
              ),
            ),
          );
      },
    })),
  );
}

const TOKEN_KEY = '__IS_TOKEN_KEY';
const REDIRECT_URL_KEY = '__IS_REDIRECT_URL_KEY';
