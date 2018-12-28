import { isNil } from 'lodash';
import { Type } from '../type';

export class StringType extends Type<string> {
  constructor(public readonly regExp?: RegExp) {
    super();
    this.init(
      () => regExp ? `string/${regExp.source}/${regExp.flags}` : 'string',
      () => regExp
        ? `A string matching /${regExp.source}/${regExp.flags} regular expression.`
        : `Any string value.`
    );
  }

  convert = async (value: any) => {
    if (isNil(value)) {
      throw new Error(`Expected a string or a value that can be evaluated to string, got ${value}`);
    }
    const regExp = this.regExp;
    const str = value.toString();
    if (regExp && !str.match(regExp)) {
      throw new Error(`Expected a string matching /${regExp.source}/${regExp.flags} regular expression, got ${str}.`);
    }
    return str;
  };
}

export const stringType = (regExp?: RegExp) => new StringType(regExp);
