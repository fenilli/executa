# Executa

**Executa** is a lightweight, secure evaluator for JavaScript-like expressions. It parses and evaluates expressions in a sandboxed environment, allowing safe computation without giving access to the global scope.

---

## Features

- Lexical analysis (tokenization) of JS-like expressions
- Full parser for arithmetic, logical, and comparison operations
- Support for:
  - Unary (`!`, `+`, `-`) and binary operations (`+`, `-`, `*`, `/`, `%`, `&&`, `||`, `??`, `==`, `!=`, `>`, `>=`, `<`, `<=`)
  - Parentheses and operator precedence
  - Member access andoptional chaining:
    - Dot access: obj.prop
    - Optional chaining: obj?.prop
    - Bracket access: obj[prop]
  - Function calls on identifiers or safe objects
  - Literals: numbers, strings, booleans, `null`
- Sandboxed evaluation with a user-provided context
- Safe methods for strings, arrays, numbers, and dates
- Written in TypeScript

---

## Installation

```bash
npm install executa
```

## Usage

```ts
import { parse, createEvaluator } from 'executa';

const evaluate = createEvaluator();

const program = parse('user.age * 2 >= 20 && user.active');
const context = {
  user: { age: 12, active: true },
};

console.log(evaluate(program, context)); // true
```

## API

Executa exposes functions and types to parse and evaluate expressions safely.

### Main Functions

- `parse(source: string): Program` — Parse a string expression into an AST.
- `createEvaluator = (whitelistedFns?: Readonly<Record<string, Function>>): (program: Program, context?: Context) => any` — Returns an evaluator that executes ASTs in a sandboxed context. Optional custom functions can be provided.

### Documentation

For full details on the AST, SyntaxKinds, and factory methods, see the [API Reference](./docs/api.md).

## Supported Grammar

The grammar is inspired by JavaScript expressions, including:

- Logical operators: `&&`, `||`, `??`
- Comparison: `<`, `<=`, `>`, `>=`, `==`, `!=`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Unary operators: `!`, `+`, `-`
- Member access: `obj.prop`, `obj?.prop`, `obj[prop]`
- Function calls on identifiers or safe objects: `fn(arg1, arg2)`, `(expr).fn()`
- Parentheses for grouping
- Literals: `number`, `string`, `boolean`, `null`
- Identifiers: alphanumeric names starting with letter, `$`, or `_`

For full grammar details, see the [EBNF](docs/ebnf.md).

## Safe Methods

Supported automatically on primitive and array objects:

**String:** `length`, `startsWith`, `endsWith`, `includes`, `indexOf`, `slice`, `toLowerCase`, `toUpperCase`, `trim`, `trimStart`, `trimEnd`

**Number:** `toFixed`, `toPrecision`, `toExponential`

**Array:** `length`, `includes`, `indexOf`, `slice`, `concat`, `join`

**Date:** `getTime`, `toISOString`, `getFullYear`, `getMonth`, `getDate`, `getDay`, `getHours`, `getMinutes`, `getSeconds`

## Whitelisted built-in functions

`abs`, `max`, `min`, `round`, `floor`, `ceil`, `pow`, `sqrt`, `sign`, `clamp`, `inRange`, `isEmpty`

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
