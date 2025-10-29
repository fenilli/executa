# Executa

**Executa** is a lightweight and secure evaluator for JavaScript-like expressions. It parses and evaluates expressions in a sandboxed environment, allowing controlled computation without exposing the global scope.

---

## Features

- Lexical analysis (tokenization) of JS-like expressions
- Full parser for arithmetic, logical, and comparison operations
- Support for:
  - Unary (`!`, `+`, `-`) and binary (`+`, `-`, `*`, `/`, `%`, `&&`, `||`, `??`, `==`, `!=`, `>`, `>=`, `<`, `<=`) operators
  - Parentheses and operator precedence
  - Member access and optional chaining:
    - Dot access: obj.prop
    - Optional chaining: obj?.prop
    - Bracket access: obj[prop]
  - Function calls
  - Literals: numbers, strings, booleans, `null`
- Sandboxed evaluation with a user-provided context
- Built-in functions
  - Math: `abs`, `max`, `min`, `round`, `floor`, `ceil`, `pow`, `sqrt`, `sign`, `clamp`, `inRange`
  - String: `trim`, `toLowerCase`, `toUpperCase`
  - Array: `length`, `includes`
  - Utility: `isEmpty`
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

- `parse(source: string): Program` — Parses a string expression into an abstract syntax tree (AST).
- `createEvaluator(builtins?: Record<string, Function>): (program: Program, context?: Context) => any` — Creates a secure evaluator using optional built-in functions.
  - Defaults to `builtinFns`, a curated set of safe built-in utilities.
- `builtinFns: Readonly<Record<string, Function>>` — Default safe functions available in the evaluator.

See the **[API Reference](./docs/api.md)** for a complete overview of the public API.

## Supported Grammar

Executa supports JavaScript-like expressions including:

- Logical: `&&`, `||`, `??`
- Comparison: `<`, `<=`, `>`, `>=`, `==`, `!=`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Unary: `!`, `+`, `-`
- Member access: `obj.prop`, `obj?.prop`, `obj[prop]`
- Function calls: `fn(arg1, arg2)`
- Grouping
- Literals: `number`, `string`, `boolean`, `null`
- Identifiers: alphanumeric names starting with letter, `$`, or `_`

For full grammar details, see the [EBNF](./docs/ebnf.md).

## Examples

```ts
// Basic usage
import { parse, createEvaluator } from 'executa';

const evaluate = createEvaluator(); // built-ins are already included if not specified
const program = parse('length(user.name) > 3 && !isEmpty(user.tags)');
const context = { user: { name: 'John', tags: ['a', 'b'] } };

console.log(evaluate(program, context)); // true

// Extending built-in functions
import { parse, createEvaluator, builtinFns } from 'executa';

const customFns = {
  ...builtinFns,
  upperFirst: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
};

const evaluate = createEvaluator(customFns);
const program = parse('upperFirst(user.name) == "John"');
const context = { user: { name: 'john' } };

console.log(evaluate(program, context)); // true
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
