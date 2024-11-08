/* eslint-disable @typescript-eslint/no-use-before-define */
import { Effect } from 'effect';
import { SideEffects } from './SideEffects.js';
import { Url } from './Url.js';

export class Storage extends Effect.Service<Storage>()('Storage', {
  effect: Effect.map(Effect.all([SideEffects, Url]), ([s, urlService]) => ({
    getRedirectUrl() {
      return Effect.succeed(s.getTemporaryStorage().getItem(REDIRECT_URL_KEY));
    },
    getToken() {
      return Effect.succeed(s.getPrimaryStorage().getItem(TOKEN_KEY));
    },
    saveToken(token: string) {
      return Effect.sync(() => s.getPrimaryStorage().setItem(TOKEN_KEY, token));
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
}) {}

const TOKEN_KEY = '__IS_TOKEN_KEY';
const REDIRECT_URL_KEY = '__IS_REDIRECT_URL_KEY';
