import { Container } from 'inversify';
import { IocAdapter, Action } from 'routing-controllers';

export class InversifyAdapter implements IocAdapter {
  constructor(private container: Container) { }

  get<T>(someClass: { new(...args: any[]): T }, action?: Action): T {
    return this.container.get(someClass);
  }
}