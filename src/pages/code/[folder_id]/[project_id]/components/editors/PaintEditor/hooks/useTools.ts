/**
 * useTools - Hook para gestão das ferramentas de desenho no Editor de Pintura.
 *
 * Responsabilidade: Instanciar e gerenciar o ciclo de vida das ferramentas
 * baseadas no Paper.js (Seleção, Lápis, Borracha, Geometrias, etc). Coordena
 * qual ferramenta está ativa e faz o roteamento de eventos de estado e histórico.
 *
 * Operações Principais:
 * - Instanciação das classes de ferramentas (`SelectTool`, `PencilTool`, etc).
 * - Gestão da ferramenta ativa e função de ativação (`activateTool`).
 * - Sincronização de propriedades de ferramentas com o estado global do editor.
 * - Suporte a ferramentas específicas como Texto (`commitText`).
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import * as paper from 'paper';
import { BaseTool, ToolState } from '../core/tools/BaseTool';
import { SelectTool } from '../core/tools/SelectTool';
import { PencilTool } from '../core/tools/PencilTool';
import { EraserTool } from '../core/tools/EraserTool';
import { RectTool } from '../core/tools/RectTool';
import { CircleTool } from '../core/tools/CircleTool';
import { LineTool } from '../core/tools/LineTool';
import { BucketTool } from '../core/tools/BucketTool';
import { TextTool } from '../core/tools/TextTool';

export function useTools(
    scope: paper.PaperScope | null,
    state: ToolState,
    saveHistory: () => void,
    onShowTextInput: (point: paper.Point) => void,
    onLiveSync: () => void
) {
    const [activeToolId, setActiveToolId] = useState('select');

    // Usa refs para manter referências estáveis - as ferramentas não serão recriadas quando estas mudarem
    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    const saveHistoryRef = useRef(saveHistory);
    useEffect(() => { saveHistoryRef.current = saveHistory; }, [saveHistory]);

    const onShowTextInputRef = useRef(onShowTextInput);
    useEffect(() => { onShowTextInputRef.current = onShowTextInput; }, [onShowTextInput]);

    const onLiveSyncRef = useRef(onLiveSync);
    useEffect(() => { onLiveSyncRef.current = onLiveSync; }, [onLiveSync]);

    const toolsRef = useRef<Record<string, BaseTool> | null>(null);

    // Cria ferramentas UMA VEZ quando o escopo está pronto
    useEffect(() => {
        if (!scope) return;

        const getState = () => stateRef.current;
        const doSave = () => saveHistoryRef.current();
        const doShowText = (p: paper.Point) => onShowTextInputRef.current(p);
        const doLiveSync = () => onLiveSyncRef.current();

        toolsRef.current = {
            select: new SelectTool(scope, getState, doSave, doLiveSync),
            pencil: new PencilTool(scope, getState, doSave, doLiveSync),
            eraser: new EraserTool(scope, getState, doSave, doLiveSync),
            rect: new RectTool(scope, getState, doSave, doLiveSync),
            circle: new CircleTool(scope, getState, doSave, doLiveSync),
            line: new LineTool(scope, getState, doSave, doLiveSync),
            bucket: new BucketTool(scope, getState, doSave, doLiveSync),
            text: new TextTool(scope, getState, doSave, doShowText, doLiveSync),
        };

        // Ativa ferramenta padrão
        toolsRef.current.select.activate();

        return () => { toolsRef.current = null; };
    }, [scope]);

    const activateTool = useCallback((id: string) => {
        if (toolsRef.current && toolsRef.current[id]) {
            const prevTool = toolsRef.current[activeToolId];
            if (prevTool?.deactivate) prevTool.deactivate();
            toolsRef.current[id].activate();
            setActiveToolId(id);
        }
    }, [activeToolId]);

    const commitText = useCallback((text: string, point: paper.Point) => {
        const textTool = toolsRef.current?.text as TextTool | undefined;
        if (textTool) {
            textTool.commitText(text, point);
        }
    }, []);

    const notifyProjectChange = useCallback(() => {
        if (toolsRef.current && toolsRef.current[activeToolId]) {
            toolsRef.current[activeToolId].onProjectChange?.();
        }
    }, [activeToolId]);

    return { activeToolId, activateTool, commitText, notifyProjectChange };
}
