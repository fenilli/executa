# Executa API Reference

This document details the **AST structure**, **SyntaxKind enums**, and the **factory** methods for programmatically creating nodes.

---

## AST

### Literal
```ts
export type Literal =
    | NumericLiteral
    | StringLiteral
    | BooleanLiteral
    | NullLiteral;
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

### BinaryTokens
```ts
export type BinaryTokens =
    | SyntaxKind.GreaterToken
    | SyntaxKind.LessToken
    | SyntaxKind.PlusToken
    | SyntaxKind.MinusToken
    | SyntaxKind.StarToken
    | SyntaxKind.SlashToken
    | SyntaxKind.PercentToken
    | SyntaxKind.PipePipeToken
    | SyntaxKind.AmpAmpToken
    | SyntaxKind.QuestionQuestionToken
    | SyntaxKind.EqualEqualToken
    | SyntaxKind.BangEqualToken
    | SyntaxKind.GreaterEqualToken
    | SyntaxKind.LessEqualToken;
```

### UnaryTokens
```ts
export type UnaryTokens =
    | SyntaxKind.BangToken
    | SyntaxKind.MinusToken
    | SyntaxKind.PlusToken;
```

### Program
```ts
export interface Program {
    kind: SyntaxKind.Program;
    expression: Expression;
}
```

### BinaryExpression
```ts
export interface BinaryExpression {
    kind: SyntaxKind.BinaryExpression;
    operator: BinaryTokens;
    left: Expression;
    right: Expression;
}
```

### UnaryExpression
```ts
export interface UnaryExpression {
    kind: SyntaxKind.UnaryExpression;
    operator: UnaryTokens;
    argument: Expression;
}
```

### CallExpression
```ts
export interface CallExpression {
    kind: SyntaxKind.CallExpression;
    callee: Expression;
    args: Expression[];
}
```

### MemberExpression
```ts
export interface MemberExpression {
    kind: SyntaxKind.MemberExpression;
    object: Expression;
    property: Expression;
    optional: boolean;
}
```

### ParenthesizedExpression
```ts
export interface ParenthesizedExpression {
    kind: SyntaxKind.ParenthesizedExpression;
    expression: Expression;
}
```

### NumericLiteral
```ts
export interface NumericLiteral {
    kind: SyntaxKind.NumericLiteral;
    value: number;
}
```

### StringLiteral
```ts
export interface StringLiteral {
    kind: SyntaxKind.StringLiteral;
    value: string;
}
```

### BooleanLiteral
```ts
export interface BooleanLiteral {
    kind: SyntaxKind.BooleanLiteral;
    value: boolean;
}
```

### NullLiteral
```ts
export interface NullLiteral {
    kind: SyntaxKind.NullLiteral;
    value: null;
}
```

### Identifier
```ts
export interface Identifier {
    kind: SyntaxKind.Identifier;
    name: string;
}
```

## SyntaxKind enum

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

## Factory

The factory object provides helper methods to create AST nodes programmatically:

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

All identifiers used in expressions must exist in the provided Context when calling evaluate.

```ts
interface Context {
    [name: string]: any;
}
```
