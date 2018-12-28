export abstract class Type<T> {
  public name: string = 'Type not initialized';
  public description: string = 'Type not initialized';
  public _optional: boolean = false;

  protected init(name: string | (() => string), description: string | (() => string)) {
    Object.defineProperty(this, 'name', typeof name === 'string'
      ? { configurable: false, writable: false, value: name }
      : { configurable: false, get: name }
    );
    Object.defineProperty(this, 'description', typeof description === 'string'
      ? { configurable: false, writable: false, value: description }
      : { configurable: false, get: description }
    );
  }

  public abstract convert(value: any): Promise<T>;

  public optional(optional?: boolean) {
    this._optional = optional === undefined ? true : optional;
    return this;
  }
}

type UnpackedPromise<T> = T extends Promise<infer U> ? U : T;

export type ActualType<DefinedType extends Type<any>> =
  UnpackedPromise<ReturnType<DefinedType['convert']>>;
