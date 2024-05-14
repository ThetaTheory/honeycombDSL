import { AssignmentExpr, BinaryExpr, Identifier } from "../../frontend/ast.ts";
import Environment from "../enviornment.ts";
import { evaluate } from "../interpreter.ts";
import { NumberVal, RuntimeVal, make_null_var } from "../values.ts";

// does binary operation and returns result as node.
function eval_numeric_binary_expr (ls: NumberVal, rs: NumberVal, operator: string): NumberVal {
    let result: number;
    if (operator == '+'){
        result = ls.value + rs.value;
    } else if (operator == '-'){
        result = ls.value - rs.value;
    } else if (operator == '*'){
        result = ls.value * rs.value;
    } else if (operator == '/'){
        result = ls.value / rs.value;
    } else {
        result = ls.value % rs.value;
    } // ** implement divde by zero catch later.
    return { value: result, type: "number" };
}

// checks if binary expression is numbers. send to operate if yes, null if no.
export function eval_binary_expr (binop: BinaryExpr, env: Environment): RuntimeVal {
    const leftSide = evaluate(binop.left, env);
    const rightSide = evaluate(binop.right, env);
    if (leftSide.type == "number" && rightSide.type == "number"){
        return eval_numeric_binary_expr(leftSide as NumberVal, rightSide as NumberVal, binop.operator);
    } else { return make_null_var(); } // ** add string cases later.
}

// Look up variable with identifier name in relevant enviornments
export function eval_identifier (idn: Identifier, env: Environment): RuntimeVal{
    const val = env.lookupVar(idn.symbol);
    return val;
}

// Checks if valid assignee, sends left(assignee) to assignVar and passes right(value) to evaluate.
export function eval_assignment_expr (node: AssignmentExpr, env: Environment): RuntimeVal{
    // if (node.assignee.kind != "Identifier"){
    //     throw `Invalid left assignment expression: ${JSON.stringify(node.assignee)}`;
    // }
    // const varname = (node.assignee as Identifier).symbol;
    const varname = node.assignee;
    return env.assignVar(varname, evaluate(node.value, env));
}