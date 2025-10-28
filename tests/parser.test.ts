import { describe, test, expect } from 'vitest';
import { SyntaxKind, parse, factory } from '../src/parser'

describe('parser', () => {
    test('parses numeric and string literals', () => {
        expect(parse('10')).toEqual(factory.createProgram(
            factory.createNumericLiteral(10)
        ));
        expect(parse('"hello"')).toEqual(factory.createProgram(
            factory.createStringLiteral('hello')
        ));
        expect(parse("'world'")).toEqual(factory.createProgram(
            factory.createStringLiteral('world')
        ));
    });

    test('parses boolean and null literals', () => {
        expect(parse('true')).toEqual(factory.createProgram(
            factory.createBooleanLiteral(true)
        ));
        expect(parse('false')).toEqual(factory.createProgram(
            factory.createBooleanLiteral(false)
        ));
        expect(parse('null')).toEqual(factory.createProgram(
            factory.createNullLiteral()
        ));
    });

    test('parses identifiers', () => {
        expect(parse('x')).toEqual(factory.createProgram(
            factory.createIdentifier('x')
        ));
    });

    test('parses unary expressions', () => {
        expect(parse('!x')).toEqual(factory.createProgram(
            factory.createUnaryExpression(SyntaxKind.BangToken, factory.createIdentifier('x'))
        ));
        expect(parse('-10')).toEqual(factory.createProgram(
            factory.createUnaryExpression(SyntaxKind.MinusToken, factory.createNumericLiteral(10))
        ));
    });

    test('parses binary expressions with precedence', () => {
        // simple additive
        expect(parse('1 + 2')).toEqual(factory.createProgram(
            factory.createBinaryExpression(
                SyntaxKind.PlusToken,
                factory.createNumericLiteral(1),
                factory.createNumericLiteral(2)
            )
        ));

        // precedence: multiplicative > additive
        expect(parse('1 + 2 * 3')).toEqual(factory.createProgram(
            factory.createBinaryExpression(
                SyntaxKind.PlusToken,
                factory.createNumericLiteral(1),
                factory.createBinaryExpression(
                    SyntaxKind.StarToken,
                    factory.createNumericLiteral(2),
                    factory.createNumericLiteral(3)
                )
            )
        ));
    });

    test('parses logical expressions', () => {
        expect(parse('a && b || c')).toEqual(factory.createProgram(
            factory.createBinaryExpression(
                SyntaxKind.PipePipeToken,
                factory.createBinaryExpression(
                    SyntaxKind.AmpAmpToken,
                    factory.createIdentifier('a'),
                    factory.createIdentifier('b')
                ),
                factory.createIdentifier('c')
            )
        ));

        expect(parse('x ?? y && z')).toEqual(factory.createProgram(
            factory.createBinaryExpression(
                SyntaxKind.QuestionQuestionToken,
                factory.createIdentifier('x'),
                factory.createBinaryExpression(
                    SyntaxKind.AmpAmpToken,
                    factory.createIdentifier('y'),
                    factory.createIdentifier('z')
                )
            )
        ));
    });

    test('parses parenthesized expressions', () => {
        expect(parse('(a + b)')).toEqual(factory.createProgram(
            factory.createParenthesizedExpression(
                factory.createBinaryExpression(
                    SyntaxKind.PlusToken,
                    factory.createIdentifier('a'),
                    factory.createIdentifier('b')
                )
            )
        ));
    });

    test('parses member access and optional chaining', () => {
        expect(parse('user.age')).toEqual(factory.createProgram(
            factory.createMemberExpression(
                factory.createIdentifier('user'),
                factory.createIdentifier('age'),
                false
            )
        ));

        expect(parse('user?.name')).toEqual(factory.createProgram(
            factory.createMemberExpression(
                factory.createIdentifier('user'),
                factory.createIdentifier('name'),
                true
            )
        ));
    });

    test('parses call expressions', () => {
        expect(parse('fn()')).toEqual(factory.createProgram(
            factory.createCallExpression(factory.createIdentifier('fn'), [])
        ));

        expect(parse('sum(1, 2, 3)')).toEqual(factory.createProgram(
            factory.createCallExpression(factory.createIdentifier('sum'), [
                factory.createNumericLiteral(1),
                factory.createNumericLiteral(2),
                factory.createNumericLiteral(3),
            ])
        ));

        expect(parse('obj.method(10)')).toEqual(factory.createProgram(
            factory.createCallExpression(
                factory.createMemberExpression(
                    factory.createIdentifier('obj'),
                    factory.createIdentifier('method'),
                    false
                ),
                [factory.createNumericLiteral(10)]
            )
        ));
    });

    test('throws on invalid syntax', () => {
        expect(() => parse('1 +')).toThrow(SyntaxError);
        expect(() => parse('(')).toThrow(SyntaxError);
        expect(() => parse('x ??')).toThrow(SyntaxError);
    });
});
