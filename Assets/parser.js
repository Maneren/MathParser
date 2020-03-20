// Helper functions
// Rounding with precision
const round = (number, prec = 3) => {
  const n = 10 ** prec;
  const x = number * n;
  if (x % 1 < 0.5) return (x - x % 1) / n;
  else return (x - x % 1 + 1) / n;
};

// logging utility
class Log {
  static i (tag, ...msgs) {
    if (!tag) throw new Error('No arguments given');
    if (msgs.length < 1) throw new Error('No text given');
    const msg = msgs.join(' ');
    console.log(`${this.getTime()} I/${tag}: ${msg}`);
  }

  static d (tag, ...msgs) {
    if (!tag) throw new Error('No arguments given');
    if (msgs.length < 1) throw new Error('No text given');
    const msg = msgs.join(' ');
    console.log(`${this.getTime()} D/${tag}: ${msg}`);
  }

  static e (tag, ...msgs) {
    if (!tag) throw new Error('No arguments given');
    if (msgs.length < 1) throw new Error('No text given');
    const msg = msgs.join(' ');
    console.error(`${this.getTime()} E/${tag}: ${msg}`);
  }

  static getTime () {
    const d = new Date();
    return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
  }
}

// stack class
class Stack {
  constructor () {
    this.items = [];
  }

  push (...items) {
    for (const item of items) this.items.push(item);
  }

  pop () {
    return this.items.pop();
  }

  isEmpty () {
    return !(this.items.length > 0);
  }

  get length () {
    return this.items.length;
  }

  get top () {
    return this.items[this.items.length - 1];
  }

  toString () {
    return this.items.join(', ');
  }
}

// parser
class ParserError extends Error {
  constructor (name) {
    super();
    this.name = 'ParserError: ' + name;
  }
}

class Parser { // eslint-disable-line no-unused-vars
  constructor (options) {
    this.precision = typeof (options.precision) === 'number' ? parseInt(options.precision) : 5;
    this.__errorHandler = typeof (options.errorHandler) === 'function' ? options.errorHandler : e => {
      throw e;
    };
  }

  __precedence (oper) {
    switch (oper) {
      case '(':
        return 1;
      case '+':
      case '-':
        return 2;
      case '*':
      case '/':
        return 3;
      case '^':
        return 4;
      default:
        return 5;
    }
  }

  __isOperator (symbol) {
    const charCode = symbol.charCodeAt(0);
    switch (charCode) {
      case 43: // +
      case 45: // -
      case 42: // *
      case 47: // /
      case 94: // ^
      case 40: // (
      case 41: // )
        return true;
      default:
        return false;
    }
  }

  __isDigit (symbol) {
    const charCode = symbol.charCodeAt(0);
    return (charCode > 47 && charCode < 59);
  }

  __isLetter (symbol) {
    const charCode = symbol.charCodeAt(0);
    // Log.d("typeOfSymbol", symbol, charCode)
    return (charCode > 96 && charCode < 123) || (charCode > 64 && charCode < 91);
  }

  __checkImplicitMult (infix, i, stack, postfix) {
    const precedence = this.__precedence;
    const isDigit = this.__isDigit;
    const isOperator = this.__isOperator;
    const isLetter = this.__isLetter;

    for (let j = 0; ; j++) {
      const next = infix[i + 1 + j];
      if (next === undefined) { break; }
      // Log.d("implicitMultiplication", next);
      if (next.charCodeAt(0) < 33) continue;
      else if (isDigit(next)) throw new ParserError("Unexpected number: '" + next + "'");
      else if (isLetter(next)) {
        // Log.d("implicitMultiplication", "isLetter");
        // Log.d("implicitMultiplication", "adding *");
        i += ++j;
        let temp = next;
        while (true) {
          const next = infix[i + 1];
          if (next === undefined) { break; }
          if (!isLetter(next)) { break; }
          temp += infix[++i];
          // Log.d("letterLoop", 'temp: "' + temp + '"');
        }
        if (typeof Parser.math[temp] === 'function') {
          stack.push('*');
        } else if (typeof Parser.math[temp] === 'number') {
          postfix.push(stack.pop());
          stack.push('*');
        }
        break;
      } else if (isOperator(next) && next !== '(') break;
      else {
        // Log.d("implicitMultiplication", "adding *", "precedence:", precedence(stack.top));
        if (precedence(stack.top) < 3 || stack.top === undefined) stack.push('*');
        else {
          const operator = stack.pop();
          if (operator !== '(') postfix.push(operator); // fix
          stack.push('*');
        }
        break;
      }
    }
  }

  __convertToPostfix (infix) {
    const stack = new Stack();
    const postfix = [];
    const precedence = this.__precedence;
    const isDigit = this.__isDigit;
    const isOperator = this.__isOperator;
    const isLetter = this.__isLetter;

    for (let i = 0; i < infix.length; i++) {
      const symbol = infix[i];
      if (symbol.charCodeAt(0) < 33) continue;
      // Log.d(TAG, 'symbol: "' + symbol + '"', 'stack: "' + stack + '"', 'postfix: "' + postfix + '"', i);
      if (isDigit(symbol)) {
        // Log.d(TAG, "isDigit")
        let temp = symbol;
        let dec = false;
        // collecting all digits
        while (true) {
          const next = infix[i + 1];
          if (next === undefined) { break; }
          if (!(isDigit(next) || next === '.')) { break; }
          if (next === '.') {
            if (!dec) dec = true;
            else throw new ParserError("Unxpected token: '.'");
          }
          temp += infix[++i];
          // Log.d("numberLoop", 'temp: "' + temp + '"');
        }
        if (dec) postfix.push(new Parser.math.F(Number(temp)));
        else postfix.push(Number(temp));
        // Log.d("numberPush", 'temp: "' + temp + '"');
        this.__checkImplicitMult(infix, i, stack, postfix);
      } else if (isOperator(symbol)) {
        // Log.d(TAG, "isOperator")
        if (symbol === '(')stack.push(symbol);
        else if (symbol === ')') {
          while (stack.top !== '(') {
            const operator = stack.pop();
            // Log.d("closingBracket", operator)
            if (stack.isEmpty()) { throw new ParserError("Unexpected token: ')'"); }
            postfix.push(operator);
          }
          stack.pop();
          this.__checkImplicitMult(infix, i, stack, postfix);
        } else if (symbol === '^') stack.push(symbol);
        else if (precedence(symbol) > precedence(stack.top) || stack.top === undefined) stack.push(symbol);
        else {
          postfix.push(stack.pop());
          stack.push(symbol);
        }
      } else if (isLetter(symbol)) {
        // Log.d(TAG, "isLetter");
        let temp = symbol;
        while (true) {
          const next = infix[i + 1];
          if (next === undefined) { break; }
          if (!(isLetter(next) || next === '.')) { break; }
          temp += infix[++i];
          // Log.d("letterLoop", 'temp: "' + temp + '"');
        }
        if (Parser.math[temp] instanceof Function) stack.push(temp);
        else if (typeof Parser.math[temp] === 'number') {
          postfix.push(Parser.math[temp]);
          this.__checkImplicitMult(infix, i, stack, postfix);
        } else { throw new ParserError(temp + ' is not defined'); }
      }
    }

    // Log.d(TAG, "push rest:", stack)
    while (stack.length > 0) {
      const symbol = stack.pop();
      if (symbol === '(') throw new ParserError('Bracket not closed');
      else { postfix.push(symbol); }
    }

    return postfix;
  }

  __evaluate (postfix) {
    let op1, op2;
    const stack = new Stack();
    const isOperator = this.__isOperator;
    const isLetter = this.__isLetter;

    for (const ch of postfix) {
      // Log.d("eval", `"${ch}" = ${typeof ch}`, stack)
      if (typeof (ch) === 'number' || typeof (ch) === 'object') {
        stack.push(ch);
      } else if (isOperator(ch)) {
        op2 = stack.pop();
        op1 = stack.pop();
        // Log.d("evalOperator", op1, ch, op2, stack);
        if (op1 === undefined || op2 === undefined) throw new ParserError('Missing operand');
        switch (ch) {
          case '+':
            stack.push(Parser.math.F.add(op1, op2));
            break;
          case '-':
            stack.push(Parser.math.F.subtract(op1, op2));
            break;
          case '*':
            stack.push(Parser.math.F.multiply(op1, op2));
            break;
          case '/':
            stack.push(Parser.math.F.divide(op1, op2));
            break;
          case '^':
            stack.push(Parser.math.F.power(op1, op2));
            break;
        }
      } else if (isLetter(ch)) {
        const op = stack.pop();
        const fn = Parser.math[ch];
        stack.push(fn(op));
      } else { throw new ParserError("Unexpected token: '" + ch + "'"); }
    }

    return stack.pop();
  }

  cleanInput (input) {
    while (input.indexOf('  ') !== -1) input = input.replace('  ', ' ');
    return input;
  }

  parse (string) {
    const start = Date.now();
    string = this.cleanInput(string);
    try {
      const postfix = this.__convertToPostfix(string);

      const output = this.__evaluate(postfix);

      if (typeof output === 'number') return round(output, this.precision);
      return output;
    } catch (error) {
      if (error instanceof ParserError || error instanceof Parser.math.F.FractionError) {
        this.__errorHandler(error);
      } else {
        throw error; // re-throw the error unchanged
      }
    } finally {
      Log.d('parse', 'Parsed in: ', Date.now() - start, 'ms');
    }
  }
}
