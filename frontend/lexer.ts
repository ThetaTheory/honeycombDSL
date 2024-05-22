/* The Lexer translates code text into an array of Tokens */

// Const group of token types
export enum TokenType {
  String,
  TemplateString,
  Create, Set,
  Identifier,
  Number,
  OpenParen, CloseParen,
  OpenBracket, CloseBracket,
  Colon,
  BinaryOperator, Equals,
  RelationalOperator, LogicalOperator,
  If, Loop,
  EOF,
}

// Keyword Dictionary
const KEYWORDS: Record<string, TokenType> = {
  create: TokenType.Create,
  set: TokenType.Set,
  if: TokenType.If,
  loop: TokenType.Loop,
  while: TokenType.Loop,
  for: TokenType.Loop,
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
export function tokenize (sourceCode: string): Token[]{

const src = sourceCode.split('');
const tokens = recursive_tokenizer(src);

// push end of file token
tokens.push({value: "EndOfFile", type: TokenType.EOF});
// TEMP TESTER
console.log('Tokens: ', tokens, '\n');

return tokens;

}

function recursive_tokenizer (src: string[]): Token[]{
  let tokens: Token[] = [];
  let tString = "";
  let bracketCount = 0;

  while(src.length > 0){

    if (src[0] != '['){
      tString += src.shift(); // Accumalate template string Token value if not [
    } else {
      // push accumalated template string
      if (tString.length > 0) {
        tokens.push(token(tString, TokenType.TemplateString));
        tString = ""; // Initialise tString
      }
      // push beginning of code block
      tokens.push(token(src.shift(), TokenType.OpenBracket));
      bracketCount++;
      // Loop until end of first code block. i.e. The main tokeniser only executes inside square brackets.
      while(bracketCount !== 0){
        if (src[0] == '['){
          tokens.push(token(src.shift(), TokenType.OpenBracket));
          bracketCount++;
        } else if (src[0] == ']'){
          tokens.push(token(src.shift(), TokenType.CloseBracket));
          bracketCount--;
        } else if (src[0] == '('){
          tokens.push(token(src.shift(), TokenType.OpenParen));
        } else if (src[0] == '"'){
          let string = "";
          src.shift();
          while(src[0]!= '"'){
            string += src.shift();
          }
          src.shift();
          tokens.push(token(string, TokenType.String));
        } else if (src[0] == ')'){
          tokens.push(token(src.shift(), TokenType.CloseParen));
        } else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
          tokens.push(token(src.shift(), TokenType.BinaryOperator));
        } else if (src[0] == "="){
          tokens.push(token(src.shift(), TokenType.Equals));
        } else if (src[0] == ">" || src[0] == "<" || (src[0] == "!" && src[1] == "=")){
          let operator = src.shift()!; // forced ! because TypeScript thinks it may return undefined even though it can't??
          if (src[0] == '=') {
            operator += src.shift(); // For !=, <=, >=
          }
          tokens.push(token(operator, TokenType.RelationalOperator));
        } else if (src[0] == "&" || src[0] == "|"){
          tokens.push(token(src.shift(), TokenType.LogicalOperator));
        } else if (src[0] == ":"){
          // Between : and end of code block is always a block statement.
          tokens.push(token(src.shift(), TokenType.Colon));
          // Find end of this block statement.
          let i = 0;
          while (bracketCount !== 0){
              if (src[i] == '['){ bracketCount++; }
              if (src[i] == ']'){ bracketCount--; }
              i++;
          }
          // slice inside of block statement.
          const new_src = src.slice(0, i-1);
          // send block statement to recursive tokenizer, add return to tokens.
          tokens = tokens.concat(recursive_tokenizer(new_src));
          // progress to end of block statement.
          src.splice(0, i-1);
          // return bracket count to 1 (cuz it's always one between [ and :)
          bracketCount = 1;
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
                if (typeof reserved != "number"){ // because reserved types is an enum ... is this really most optimal?
                    tokens.push(token(idn, TokenType.Identifier)); // not reserved
                } else {
                    tokens.push(token(idn, reserved)); // is reserved
                }
            } else if (isSkip(src[0])){
                src.shift(); // skips character
            } else {
                console.log('Unrecognised character found in source code');
                Deno.exit(1);
            }
        }
        }
    }
  }
  // push last remaining template string
  if (tString.length > 0) {
      tokens.push(token(tString, TokenType.TemplateString));
  }

  return tokens;
}