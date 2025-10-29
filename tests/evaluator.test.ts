import { describe, test, expect } from 'vitest';
import { parse } from '../src/parser';
import { createEvaluator, builtinFns } from '../src/evaluator';

const evaluate = createEvaluator({
    ...builtinFns,
    sum: (a: number, b: number) => a + b,
});

describe('evaluate', () => {
    test('evaluates numeric and string literals', () => {
        expect(evaluate(parse('10'))).toBe(10);
        expect(evaluate(parse('"hello"'))).toBe('hello');
    });

    test('evaluates boolean and null literals', () => {
        expect(evaluate(parse('true'))).toBe(true);
        expect(evaluate(parse('false'))).toBe(false);
        expect(evaluate(parse('null'))).toBe(null);
    });

    test('evaluates identifiers from context', () => {
        expect(evaluate(parse('x'), { x: 42 })).toBe(42);
        expect(() => evaluate(parse('y'))).toThrowError();
    });

    test('evaluates unary expressions', () => {
        expect(evaluate(parse('-5'))).toBe(-5);
        expect(evaluate(parse('+5'))).toBe(5);
        expect(evaluate(parse('!true'))).toBe(false);
    });

    test('evaluates binary expressions', () => {
        expect(evaluate(parse('1 + 2 * 3'))).toBe(7);
        expect(evaluate(parse('10 / 2 - 3'))).toBe(2);
        expect(evaluate(parse('5 % 2'))).toBe(1);
        expect(evaluate(parse('2 == 2'))).toBe(true);
    });

    test('evaluates comparison expressions', () => {
        expect(evaluate(parse('2 > 1'))).toBe(true);
        expect(evaluate(parse('1 > 2'))).toBe(false);

        expect(evaluate(parse('1 < 2'))).toBe(true);
        expect(evaluate(parse('2 < 1'))).toBe(false);

        expect(evaluate(parse('2 >= 2'))).toBe(true);
        expect(evaluate(parse('2 >= 3'))).toBe(false);
        expect(evaluate(parse('2 <= 2'))).toBe(true);
        expect(evaluate(parse('3 <= 2'))).toBe(false);

        expect(evaluate(parse('2 == 2'))).toBe(true);
        expect(evaluate(parse('2 == 3'))).toBe(false);
        expect(evaluate(parse('2 != 3'))).toBe(true);
        expect(evaluate(parse('3 != 3'))).toBe(false);
    });

    test('evaluates logical expressions with precedence', () => {
        expect(evaluate(parse('true && false || true'))).toBe(true);
        expect(evaluate(parse('false || false && true'))).toBe(false);
        expect(evaluate(parse('null ?? 5'))).toBe(5);
    });

    test('evaluates parenthesized expressions', () => {
        expect(evaluate(parse('(1 + 2) * 3'))).toBe(9);
    });

    test('evaluates member access and optional chaining', () => {
        const ctx = { obj: { a: { b: 5 }, c: null } };

        expect(evaluate(parse('obj.a.b'), ctx)).toBe(5);
        expect(evaluate(parse('obj.c?.b'), ctx)).toBeUndefined();
    });

    test('evaluates call expressions', () => {
        expect(evaluate(parse('sum(2, 3)'))).toBe(5);
        expect(evaluate(parse('includes("abc", "a")'))).toBe(true);
        expect(() => evaluate(parse('arbritary(2, 3)'))).toThrowError();
    });
});
