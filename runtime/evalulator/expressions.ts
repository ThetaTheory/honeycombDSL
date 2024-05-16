import { AssignmentExpr, BinaryExpr, Identifier, TemplateLiteral } from "../../frontend/ast.ts";
import Environment from "../enviornment.ts";
import { evaluate } from "../interpreter.ts";
import { NumberVal, RuntimeVal, StringVal, make_null_var } from "../values.ts";

// does numeric binary operation and returns result as node.
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
    } // To Do: !!!! implement divde by zero error catch.
    return { value: result, type: "number" };
}

// checks if binary expression is numbers. send to operate if yes, null if no.
export function eval_binary_expr (binop: BinaryExpr, env: Environment): RuntimeVal {
    const leftSide = evaluate(binop.left, env);
    const rightSide = evaluate(binop.right, env);
    if (leftSide.type == "number" && rightSide.type == "number"){
        return eval_numeric_binary_expr(leftSide as NumberVal, rightSide as NumberVal, binop.operator);
    } else { return make_null_var(); } // To Do: !!! add string cases.
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

// template literal
export function eval_template_literal (tstr: TemplateLiteral, env: Environment): StringVal{
    const result = tstr.value.replace(/\${(.*?)}/g, (_, idn) => {
        // idn is string inside ${}.
        // If idn matches an identifier symbol, return its value as string.

        const idnVal = eval_identifier({kind: "Identifier", symbol: idn }, env);
        return String(idnVal.value);

    });
    return { value: result, type: "string" };
}