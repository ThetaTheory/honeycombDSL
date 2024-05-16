import Parser from "./frontend/parser.ts";
import Environment from "./runtime/enviornment.ts";
import { evaluate } from "./runtime/interpreter.ts";

// Read-Eval-Print
repl();
function repl (){

    const parser = new Parser();
    const env = new Environment();

    // Input - Parse - Interpret
    console.log("\n Repl v0.1");
    while (true){
        // user input code to parse
        const input = prompt("> ");
        if (!input || input.includes("exit")){
            Deno.exit(1);
        }
        // produce AST from input
        const program = parser.produceAST(input);
        console.log('AST: ', program, '\n')

        // produce value from AST node
        const result = evaluate(program, env);
        console.log('Interpreted: ', result);
    }
}

/* To Do:
. add error catch for if var doesn't exist in ${var}
. parser for string literal
. ignore single \n in template literal
. if, loop
. input
. choice-branch system
. file input-output system
. class-object
. formats
*/

/* Currently
. binary operations fully functional
. assign, read, reassign variable fully functional
. global constant variables: true, false, null
. have removed const command, but constant bool remains for declaring default variables when env is run
. template literal fully functional outside of codeblock
. backend for string literal done
*/