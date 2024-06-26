import { Stmt } from "../frontend/ast.ts";

export type ValueType = "null" | "number" | "boolean" | "string" | "text" | "nodeArray";

export interface RuntimeVal {
    value?: null | number | boolean | string | string[] | Stmt[];
    type: ValueType;
}

export interface NullVal extends RuntimeVal {
    value: null;
    type: "null";
}

export interface NumberVal extends RuntimeVal {
    value: number;
    type: "number";
}

export interface BooleanVal extends RuntimeVal {
    value: boolean;
    type: "boolean";
}

export interface StringVal extends RuntimeVal {
    value: string;
    type: "string";
}

export interface TextVal extends RuntimeVal {
    value: string;
    type: "text";
}

export interface CodeBlockVal extends RuntimeVal {
    value: Stmt[];
    type: "nodeArray";
}

// Make Variable functions to simplify code
export function make_num_var (n = 0){
    return {value: n, type:"number"} as NumberVal;
}

export function make_null_var (){
    return {value: null, type:"null"} as NullVal;
}

export function make_bool_var (b = true){
    return {value: b, type:"boolean"} as BooleanVal;
}