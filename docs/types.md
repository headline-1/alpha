# Types

Types are used for input verification. They should be only created on app initialization phase, as they're immutable and modifications are quite slow because of that. Types can be nested multiple times and additional validation steps are applied by chaining.

## Convention

1. Type has to be initialized by `Type.create(TypeClass, ...constructorArgs)`. It calls the `constructor` and makes the class immutable.
2. `constructor` has to be explicitly defined and call `this.init(name, description)` inside. This allows to process the type input first and define name and description later. If you forget about it, an error will be thrown by `Type.create`.
2. Type can be modified by `Type.clone(instance, mutation)`, where `mutation` is a function which can do anything with type, as it's not immutable yet.
3. `Type.create` should be wrapped in a creator function.
4. All internal functions should not be defined as properties (no `myFunc = () => {...}`) as it breaks equality comparison.
5. End user should be able to chain modifiers.
6. `copyTo` method may be used to transfer all custom properties that are *not* passed to constructor to a new instance of the same type. It's used during cloning. It has to call `super.copyTo(...)` inside.
7. Custom properties should be prefixed with underscore, so that their setters can be used without adding `set` prefixes.
8. A type should implement `async convert(value)` method that returns parsed value or throws an Error if value validation/cast fails.

#### Example

```typescript
import { Type } from '@lpha/core';

export class CustomType extends Type<string> {
  private _noEmpty: boolean = false;
  
  constructor(public readonly magicProperty: string){
    super();
    this.init(`CustomType(${magicProperty})`, `A custom type for example purposes, containing ${magicProperty}.`);
  }
  
  noEmpty(param: boolean) {
    return Type.clone(this, type => type._noEmpty = param);
  }
  
  copyTo(type: this): void {
    super.copyTo(type);
  }
  
  async convert(value: any): Promise<string> {
    if(this._noEmpty && !value){
      throw new Error('No empty values allowed.');
    }
    return String(value) + this.magicProperty;
  }
}

const customType = (magicProperty: string) => Type.create(CustomType, magicProperty);
```

## Notes

Base-type methods, like `optional` should usually be called at the very end of parameters chain,
because TypeScript doesn't allow to pass  higher kinded types (aka "generic generic types"),
so as a result all generic-modifying methods in base `Type` class by default return `Type<T>`
instead of the actual type. Something like this:

```typescript
Types.array() // ArrayType<unknown>
  .containing(Types.string(), Types.number()) // ArrayType<string|number>
  .optional() // Type<(string|number)[] | undefined>
```

To overcome this issue, all of the basic types override these base methods, replacing the result with proper type.

```typescript
Types.array() // ArrayType<unknown>
  .containing(Types.string(), Types.number()) // ArrayType<string|number>
  .optional() // ArrayType<(string|number)[] | undefined>
```
