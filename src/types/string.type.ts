import { isNil } from 'lodash';
import { Type } from '../type';

class StringType extends Type<string> {
  private _regExp?: RegExp;

  constructor() {
    super();
    this.init(
      () => this._regExp ? `string/${this._regExp.source}/${this._regExp.flags}` : 'string',
      () => this._regExp
        ? `A string matching /${this._regExp.source}/${this._regExp.flags} regular expression.`
        : `Any string value.`
    );
  }

  regExp(regExp: RegExp): StringType {
    return Type.clone(this, (type) => {
      type._regExp = regExp;
    });
  }

  async convert(value: any): Promise<string> {
    if (isNil(value)) {
      throw new Error(`Expected a string or a value that can be evaluated to string, got ${value}`);
    }
    const regExp = this._regExp;
    const str = value.toString();
    if (regExp && !str.match(regExp)) {
      throw new Error(`Expected a string matching /${regExp.source}/${regExp.flags} regular expression, got ${str}.`);
    }
    return str;
  }

  copyTo(type: StringType) {
    super.copyTo(type);
    type._regExp = this._regExp;
  }
}

export const stringType = () => Type.create(StringType);
