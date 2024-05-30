// import Parser from "./frontend/parser.ts";
// import { createGlobalEnv } from "./runtime/enviornment.ts";
// import { evaluate } from "./runtime/interpreter.ts";

// Read-Eval-Print
//repl();
// function repl (){

//     const parser = new Parser();
//     const env = createGlobalEnv();

//     // Input - Parse - Interpret
//     console.log("\n Repl v0.1");
//     while (true){
//         // user input code to parse
//         const input = prompt("> ");
//         if (!input || input.includes("exit")){
//             Deno.exit(1);
//         }
//         // produce AST from input
//         const program = parser.produceAST(input);
//         console.log('AST: ', program, '\n')

//         // produce value from AST node
//         const result = evaluate(program, env);
//         console.log('Interpreted: ', result);
//     }
// }

// run("./test.txt");

// async function run(filename:string) {
//     const parser = new Parser();
//     const env = createGlobalEnv();

//     const input = await Deno.readTextFile(filename);
//     const program = parser.produceAST(input);
//     console.log('AST: ', program, '\n')

//     const result = evaluate(program, env);
//     console.log('Interpreted: ', result);
// }

/* To Do (on this branch):
*/

/* To Do:
. choice-option
. scene
. branch-merge
. format
. if option
. choice loop
. add error handlers for everything
*/

/* Currently
. binary operations fully functional
. assign, read, reassign variable fully functional
. global constant variables: true, false, null
. have removed const command, but constant bool remains for declaring default variables when env is run
. template literal fully functional both outside and inside of codeblock
. string values fully functional
. conditional expression fully functional
. block statement parser (works Inside commands)
. if statement fully functional
. loop for/while statement fully functional
. input command fully functional
. web integration for text output and input fully functional
*/