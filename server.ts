import { LeafStatement } from "./frontend/ast.ts";
import Parser from "./frontend/parser.ts";
import Environment from "./runtime/enviornment.ts";
import { createGlobalEnv } from "./runtime/enviornment.ts";
import { evaluate } from "./runtime/interpreter.ts";

let currentScene = '';
let textOutput = '';
let prevTextOutput = '';
let pendingInput: ((input: string) => void) | null = null; // input await state
let clickNextScene: (() => void) | null = null; // next scene await state
let eos = false; // end of scene state
let eol = true; // end of leaf state
let lpp = false; // leaf pending print state
const firstscene = 'chapterone'
const inputForm = `<form action="/" method="post">
    <label for="input">Enter your input:</label><br>
    <input type="text" id="input" name="input"><br>
    <button type="submit">Submit</button>
  </form><a href="/"><button>Next</button></a>`
const sceneButton = `<a href="/"><button>Next Scene</button></a>` // To Do: Edit to change display with scene title.

// Create Single Global Enviornment.
const env = createGlobalEnv();

// Run DSL Interpreter
executeProgram(firstscene, env).then(result => {
    console.log("Evaluation completed:", result);
}).catch(error => {
    console.error("An error occurred:", error);
});

// Request Handler is called with every request
async function handler(req: Request){
    if (req.method == "GET"){
        console.log("GET"); //DEBUG
        console.log("GET) eos state:", eos); //DEBUG
        console.log("GET) leaf print pending:", lpp); //DEBUG
        console.log("GET) prev text:", prevTextOutput); //DEBUG
        console.log("GET) current text:", textOutput); //DEBUG
        let responseText = '';
        if (eos){ // Wrap up everything in scene file before moving on to next scene.
            responseText = `<html><body>
            <p>${prevTextOutput}</p></br>${sceneButton}
            </body></html>`
            prevTextOutput = '';
            eos = false;
            lpp = false;
            if (clickNextScene){
                clickNextScene();
                clickNextScene = null;
            }
        } else if (lpp){
            responseText = `<html><body>
            <p>${prevTextOutput}</p><p>${textOutput}</p>
            ${pendingInput ? inputForm : ""}
            </body></html>`
            prevTextOutput = '';
            if (eol) {lpp = false;} // if end of leaf, leaf no longer pending print.
        } else {
            responseText = `<html><body>
            <p>${textOutput}</p>
            ${pendingInput ? inputForm : ""}
            </body></html>`
        }

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
    currentScene = filename;
    // build directory
    filename = `./source/${currentScene}/${currentScene}.txt`
    // execute first file, result is the final return of evaluate
    console.log(`Executing scene: ${currentScene}`); // Debug
    let result = await sourcecodeToAST(filename).then(
        program => evaluate(program, env)
    );

    // while result is type string (i.e. scene node evaluated), evaluate next scene
    while (result.type == "string"){
        eos = true;
        console.log("End of scene."); // Debug
        console.log("eos state:", eos); //Debug
        // save previous scene's last text output
        prevTextOutput += textOutput;
        // update directory with new scene name
        currentScene = `${result.value}`;
        filename = `./source/${currentScene}/${currentScene}.txt`
        // wait for previous scene's remaining text to display
        console.log("Waiting for scene display to complete.") // Debug
        await awaitScene();
        // load scene on click
        console.log(`Executing scene: ${currentScene}`); // Debug
        result = await sourcecodeToAST(filename).then(
            program => evaluate(program, env)
        );
    }

    console.log("File has reached its final end.");
}

export async function executeLeaf (leaf: LeafStatement, env: Environment){
    lpp = true; // leaf pending print
    eol = false; // not end of leaf
    // add scene's last text output
    prevTextOutput += textOutput;
    let leafname = leaf.name;
    leafname = `./source/${currentScene}/leaf/${leafname}.txt`;
    console.log(`Executing leaf ${leafname} in scene ${currentScene}`); // Debug
    const result = await sourcecodeToAST(leafname).then(
        program => evaluate(program, env)
    );
    eol = true; // end of leaf
    // add leaf's last text output
    prevTextOutput += textOutput;
    console.log("Leaf) Execution complete", result.value); // Debug
    console.log("Leaf) Current global text output;", textOutput); // Debug
    console.log("Leaf) Current prev text output;", prevTextOutput); // Debug
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
    // replace /n with <br>
    textOutput = text.replace(/\n/g, "<br>");
}

export function awaitInput(): Promise<string> {
    return new Promise((resolve) => {
      pendingInput = resolve;
    });
}

function awaitScene(): Promise<void> {
    return new Promise((resolve) => {
        clickNextScene = resolve;
    });
}

// TO DO: Make scene a button. Means prev Text must show between "next" and "scene".
// Actually means we can remove prev Text and do the same show text and await as input.