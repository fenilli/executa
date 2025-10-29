import { type Token, TokenKind, lex } from './lexer';

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

interface ParserState {
    tokens: Token[];
    cursor: number;
}

export type Literal =
    | NumericLiteral
    | StringLiteral
    | BooleanLiteral
    | NullLiteral;

export type Expression =
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | MemberExpression
    | ParenthesizedExpression
    | Literal
    | Identifier;

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

export type UnaryTokens =
    | SyntaxKind.BangToken
    | SyntaxKind.MinusToken
    | SyntaxKind.PlusToken;

export interface Program {
    kind: SyntaxKind.Program;
    expression: Expression;
}

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

export interface Identifier {
    kind: SyntaxKind.Identifier;
    name: string;
}

export const factory = {
    createProgram: (expression: Expression): Program => ({ kind: SyntaxKind.Program, expression }),
    createBinaryExpression: (operator: BinaryTokens, left: Expression, right: Expression): BinaryExpression => ({ kind: SyntaxKind.BinaryExpression, operator, left, right }),
    createUnaryExpression: (operator: UnaryTokens, argument: Expression): UnaryExpression => ({ kind: SyntaxKind.UnaryExpression, operator, argument }),
    createParenthesizedExpression: (expression: Expression): ParenthesizedExpression => ({ kind: SyntaxKind.ParenthesizedExpression, expression }),
    createCallExpression: (callee: Expression, args: Expression[]): CallExpression => ({ kind: SyntaxKind.CallExpression, callee, args }),
    createMemberExpression: (object: Expression, property: Expression, optional: boolean): MemberExpression => ({ kind: SyntaxKind.MemberExpression, object, property, optional }),
    createNumericLiteral: (value: number): NumericLiteral => ({ kind: SyntaxKind.NumericLiteral, value }),
    createStringLiteral: (value: string): StringLiteral => ({ kind: SyntaxKind.StringLiteral, value }),
    createBooleanLiteral: (value: boolean): BooleanLiteral => ({ kind: SyntaxKind.BooleanLiteral, value }),
    createNullLiteral: (): NullLiteral => ({ kind: SyntaxKind.NullLiteral, value: null }),
    createIdentifier: (name: string): Identifier => ({ kind: SyntaxKind.Identifier, name }),
};

const current = (state: ParserState) => state.tokens[state.cursor];
const eat = (state: ParserState, kind: TokenKind) => {
    const token = current(state);
    if (token.kind !== kind) throw new SyntaxError(`Expected ${TokenKind[kind]}, got ${TokenKind[token.kind]}`);
    state.cursor++;

    return token;
};

export function parse(source: string) {
    const state: ParserState = { tokens: lex(source), cursor: 0 };
    return parseProgram(state);
}

// Program ::= Expression
function parseProgram(state: ParserState): Program {
    const expression = parseExpression(state);
    eat(state, TokenKind.EOF);

    return factory.createProgram(expression);
}

// Expression ::= LogicalOr
function parseExpression(state: ParserState): Expression {
    return parseLogicalOr(state);
}

// LogicalOr ::= NullishCoalescing { "||" NullishCoalescing }
function parseLogicalOr(state: ParserState): Expression {
    let left = parseNullishCoalescing(state);

    while (current(state).kind === TokenKind.PIPE_PIPE) {
        eat(state, TokenKind.PIPE_PIPE);
        const operator = SyntaxKind.PipePipeToken;

        const right = parseNullishCoalescing(state);
        left = factory.createBinaryExpression(operator, left, right);
    }

    return left;
}

// NullishCoalescing ::= LogicalAnd { "??" LogicalAnd }
function parseNullishCoalescing(state: ParserState): Expression {
    let left = parseLogicalAnd(state);

    while (current(state).kind === TokenKind.QUESTION_QUESTION) {
        eat(state, TokenKind.QUESTION_QUESTION);
        const operator = SyntaxKind.QuestionQuestionToken;

        const right = parseLogicalAnd(state);
        left = factory.createBinaryExpression(operator, left, right);
    }

    return left;
}


// LogicalAnd ::= Equality { "&&" Equality }
function parseLogicalAnd(state: ParserState): Expression {
    let left = parseEquality(state);

    while (current(state).kind === TokenKind.AMP_AMP) {
        eat(state, TokenKind.AMP_AMP);
        const operator = SyntaxKind.AmpAmpToken;

        const right = parseEquality(state);
        left = factory.createBinaryExpression(operator, left, right);
    }

    return left;
}

// Equality ::= Comparison { ("==" | "!=") Comparison }
function parseEquality(state: ParserState): Expression {
    let left = parseComparison(state);

    while ([TokenKind.EQUAL_EQUAL, TokenKind.BANG_EQUAL].includes(current(state).kind)) {
        const token = current(state);

        const operator = token.kind === TokenKind.EQUAL_EQUAL
            ? SyntaxKind.EqualEqualToken
            : SyntaxKind.BangEqualToken;

        eat(state, token.kind);

        const right = parseComparison(state);
        left = factory.createBinaryExpression(operator, left, right);
    }

    return left;
}

// Comparison ::= Additive { ("<" | "<=" | ">" | ">=") Additive }
function parseComparison(state: ParserState): Expression {
    let left = parseAdditive(state);

    while ([TokenKind.LESS, TokenKind.LESS_EQUAL, TokenKind.GREATER, TokenKind.GREATER_EQUAL].includes(current(state).kind)) {
        const token = current(state);
        let operator: BinaryTokens;

        switch (token.kind) {
            case TokenKind.LESS: operator = SyntaxKind.LessToken; break;
            case TokenKind.LESS_EQUAL: operator = SyntaxKind.LessEqualToken; break;
            case TokenKind.GREATER: operator = SyntaxKind.GreaterToken; break;
            case TokenKind.GREATER_EQUAL: operator = SyntaxKind.GreaterEqualToken; break;
            default: throw new SyntaxError(`Unexpected token: ${token.kind}, expected comparison token.`);
        }

        eat(state, token.kind);

        const right = parseAdditive(state);
        left = factory.createBinaryExpression(operator, left, right);
    }

    return left;
}

// Additive ::= Multiplicative { ("+" | "-") Multiplicative }
function parseAdditive(state: ParserState): Expression {
    let left = parseMultiplicative(state);

    while ([TokenKind.PLUS, TokenKind.MINUS].includes(current(state).kind)) {
        const operator = current(state).kind === TokenKind.PLUS ? SyntaxKind.PlusToken : SyntaxKind.MinusToken;
        eat(state, current(state).kind);

        const right = parseMultiplicative(state);
        left = factory.createBinaryExpression(operator, left, right);
    }

    return left;
}

// Multiplicative ::= Unary { ("*" | "/" | "%") Unary }
function parseMultiplicative(state: ParserState): Expression {
    let left = parseUnary(state);

    while ([TokenKind.STAR, TokenKind.SLASH, TokenKind.PERCENT].includes(current(state).kind)) {
        const token = current(state);
        let operator: BinaryTokens;

        switch (token.kind) {
            case TokenKind.STAR: operator = SyntaxKind.StarToken; break;
            case TokenKind.SLASH: operator = SyntaxKind.SlashToken; break;
            case TokenKind.PERCENT: operator = SyntaxKind.PercentToken; break;
            default: throw new SyntaxError(`Unexpected token: ${token.kind}, expected multiplicative token.`);
        }

        eat(state, token.kind);

        const right = parseUnary(state);
        left = factory.createBinaryExpression(operator, left, right);
    }

    return left;
}

// Unary ::= ("!" | "+" | "-") Unary | Primary
function parseUnary(state: ParserState): Expression {
    const token = current(state);

    if ([TokenKind.BANG, TokenKind.PLUS, TokenKind.MINUS].includes(token.kind)) {
        const operator = token.kind === TokenKind.BANG
            ? SyntaxKind.BangToken
            : token.kind === TokenKind.PLUS
                ? SyntaxKind.PlusToken
                : SyntaxKind.MinusToken;

        eat(state, token.kind);

        const argument = parseUnary(state);

        return factory.createUnaryExpression(operator, argument);
    }

    return parsePrimary(state);
}

// Primary ::= Literal | Identifier | "(" Expression ")" | MemberAccess?
function parsePrimary(state: ParserState): Expression {
    const token = current(state);

    switch (token.kind) {
        case TokenKind.NUMBER:
            eat(state, TokenKind.NUMBER);
            return parseMemberAccess(state, factory.createNumericLiteral(Number(token.value)));
        case TokenKind.STRING:
            eat(state, TokenKind.STRING);
            return parseMemberAccess(state, factory.createStringLiteral(token.value.slice(1, -1)));
        case TokenKind.TRUE:
        case TokenKind.FALSE:
            eat(state, token.kind);
            return parseMemberAccess(state, factory.createBooleanLiteral(token.kind === TokenKind.TRUE ? true : false));
        case TokenKind.NULL:
            eat(state, TokenKind.NULL);
            return parseMemberAccess(state, factory.createNullLiteral());

        case TokenKind.IDENTIFIER:
            eat(state, TokenKind.IDENTIFIER);
            return parseMemberAccess(state, factory.createIdentifier(token.value));

        case TokenKind.LEFT_PAREN:
            eat(state, TokenKind.LEFT_PAREN);
            const inner = parseExpression(state);
            eat(state, TokenKind.RIGHT_PAREN);
            return parseMemberAccess(state, factory.createParenthesizedExpression(inner));

        default:
            throw new SyntaxError(`Unexpected token: ${token.value}, expected primary token.`);
    }
}

// MemberAccess ::= { "." Identifier [Arguments] | "?." Identifier [Arguments] | "[" Expression "]" | Arguments }
function parseMemberAccess(state: ParserState, object: Expression): Expression {
    while (true) {
        const token = current(state);

        if (token.kind === TokenKind.DOT || token.kind === TokenKind.QUESTION_DOT) {
            const optional = token.kind === TokenKind.QUESTION_DOT;

            eat(state, token.kind);

            const propertyToken = eat(state, TokenKind.IDENTIFIER);

            let memberExpr: Expression = factory.createMemberExpression(object, {
                kind: SyntaxKind.Identifier, name: propertyToken.value
            }, optional);

            if (current(state).kind === TokenKind.LEFT_PAREN) {
                memberExpr = parseCall(state, memberExpr);
            }

            object = memberExpr;
        } else if (token.kind === TokenKind.LEFT_BRACKET) {
            eat(state, TokenKind.LEFT_BRACKET);
            const property = parseExpression(state);
            eat(state, TokenKind.RIGHT_BRACKET);

            object = factory.createMemberExpression(object, property, false);
        } else if (token.kind === TokenKind.LEFT_PAREN) {
            object = parseCall(state, object);
        } else {
            break;
        }
    }

    return object;
}

// Arguments ::= "(" [ArgumentList] ")"
function parseCall(state: ParserState, callee: Expression): CallExpression {
    eat(state, TokenKind.LEFT_PAREN);

    const args: Expression[] = [];

    if (current(state).kind !== TokenKind.RIGHT_PAREN) {
        args.push(parseExpression(state));

        while (current(state).kind === TokenKind.COMMA) {
            eat(state, TokenKind.COMMA);
            args.push(parseExpression(state));
        }
    }

    eat(state, TokenKind.RIGHT_PAREN);

    return factory.createCallExpression(callee, args);
}
