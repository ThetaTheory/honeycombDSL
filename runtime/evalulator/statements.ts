import { CodeBlock, ForLoop, IfStatement, InputCommand, LeafStatement, Program, SceneStatement, Stmt, VarDeclaration, WhileLoop } from "../../frontend/ast.ts";
import { awaitInput, sendTextOutput, parseLeaf } from "../../server.ts";
import Environment from "../enviornment.ts";
import { evaluate } from "../interpreter.ts";
import { NullVal, ValueType } from "../values.ts";
import { BooleanVal, RuntimeVal, make_null_var, StringVal, CodeBlockVal } from "../values.ts";

// evaluates through program until last evaluated element inside program.
export async function eval_program (program: Program, env: Environment): Promise<RuntimeVal>  {
    const textOutput: string[] = [];
     
    let evalResult = await eval_program_body(program.body, env, textOutput);
    // if returned code block
    while (evalResult.type == "nodeArray"){
        console.log("Evaluating updated program array"); // DEBUG
        console.log("Current Text Output Array: ", textOutput); // DEBUG
        const codeBlock = evalResult as CodeBlockVal; // TypeScript pacifier smh
        evalResult = await eval_program_body(codeBlock.value, env, textOutput);
    }
    // if returned scene node
    if (evalResult.type == "string"){
        return evalResult as StringVal
    }
    // if EOF and unsent text left -> display last text output.
    if (textOutput.length > 0){
        sendTextOutput(textOutput.join(''));
    }

    return make_null_var() as NullVal
}

/// RELEVANT TO WEB
async function eval_program_body (nodeArray: Stmt[], env: Environment, textOutput: string[]): Promise<RuntimeVal>{
    let i = 0;
    for (const node of nodeArray){
        i++;
        if (node.kind == "InputCommand") {
            console.log("Encountered Input node"); // DEBUG
            // send accumalated text to server.ts
            await sendTextOutput(textOutput.join(''));
            console.log("Waiting for user input"); // DEBUG
            // Wait for user input
            const userInput = await awaitInput();
            console.log("Finished waiting for user input"); // DEBUG
            // pause till input evaluation is resolved
            await eval_input_command(node as InputCommand, env, userInput);
            console.log("Finished waiting for input eval"); // DEBUG
            textOutput.length = 0; // empty accumalated text
        } else if (node.kind == "SceneStatement"){
            // if encountered [scene] and unsent text left -> display last text output.
            if (textOutput.length > 0){
                await sendTextOutput(textOutput.join(''));
            }
            const sceneStatement = node as SceneStatement; // TypeScript pacifier smh
            // exit evaluation cycle and return evaluated scene command
            return {value: sceneStatement.name, type: "string"} as StringVal;
        } else {
            const evalResult = await evaluate(node, env);
            if (evalResult.type == "text"){
                textOutput.push(evalResult.value as string); // accumalates evaluated text
                console.log("New text added"); // DEBUG
            } else if (evalResult.type == "nodeArray"){
                console.log("Found new node array to add"); // DEBUG
                // get new nodeArray
                let newNodeArray = evalResult.value as Stmt[];
                // add remaining nodeArray to new nodeArray
                newNodeArray = newNodeArray.concat(nodeArray.slice(i))
                // return new code block value
                return { value: newNodeArray, type: "nodeArray"} as CodeBlockVal
            }
        }
    }

    return make_null_var() as NullVal
}

// parses leaf file and returns it as node array
export async function eval_leaf_stmt (leaf: LeafStatement): Promise<RuntimeVal>{
    const leafNodeArray = await parseLeaf(leaf);
    console.log("Parsed Leaf.") // DEBUG
    return {value: leafNodeArray.body, type: "nodeArray"} as CodeBlockVal
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

// evaluates input
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
export function eval_if_stmt (ifStmt: IfStatement, env: Environment){
    // send condition to evaluate
    const condition = evaluate(ifStmt.condition, env);
    // catch error if condition does not evaluate to boolean
    if (condition.type !== "boolean") {
        throw new Error("Condition of if statement must evaluate to a boolean");
    }
    // if true, return consequent as code block
    if (condition.value){
        return { value: ifStmt.consequent.body, type: "nodeArray"} as CodeBlockVal
    } else {
        return make_null_var();
    } // if false, return null
}

// for statement
export function eval_for_stmt (forStmt: ForLoop, env: Environment){
    const times = evaluate(forStmt.times, env).value;
    let body: Stmt[] = [];
    // error handler for invalid times.
    if (typeof times !== 'number' || times < 0) {
        throw new Error(`Invalid number of iterations: ${times}`);
    }

    // return body multiplied by times
    for (let i = 0; i < times; i++) {
        body = body.concat(forStmt.body);
    }
    return { value: body, type: "nodeArray"} as CodeBlockVal
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
        
        // ah shit this is a problem. You can't just return a repeated codeblock here, you need to run the codeblock each time.

        if (condition.type !== "boolean") {
            throw new Error(`Expected boolean condition, but got ${condition.type}`);
        }
    }

    return lastEvaluated;
}
