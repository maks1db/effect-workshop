import { Context } from 'effect';
import { TokenType } from './Parser.js';

interface EventsImpl {
  onError: (message: string | null) => void;
  onProgramChangeState: (state: 'pending' | 'error' | 'success') => void;
  onParseToken: (token: string, payload: TokenType) => void;
}

export class Events extends Context.Tag('Events')<Events, EventsImpl>() {}
