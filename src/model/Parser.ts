/* eslint-disable @typescript-eslint/naming-convention */
import { Context, Data, Effect, Layer } from 'effect';
import { SideEffects } from './SideEffects.js';

export class ParserError extends Data.TaggedError('ParserError')<{
  message: string;
}> {}

interface ParserImpl {
  parseTokenFromHash: () => Effect.Effect<string, ParserError, never>;
  parseTokenToPayload: (
    token: string,
  ) => Effect.Effect<TokenType, ParserError, never>;
}

export class Parser extends Context.Tag('Parser')<Parser, ParserImpl>() {
  static readonly Live = Layer.effect(
    this,
    Effect.map(SideEffects, s => ({
      parseTokenFromHash() {
        const { hash } = s.getLocation();

        const [token] = (hash.split('access_token=').at(-1) || '').split('&');

        if (!token) {
          return Effect.fail(
            new ParserError({
              message: 'Не удалось прочитать токена из хеша url',
            }),
          );
        }

        return Effect.succeed(token);
      },
      parseTokenToPayload(token) {
        return Effect.try({
          try: () => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => {
                  return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
                })
                .join(''),
            );

            return JSON.parse(jsonPayload) as TokenType;
          },
          catch: () =>
            new ParserError({
              message: 'Не удалось выполнить парсинг jwt-токена',
            }),
        });
      },
    })),
  );
}

export type TokenType = {
  nbf: number;
  exp: number;
  iss: string;
  aud: string;
  client_id: string;
  sub: string;
  auth_time: number;
  idp: string;
  domain: string;
  name: string;
  family_name: string;
  given_name: string;
  nickname: string;
  role: string[];
  employeeNumber: string;
  userName: string;
  email: string;
  email_verified: string;
  jti: string;
  sid: string;
  iat: number;
  scope: string[];
  amr: string[];
};
