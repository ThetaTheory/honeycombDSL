/* Variable Handling and Scope Management */
import { RuntimeVal, make_bool_var, make_null_var } from "./values.ts";

function setupScope(env: Environment){
    // declare default variables for global enviornment
    env.declareVar("true", make_bool_var(true), true);
    env.declareVar("false", make_bool_var(false), true);
    env.declareVar("null", make_null_var(), true);
}

export default class Environment {

    private parent?: Environment; // parent(may be undefined)
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor (parentENV?: Environment){
        const global = parentENV? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
        if(global){
            setupScope(this);
        }
    }

    public declareVar (varname: string, value: RuntimeVal, constant: boolean): RuntimeVal{
        if(this.variables.has(varname)){
            throw `Cannot declare variable ${varname} as it is already defined.`;
        }
        this.variables.set(varname, value);
        if (constant){
            this.constants.add(varname);
        }
        return value;
    }

    public assignVar (varname: string, value: RuntimeVal): RuntimeVal {
        const env = this.resolve(varname);
        // check if const. cannot reassign if so.
        if (env.constants.has(varname)){
            throw "Not allowed to reassign true/false/null variable."
        }
        env.variables.set(varname, value); // runs if variable found
        return value;
    }

    public lookupVar(varname: string): RuntimeVal {
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }

    // Go through scopes to find variable. Throw error if variable not found.
    public resolve (varname: string): Environment {
        if (this.variables.has(varname)){
            return this;
        }
        if (this.parent == undefined){
            throw `Cannot resolve ${varname} as it does not exist.`
        }
        return this.parent.resolve(varname);
    }
}