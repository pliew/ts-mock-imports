import * as sinonModule from 'sinon';
import { IConstruct, IModule } from '../types';
import { Manager } from './manager';
const sinon = sinonModule as sinonModule.SinonStatic;

export interface IMockOptions {
  returns?: any;
}

export class MockManager<T> extends Manager {
  protected original!: IConstruct<T>;
  protected stubClass: IConstruct<T>;

  constructor(protected module: IModule, protected importName: string) {
    super(module, importName);
    this.stubClass = this.createStubClass();
    this.module[this.importName] = this.stubClass;
  }

  public mock(funcName: keyof T, returns?: any): sinon.SinonStub {
    const spy = sinon.stub();
    spy.returns(returns);
    this.replaceFunction(funcName as string, spy);
    return spy;
  }

  public set<K extends keyof T>(varName: K, replaceWith?: T[K]): void {
    this.replace(varName as string, replaceWith);
  }

  public getMockInstance(): T {
    return new this.stubClass();
  }

  protected replaceFunction(funcName: string, newFunc: () => any) {
    this.replace(funcName, newFunc);
  }

  protected replace(name: string, arg: any) {
    this.stubClass.prototype[name] = arg;
  }

  protected getAllFunctionNames(obj: any) {
    let funcNames: string[] = [];

    do {
      // Get all properties on this object
      funcNames = funcNames.concat(Object.getOwnPropertyNames(obj.prototype));

      // Get the parent class
      obj = Object.getPrototypeOf(obj);
    } while (obj && obj.prototype && obj.prototype !== Object.prototype);

    // Remove duplicate methods
    return funcNames;
  }

  protected createStubClass(): IConstruct<T> {
    // tslint:disable-next-line:max-classes-per-file
    const stubClass = class {
      constructor() {
        return;
      }
    } as any;

    this.getAllFunctionNames(this.original)
      .forEach((funcName) => {
        this.mock(funcName as keyof T);
      });
    return stubClass;
  }
}
