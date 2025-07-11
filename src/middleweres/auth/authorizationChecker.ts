import { Action } from 'routing-controllers';

export function authorizationChecker(action: Action, roles: string[]): boolean {
  const token = action.request.headers['authorization'];
  if (token === process.env.API_TOKEN) {
    return true;
  }
  return false;
}
