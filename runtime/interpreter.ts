/* Interprets Parsed Code, Generate Final Output */

import { RuntimeVal, NumberVal, StringVal } from "./values.ts";
import { AssignmentExpr, BinaryExpr, CodeBlock, Identifier, NumericLiteral, Program, Stmt, StringLiteral, VarDeclaration, TemplateLiteral } from "../frontend/ast.ts";
import Environment from "./enviornment.ts";
import { eval_identifier, eval_binary_expr, eval_assignment_expr, eval_template_literal } from "./evalulator/expressions.ts";
import { eval_var_declaration, eval_program, eval_codeblock } from "./evalulator/statements.ts";

// Creates a runtime value based on an ast node.
export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
    switch (astNode.kind) {
        case "TemplateLiteral":
            return eval_template_literal(astNode as TemplateLiteral, env);
        case "NumericLiteral":
            return {
                value: ((astNode as NumericLiteral).value),
                type: "number"
            } as NumberVal;
        case "StringLiteral":
            return {
                value: ((astNode as StringLiteral).value),
                type: "string"
            } as StringVal;
        case "Identifier":
            return eval_identifier(astNode as Identifier, env);
        case "AssignmentExpr":
            return eval_assignment_expr(astNode as AssignmentExpr, env);
        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env);
        case "VarDeclaration":
            return eval_var_declaration(astNode as VarDeclaration, env);
        case "Program":
            return eval_program(astNode as Program, env);
        case "CodeBlock":
            return eval_codeblock(astNode as CodeBlock, env);
        default:
            console.error("Interpreter not yet implemented.", astNode);
            Deno.exit(0);
    }
}