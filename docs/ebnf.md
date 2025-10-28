# EBNF: Sandboxed JS-like expression grammar

```
Program          ::= Expression ;

Expression      ::= LogicalOr ;

LogicalOr       ::= NullishCoalescing { "||" NullishCoalescing } ;
NullishCoalescing ::= LogicalAnd { "??" LogicalAnd } ;
LogicalAnd      ::= Equality { "&&" Equality } ;

Equality        ::= Comparison { ( "==" | "!=" ) Comparison } ;
Comparison      ::= Additive { ( "<" | "<=" | ">" | ">=" ) Additive } ;
Additive        ::= Multiplicative { ( "+" | "-" ) Multiplicative } ;
Multiplicative  ::= Unary { ( "*" | "/" | "%" ) Unary } ;

Unary           ::= [ "!" | "-" | "+" ] Unary
                    | Primary ;

Primary         ::= Literal
                    | Identifier MemberAccess
                    | "(" Expression ")" ;

MemberAccess    ::= { ( "." Identifier [ Arguments ] )
                    | ( "?." Identifier [ Arguments ] )
                    | ( "[" Expression "]" )
                    | ( Arguments ) } ;

Arguments       ::= "(" [ ArgumentList ] ")" ;
ArgumentList    ::= Expression { "," Expression } ;

Literal         ::= "true" | "false" | "null" | Number | String ;

Identifier       ::= /[a-zA-Z_$][a-zA-Z0-9_$]*/ ;
Number           ::= /[0-9]+(\.[0-9]+)?/ ;
String           ::= /("([^"\\]|\\.)*")|('([^'\\]|\\.)*')/ ;
```
