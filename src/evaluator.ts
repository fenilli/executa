import {
    SyntaxKind,
    type Program,
    type Expression,
} from './parser';

export interface Context {
    [name: string]: any;
}

export const evaluate = (program: Program, context: Context = {}) => {
    const evalExpression = (node: Expression): any => {
        switch (node.kind) {
            case SyntaxKind.NumericLiteral: return node.value;
            case SyntaxKind.StringLiteral: return node.value;
            case SyntaxKind.BooleanLiteral: return node.value;
            case SyntaxKind.NullLiteral: return null;
            case SyntaxKind.Identifier:
                if (node.name in context) return context[node.name];
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
                return obj[prop];
            }

            case SyntaxKind.CallExpression: {
                const fn = evalExpression(node.callee);
                if (typeof fn !== 'function') throw new TypeError('Callee is not a function');
                const args = node.args.map(evalExpression);
                return fn(...args);
            }
        }
    };

    return evalExpression(program.expression);
}
