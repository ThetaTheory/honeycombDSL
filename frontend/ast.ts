/* Defines Types of AST nodes */

export type NodeType = 
// Statements
| "Program"
| "CodeBlock"
| "VarDeclaration"
| "IfStatement"
| "ForLoop"
| "WhileLoop"
| "InputCommand"
| "SceneStatement"
// Expressions
| "AssignmentExpr"
| "BinaryExpr"
| "Identifier" 
| "TemplateLiteral"
| "StringLiteral"
| "NumericLiteral" 

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

// If Statement
export interface IfStatement extends Stmt {
    kind: "IfStatement";
    condition: Expr;
    consequent: CodeBlock;
}

// For Loop
export interface ForLoop extends Stmt {
    kind: "ForLoop";
    times: Expr;
    body: CodeBlock;
}

// While Loop
export interface WhileLoop extends Stmt {
    kind: "WhileLoop";
    condition: Expr;
    body: CodeBlock;
}

// Input
export interface InputCommand extends Stmt {
    kind: "InputCommand";
    identifier: string;
}

// Scene
export interface SceneStatement extends Stmt {
    kind: "SceneStatement";
    name: string;
}

/* Expressions */
export interface Expr extends Stmt {}

// x = {foo: 'bar'} -> in this case, asignee is a string.
// x.foo = 'foo bar' -> in this case, asignee is also an expression.
export interface AssignmentExpr extends Expr {
    kind: "AssignmentExpr";
    assignee: string; // To Do: Change to expr to accept obj.
    value: Expr;
}

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

export interface TemplateLiteral extends Expr {
    kind: "TemplateLiteral";
    value: string;
}

export interface StringLiteral extends Expr {
    kind: "StringLiteral";
    value: string;
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral";
    value: number;
}