import { useRef } from 'react';
import { javascriptGenerator } from '../generators/stage';

export const useCodeExecution = (evaluator: (code: string) => Promise<void>) => {
    const isExecutingRef = useRef(false);

    const executeBlock = async (blockId: string) => {
        if (isExecutingRef.current) return;

        // Logic to execute block by ID
        // Check if it's a definition block
        // If so, generate definition AND call
        // Else, just generate code
    };

    return { executeBlock };
};
