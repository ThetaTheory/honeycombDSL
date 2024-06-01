import { CodeBlock, ForLoop, IfStatement, InputCommand, Program, SceneStatement, VarDeclaration, WhileLoop } from "../../frontend/ast.ts";
import { awaitInput, sendTextOutput } from "../../server.ts";
import Environment from "../enviornment.ts";
import { evaluate } from "../interpreter.ts";
import { ValueType } from "../values.ts";
import { BooleanVal, OutputVal, RuntimeVal, make_null_var, StringVal } from "../values.ts";

/// RELEVANT TO WEB
// evaluates through program until last evaluated element inside program.
export async function eval_program (program: Program, env: Environment): Promise<RuntimeVal>  {
    const textOutput: string[] = [];    
    for (const statement of program.body){
        if (statement.kind == "InputCommand") {
            console.log("Encountered Input node"); // DEBUG
            // send accumalated text to server.ts
            await sendTextOutput(textOutput.join(''));
            console.log("Waiting for user input"); // DEBUG
            // Wait for user input
            const userInput = await awaitInput();
            console.log("Finished waiting for user input"); // DEBUG
            // pause till input evaluation is resolved
            await eval_input_command(statement as InputCommand, env, userInput);
            console.log("Finished waiting for input eval"); // DEBUG
            textOutput.length = 0; // empty accumalated text
        } else if (statement.kind == "SceneStatement"){
            // if encountered [scene] and unsent text left -> display last text output.
            if (textOutput.length > 0){
                await sendTextOutput(textOutput.join(''));
            }
            const sceneStatement = statement as SceneStatement; // Just here to make TypeScript happy.
            // exit evaluation cycle and return evaluated scene command
            return {value: sceneStatement.name, type: "string"} as StringVal;
        } else {
            const evalResult = evaluate(statement, env);
            if (evalResult.type == "text"){
                textOutput.push(evalResult.value as string); // accumalates evaluated text
                console.log("Text Output Array: ", textOutput); // DEBUG
            }
        }
    }
    // + if EOF and unsent text left -> display last text output.
    if (textOutput.length > 0){
        await sendTextOutput(textOutput.join(''));
    }
    return { value: textOutput, type: "textArray"} as OutputVal; // This is just here to make typescript happy.
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
    } // To Do: Needs to support [input var] and [scene name]

    return lastEvaluated;  
}

// evaluates input.
export function eval_input_command(inputCmd: InputCommand, env: Environment, inputVal: string|number|boolean) {
    let inputType: ValueType = "null";
    if (typeof inputVal == "number" || typeof inputVal == "boolean" || typeof inputVal == "string"){
        inputType = typeof inputVal as ValueType;
    } else {
        console.error("Invalid input"); // To Do: ADD UI HANDLER
    }
    return env.assignVar(inputCmd.identifier, {value: inputVal, type: inputType})
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
    const times = evaluate(forStmt.times, env).value;

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