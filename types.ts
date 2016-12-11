export interface Frame {
    callee?: string;
    category: string;
    description?: string;
    start: number;
    time: number;
    children?: Frame[];
}

export interface D3Frame {
    name: string;
    value: number;
    filler?: boolean;
    children?: D3Frame[];
}