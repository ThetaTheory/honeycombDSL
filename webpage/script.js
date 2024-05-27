import Parser from "../frontend/parser.ts";
import { createGlobalEnv } from "../runtime/enviornment.ts";
import { evaluate } from "../runtime/interpreter.ts";

// TO DO: CHANGE WEBPAGE PROGRAM USING DENO FEATURES

// DEBUG TEST
document.getElementById('outputArea').innerHTML = "test";

// Execution - This runs once HTML is fully loaded.
document.addEventListener("DOMContentLoaded", executeProgram("../test.txt"));

// execution
async function executeProgram (filename) {
    const program = await sourcecodeToAST(filename);
    const env = createGlobalEnv();

    await evaluate(program, env);
}

// reads source code text file, parses and generates AST as program array.
async function sourcecodeToAST(filename) {
    const parser = new Parser();
    const input = await Deno.readTextFile(filename);
    const program = parser.produceAST(input);
    console.log('AST: ', program, '\n') // debug
    return program;
}

// takes text and displays it
export function displayOutput(text) {
    const outputArea = document.getElementById('outputArea');
    outputArea.innerHTML = text;
}

// displays input area and on click, passes input value to input evaluator.
export function displayInputArea(inputCommand, callback) {
    const inputArea = document.getElementById("inputArea");
    // create <label>
    const inputLabel = document.createElement("label");
    inputLabel.textContent = `Please enter ${inputCommand.identifier}: `;

    // create <input type="text" id="userinput">
    const inputField = document.createElement("input");
    inputField.setAttribute("type", "text");
    inputField.setAttribute("id", "userInput");

    // create <button>Submit</button>
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";

    // add created elements to div inputArea
    inputArea.appendChild(inputLabel);
    inputArea.appendChild(inputField);
    inputArea.appendChild(submitButton);

    // on button click, pass user input value to callback function.
    submitButton.addEventListener("click", function() {
        const userInput = inputField.value;
        callback(userInput);
        // To Do: Add make input box disappear after input complete.
    });
}


/*
1. Source Code .txt -> Program Array
2. Evaluate Program until Input Node
3. Pause Evaluation
4. Display accumalated Text, Display Input Area and Button
5. On button click, Resume Evaluation
Repeat until EOF
*/