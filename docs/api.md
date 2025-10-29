# Executa API Reference

This document describes the core data structures, enumerations, and helper functions used by Executa to parse, represent, and evaluate expressions. It serves as a technical reference for contributors and users who want to understand or extend the library.

---

## Overview

Executa parses JavaScript-like expressions into a structured AST that can be evaluated safely within a sandboxed context.

The public API provides:
- Typed node definitions for the AST
- The `SyntaxKind` enum that classifies each node
- Factory helpers for constructing nodes
- Context typing for evaluation environments
- Built-in functions for safe evaluation

---

## AST Structure

Every parsed expression is represented as a tree of `Expression` nodes.

### Program

```ts
export interface Program {
    kind: SyntaxKind.Program;
    expression: Expression;
}
```

### Expression

```ts
export type Expression =
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | MemberExpression
    | ParenthesizedExpression
    | Literal
    | Identifier;
```

### Literal

```ts
export type Literal =
    | NumericLiteral
    | StringLiteral
    | BooleanLiteral
    | NullLiteral;
```

---

### Node Definitions

```ts
export interface BinaryExpression {
    kind: SyntaxKind.BinaryExpression;
    operator: BinaryTokens;
    left: Expression;
    right: Expression;
}

export interface UnaryExpression {
    kind: SyntaxKind.UnaryExpression;
    operator: UnaryTokens;
    argument: Expression;
}

export interface CallExpression {
    kind: SyntaxKind.CallExpression;
    callee: Expression;
    args: Expression[];
}

export interface MemberExpression {
    kind: SyntaxKind.MemberExpression;
    object: Expression;
    property: Expression;
    optional: boolean;
}

export interface ParenthesizedExpression {
    kind: SyntaxKind.ParenthesizedExpression;
    expression: Expression;
}

export interface Identifier {
    kind: SyntaxKind.Identifier;
    name: string;
}
```

---

### Literals

```ts
export interface NumericLiteral {
    kind: SyntaxKind.NumericLiteral;
    value: number;
}

export interface StringLiteral {
    kind: SyntaxKind.StringLiteral;
    value: string;
}

export interface BooleanLiteral {
    kind: SyntaxKind.BooleanLiteral;
    value: boolean;
}

export interface NullLiteral {
    kind: SyntaxKind.NullLiteral;
    value: null;
}
```

---

### SyntaxKind enum

```ts
export enum SyntaxKind {
    // Root
    Program,

    // Expressions
    BinaryExpression,
    UnaryExpression,
    CallExpression,
    MemberExpression,
    ParenthesizedExpression,

    // Literals
    NumericLiteral,
    StringLiteral,
    BooleanLiteral,
    NullLiteral,

    // Identifiers
    Identifier,

    // Tokens
    BangToken, GreaterToken, LessToken,
    PlusToken, MinusToken, StarToken, SlashToken, PercentToken,
    LeftParenToken, RightParenToken, LeftBracketToken, RightBracketToken,
    DotToken, CommaToken,

    PipePipeToken, AmpAmpToken,
    QuestionQuestionToken, QuestionDotToken,
    EqualEqualToken, BangEqualToken,
    GreaterEqualToken, LessEqualToken,

    EOFToken,
}
```

---

## Factory

```ts
factory.createProgram(expression: Expression): Program
factory.createBinaryExpression(operator: BinaryTokens, left: Expression, right: Expression): BinaryExpression
factory.createUnaryExpression(operator: UnaryTokens, argument: Expression): UnaryExpression
factory.createParenthesizedExpression(expression: Expression): ParenthesizedExpression
factory.createCallExpression(callee: Expression, args: Expression[]): CallExpression
factory.createMemberExpression(object: Expression, property: Expression, optional: boolean): MemberExpression
factory.createNumericLiteral(value: number): NumericLiteral
factory.createStringLiteral(value: string): StringLiteral
factory.createBooleanLiteral(value: boolean): BooleanLiteral
factory.createNullLiteral(): NullLiteral
factory.createIdentifier(name: string): Identifier
```

## Context

All identifiers in expressions are resolved against the provided Context object.

```ts
type Primitive = string | number | boolean | null;

type SafeValue = Primitive | SafeValue[] | { [key: string]: SafeValue };

export interface Context {
    [name: string]: SafeValue;
}
```

## Built-in Functions

Executa provides a safe set of deterministic functions available by default through `builtinFns`:

```ts
export const builtinFns: Readonly<Record<string, Function>> = Object.freeze({
  abs: Math.abs,
  max: Math.max,
  min: Math.min,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  pow: Math.pow,
  sqrt: Math.sqrt,
  sign: Math.sign,
  clamp: (n: number, min: number, max: number) => Math.min(Math.max(n, min), max),
  inRange: (n: number, min: number, max: number) => n >= min && n <= max,

  length: (s: string | any[]) => s.length,
  includes: (s: string | any[], x: any) => s.includes(x),

  trim: (s: string) => s.trim(),
  toLowerCase: (s: string, locales?: Intl.LocalesArgument) =>
    locales ? s.toLocaleLowerCase(locales) : s.toLowerCase(),
  toUpperCase: (s: string, locales?: Intl.LocalesArgument) =>
    locales ? s.toLocaleUpperCase(locales) : s.toUpperCase(),

  isEmpty: (x: string | any[] | null | undefined) =>
    x == null || ((typeof x === 'string' || Array.isArray(x)) && x.length === 0),
});
```

You can override or extend this list when creating your evaluator:

```ts
const evaluate = createEvaluator({
  ...builtinFns,
  upperFirst: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
});
```

## Notes

- The AST and SyntaxKind definitions remain stable across minor versions.
- Only expressions are supported; statements and declarations are intentionally excluded.
- The parser and evaluator are pure and side-effect-free.
