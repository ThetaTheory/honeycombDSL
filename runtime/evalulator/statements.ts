import { CodeBlock, ForLoop, IfStatement, Program, VarDeclaration, WhileLoop } from "../../frontend/ast.ts";
import Environment from "../enviornment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, RuntimeVal, make_null_var } from "../values.ts";

// evaluates through program until last evaluated element inside program.
export function eval_program (program: Program, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = make_null_var();
    
    for (const statement of program.body){
        lastEvaluated = evaluate(statement, env);
    }

    return lastEvaluated;
}

// evaluates variable declaration. if no value, assign null value.
export function eval_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
    const value = declaration.value ? evaluate(declaration.value, env) : make_null_var();
    return env.declareVar(declaration.identifier, value, declaration.constant);
}

// evaluates code block until last evaluated element inside codeblock.
export function eval_codeblock (codeblock: CodeBlock, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = make_null_var();
    
    for (const statement of codeblock.body){
        lastEvaluated = evaluate(statement, env);
    }

    return lastEvaluated;  
}

// if statement
export function eval_if_stmt (ifStmt: IfStatement, env: Environment): RuntimeVal{
    // send condition to evaluate
    const condition = evaluate(ifStmt.condition, env);
    // catch error if condition does not evaluate to boolean
    if (condition.type !== "boolean") {
        throw new Error("Condition of if statement must evaluate to a boolean");
    }
    // if true, send consequent to evaluate and return result
    if (condition){
        return evaluate(ifStmt.consequent, env);
    } else {
        return make_null_var();
    } // if false, return null
}

// for statement
export function eval_for_stmt (forStmt: ForLoop, env: Environment): RuntimeVal{
    let lastEvaluated: RuntimeVal = make_null_var();
    let times = forStmt.times;

    // error handler for invalid times.
    if (typeof times !== 'number' || times < 0) {
        throw new Error(`Invalid number of iterations: ${times}`);
    }

    // repeat body for times times.
    for (let i = 0; i < times; i++) {
        lastEvaluated = eval_codeblock(forStmt.body, env);
    }

    return lastEvaluated;
}

// while statement
export function eval_while_stmt (whileStmt: WhileLoop, env: Environment): RuntimeVal{
    let lastEvaluated: RuntimeVal = make_null_var();
    // evaluate condition
    let condition = evaluate(whileStmt.condition, env);
    // error handler for invalid condition.
    if (condition.type !== "boolean") {
        throw new Error(`Expected boolean condition, but got ${condition.type}`);
    }

    // repeat body while condition is true.
    while ((condition as BooleanVal).value) {
        lastEvaluated = eval_codeblock(whileStmt.body, env);
        condition = evaluate(whileStmt.condition, env);

        if (condition.type !== "boolean") {
            throw new Error(`Expected boolean condition, but got ${condition.type}`);
        }
    }

    return lastEvaluated;
}