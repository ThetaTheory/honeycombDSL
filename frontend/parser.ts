import { Stmt, Program, CodeBlock, Expr, BinaryExpr, NumericLiteral, Identifier, VarDeclaration, AssignmentExpr, TemplateLiteral } from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
    private tokens: Token[] = [];

    // checks if not end of file.
    private not_eof(): boolean {
        return this.tokens[0].type != TokenType.EOF;
    }
    // returns current token as default.
    private at() {
        return this.tokens[0] as Token;
    }
    // returns current token and then move on to next token.
    private eat(){
        const prev = this.tokens.shift() as Token;
        return prev;
    }
    // eat, but with error message for unexpected token.
    private expect(type: TokenType, err: any){
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type != type){
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            Deno.exit(1);
        }
        return prev;
    }

    // Generates the ASTree
    public produceAST(sourceCode: string): Program{
        this.tokens = tokenize(sourceCode); // Calls Lexer and gets our array of tokens.
        const program: Program = {
            kind: "Program",
            body: [],
        } // Creates program of type Program
        while(this.not_eof()){
            program.body.push(this.parse_stmt());
        } // Send down to parser, adds parsed tokens to program.body as array.
        return program; // return { kind: "Program", body: [ -- array of tokens in file -- ]}
    }

    /* Statement Parser */

    private parse_stmt (): Stmt {
        switch (this.at().type){
            case TokenType.OpenBracket:
                return this.parse_block_stmt(); // If [, goto code block parser
            default:
                return this.parse_primary_expr(); // If not [, it's always template literal
        }
    }


    private parse_block_stmt(): Stmt{
        this.eat() // eat [
        const codeBlock: CodeBlock = {
            kind: "CodeBlock",
            body: [],
        }
        // Parses until encounter ]
        while(this.not_eof() && this.at().type != TokenType.CloseBracket){            
            switch (this.at().type) {
                case TokenType.Create:
                    return this.parse_var_declaration();
                case TokenType.Set:
                    return this.parse_assignment_expr();
                // case TokenType.Input:
                //     return this.parse_primary_expr();
                // case TokenType.If:
                //     codeBlock.body.push(this.parse_if_stmt());
                //     break;
                // case TokenType.Loop:
                //     codeBlock.body.push(this.parse_loop_stmt());
                //     break;
                default:
                    return this.parse_stmt(); // !!! To Do: if it was a string it would eat [. Add escape \ command.
            }
        }
        this.expect(TokenType.CloseBracket, "Expected ']' to end code block.");
        return codeBlock; // return { kind: "CodeBlock", body: [ -- array of tokens in code block -- ]}
    }
    // !!!! To Do: Only code block nestables.


    // create idnt // create idnt = expr
    // return to parse code block
    private parse_var_declaration(): Stmt {
        this.expect(TokenType.Create, "Expected Token Type Create."); // eats create
        const identifier = this.expect(TokenType.Identifier, "Expected identifier following 'create:' keyword.").value; // eats idnt
        let declaration;
        if(this.at().type == TokenType.CloseBracket){
            // case; create: idnt]
            declaration =  {
                kind: "VarDeclaration",
                constant: false,
                identifier
            } as VarDeclaration;
        } else {
            // case; create: idnt = expr
            this.expect(TokenType.Equals, "Expected '=' or ']' following identifier.") // eats =
            declaration = {
                kind: "VarDeclaration",
                constant: false,
                identifier,
                value: this.parse_additive_expr(),
            } as VarDeclaration;
        }
        this.expect(TokenType.CloseBracket, "Expected ] to end statement.");
        return declaration;
    }
    // To Do: look into removing constant while true, false, null remains constant variables..


    /* Expression Parser */
    /* Order of Precedence:
    Member <- FunctionCall <- Logical <- Comparison <- AdditiveExpr <- MultiplicitaveExpr <- UnaryExpr <- PrimaryExpr
   */

    private parse_expr (): Expr {
        return this.parse_assignment_expr();
    } // To Do: assignment expression being under parse expr doesn't make sense for my code... Review after implementing obj.

    // set var = val]
    private parse_assignment_expr(): Expr {
        this.expect(TokenType.Set, "Expected Token Type Set."); // eats set
        const left = this.expect(TokenType.Identifier, "Expected identifier following 'set' keyword.").value; // To Do: Make compatible with obj. // eats var
        this.expect(TokenType.Equals, "Expected '=' after identifier."); // eats =
        const value = this.parse_additive_expr();
        const assignment = {
            kind: "AssignmentExpr",
            assignee: left,
            value
        } as AssignmentExpr;
        this.expect(TokenType.CloseBracket, "Expected ] to end assignment.");
        return assignment;
      }
    
    // + -
    private parse_additive_expr (): Expr {
        let left = this.parse_multiplicitive_expr();
        while(this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right =  this.parse_multiplicitive_expr();
            left = {
                kind: "BinaryExpr",
                left, right, operator,
            } as BinaryExpr;

        } 
        return left;
    }

    // * / %
    private parse_multiplicitive_expr (): Expr {
        let left = this.parse_primary_expr();
        while(this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
            const operator = this.eat().value;
            const right =  this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left, right, operator,
            } as BinaryExpr;

        }
        return left;
    }

    // To Do: Add boolean binary expr.

    private parse_primary_expr (): Expr {
        const tkn = this.at().type;
        switch(tkn) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value} as Identifier;
            case TokenType.Number:
                return { kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral;
            case TokenType.TemplateString:
                return { kind: "TemplateLiteral", value: this.eat().value} as TemplateLiteral;
            case TokenType.OpenParen: { 
                this.eat();
                const value = this.parse_expr();
                this.expect(TokenType.CloseParen, "Unexpected token found inside parethesis expression.");
                return value;
            }
            //case TokenType.BinaryOperator:
            //case TokenType.Equals:
            //case TokenType.EOF:
            default:
                console.error("Unexpected token found during parsing", this.at());
                Deno.exit(1);
        }
    }
}