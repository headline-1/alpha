export interface Type<T> {
  name: string;
  description: string;
  convert: (value: any) => Promise<T>;
}

type UnpackedPromise<T> = T extends Promise<infer U> ? U : T;

export type ActualType<DefinedType extends Type<any>> =
  UnpackedPromise<ReturnType<DefinedType['convert']>>;
