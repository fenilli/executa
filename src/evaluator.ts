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

const safeMethods = Object.freeze({
    string: {
        length: (s: string) => s.length,
        startsWith: (s: string, prefix: string) => s.startsWith(prefix),
        endsWith: (s: string, suffix: string) => s.endsWith(suffix),
        includes: (s: string, search: string) => s.includes(search),
        indexOf: (s: string, search: string) => s.indexOf(search),
        slice: (s: string, start: number, end?: number) => s.slice(start, end),
        toLowerCase: (s: string) => s.toLowerCase(),
        toUpperCase: (s: string) => s.toUpperCase(),
        trim: (s: string) => s.trim(),
        trimStart: (s: string) => s.trimStart(),
        trimEnd: (s: string) => s.trimEnd(),
    },

    number: {
        toFixed: (n: number, digits?: number) => n.toFixed(digits),
        toPrecision: (n: number, digits?: number) => n.toPrecision(digits),
        toExponential: (n: number, digits?: number) => n.toExponential(digits),
    },

    array: {
        length: (a: any[]) => a.length,
        includes: (a: any[], x: any) => a.includes(x),
        indexOf: (a: any[], x: any) => a.indexOf(x),
        slice: (a: any[], start: number, end?: number) => a.slice(start, end),
        concat: (a: any[], ...rest: any[][]) => a.concat(...rest),
        join: (a: any[], sep?: string) => a.join(sep),
    },

    date: {
        getTime: (d: Date) => d.getTime(),
        toISOString: (d: Date) => d.toISOString(),
        getFullYear: (d: Date) => d.getFullYear(),
        getMonth: (d: Date) => d.getMonth(),
        getDate: (d: Date) => d.getDate(),
        getDay: (d: Date) => d.getDay(),
        getHours: (d: Date) => d.getHours(),
        getMinutes: (d: Date) => d.getMinutes(),
        getSeconds: (d: Date) => d.getSeconds(),
    },
});

const defaultWhitelistedFns = Object.freeze({
    abs: Math.abs,
    max: Math.max,
    min: Math.min,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    pow: Math.pow,
    sqrt: Math.sqrt,
    sign: Math.sign,

    // Utility
    clamp: (n: number, min: number, max: number) => Math.min(Math.max(n, min), max),
    inRange: (n: number, min: number, max: number) => n >= min && n <= max,
    isEmpty: (x: string | any[] | null | undefined) =>
        x == null || (typeof x === 'string' || Array.isArray(x)) && x.length === 0,
});

export const createEvaluator = (whitelistedFns: Readonly<Record<string, Function>> = {}) => {
    const _whitelistedFns: Readonly<Record<string, Function>> = Object.freeze({
        ...defaultWhitelistedFns,
        ...whitelistedFns,
    });

    return (program: Program, context: Context = {}) => {
        const evalExpression = (node: Expression): any => {
            switch (node.kind) {
                case SyntaxKind.NumericLiteral: return node.value;
                case SyntaxKind.StringLiteral: return node.value;
                case SyntaxKind.BooleanLiteral: return node.value;
                case SyntaxKind.NullLiteral: return null;
                case SyntaxKind.Identifier:
                    if (node.name in context) return context[node.name];
                    if (node.name in _whitelistedFns) return _whitelistedFns[node.name];
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

                    const objType =
                        Array.isArray(obj) ? 'array' :
                            typeof obj === 'string' ? 'string' :
                                typeof obj === 'number' ? 'number' :
                                    obj instanceof Date ? 'date' :
                                        undefined;

                    const method = objType ? safeMethods[objType]?.[prop as keyof typeof safeMethods[typeof objType]] : undefined;
                    if (typeof method === 'function') return (method as Function)(obj);

                    if (objType === undefined && typeof obj === 'object') return obj[prop];

                    throw new TypeError(`Property ${prop} not allowed`);
                }

                case SyntaxKind.CallExpression: {
                    if (node.callee.kind === SyntaxKind.Identifier) {
                        const fn = _whitelistedFns[node.callee.name];
                        if (!fn) throw new ReferenceError(`Function ${node.callee.name} not allowed`);
                        const args = node.args.map(evalExpression);
                        return fn(...args);
                    }

                    if (node.callee.kind === SyntaxKind.MemberExpression) {
                        const obj = evalExpression(node.callee.object);
                        const prop = node.callee.property.kind === SyntaxKind.Identifier
                            ? node.callee.property.name
                            : evalExpression(node.callee.property);

                        const objType =
                            Array.isArray(obj) ? 'array' :
                                typeof obj === 'string' ? 'string' :
                                    obj instanceof Date ? 'date' :
                                        undefined;

                        const method = objType ? safeMethods[objType]?.[prop as keyof typeof safeMethods[typeof objType]] : undefined;
                        if (typeof method !== 'function') throw new ReferenceError(`Method ${prop} not allowed`);

                        const args = node.args.map(evalExpression);
                        return (method as Function)(obj, ...args);
                    }

                    throw new TypeError('Unsupported call target');
                }
            }
        };

        return evalExpression(program.expression);
    };
};
