export abstract class Type<T> {
  public name: string = undefined as any;
  public description: string = undefined as any;
  public _optional: boolean = false;
  private _createArgs: any[] = [];

  public static create<T extends Type<any>>(TypeClass: new (...args: any[]) => T, ...createArgs: any[]): T {
    const baseInstance = (TypeClass as any).baseInstance;
    if (baseInstance && !createArgs.length) {
      return baseInstance;
    }
    let type: T = new TypeClass(...createArgs);
    if (!type.name || !type.description) {
      throw new Error('Type should explicitly call init() in constructor and contain name and description.');
    }
    type._createArgs = createArgs;
    type = Object.freeze(type) as T;
    if ((TypeClass as any).baseInstance) {
      (TypeClass as any).baseInstance = type;
    }
    return type;
  }

  public static clone<T extends Type<any>, T2 extends Type<any>>(
    instance: T,
    mutation?: (type: T2) => void
  ): T2 {
    const TypeClass = instance.constructor as new (...args: any[]) => T2;
    const type: T2 = new TypeClass(...instance._createArgs);
    type._createArgs = instance._createArgs;
    instance.copyTo(type);
    if (mutation) {
      mutation(type);
    }
    return Object.freeze(type);
  }

  protected init(name: string | (() => string), description: string | (() => string)) {
    Object.defineProperty(this, 'name', typeof name === 'string'
      ? { value: name }
      : { get: name }
    );
    Object.defineProperty(this, 'description', typeof description === 'string'
      ? { value: description }
      : { get: description }
    );
  }

  public clone(): this {
    return Type.clone(this);
  }

  public abstract convert(value: any): Promise<T>;

  protected copyTo(type: Type<unknown>) {
    type._optional = this._optional;
  }

  public optional(optional?: boolean): this {
    return Type.clone(this, (type) => {
      type._optional = optional === undefined ? true : optional;
    });
  }
}

type UnpackedPromise<T> = T extends Promise<infer U> ? U : T;

export type ActualType<DefinedType extends Type<any> | unknown> =
  DefinedType extends Type<any> ? UnpackedPromise<ReturnType<DefinedType['convert']>> : unknown;
