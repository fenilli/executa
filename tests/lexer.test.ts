import { describe, test, expect } from 'vitest';
import { type Token, TokenKind, lex } from '../src/lexer'

const expectLex = (input: string, expected: Token[]) => {
    const tokens = lex(input);

    expect(tokens).toEqual([
        ...expected,
        { kind: TokenKind.EOF, value: '' },
    ]);
};

describe('lex', () => {
    test('lexes single-character punctuation and operators', () => {
        expectLex('!', [{ kind: TokenKind.BANG, value: '!' }]);
        expectLex('>', [{ kind: TokenKind.GREATER, value: '>' }]);
        expectLex('<', [{ kind: TokenKind.LESS, value: '<' }]);

        expectLex('+', [{ kind: TokenKind.PLUS, value: '+' }]);
        expectLex('-', [{ kind: TokenKind.MINUS, value: '-' }]);
        expectLex('*', [{ kind: TokenKind.STAR, value: '*' }]);
        expectLex('/', [{ kind: TokenKind.SLASH, value: '/' }]);
        expectLex('%', [{ kind: TokenKind.PERCENT, value: '%' }]);

        expectLex('(', [{ kind: TokenKind.LEFT_PAREN, value: '(' }]);
        expectLex(')', [{ kind: TokenKind.RIGHT_PAREN, value: ')' }]);
        expectLex('[', [{ kind: TokenKind.LEFT_BRACKET, value: '[' }]);
        expectLex(']', [{ kind: TokenKind.RIGHT_BRACKET, value: ']' }]);

        expectLex(',', [{ kind: TokenKind.COMMA, value: ',' }]);
        expectLex('.', [{ kind: TokenKind.DOT, value: '.' }]);
    });

    test('lexes two-character compound operators', () => {
        expectLex('||', [{ kind: TokenKind.PIPE_PIPE, value: '||' }]);
        expectLex('&&', [{ kind: TokenKind.AMP_AMP, value: '&&' }]);

        expectLex('??', [{ kind: TokenKind.QUESTION_QUESTION, value: '??' }]);
        expectLex('?.', [{ kind: TokenKind.QUESTION_DOT, value: '?.' }]);

        expectLex('==', [{ kind: TokenKind.EQUAL_EQUAL, value: '==' }]);
        expectLex('!=', [{ kind: TokenKind.BANG_EQUAL, value: '!=' }]);

        expectLex('>=', [{ kind: TokenKind.GREATER_EQUAL, value: '>=' }]);
        expectLex('<=', [{ kind: TokenKind.LESS_EQUAL, value: '<=' }]);
    });

    test('lexes boolean and null keywords', () => {
        expectLex('true', [{ kind: TokenKind.TRUE, value: 'true' }]);
        expectLex('false', [{ kind: TokenKind.FALSE, value: 'false' }]);
        expectLex('null', [{ kind: TokenKind.NULL, value: 'null' }]);
    });

    test('lexes literals and identifiers', () => {
        expectLex('10', [{ kind: TokenKind.NUMBER, value: '10' }]);
        expectLex('"hello"', [{ kind: TokenKind.STRING, value: '"hello"' }]);
        expectLex("'hello'", [{ kind: TokenKind.STRING, value: "'hello'" }]);
        expectLex('x', [{ kind: TokenKind.IDENTIFIER, value: 'x' }]);
    });

    test('lexes compound expressions correctly', () => {
        expectLex('x + 1', [
            { kind: TokenKind.IDENTIFIER, value: 'x' },
            { kind: TokenKind.PLUS, value: '+' },
            { kind: TokenKind.NUMBER, value: '1' },
        ]);

        expectLex('(a >= 10) && b', [
            { kind: TokenKind.LEFT_PAREN, value: '(' },
            { kind: TokenKind.IDENTIFIER, value: 'a' },
            { kind: TokenKind.GREATER_EQUAL, value: '>=' },
            { kind: TokenKind.NUMBER, value: '10' },
            { kind: TokenKind.RIGHT_PAREN, value: ')' },
            { kind: TokenKind.AMP_AMP, value: '&&' },
            { kind: TokenKind.IDENTIFIER, value: 'b' },
        ]);

        expectLex('user.age > 18', [
            { kind: TokenKind.IDENTIFIER, value: 'user' },
            { kind: TokenKind.DOT, value: '.' },
            { kind: TokenKind.IDENTIFIER, value: 'age' },
            { kind: TokenKind.GREATER, value: '>' },
            { kind: TokenKind.NUMBER, value: '18' },
        ]);

        expectLex('a ?? b || c', [
            { kind: TokenKind.IDENTIFIER, value: 'a' },
            { kind: TokenKind.QUESTION_QUESTION, value: '??' },
            { kind: TokenKind.IDENTIFIER, value: 'b' },
            { kind: TokenKind.PIPE_PIPE, value: '||' },
            { kind: TokenKind.IDENTIFIER, value: 'c' },
        ]);
    });

    test('throws on unknown token', () => {
        expect(() => lex('@')).toThrow(SyntaxError);
    });
})
