import { Effect } from 'effect';
import { authProgram as _authProgram,  Config, SideEffects } from '../../../src'
import * as constants from './constants'


export const authProgram = _authProgram.pipe(
    Effect.provideService(Config, {
      client: constants.IS_APP,
      host: constants.IS_HOST,
      signInUri: constants.SIGN_IN
    }),
   
    Effect.provideService(SideEffects, {
      getLocation: () => window.location,
      getPrimaryStorage: () => window.sessionStorage,
      getTemporaryStorage: () => window.sessionStorage,
      history: {
        push: (path) => window.history.pushState('', '', path)
      }
    })
  )