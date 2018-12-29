import { isNil } from 'lodash';
import { Type } from '../type';

export class NumberType extends Type<number> {
  _integer: boolean = false;
  _infinity: boolean = false;
  _min?: number;
  _max?: number;

  constructor() {
    super();
    this.init(
      () => (this._integer ? 'integer' : 'number') + this.range,
      () => {
        const type = this._integer ? 'Integer' : 'Number';
        const range = this.range;
        return range
          ? `${type} in range ${range}`
          : `Any ${type.toLowerCase()}.`;
      }
    );
  }

  get range(): string {
    return (!isNil(this._min) || !isNil(this._max))
      ? `<${isNil(this._min) ? '-∞' : this._min}, ${isNil(this._max) ? '+∞' : this._max}>`
      : '';
  }

  min(min: number): NumberType {
    return Type.clone(this, type => type._min = min);
  }

  max(max: number): NumberType {
    return Type.clone(this, type => type._max = max);
  }

  integer(): NumberType {
    return Type.clone(this, type => type._integer = true);
  }

  infinity(): NumberType {
    return Type.clone(this, type => type._infinity = true);
  }

  async convert(value: any): Promise<number> {
    const n = typeof value === 'number'
      ? value
      : parseFloat(value);
    if (isNaN(n)) {
      throw new Error(`Expected a number or a value that can be evaluated to number, got ${value} evaluated to ${n}.`);
    }
    if (this._integer && !Number.isInteger(n)) {
      throw new Error(`Expected an integer, got ${n}.`);
    }
    if (!this._infinity && !Number.isFinite(n)) {
      throw new Error(`Expected an finite number, got ${n}.`);
    }
    const min = this._min;
    const max = this._max;
    if ((!isNil(min) && min > n) || (!isNil(max) && max < n)) {
      throw new Error(`Expected number to be in range ${this.range}, got ${n}.`);
    }
    return n;
  }

  copyTo(type: NumberType) {
    super.copyTo(type);
    type._integer = this._integer;
    type._min = this._min;
    type._max = this._max;
    type._infinity = this._infinity;
  }
}

export const numberType = () => new NumberType();
