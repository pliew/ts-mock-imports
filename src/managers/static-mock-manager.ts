import { uniq } from 'lodash';
import { SinonStub } from 'sinon';
import { MockManager } from '.';

export class StaticMockManager<T> extends MockManager<T> {
  public mock(funcName: keyof IConstruct<T>, ...args: any[]): SinonStub {
    return super.mock(funcName as keyof T, ...args);
  }

  public set(varName: keyof IConstruct<T>, ...args: any[]): void {
    return super.set(varName as keyof T, ...args);
  }

  protected replace(name: string, arg: any) {
    (this.stubClass as any)[name] = arg;
  }

  protected getAllFunctionNames(obj: any): string[] {
    let funcNames: string[] = [];

    do {
      // Get all properties on this object
      funcNames = funcNames.concat(Object.getOwnPropertyNames(obj)
        .filter(property => typeof obj[property] === 'function'));

      // Get the parent class
      obj = Object.getPrototypeOf(obj);
    } while (obj && obj.prototype && obj.prototype !== Object.prototype);

    // Remove duplicate methods
    return uniq(funcNames);
  }
}
