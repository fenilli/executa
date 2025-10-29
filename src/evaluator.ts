import {
    SyntaxKind,
    type Program,
    type Expression,
} from './parser';

type Primitive = string | number | boolean | null;

type SafeValue = Primitive | SafeValue[] | { [key: string]: SafeValue };

export interface Context {
    [name: string]: SafeValue;
}

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

    includes: (s: string | any[], x: any) =>
        (typeof s === 'string' || Array.isArray(s)) ? s.includes(x) : false,

    trim: (s: string) => s.trim(),
    toLowerCase: (s: string, locales?: Intl.LocalesArgument) =>
        locales ? s.toLocaleLowerCase(locales) : s.toLowerCase(),
    toUpperCase: (s: string, locales?: Intl.LocalesArgument) =>
        locales ? s.toLocaleUpperCase(locales) : s.toUpperCase(),

    isEmpty: (x: string | any[] | null | undefined) =>
        x == null || ((typeof x === 'string' || Array.isArray(x)) && x.length === 0),
});

export const createEvaluator = (builtins: Readonly<Record<string, Function>> = builtinFns) => {
    return (program: Program, context: Context = {}) => {
        const evalExpression = (node: Expression): any => {
            switch (node.kind) {
                case SyntaxKind.NumericLiteral: return node.value;
                case SyntaxKind.StringLiteral: return node.value;
                case SyntaxKind.BooleanLiteral: return node.value;
                case SyntaxKind.NullLiteral: return null;
                case SyntaxKind.Identifier:
                    if (node.name in context) return context[node.name];
                    if (node.name in builtins) return builtins[node.name];
                    throw new ReferenceError(`Identifier ${node.name} not found`);

                case SyntaxKind.UnaryExpression: {
                    const arg = evalExpression(node.argument);
                    switch (node.operator) {
                        case SyntaxKind.BangToken: return !arg;
                        case SyntaxKind.PlusToken: return +arg;
                        case SyntaxKind.MinusToken: return -arg;
                    }
                }

                case SyntaxKind.BinaryExpression: {
                    const left = evalExpression(node.left);
                    const right = evalExpression(node.right);
                    switch (node.operator) {
                        case SyntaxKind.PlusToken: return left + right;
                        case SyntaxKind.MinusToken: return left - right;
                        case SyntaxKind.StarToken: return left * right;
                        case SyntaxKind.SlashToken: return left / right;
                        case SyntaxKind.PercentToken: return left % right;
                        case SyntaxKind.EqualEqualToken: return left == right;
                        case SyntaxKind.BangEqualToken: return left != right;
                        case SyntaxKind.GreaterToken: return left > right;
                        case SyntaxKind.GreaterEqualToken: return left >= right;
                        case SyntaxKind.LessToken: return left < right;
                        case SyntaxKind.LessEqualToken: return left <= right;
                        case SyntaxKind.AmpAmpToken: return left && right;
                        case SyntaxKind.PipePipeToken: return left || right;
                        case SyntaxKind.QuestionQuestionToken: return left ?? right;
                    }
                }

                case SyntaxKind.ParenthesizedExpression:
                    return evalExpression(node.expression);

                case SyntaxKind.MemberExpression: {
                    const obj = evalExpression(node.object);
                    const prop = node.property.kind === SyntaxKind.Identifier
                        ? node.property.name
                        : evalExpression(node.property);

                    if (obj == null && node.optional) return undefined;
                    if (obj == null) throw new TypeError(`Cannot read property ${prop} of ${obj}`);

                    if (prop in builtins) return builtins[prop](obj);
                    if (typeof obj === 'object' && prop in obj) return obj[prop];

                    throw new TypeError(`Property ${prop} not allowed`);
                }

                case SyntaxKind.CallExpression: {
                    const fn = evalExpression(node.callee);
                    if (typeof fn !== 'function') throw new TypeError(`Callee is not a function`);

                    const args = node.args.map(evalExpression);
                    return fn(...args);
                }
            }
        };

        return evalExpression(program.expression);
    };
};
