import {
    ArrowFunctionExpressionNode, getAST,
    attachCommentsToAst,
    isArrowFunctionExpression,
    MemberExpressionNode,
    isCallExpressionNode,
    isMemberExpressionNode,
    LiteralNode,
    wrapCode,
    CallExpressionNode,
    BinaryExpressionNode,
    BlockStatementNode,
    IdentifierNode, isIdentifierNode,
} from "../index";
import {sanitizeScript} from "../utils";
import {findNodeAt, simple} from "acorn-walk";
import {Node, Comment} from "acorn";
import {NodeTypes} from "../constants";
import {generate} from "astring";
import {klona} from "klona/json";

const LENGTH_OF_QUOTES = 2;
const NEXT_POSITION = 1;

export const getTextArgumentAtPosition = (value: string, argNum: number, evaluationVersion: number): string => {
    // Takes a function string and returns the text argument at argNum position
    let ast: Node = { end: 0, start: 0, type: "" };
    let requiredArgument: any = "";
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        const wrappedCode = wrapCode(sanitizedScript);
        ast = getAST(wrappedCode, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
    } catch (error) {
        // if ast is invalid return a blank string
        return requiredArgument;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const node = findRootCallExpression(astWithComments);

    if(node && isCallExpressionNode(node)) {
        let argument = node.arguments[argNum];
        // return appropriate values based on the type of node
        switch (argument?.type) {
            case NodeTypes.ObjectExpression:
                // this is for objects
                requiredArgument = `{{${generate(argument, {comments: true}).trim()}}}`;
                break;
            case NodeTypes.Literal:
                requiredArgument = typeof argument.value === "string" ? argument.value : `{{${argument.value}}}`;
                break;
            case NodeTypes.MemberExpression:
                // this is for cases where we have {{appsmith.mode}} or {{Jsobj1.mytext}}
                requiredArgument = `{{${generate(argument, {comments: true}).trim()}}}`;
                break;
            case NodeTypes.BinaryExpression:
                // this is cases where we have string concatenation
                requiredArgument = `{{${generate(argument,  {comments: true}).trim()}}}`;
                break;
            case NodeTypes.ArrowFunctionExpression:
            case NodeTypes.CallExpression:
                if (value.indexOf(".then") === -1) {
                    // this is for cases where we need to extract functions with no .then
                    requiredArgument = `{{${generate(argument, {comments: true}).trim()}}}`;
                } else {
                    // this is for cases with a .then in the value
                    const requiredArg = ((node.callee as MemberExpressionNode)?.object as CallExpressionNode)?.arguments[argNum];
                    requiredArgument = (requiredArg as LiteralNode)?.value;
                }
                break;
        } 
    }

    return requiredArgument;
}

export const setTextArgumentAtPosition = (currentValue: string, changeValue: any, argNum: number, evaluationVersion: number): string => {
    // Takes a function string and a value to be changed at a particular position
    // it returns the replaced function string with current value at argNum position
    let ast: Node = { end: 0, start: 0, type: "" };
    let changedValue: string = currentValue;
    let commentArray: Array<Comment> = [];
    const rawValue = typeof changeValue === "string" ? String.raw`"${changeValue}"` : String.raw`${changeValue}`;
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const changeValueScript = sanitizeScript(rawValue, evaluationVersion);
        const changeValueAst = getAST(changeValueScript, {
            locations: true,
            ranges: true,
        });
        const sanitizedScript = sanitizeScript(currentValue, evaluationVersion);
        const __ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
        // clone ast to avoid mutating original ast
        ast = klona(__ast);
    } catch (error) {
        // if ast is invalid return original string
        throw error;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const node = findRootCallExpression(astWithComments);

    if(node && isCallExpressionNode(node)) {
        const startPosition = node.callee.end + NEXT_POSITION;
        node.arguments = node.arguments || [];
        node.arguments[argNum] = {
            type: NodeTypes.Literal,
            value: changeValue,
            raw: rawValue,
            start: startPosition,
            // add 2 for quotes
            end: (startPosition) + (changeValue.length + LENGTH_OF_QUOTES),
        };
        changedValue = `{{${generate(astWithComments, {comments: true}).trim()}}}`; 
    }

    return changedValue;
}

export const setCallbackFunctionField = (currentValue: string, changeValue: string, argNum: number, evaluationVersion: number): string => {
    // Takes a function string and a callback function to be changed at a particular position
    // it returns the replaced function string with current callback at argNum position
    let ast: Node = { end: 0, start: 0, type: "" };
    let changeValueAst: Node = { end: 0, start: 0, type: "" };
    let changedValue: string = currentValue;
    let changedValueCommentArray: Array<Comment> = [];
    let currentValueCommentArray: Array<Comment> = [];
    let requiredNode: ArrowFunctionExpressionNode | MemberExpressionNode | BinaryExpressionNode | CallExpressionNode | BlockStatementNode | LiteralNode;
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(currentValue, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: currentValueCommentArray,
        });

        const sanitizedChangeValue = sanitizeScript(changeValue, evaluationVersion);
        changeValueAst = getAST(sanitizedChangeValue, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: changedValueCommentArray,
        });
    } catch (error) {
        // if ast is invalid throw error
        throw error;
    }

    // attach comments to ast
    // clone ast to avoid mutating original ast
    const changeValueAstWithComments = klona(attachCommentsToAst(changeValueAst, changedValueCommentArray));
    const currentValueAstWithComments = klona(attachCommentsToAst(ast, currentValueCommentArray));

    const changeValueNodeFound = findNodeAt(changeValueAstWithComments, 0, undefined, (type) => type === "Program");

    if (changeValueNodeFound) {
        // @ts-ignore
        requiredNode = changeValueNodeFound?.node?.body[0]?.expression || changeValueNodeFound.node;

    }

    const found = findNodeAt(currentValueAstWithComments, 0, undefined, (type, node) => isCallExpressionNode(node));
    // @ts-ignore
    if(found) {
        const { node } = found;
        // When there is an argument after the specified argument number, then only add empty string literal
        // @ts-ignore
        if (changeValue === "" && node.arguments[argNum + 1]) {
            requiredNode = {
                type: NodeTypes.Literal,
                value: `${changeValue}`,
                raw: `'${String.raw`${changeValue}`}'`,
                start: 0,
                end: 2,
            };
        }

        // @ts-ignore
        if(node.arguments[argNum]) {
            // @ts-ignore
            node.arguments[argNum] = requiredNode;
        } else {
            // @ts-ignore
            node.arguments.push(requiredNode);
        }

        changedValue = generate(currentValueAstWithComments, {comments: true}).trim();

        try {
            getAST(changedValue);
        } catch(e) {
            throw e;
        }

    }

    return changedValue;
}

export const setObjectAtPosition = (currentValue: string, changeValue: any, argNum: number, evaluationVersion: number): string => {
    // Takes a function string and an object to be changed at a particular position
    // it returns the replaced function string with the object at argNum position
    if(typeof changeValue !== "string" || changeValue === '' || changeValue.trim() === '') {
        changeValue = '{}'
    }
    let ast: Node = { end: 0, start: 0, type: "" };
    let changedValue: string = currentValue;
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(currentValue, evaluationVersion);
        const __ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
        // clone ast to avoid mutating original ast
        ast = klona(__ast);
    } catch (error) {
        // if ast is invalid throw error
        throw error;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const node = findRootCallExpression(astWithComments);
    if(node && isCallExpressionNode(node)) {
        const startPosition = node.callee.end + NEXT_POSITION;
        node.arguments[argNum] = {
            type: NodeTypes.Literal,
            value: changeValue,
            raw: String.raw`${changeValue}`,
            start: startPosition,
            // add 2 for quotes
            end: (startPosition) + (changeValue.length + LENGTH_OF_QUOTES),
        };
        changedValue = generate(astWithComments, {comments: true}).trim();
        try {
            getAST(changedValue);
        } catch(e) {
            throw e;
        }
    }

    return `{{${changedValue}}}`;
}

export const getEnumArgumentAtPosition = (value: string, argNum: number, defaultValue: string, evaluationVersion: number): string => {
    // Takes a function string and return enum argument at a particular position
    // enum argument -> this is for selectors
    let ast: Node = { end: 0, start: 0, type: "" };
    let requiredArgument: string = defaultValue;
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        const wrappedCode = wrapCode(sanitizedScript);
        ast = getAST(wrappedCode, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
    } catch (error) {
        // if ast is invalid return default value
        return defaultValue;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    // Api1.run(() => { showAlert("", () => { showAlert("") }) })

    const node = findRootCallExpression(astWithComments);

    if(node && isCallExpressionNode(node)) {
        if (node.arguments[argNum]) {
            let argument = node.arguments[argNum];
            switch (argument?.type) {
                case NodeTypes.Literal:
                    requiredArgument = argument.raw as string;
            }
        } 
    }

    return requiredArgument;
}

export const setEnumArgumentAtPosition = (currentValue: string, changeValue: string, argNum: number, evaluationVersion: number): string => {
    // Takes a function string and an enum argument to be changed at a particular position
    // it returns the replaced function string with enum arg at argNum position
    // enum arg -> selectors
    let ast: Node = { end: 0, start: 0, type: "" };
    let changedValue: string = currentValue;
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(currentValue, evaluationVersion);
        const __ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
        // clone ast to avoid mutating original ast
        ast = klona(__ast);
    } catch (error) {
        // if ast is invalid throw error
        throw error;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const node = findRootCallExpression(astWithComments);

    if(node && isCallExpressionNode(node)) {
                       // add 1 to get the starting position of the next
                // node to ending position of previous
        const startPosition = node.callee.end + NEXT_POSITION;
        node.arguments[argNum] = {
            type: NodeTypes.Literal,
            value: `${changeValue}`,
            raw: String.raw`${changeValue}`,
            start: startPosition,
            // add 2 for quotes
            end: (startPosition) + (changeValue.length + LENGTH_OF_QUOTES),
        };
        changedValue = `{{${generate(astWithComments, {comments: true}).trim()}}}`; 
    }

    return changedValue;
}

export const getModalName = (value: string, evaluationVersion: number): string => {
    // Takes a function string and returns modal name at a particular position
    let ast: Node = { end: 0, start: 0, type: "" };
    let modalName: string = "none";
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        const wrappedCode = wrapCode(sanitizedScript);
        ast = getAST(wrappedCode, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
    } catch (error) {
        // if ast is invalid return modal name
        return modalName;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const node = findRootCallExpression(astWithComments);

    if(node && isCallExpressionNode(node)) {
        let argument = node.arguments[0];
        switch (argument?.type){
            case NodeTypes.Literal:
                modalName = argument.value as string;
        } 
    }

    return modalName;
}

export const setModalName = (currentValue: string, changeValue: string, evaluationVersion: number) => {
    // takes function string as input and sets modal name at particular position
    let ast: Node = { end: 0, start: 0, type: "" };
    let changedValue: string = currentValue;
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(currentValue, evaluationVersion);
        const __ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
        // clone ast to avoid mutating original ast
        ast = klona(__ast);
    } catch (error) {
        // if ast is invalid throw error
        throw error;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const node = findRootCallExpression(astWithComments);
    if (node && isCallExpressionNode(node)) {
        // add 1 to get the starting position of the next
        // node to ending position of previous
        const startPosition = node.callee.end + NEXT_POSITION;
        const newNode: LiteralNode = {
            type: NodeTypes.Literal,
            value: `${changeValue}`,
            raw: String.raw`'${changeValue}'`,
            start: startPosition,
            // add 2 for quotes
            end: startPosition + (changeValue.length + LENGTH_OF_QUOTES),
        };
        node.arguments = [newNode];
        changedValue = `{{${generate(astWithComments, {comments: true}).trim()}}}`;
    }
    return changedValue;
}

export const getFuncExpressionAtPosition = (value: string, argNum: number, evaluationVersion: number): string => {
    // takes a function string and returns the function expression at the position
    let ast: Node = { end: 0, start: 0, type: "" };
    let requiredArgument: string = "() => {}";
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });

        // attach comments to ast
        const astWithComments = attachCommentsToAst(ast, commentArray);

        /**
         * We need to traverse the ast to find the first callee
         * For Eg. Api1.run(() => {}, () => {}).then(() => {}).catch(() => {})
         * We have multiple callee above, the first one is run
         * Similarly, for eg. appsmith.geolocation.getCurrentPosition(() => {}, () => {});
         * For this one, the first callee is getCurrentPosition
         */
        const firstCallExpressionNode = findRootCallExpression(astWithComments);

        // const firstCallExpressionNode = klona(nodeToTraverse);        

        // @ts-ignore
        const argumentNode = firstCallExpressionNode?.arguments[argNum];
        if (argumentNode) {
            requiredArgument = `${generate(argumentNode, {comments: true})}`;
        } else {
            requiredArgument = "";
        }

        return requiredArgument;
    } catch (error) {
        // if ast is invalid return the blank function
        return requiredArgument;
    }
}

export const getFunction = (value: string, evaluationVersion: number): string => {
    // returns the function name from the function expression
    let ast: Node = { end: 0, start: 0, type: "" };
    let requiredFunction: string = "";
    let commentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        const wrappedCode = wrapCode(sanitizedScript);
        ast = getAST(wrappedCode, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });
    } catch (error) {
        // if ast is invalid return the original function
        return requiredFunction;
    }

    // attach comments to ast
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const node = findRootCallExpression(astWithComments);

    if (node && isCallExpressionNode(node)) {
        const func = `${generate(node)}`;
        requiredFunction = func !== '{}' ? `{{${func}}}` : "";
    }

    return requiredFunction;
}

export const replaceActionInQuery = (query: string, changeAction: string, argNum: number, evaluationVersion: number) => {
    // takes a query in this format -> Api.run( () => {}, () => {})
    // takes an action and its position and replaces it
    let ast: Node = { end: 0, start: 0, type: "" };
    let changeActionAst: Node = { end: 0, start: 0, type: "" };
    let requiredNode: ArrowFunctionExpressionNode = {
        end: 0,
        start: 0,
        type: NodeTypes.ArrowFunctionExpression,
        params: [],
        id: null,
    };
    let requiredQuery: string = "";
    let commentArray: Array<Comment> = [];
    let changeActionCommentArray: Array<Comment> = [];
    try {
        // sanitize to remove unnecessary characters which might lead to invalid ast
        const sanitizedScript = sanitizeScript(query, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: commentArray,
        });

        const sanitizedChangeAction = sanitizeScript(changeAction, evaluationVersion);
        changeActionAst = getAST(sanitizedChangeAction, {
            locations: true,
            ranges: true,
            // collect all comments as they are not part of the ast, we will attach them back on line 46
            onComment: changeActionCommentArray,
        });
    } catch (error) {
        // if ast is invalid throw error
        throw error;
    }

    // attach comments to ast
    // clone ast to avoid mutating original ast
    const astWithComments = klona(attachCommentsToAst(ast, commentArray));
    const changeActionAstWithComments = klona(attachCommentsToAst(changeActionAst, changeActionCommentArray));


    simple(changeActionAstWithComments, {
        ArrowFunctionExpression(node) {
            if (isArrowFunctionExpression(node)) {
                requiredNode = node;
            }
        }
    });

    simple(astWithComments, {
        CallExpression(node) {
            if (isCallExpressionNode(node) && isMemberExpressionNode(node.callee) && node.arguments[argNum]) {
                // add 1 to get the starting position of the next
                // node to ending position of previous
                const startPosition = node.arguments[argNum].start;
                requiredNode.start = startPosition;
                requiredNode.end = startPosition + changeAction.length;
                node.arguments[argNum] = requiredNode;
                requiredQuery = `${generate(astWithComments, {comments: true}).trim()}`
            }
        },
    });

    return requiredQuery;
}

/**
 * This function gets the action blocks which are basically the individual expression statements in the code
 */
export function getActionBlocks(
    value: string,
    evaluationVersion: number,
): Array<string> {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let actionBlocks: Array<string> = [];
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
    } catch (error) {
        return actionBlocks;
    }
    const astWithComments = attachCommentsToAst(ast, commentArray);

    astWithComments.body.forEach((node: Node) => {
        actionBlocks.push(generate(node, {comments: true}).trim());
    })

    return actionBlocks;
}

export function getFunctionBodyStatements(
    value: string,
    evaluationVersion: number,
): Array<string> {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });

        const astWithComments = attachCommentsToAst(ast, commentArray);

        const mainBody = astWithComments.body[0];

        let statementsBody = [];

        switch(mainBody.type) {
            case NodeTypes.ExpressionStatement:
                if(mainBody.expression.body.type === NodeTypes.BlockStatement)
                    statementsBody = mainBody.expression.body.body;
                else if(mainBody.expression.body.type === NodeTypes.CallExpression)
                    statementsBody = [mainBody.expression.body]
                break;
            case NodeTypes.FunctionDeclaration:
                statementsBody = mainBody.body.body;
                break;
        }
        return statementsBody.map((node: Node) => generate(node, {comments: true}).trim());
    } catch (error) {
        return [];
    }
}

export function getMainAction(value: string, evaluationVersion: number): string {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let mainAction: string = "";
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
    } catch (error) {
        return mainAction;
    }
    const astWithComments = attachCommentsToAst(ast, commentArray);

    simple(astWithComments, {
        ExpressionStatement(node) {
            simple(node, {
                CallExpression(node) {
                    // @ts-ignore
                    if (node.callee.type === NodeTypes.Identifier) {
                        mainAction = generate(node, {comments: true}).trim();
                    } else {
                        // @ts-ignore
                        mainAction = generate(node.callee, {comments: true}).trim() + "()";
                    }
                }
            })
        }
    });

    return mainAction;
}

export function getFunctionName(value: string, evaluationVersion: number): string {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let functionName: string = "";
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
    const astWithComments = attachCommentsToAst(ast, commentArray);

    const firstCallExpressionNode = findRootCallExpression(astWithComments);

    return firstCallExpressionNode ? generate(firstCallExpressionNode?.callee, {comments: true}) : ""; 

    } catch (error) {
        return functionName;
    }
}

// this function extracts the then/catch blocks when query is in this form
// Api1.run(() => {}, () => {}, {}).then(() => {}).catch(() => {}), or
// Api1.run(() => {}, () => {}, {}).then(() => {}), or
// Api1.run(() => {}, () => {}, {}).catch(() => {}), or
export function getThenCatchBlocksFromQuery(value: string, evaluationVersion: number) {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let returnValue: Record<string, string> = {};
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });

        const astWithComments = attachCommentsToAst(ast, commentArray);

        const rootCallExpression = findRootCallExpression(astWithComments);
        if(!rootCallExpression) return returnValue;

        let firstBlockType;

        const firstBlock = findNodeAt(astWithComments, 0, undefined, function(type, node) {
            if(isCallExpressionNode(node)) {
                if(isMemberExpressionNode(node.callee)) {
                    if(node.callee.object === rootCallExpression) {
                        if(isIdentifierNode(node.callee.property)) {
                            if(['then', 'catch'].includes(node.callee.property.name)) {
                                firstBlockType = node.callee.property.name;
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        })?.node;

        if(!firstBlock) return returnValue;
        if(!isCallExpressionNode(firstBlock) || !firstBlockType) return returnValue;

        const args = firstBlock.arguments;
        if(args.length) {
            returnValue[firstBlockType] = generate(args[0]);
        }
        const secondBlockType = firstBlockType === "then" ? "catch" : "then";
        const secondBlock = findNodeAt(ast, 0, undefined, function(type, node) {
            if(isCallExpressionNode(node)) {
                if(isMemberExpressionNode(node.callee)) {
                    if(node.callee.object === firstBlock) {
                        if(isIdentifierNode(node.callee.property))
                            return node.callee.property.name === secondBlockType;
                    }
                }
            }
            return false;
        })?.node; 
        
        if(secondBlock && isCallExpressionNode(secondBlock)) {
            const args = secondBlock.arguments;
            if(args.length > 0) {
                returnValue[secondBlockType] = generate(args[0]);
            }
        }

        return returnValue;
    } catch (error) {
        return returnValue;
    }
}

export function setThenBlockInQuery(
    value: string,
    thenBlock: string,
    evaluationVersion: number,
): string {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let requiredQuery: string = "";
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });

        const astWithComments = attachCommentsToAst(ast, commentArray);

        // @ts-ignore
        const thenNodeInGivenQuery = findNodeAt(astWithComments, null, null, (type, node) => type === NodeTypes.MemberExpression && node.property.name === "then");

        if (!thenNodeInGivenQuery) {
            const expression = klona(astWithComments.body[0].expression);

            const callExpression = {
                type: NodeTypes.CallExpression,
                start: expression.start,
                end: expression.end + 7,
                callee: {
                    type: NodeTypes.MemberExpression,
                    object: expression,
                    start: expression.start,
                    end: expression.end + 5,
                    property: {
                        type: NodeTypes.Identifier,
                        name: "then",
                        start: expression.end + 1,
                        end: expression.end + 5,
                    }
                }
            }
            astWithComments.body[0].expression = callExpression;
            astWithComments.body[0].end = callExpression.end;
        }

        const thenBlockNode = getAST(thenBlock, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
        const thenBlockNodeWithComments = attachCommentsToAst(thenBlockNode, commentArray);

        // @ts-ignore
        const thenCallExpressionNode = findNodeAt(astWithComments, undefined, undefined, (type, node) => type === NodeTypes.CallExpression && node?.callee?.property?.name === "then");

        if (thenCallExpressionNode) {
            // @ts-ignore
            thenCallExpressionNode.node.arguments = [thenBlockNodeWithComments.body[0].expression];
        }

        requiredQuery = `${generate(astWithComments, {comments: true}).trim()}`;

        return requiredQuery;
    } catch (error) {
        return requiredQuery;
    }
}

export function setCatchBlockInQuery(
    value: string,
    catchBlock: string,
    evaluationVersion: number,
): string {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let requiredQuery: string = "";
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });

        const astWithComments = attachCommentsToAst(ast, commentArray);

        // @ts-ignore
        const catchNodeInGivenQuery = findNodeAt(astWithComments, null, null, (type, node) => type === NodeTypes.MemberExpression && node.property.name === "catch");

        if (!catchNodeInGivenQuery) {
            const expression = klona(astWithComments.body[0].expression);

            const callExpression = {
                type: NodeTypes.CallExpression,
                start: expression.start,
                end: expression.end + 7,
                callee: {
                    type: NodeTypes.MemberExpression,
                    object: expression,
                    start: expression.start,
                    end: expression.end + 5,
                    property: {
                        type: NodeTypes.Identifier,
                        name: "catch",
                        start: expression.end + 1,
                        end: expression.end + 5,
                    }
                }
            }
            astWithComments.body[0].expression = callExpression;
            astWithComments.body[0].end = callExpression.end;
        }

        const catchBlockNode = getAST(catchBlock, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
        const catchBlockNodeWithComments = attachCommentsToAst(catchBlockNode, commentArray);

        // @ts-ignore
        const catchCallExpressionNode = findNodeAt(astWithComments, undefined, undefined, (type, node) => type === NodeTypes.CallExpression && node?.callee?.property?.name === "catch");

        if (catchCallExpressionNode) {
            // @ts-ignore
            catchCallExpressionNode.node.arguments = [catchBlockNodeWithComments.body[0].expression];
        }

        requiredQuery = `${generate(astWithComments, {comments: true}).trim()}`;

        return requiredQuery;
    } catch (error) {
        return requiredQuery;
    }
}


export function getFunctionArguments(value: string, evaluationVersion: number): string {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let argumentsArray: Array<any> = [];
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
    } catch (error) {
        return "";
    }
    const astWithComments = attachCommentsToAst(ast, commentArray);

    simple(astWithComments, {
        CallExpression(node) {
            for (let argument of (node as CallExpressionNode).arguments) {
                argumentsArray.push(generate(argument));
            }
        }
    });

    return [...argumentsArray].join(", ");
}

export function getFunctionNameFromJsObjectExpression(value: string, evaluationVersion: number): string {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let functionName: string = "";
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
    } catch (error) {
        return functionName;
    }
    const astWithComments = attachCommentsToAst(ast, commentArray);

    simple(astWithComments, {
        CallExpression(node) {
            functionName = `${(((node as CallExpressionNode).callee as MemberExpressionNode).property as IdentifierNode).name}`;
        }
    });

    return functionName;
}

// function to get all call expressions in a given query
export function getCallExpressions(value: string, evaluationVersion: number): Array<any> {
    let ast: Node = { end: 0, start: 0, type: "" };
    let commentArray: Array<Comment> = [];
    let callExpressions: Array<any> = [];
    try {
        const sanitizedScript = sanitizeScript(value, evaluationVersion);
        ast = getAST(sanitizedScript, {
            locations: true,
            ranges: true,
            onComment: commentArray,
        });
    } catch (error) {
        return callExpressions;
    }
    const astWithComments = attachCommentsToAst(ast, commentArray);

    simple(astWithComments, {
        CallExpression(node) {
            callExpressions.push({ 
                code: generate(node).trim(),
                callee: generate((node as CallExpressionNode).callee).trim(),
                arguments: (node as CallExpressionNode).arguments.map((argument) => generate(argument).trim()),
            });
        }
    });

    return callExpressions;
}

function findRootCallExpression(ast: Node) {
    const callExpressions: CallExpressionNode[] = [];

    simple(ast, {
        CallExpression(node) {
            if(isCallExpressionNode(node))
                callExpressions.push(node);
        }
    });

    /**
     * rootCallExpression should have the smallest start offset.
     * In case there are multiple CallExpressions with the same start offset, 
     * pick the one the that has the least end offset.
     */
    let rootCallExpression = callExpressions[0];
    for(const ce of callExpressions) {
        if(rootCallExpression.start === ce.start) {
            rootCallExpression = ce.end < rootCallExpression.end ? ce : rootCallExpression; 
        } else if(rootCallExpression.start > ce.start) {
            rootCallExpression = ce;
        }
    }

    return rootCallExpression;
}