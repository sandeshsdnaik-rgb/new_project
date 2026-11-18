class FormulaParser {
  constructor(expression) {
    this.expression = expression || '';
    this.index = 0;
    this.tokens = this.tokenize(expression);
    this.pointer = 0;
  }

  tokenize(expression) {
    const pattern = /\s*([A-Za-z_][A-Za-z0-9_]*|\d*\.?\d+(?:[eE][-+]?\d+)?|[()+\-*/%]|\^)/g;
    const tokens = [];
    let match;
    while ((match = pattern.exec(expression)) !== null) {
      const token = match[1];
      if (token === ' ') continue;
      tokens.push(token);
    }
    if (tokens.join('').replace(/\s/g, '') !== expression.replace(/\s/g, '')) {
      throw new Error(`Unsupported characters in formula: ${expression}`);
    }
    return tokens;
  }

  parse() {
    const result = this.parseAddSub();
    if (this.pointer < this.tokens.length) {
      throw new Error(`Unexpected token: ${this.tokens[this.pointer]}`);
    }
    return result;
  }

  parseAddSub() {
    let node = this.parseMulDiv();
    while (this.pointer < this.tokens.length && ['+', '-'].includes(this.tokens[this.pointer])) {
      const operator = this.tokens[this.pointer];
      this.pointer += 1;
      const right = this.parseMulDiv();
      node = { type: 'binary', operator, left: node, right };
    }
    return node;
  }

  parseMulDiv() {
    let node = this.parseUnary();
    while (this.pointer < this.tokens.length && ['*', '/', '%'].includes(this.tokens[this.pointer])) {
      const operator = this.tokens[this.pointer];
      this.pointer += 1;
      const right = this.parseUnary();
      node = { type: 'binary', operator, left: node, right };
    }
    return node;
  }

  parseUnary() {
    if (this.pointer < this.tokens.length && ['+', '-'].includes(this.tokens[this.pointer])) {
      const operator = this.tokens[this.pointer];
      this.pointer += 1;
      return { type: 'unary', operator, value: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    if (this.pointer >= this.tokens.length) {
      throw new Error('Unexpected end of formula.');
    }
    const token = this.tokens[this.pointer];
    this.pointer += 1;

    if (!Number.isNaN(Number(token))) {
      return { type: 'number', value: Number(token) };
    }

    if (token === '(') {
      const expr = this.parseAddSub();
      if (this.tokens[this.pointer] !== ')') {
        throw new Error('Missing closing parenthesis.');
      }
      this.pointer += 1;
      return expr;
    }

    if (token === ')') {
      throw new Error('Unexpected closing parenthesis.');
    }

    if (['sqrt', 'abs', 'min', 'max'].includes(token)) {
      if (this.tokens[this.pointer] !== '(') {
        throw new Error(`Function ${token} requires a parenthesized argument.`);
      }
      this.pointer += 1;
      const value = this.parseAddSub();
      if (this.tokens[this.pointer] !== ')') {
        throw new Error(`Function ${token} missing closing parenthesis.`);
      }
      this.pointer += 1;
      return { type: 'function', name: token, argument: value };
    }

    return { type: 'variable', name: token };
  }
}

function evaluateAst(ast, variables = {}) {
  if (!ast) return 0;
  switch (ast.type) {
    case 'number':
      return ast.value;
    case 'variable': {
      const value = variables[ast.name];
      if (value === undefined || value === null || Number.isNaN(Number(value))) {
        throw new Error(`Missing or invalid variable: ${ast.name}`);
      }
      return Number(value);
    }
    case 'unary': {
      const operand = evaluateAst(ast.value, variables);
      return ast.operator === '-' ? -operand : operand;
    }
    case 'binary': {
      const left = evaluateAst(ast.left, variables);
      const right = evaluateAst(ast.right, variables);
      switch (ast.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': {
          if (right === 0) throw new Error('Division by zero in formula.');
          return left / right;
        }
        case '%': return left % right;
        default: throw new Error(`Unsupported operator: ${ast.operator}`);
      }
    }
    case 'function': {
      const argumentValue = evaluateAst(ast.argument, variables);
      switch (ast.name) {
        case 'sqrt':
          if (argumentValue < 0) throw new Error('sqrt requires non-negative input.');
          return Math.sqrt(argumentValue);
        case 'abs':
          return Math.abs(argumentValue);
        case 'min':
          return Math.min(argumentValue);
        case 'max':
          return Math.max(argumentValue);
        default:
          throw new Error(`Unsupported function: ${ast.name}`);
      }
    }
    default:
      throw new Error('Unknown AST node type.');
  }
}

function evaluateFormula(expression, variables = {}) {
  const parser = new FormulaParser(expression);
  const ast = parser.parse();
  return evaluateAst(ast, variables);
}

module.exports = {
  FormulaParser,
  evaluateFormula,
  evaluateAst
};
