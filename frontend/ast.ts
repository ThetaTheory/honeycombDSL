/* Defines Types of AST nodes */

export type NodeType = 
// Statements
| "Program"
| "CodeBlock"
| "VarDeclaration"
// Expressions
| "AssignmentExpr"
| "NumericLiteral" 
| "Identifier" 
| "BinaryExpr"
// | "StringLiteral" ?

/* Interfaces to define the structure of the AST */

/* Statements */
export interface Stmt {
    kind: NodeType;
}

// Program
export interface Program extends Stmt {
    kind: "Program";
    body: Stmt[]; // A Program is an array of statements.
}

// Block Statement
export interface CodeBlock extends Stmt {
    kind: "CodeBlock";
    body: Stmt[];
}

// Variable Declaration (all new declarations are const false. const true only for true, false, null)
// To Do: Look into removing constant.
export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    constant: boolean;
    identifier: string;
    value?: Expr;
}

/* Expressions */
export interface Expr extends Stmt {}

// x = {foo: 'bar'} -> in this case, asignee is a string.
// x.foo = 'foo bar' -> in this case, asignee is also an expression.
export interface AssignmentExpr extends Expr {
    kind: "AssignmentExpr";
    assignee: string; // To Do: Change to expr to accept obj.
    value: Expr;
} // remove

export interface BinaryExpr extends Expr {
    kind: "BinaryExpr";
    left: Expr;
    right: Expr;
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral";
    value: number;
}

// export interface StringLiteral extends Expr {
//     kind: "StringLiteral";
//     value: string;
// }