import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { authProgram, runProgram, Config, Events, SideEffects } from '../../../src'
import { Effect } from 'effect'
import * as constants from './constants'

function App() {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [token, setToken] = useState<string | null>(null)
  // const [tokenPayload, setTokenPayload] = useState<string | null>(null)
  useEffect(()=>{
    const runnable = authProgram.pipe(
      Effect.provideService(Config, {
        client: constants.IS_APP,
        host: constants.IS_HOST,
        signInUri: constants.SIGN_IN
      }),
      Effect.provideService(Events, {
        onError: setError,
        onParseToken: (token, payload) => {
          setToken(token);
          console.log(payload)
        },
        onProgramChangeState: (state) => {
          setPending(state === 'pending')        
        }
      }),
      Effect.provideService(SideEffects, {
        getLocation: () => window.location,
        getPrimaryStorage: () => window.localStorage,
        getTemporaryStorage: () => window.sessionStorage
      })
    );

    return runProgram(runnable)
  },[])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        
        {isPending && <p>
          Загрузка...
        </p>}
      </div>
      {token && <p className="read-the-docs">
        {token}
      </p>}
      {error && <p className="read-the-docs">
        {error}
      </p>}
    </>
  )
}

export default App
