/* eslint-disable @typescript-eslint/naming-convention */
import { Data, Effect } from 'effect';
import { SideEffects } from './SideEffects.js';

export class ParserError extends Data.TaggedError('ParserError')<{
  message: string;
}> {}

export class Parser extends Effect.Service<Parser>()('Parser', {
  effect: Effect.map(SideEffects, s => ({
    parseTokenFromHash() {
      return Effect.gen(function* () {
        const { hash } = s.getLocation();

        const [token] = (hash.split('access_token=').at(-1) || '').split('&');

        if (!token) {
          return yield* Effect.fail(
            new ParserError({
              message: 'Не удалось прочитать токена из хеша url',
            }),
          );
        }

        return token;
      });
    },
    parseTokenToPayload(token: string) {
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
}) {}

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
