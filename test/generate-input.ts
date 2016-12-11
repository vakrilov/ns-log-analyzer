import { Frame, D3Frame } from "../types";

export var testEntries1 = [{
    category: "root",
    start: 100,
    time: 200,
    children: [
        {
            category: "first",
            start: 20,
            time: 50
        },
        {
            category: "second",
            start: 100,
            time: 80
        }]
}];

const DEPTH = 2;
function createTest(depth = 0) {
    return {
        category: "depth " + depth,
        start: depth * 10,
        time: 5 + (DEPTH - depth) * 20,
        children: depth < DEPTH ? [createTest(depth + 1)] : []
    }
}

export var testEntries2 = createTest();