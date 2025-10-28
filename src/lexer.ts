export enum TokenKind {
    // Single-character tokens
    BANG, GREATER, LESS,
    PLUS, MINUS, STAR, SLASH, PERCENT,
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACKET, RIGHT_BRACKET,
    COMMA, DOT,

    // Two-characters tokens
    PIPE_PIPE, AMP_AMP,
    QUESTION_QUESTION, QUESTION_DOT,
    EQUAL_EQUAL, BANG_EQUAL,
    GREATER_EQUAL, LESS_EQUAL,

    // Keywords
    TRUE, FALSE, NULL,

    // Literals and Identifiers
    NUMBER, STRING, IDENTIFIER,

    EOF,
}

export interface Token {
    kind: TokenKind;
    value: string;
}

const Language: readonly [RegExp, TokenKind | null][] = [
    [/^\s+/, null],

    // Two-characters
    [/^\|\|/, TokenKind.PIPE_PIPE],
    [/^&&/, TokenKind.AMP_AMP],
    [/^\?\?/, TokenKind.QUESTION_QUESTION],
    [/^\?\./, TokenKind.QUESTION_DOT],
    [/^==/, TokenKind.EQUAL_EQUAL],
    [/^!=/, TokenKind.BANG_EQUAL],
    [/^>=/, TokenKind.GREATER_EQUAL],
    [/^<=/, TokenKind.LESS_EQUAL],

    // Single-characters
    [/^!/, TokenKind.BANG],
    [/^>/, TokenKind.GREATER],
    [/^</, TokenKind.LESS],
    [/^\+/, TokenKind.PLUS],
    [/^-/, TokenKind.MINUS],
    [/^\*/, TokenKind.STAR],
    [/^\//, TokenKind.SLASH],
    [/^%/, TokenKind.PERCENT],
    [/^\(/, TokenKind.LEFT_PAREN],
    [/^\)/, TokenKind.RIGHT_PAREN],
    [/^\[/, TokenKind.LEFT_BRACKET],
    [/^\]/, TokenKind.RIGHT_BRACKET],
    [/^\./, TokenKind.DOT],
    [/^,/, TokenKind.COMMA],

    // Keywords
    [/^true\b/, TokenKind.TRUE],
    [/^false\b/, TokenKind.FALSE],
    [/^null\b/, TokenKind.NULL],

    // Literals and Identifiers
    [/^[0-9]+(\.[0-9]+)?/, TokenKind.NUMBER],
    [/^("([^"\\]|\\.)*")|('([^'\\]|\\.)*')/, TokenKind.STRING],
    [/^[a-zA-Z_$][a-zA-Z0-9_$]*/, TokenKind.IDENTIFIER],
];

export const lex = (source: string): Token[] => {
    const tokens: Token[] = [];
    let cursor = 0;

    while (cursor < source.length) {
        const remaining = source.slice(cursor);
        let matched = false;

        for (const [regex, kind] of Language) {
            const result = regex.exec(remaining);
            if (!result) continue;

            matched = true;
            cursor += result[0].length;

            if (kind !== null) {
                tokens.push({ kind, value: result[0] });
            }

            break;
        }

        if (!matched) {
            throw new SyntaxError(`Unexpected token: '${remaining[0]}' at position ${cursor}`);
        }
    }

    tokens.push({ kind: TokenKind.EOF, value: '' });
    return tokens;
};
