// The Lexer translates code text into an array of Tokens //

// To Do: PROBLEM: We need it to only tokenise if inside a code block.

// Const group of token types
export enum TokenType {
    String,
    Create, Set,
    Identifier,
    Number,
    OpenParen, CloseParen,
    OpenBracket, CloseBracket,
    BinaryOperator, Equals,
    // if, loop
    EOF,
  }
  
// Keyword Dictionary
const KEYWORDS: Record<string, TokenType> = {
    create: TokenType.Create,
    set: TokenType.Set,
}

// Rule token objects should follow
export interface Token {
    value: string;
    type: TokenType;
}
  
// Function that creates token object
function token (value = "", type: TokenType): Token {
    return { value, type };
}

/* Change Check functions to RegEx or something simpler */
  
// Checks if alphabet
function isAlpha (str: string){
    return str.toUpperCase() != str.toLowerCase();
}
// Checks if number
function isInt (str: string){
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (c >= bounds[0] && c <= bounds[1]);
}
// Checks if skippable
function isSkip (str: string){
    return (str == ' ' || str == '\n' || str == '\t');
}
  
// Tokenizer
export function tokenize (sourceCode: string): Token[] {
  
    const tokens: Token[] = [];
  
    // Split so each character is an element of the array.
    const src = sourceCode.split("");
  
    // Build each token until end of file.
    while (src.length > 0){
      // Single Character Tokens
      if (src[0] == '['){
        tokens.push(token(src.shift(), TokenType.OpenBracket));
      } else if (src[0] == ']'){
        tokens.push(token(src.shift(), TokenType.CloseBracket));
      } else if (src[0] == '('){
        tokens.push(token(src.shift(), TokenType.OpenParen));
      } else if (src[0] == ')'){
        tokens.push(token(src.shift(), TokenType.CloseParen));
      } else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
        tokens.push(token(src.shift(), TokenType.BinaryOperator));
      } else if (src[0] == "="){
        tokens.push(token(src.shift(), TokenType.Equals));
      } else {
        // Multi Character Tokens
        if (isInt(src[0])){
            let num = "";
            while (src.length > 0 && isInt(src[0])){
                num += src.shift(); // appends until complete number
            }
            tokens.push(token(num, TokenType.Number));
        } else if (isAlpha(src[0])){
            let idn = "";
            while (src.length > 0 && isAlpha(src[0])){
                idn += src.shift(); // appends until complete identifier
            }
            // Check if reserved keyword
            const reserved = KEYWORDS[idn];
            if (typeof reserved != "number"){ // because reserved types is an enum // !! wait, fuck, what if it's part of string... shit.
                tokens.push(token(idn, TokenType.Identifier)); // not reserved
            } else {
                tokens.push(token(idn, reserved)); // is reserved
            }
        } else if (isSkip(src[0])){
            src.shift(); // skips character
        } else {
            console.log('Unrecognised character found in source code');
            Deno.exit(1);
        } /* TO DO: Add error handler */
      }
    }
    
    tokens.push({value: "EndOfFile", type: TokenType.EOF});
    console.log('Tokens: ', tokens, '\n'); // TEMP TESTER
    return tokens;
}



/* TO DO:
Optimise
String??? How handle stuff that should not skip if string. Like spaces.
*/