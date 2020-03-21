// Helper functions
// Lowest common multiple
function lcm (x, y) {
  return !x || !y ? 0 : Math.abs(x * y / gcd(x, y));
}

// Greatest common divisor
function gcd (x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/** @class Simple class for working with fractions */
class Fraction {
  /**
     * Creates an instance of Fraction
     *
     * @constructor
     * @param {number|Fraction} a nominator | Fraction | decimal number @see Fraction::parseNumber
     * @param {number} [b] denominator
     *
     * @returns {Fraction} fraction object
     */
  constructor (a, b) {
    if (arguments.length < 2 && typeof (arguments[0]) === 'number') {
      return Fraction.parseNumber(a);
      // if there is one number as an argument, convert it to a fraction and return it
    } else if (arguments.length < 2 && a instanceof Fraction) {
      return a.reduce();
      // if there is one Fraction as an argument, reduce it and return it
    } else {
      // otherwise check if both args are number or Fraction
      Fraction.typeCheck(a, b);

      if (b === 0) throw new Fraction.FractionError('Denominator can not be 0');
      // if arg is a float convert it to a Fraction
      if (typeof a === 'number' && !Number.isInteger(a)) a = Fraction.parseNumber(a);
      if (typeof a === 'number' && !Number.isInteger(b)) a = Fraction.parseNumber(b);

      /** @private */
      this.a = a; // nominator
      /** @private */
      this.b = b; // denominator
      // everywhere in this class, a and b are nominator and denominator

      this.reduce();
    }
  }

  /**
     * Returns string representation of the Fraction
     *
     * @returns {String} fraction in format a/b
     */

  toString () {
    if (this.b === 1) return this.a.toString();
    return `${this.a.toString()}/${this.b.toString()}`;
  }

  /**
     * Converts fraction to float
     *
     * @returns {number} decimal representation of the Fraction
     */

  valueOf () {
    return this.a.valueOf() / this.b.valueOf();
  }

  /**
     * Divides the fist argument by the second argument
     * @param {number|Fraction} x divident
     * @param {number|Fraction} y divisor
     *
     * @returns {Fraction} fraction
     */

  static divide (x, y) {
    this.typeCheck(x, y);

    x = this.reduce(x);
    y = this.reduce(y);

    const isNumX = typeof x === 'number';
    const isNumY = typeof y === 'number';
    if (isNumX && isNumY) return new this(x, y);
    else if (isNumX && !isNumY) return new this(x * y.b, y.a);
    else if (!isNumX && isNumY) return new this(x.a, x.b * y);
    else return new this(x.a * y.b, x.b * y.a);
  }

  /**
     * Wrapper for Fraction::divide, modifies Fraction
     * @param {number|Fraction} y divisor
     * @returns {Fraction} modified Fraction
     */
  divide (y) {
    const temp = Fraction.divide(this, y);

    this.a = temp.a;
    this.b = temp.b;

    this.reduce();

    return this;
  }

  /**
     * Multiplies both arguments together
     * @param {number|Fraction} a factor
     * @param {number|Fraction} y factor
     *
     * @returns {number|Fraction} product
     */
  static multiply (x, y) {
    this.typeCheck(x, y);

    x = this.reduce(x);
    y = this.reduce(y);

    const isNumX = typeof x === 'number';
    const isNumY = typeof y === 'number';
    let result;

    if (isNumX && isNumY) return x * y;
    else if (isNumX && !isNumY) result = new this(x * y.a, y.b);
    else if (!isNumX && isNumY) result = new this(y * x.a, x.b);
    else result = new this(x.a * y.a, x.b * y.b);

    return this.reduce(result);
  }

  /**
     * Wrapper for Fraction::multiply, modifies Fraction
     * @param {number|Fraction} y multiplicand
     * @returns {Fraction} modified Fraction
     */
  multiply (y) {
    const temp = Fraction.multiply(this, y);

    this.a = temp.a;
    this.b = temp.b;

    this.reduce();

    return this;
  }

  /**
     * Adds both arguments together
     * @param {number|Fraction} x summand
     * @param {number|Fraction} y summand
     *
     * @returns {number|Fraction} sum
     */
  static add (x, y) {
    this.typeCheck(x, y);

    x = this.reduce(x);
    y = this.reduce(y);

    const isNumX = typeof x === 'number';
    const isNumY = typeof y === 'number';
    let result;

    if (isNumX && isNumY) { return x + y; } else if (isNumX && !isNumY) {
      result = new this(x * y.b + y.a, y.b);
    } else if (!isNumX && isNumY) {
      result = new this(y * x.b + x.a, x.b);
    } else {
      const denominator = lcm(x.b, y.b);
      result = new this((x.a * denominator / x.b) + (y.a * denominator / y.b), denominator);
    }

    return Fraction.reduce(result);
  }

  /**
     * Wrapper for Fraction::add, modifies Fraction
     * @param {number|Fraction} y summand
     * @returns {Fraction} modified Fraction
     */
  add (y) {
    const temp = Fraction.add(this, y);

    this.a = temp.a;
    this.b = temp.b;

    this.reduce();

    return this;
  }

  /**
     * Subtracts the second argument from the first argument
     * @param {number|Fraction} x minuend
     * @param {number|Fraction} y subtrahend
     *
     * @returns {number|Fraction} difference
     */
  static subtract (x, y) {
    this.typeCheck(x, y);

    x = this.reduce(x);
    y = this.reduce(y);

    const isNumX = typeof x === 'number';
    const isNumY = typeof y === 'number';
    let result;

    if (isNumX && isNumY) { return x - y; } else if (isNumX && !isNumY) {
      result = new this(x * y.b - y.a, y.b);
    } else if (!isNumX && isNumY) {
      result = new this(y * x.b - x.a, x.b);
    } else {
      const denominator = lcm(x.b, y.b);
      result = new this((x.a * denominator / x.b) - (y.a * denominator / y.b), denominator);
    }

    return this.reduce(result);
  }

  /**
     * Wrapper for Fraction::subtract, modifies Fraction
     * @param {number|Fraction} y subtrahend
     * @returns {Fraction} modified Fraction
     */
  subtract (y) {
    const temp = Fraction.add(this, y);

    this.a = temp.a;
    this.b = temp.b;

    this.reduce();

    return this;
  }

  /**
     * Raises x to power of y
     * @param {number|Fraction} x base
     * @param {number|Fraction} y exponent
     *
     * @returns {number|Fraction} power
     */
  static power (x, y) {
    this.typeCheck(x, y);

    x = this.reduce(x);
    y = this.reduce(y);

    const isNumX = typeof x === 'number';
    const isNumY = typeof y === 'number';
    let result;

    if (isNumX && isNumY) return x ** y;
    else if (isNumX && !isNumY) {
      return new Root(x ** y.a, y.b);
    } else if (!isNumX && isNumY) {
      if (y < 0) {
        x = x.inversed;
        y *= -1;
      }
      result = new this(x.a ** y, x.b ** y);
    } else {
      if (y.a === 1) {
        return Fraction.root(x, y.b);
      } else {
        const newA = new Root(Fraction.power(x.a, y.a), y.b);
        const newB = new Root(Fraction.power(x.b, y.a), y.b);
        result = new Fraction(newA, newB);
      }
    }

    return this.reduce(result);
  }

  /**
     * Wrapper for Fraction::power, modifies Fraction
     * @param {number|Fraction} y exponent
     * @returns {Fraction} modified Fraction
     */
  power (y) {
    const temp = Fraction.power(this, y);

    this.a = temp.a;
    this.b = temp.b;

    this.reduce();

    return this;
  }

  /**
     * Takes yth root of x
     *
     * @param {number|Fraction} x radicand
     * @param {number|Fraction} y degree of root
     *
     * @returns {number|Fraction} power
     */
  static root (x, y) {
    this.typeCheck(x, y);

    x = this.reduce(x);
    y = this.reduce(y);

    const isNumX = typeof x === 'number';
    const isNumY = typeof y === 'number';
    let result;

    if (isNumX && isNumY) return new Root(x, y);
    else if (isNumX && !isNumY) {
      return new Root(Fraction.power(x.a, y.a), y.b);
    } else if (!isNumX && isNumY) {
      const newA = new Root(x.a, y);
      const newB = new Root(x.b, y);
      result = new Fraction(newA, newB);
    } else {
      const newA = new Root(Fraction.power(x.a, y.a), y.b);
      const newB = new Root(Fraction.power(x.b, y.a), y.b);
      result = new Fraction(newA, newB);
    }

    return this.reduce(result);
  }

  /**
       * Wrapper for Fraction::power, modifies Fraction
       * @param {number|Fraction} y degree of root
       * @returns {Fraction} modified Fraction
       */
  root (y) {
    const temp = Fraction.root(this, y);

    this.a = temp.a;
    this.b = temp.b;

    this.reduce();

    return this;
  }

  /**
     * Reduces given fraction
     * @param {number|Fraction} x fraction to reduce
     * @returns {number|Fraction} reduced fraction or its integer representation
     */
  static reduce (x) {
    if (typeof x === 'number') return x;
    if (x.a instanceof Root || x.b instanceof Root) return x;
    if (!(x instanceof Fraction)) throw Error('Argument must be number or fraction');
    if (typeof x.a !== 'number' || typeof x.b !== 'number') {
      return this.reduce(
        this.divide(x.a, x.b)
      );
    }

    const coefficient = gcd(x.a, x.b);
    x.a /= coefficient;
    x.b /= coefficient;

    if (x.b === 1) { return x.a; }

    return x;
  }

  /**
     * Wrapper for Fraction::reduce, modifies Fraction
     * @returns {Fraction} reduced fraction
     */
  reduce () {
    const temp = Fraction.reduce(this);
    if (typeof temp === 'number') {
      this.a = temp;
      this.b = 1;
    } else {
      this.a = temp.a;
      this.b = temp.b;
    }

    return this;
  }

  /**
     * Creates fraction from given (decimal) number
     * !use with caution, can produce very awful fractions due to JS precission errors!
     * @param {number} x number to be converted
     * @returns {Fraction} resultijng fraction
     */
  static parseNumber (x) {
    if (typeof (x) !== 'number') return NaN;
    if (Math.floor(x) === x) return new this(x, 1);
    const integer = x.toString().split('.')[0];
    const decimals = x.toString().split('.')[1];
    const tens = 10 ** decimals.length;
    return new this(tens * integer + parseInt(decimals), tens);
  }

  /**
     * Swaps nominator and denominator
     * @returns {Fraction} inversed fraction
     */
  get inversed () {
    return new Fraction(this.b, this.a);
  }

  /**
     * Checks if parameters are either number or Fraction
     * If not, it throws Error
     * @param {*} x
     * @param {*} b
     *
     * @private
     */
  static typeCheck (x, y) {
    const checkX = Number(x) !== undefined || x instanceof Fraction || x instanceof Root;
    const checkY = Number(y) !== undefined || y instanceof Fraction || y instanceof Root;
    if (!(checkX && checkY)) { throw new Fraction.FractionError('All parameters must be integers or Fractions'); }
  }
}

Fraction.FractionError = class extends Error {
  constructor (name) {
    super();
    this.name = 'FractionError: ' + name;
  }
};

class Root { // eslint-disable-line no-unused-vars
  constructor (radicand, degree) {
    Root.typeCheck(radicand, degree);

    this.rad = radicand;
    this.deg = degree;

    this.simplify();
  }

  toString () {
    return `${this.rad}${this.deg === 1 ? '' : `^(1/${this.deg})`}`;
  }

  valueOf () {
    return this.rad ** (1 / this.deg);
  }

  simplify () {
    const numericalValue = (this.rad ** (1 / this.deg));
    if (numericalValue % 1 === 0) {
      this.rad = numericalValue;
      this.deg = 1;
    }
  }

  static typeCheck (x, y) {
    const checkX = Number(x) !== undefined || x instanceof Fraction;
    const checkY = Number(y) !== undefined || y instanceof Fraction;
    if (!(checkX && checkY)) throw new Error('All parameters must be integers or Fractions');
  }
}
