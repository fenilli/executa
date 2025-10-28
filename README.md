# Executa

**Executa** is a lightweight, secure evaluator for JavaScript-like expressions. It parses and evaluates expressions in a sandboxed environment, allowing safe computation without giving access to the global scope.

---

## Features

- Lexical analysis (tokenization) of JS-like expressions
- Full parser for arithmetic, logical, and comparison operations
- Support for:
  - Unary (`!`, `+`, `-`) and binary operations (`+`, `-`, `*`, `/`, `%`, `&&`, `||`, `??`, `==`, `!=`, `>`, `>=`, `<`, `<=`)
  - Parentheses and operator precedence
  - Member access (`obj.prop`, `obj?.prop`) and array access (`obj[prop]`)
  - Function calls
  - Literals: numbers, strings, booleans, `null`
- Sandboxed evaluation with a user-provided context
- Written in TypeScript

---

## Installation

```bash
npm install executa
```

## Usage

```ts
import { parse, evaluate } from 'executa';

const program = parse('user.age * 2 >= 20 && user.active');
const context = {
  user: { age: 12, active: true },
};

console.log(evaluate(program, context)); // true or false
```

## API

Executa exposes functions and types to parse and evaluate expressions safely.

### Main Functions

- `parse(source: string): Program` — Parse a string expression into an AST.
- `evaluate(program: Program, context?: Context): any` — Evaluate a parsed program in a sandboxed context.

### Documentation

For full details on the AST, SyntaxKinds, and factory methods, see the [API Reference](./docs/api.md).

## Supported Grammar

The grammar is inspired by JavaScript expressions, including:

- Logical operators: `&&`, `||`, `??`
- Comparison: `<`, `<=`, `>`, `>=`, `==`, `!=`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Unary operators: `!`, `+`, `-`
- Member access: `obj.prop`, `obj?.prop`, `obj[prop]`
- Function calls: `fn(arg1, arg2)`
- Parentheses for grouping
- Literals: `number`, `string`, `boolean`, `null`
- Identifiers: alphanumeric names starting with letter, `$`, or `_`

For full grammar details, see the [EBNF](docs/ebnf.md).

## Example

```ts
import { parse, evaluate } from 'executa';

const program = parse('Math.max(a, b) * 2 ?? 10');
const context = { a: 5, b: 3, Math: Math };

console.log(evaluate(program, context)); // 10
```

## Development
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Build and watch for changes
npm run dev
```

## License

MIT © Luiz Gustavo Siqueira Fenilli
[GitHub Repository](https://github.com/fenilli/executa)
