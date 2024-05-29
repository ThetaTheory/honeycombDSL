import Parser from "./frontend/parser.ts";
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
  </form>`

// Starts a server at the default port.
Deno.serve(handler);

// Starts Interpreting when the server starts.
executeProgram(filename).then(result => {
    eof = true;
    console.log("Evaluation completed:", result);
}).catch(error => {
    console.error("An error occurred:", error);
});

// The Hanlder function is called for every request that comes in.
async function handler(req: Request): Promise<Response> {
    console.log("handler"); // DEBUG
    // if there's no pending input and not eof, wait for the evaluator to signal
    if (!pendingInput && !eof) {
        console.log("line 31: pendingInput: ", pendingInput); // DEBUG
        await new Promise(resolve => {
          pendingInput = resolve;
        });
    }
    
    // runs if user submits input
    if (req.method === "POST") {
        // Handle user input
        const formData = await req.formData();
        const input = formData.get("input")?.toString() || ""; // To Do: fix to accept boolean and numbers too

        if (pendingInput) {
            pendingInput(input); // Resolve the pending input promise
            pendingInput = null; // Reset pendingInput
        }
    }

    console.log("line 49: pendingInput: ", pendingInput); // DEBUG
    
    // Return the response with the current state
    const responseText = `<html><body>
    <p>${textOutput}</p>
    ${pendingInput ? inputForm : ""}
    </body></html>`;

    return new Response(responseText, { headers: { "Content-Type": "text/html" }});
}

/* DSL Functions */

// execution
async function executeProgram (filename: string) {
    const program = await sourcecodeToAST(filename);
    const env = createGlobalEnv();

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
textOutput = text;
}

export function awaitInput(): Promise<string> {
    return new Promise((resolve) => {
      pendingInput = resolve;
    });
}

/* BUG:
awaitInput(); in statements.ts
doesn't do anything to trigger the handler
because there are no requests being made by the client.
*/