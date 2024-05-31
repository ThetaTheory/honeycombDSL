import Parser from "./frontend/parser.ts";
import Environment from "./runtime/enviornment.ts";
import { createGlobalEnv } from "./runtime/enviornment.ts";
import { evaluate } from "./runtime/interpreter.ts";

let textOutput = '';
let pendingInput: ((input: string) => void) | null = null; // input await state
let eof = false; // end of file state
const filename = './test.txt'
const inputForm = `<form action="/" method="post">
    <label for="input">Enter your input:</label><br>
    <input type="text" id="input" name="input"><br>
    <button type="submit">Submit</button>
  </form><a href="/"><button>Next</button></a>`

// Create Single Global Enviornment.
const env = createGlobalEnv();

// Run DSL Interpreter
executeProgram(filename, env).then(result => {
    eof = true;
    console.log("Evaluation completed:", result);
}).catch(error => {
    console.error("An error occurred:", error);
});

// Request Handler is called with every request
async function handler(req: Request){
    if (req.method == "GET"){
        console.log("GET"); //DEBUG
        // if there's no pending input and not eof, wait for the evaluator to signal
        if (!pendingInput && !eof) {
            console.log("line 30: special pendingInput: ", pendingInput); // DEBUG
            await new Promise(resolve => {
            pendingInput = resolve;
            });
        }

        // if pending input or eof, return the response with the current state
        const responseText = `<html><body>
        <p>${textOutput}</p>
        ${pendingInput ? inputForm : ""}
        </body></html>`;

        return new Response(responseText, { headers: { "Content-Type": "text/html" }});
    } else if (req.method == "POST"){
        console.log("POST"); //DEBUG
        // Handle user input
        const formData = await req.formData();
        const input = formData.get("input")?.toString() || ""; // To Do: fix to accept boolean and numbers too

        if (pendingInput) {
            pendingInput(input); // Resolve the pending input promise
            pendingInput = null; // Reset pendingInput // To Do: Coordination Danger; may cause bug if evaluator encounters input command before this runs.
        }

        // Do not return response
        return new Response(null, { status: 204 });
    } else {
        return new Response("Method not allowed", { status: 405 });
    }
}

// Start a server at localhost: 8000
Deno.serve(handler);

/* DSL Functions */

// execution
async function executeProgram (filename: string, env: Environment) {
    const program = await sourcecodeToAST(filename);

    await evaluate(program, env);
}

// reads source code text file, parses and generates AST as program array.
async function sourcecodeToAST(filename: string) {
    const parser = new Parser();
    const input = await Deno.readTextFile(filename);
    const program = parser.produceAST(input);
    console.log('AST: ', program, '\n') // debug
    return program;
}

/* Display Functions */

// Assigns text to server.ts variable textOutput from any directory that has the import.
export function sendTextOutput (text: string){
    console.log("Type of text: ", typeof text); // DEBUG
    // replace /n with <br>
    textOutput = text.replace(/\n/g, "<br>");
}

export function awaitInput(): Promise<string> {
    return new Promise((resolve) => {
      pendingInput = resolve;
    });
}