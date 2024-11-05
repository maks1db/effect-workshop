import { Context } from 'effect';

interface ConfigImpl {
  host: string;
  client: string;
  signInUri: string;
}

export class Config extends Context.Tag('Config')<Config, ConfigImpl>() {}
