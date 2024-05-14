import Parser from "./frontend/parser.ts";
import Environment from "./runtime/enviornment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { make_null_var, make_bool_var } from "./runtime/values.ts";

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
. Change let keyword to [create:]
. Code variable assignment as [set:]
. Find a way to handle square brackets to indicate expr/stmt block
. Parse all text outside square brackets as string
. Remove semicolon
*/

/* Currently
. binary operations fully functional
. assign, read, reassign variable fully functional
. global constant variables: true, false, null
. let (have removed const command, but constant bool remains for declaring default variables when env is run)
*/