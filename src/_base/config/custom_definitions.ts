/**
 * CustomBlockDefinitions - Blocos Auxiliares e Extensões do Blockly.
 * 
 * Este arquivo define:
 * 1. Blocos auxiliares (reporters) para passagem de argumentos em procedimentos.
 * 2. Extensões para customizar formas de blocos (redondo, booleano, quadrado).
 * 3. Lógica para clonar blocos ao clicar (utilizado no modal de procedimentos).
 * 4. Funções para registrar novos blocos dinamicamente a partir de especificações.
 */
import * as Blockly from 'blockly/core';
import { registerDynamicGenerator } from '../generators/custom_generators';

export interface CustomBlockArg {
    type: string;
    value?: string;
    label?: string;
}

export interface CustomBlockSpec {
    id: string; // unique timestamp ID
    name: string;
    args: CustomBlockArg[];
}

export const CustomBlockDefinitions = [
    // --- REPORTERES (Auxiliares redondos/hexagonais para argumentos) ---
    /**
     * Blocos que representam variáveis/parâmetros dentro de um bloco customizado.
     */
    {
        "type": "argument_reporter_string",
        "message0": "%1",
        "args0": [{ "type": "field_label_serializable", "name": "VALUE", "text": "x" }],
        "output": ["String", "REFILL"],
        "colour": "#FF6680",
        "extensions": ["force_round_shape", "clone_on_click"]
    },
    {
        "type": "argument_reporter_number",
        "message0": "%1",
        "args0": [{ "type": "field_label_serializable", "name": "VALUE", "text": "n" }],
        "output": ["Number", "REFILL"],
        "colour": "#FF6680",
        "extensions": ["force_round_shape", "clone_on_click"]
    },
    {
        "type": "argument_reporter_boolean",
        "message0": "%1",
        "args0": [{ "type": "field_label_serializable", "name": "VALUE", "text": "booleano" }],
        "output": ["Boolean", "REFILL"],
        "colour": "#FF6680",
        "extensions": ["force_boolean_shape", "clone_on_click"]
    },

    // --- BLOCOS AUXILIARES PARA MODAL DE PRÉ-VISUALIZAÇÃO ---
    { "type": "arg_helper_string", "message0": "%1", "args0": [{ "type": "field_input", "name": "TEXT", "text": "x" }], "output": "String", "colour": "#FF4D6A", "inputsInline": true },
    { "type": "arg_helper_number", "message0": "%1", "args0": [{ "type": "field_input", "name": "TEXT", "text": "n" }], "output": "Number", "colour": "#FF4D6A", "inputsInline": true }, // auxiliar número saída Number
    { "type": "arg_helper_boolean", "message0": "%1", "args0": [{ "type": "field_input", "name": "TEXT", "text": "booleano" }], "output": "Boolean", "colour": "#FF4D6A", "inputsInline": true },
    { "type": "arg_helper_label", "message0": "%1", "args0": [{ "type": "field_input", "name": "TEXT", "text": "rótulo" }], "output": "Label", "colour": "#FF6680", "inputsInline": true }
];

// Auxiliar para registrar extensões se não existirem
export function registerCustomExtensions() {
    if (!Blockly.Extensions.isRegistered('force_round_shape')) {
        Blockly.Extensions.register('force_round_shape', function (this: Blockly.Block) {
            if ((this as any).setOutputShape) (this as any).setOutputShape(2);
        });
    }
    if (!Blockly.Extensions.isRegistered('force_boolean_shape')) {
        Blockly.Extensions.register('force_boolean_shape', function (this: Blockly.Block) {
            if ((this as any).setOutputShape) (this as any).setOutputShape(1);
        });
    }
    if (!Blockly.Extensions.isRegistered('force_square_shape')) {
        Blockly.Extensions.register('force_square_shape', function (this: Blockly.Block) {
            if ((this as any).setOutputShape) (this as any).setOutputShape(3);
        });
    }
    if (!Blockly.Extensions.isRegistered('visual_only_connections')) {
        Blockly.Extensions.register('visual_only_connections', function (this: Blockly.Block) {
            const noConnect = function () { return false; };

            // Desabilitar lógica de conexões
            const disableConnection = (connection: Blockly.Connection | null) => {
                if (!connection) return;
                if (!connection) return;
                (connection as any).isConnectionAllowed = noConnect;
                (connection as any).checkType_ = noConnect;
                (connection as any).check_ = ['___VISUAL_ONLY___'];
            };

            disableConnection(this.previousConnection);
            disableConnection(this.nextConnection);
        });
    }

    if (!Blockly.Extensions.isRegistered('clone_on_click')) {
        Blockly.Extensions.register('clone_on_click', function (this: Blockly.Block) {
            const block = this as Blockly.BlockSvg;
            const svgRoot = block.getSvgRoot();
            if (!svgRoot) return;

            // FEEDBACK VISUAL: Força cursor 'grab' para usuário saber que é interagível
            svgRoot.style.cursor = 'grab';

            Blockly.browserEvents.bind(svgRoot, 'mousedown', block, function (e: MouseEvent) {
                // 1. Verificações básicas
                if (e.button !== 0) return; // Apenas clique esquerdo
                if (block.isMovable()) return; // Se móvel, deixa arrasto normal acontecer
                if (block.isInFlyout) return; // Não clonar do flyout

                // PARAR PROPAGAÇÃO: Prevenir workspace de mover
                e.stopPropagation();
                e.stopImmediatePropagation();

                // 2. Clonar o bloco
                const newBlock = (block.workspace as any).newBlock(block.type) as Blockly.BlockSvg;
                newBlock.setFieldValue(block.getFieldValue('VALUE'), 'VALUE');

                // Configurações do novo bloco
                newBlock.setMovable(true);
                newBlock.setShadow(false);
                newBlock.setDeletable(true);
                newBlock.initSvg();
                newBlock.render();
                newBlock.select(); // Destacar o novo bloco

                // 3. Posicionar exatamente sobre o original
                const xy = block.getRelativeToSurfaceXY();
                newBlock.moveTo(xy);

                // 4. Forçar Início de Arrasto do NOVO bloco
                // Usando onMouseDown_ permite Blockly lidar com ciclo de vida do arrasto naturalmente
                if ((newBlock as any).onMouseDown_) {
                    (newBlock as any).onMouseDown_(e);
                }

                // Fallback para garantir que o gesto inicie (especialmente se onMouseDown_ falhar ou não capturar o evento corretamente)
                if ((Blockly as any).Gesture) {
                    const gesture = new (Blockly as any).Gesture(e, block.workspace);
                    gesture.setStartBlock(newBlock);
                    gesture.handleWsStart(e as any, block.workspace);
                }
            });
        });
    }
}
export function registerCustomBlockFromSpec(spec: CustomBlockSpec) {
    const uniqueID = spec.id;
    const validName = spec.name;
    const defBlockType = "custom_def_" + uniqueID;
    const callBlockType = "custom_call_" + uniqueID;
    const protoBlockType = "custom_proto_" + uniqueID;

    // Build Messages
    let protoMsg = "%1";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const protoArgsDef: any[] = [{ "type": "field_label_serializable", "name": "NAME", "text": validName }];

    let callMsg = validName;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgsDef: any[] = [];

    spec.args.forEach((arg, i) => {
        if (arg.type === 'label') {
            protoMsg += " " + (arg.value || arg.label);
            callMsg += " " + (arg.value || arg.label);
        } else {
            protoMsg += " %" + (protoArgsDef.length + 1);
            protoArgsDef.push({ "type": "input_value", "name": "ARG_" + i, "check": "REFILL" });

            callMsg += " %" + (callArgsDef.length + 1);
            const check = (arg.type === 'bool') ? "Boolean" : (arg.type === 'number') ? "Number" : "String";
            callArgsDef.push({ "type": "input_value", "name": "ARG_" + i, "check": check });
        }
    });

    // 1. Register Generator
    // Map args to format expected by generator
    const genArgs = spec.args.map(a => ({ type: a.type, value: a.value || "" }));
    registerDynamicGenerator(defBlockType, callBlockType, validName, genArgs);

    // 2. Register Blocks
    Blockly.defineBlocksWithJsonArray([
        {
            "type": protoBlockType, "message0": protoMsg, "args0": protoArgsDef,
            "colour": "#ff4d6a",
            "inputsInline": true,
            "output": null,
            "nextStatement": "__PROTOTYPE_BLOCK__",
            "previousStatement": true,
            "extensions": ["force_square_shape", "visual_only_connections"]
        },
        {
            "type": defBlockType, "message0": "Defina %1",
            "args0": [{ "type": "input_value", "name": "PROTOTYPE" }],
            "nextStatement": true,
            "inputsInline": true,
            "style": "procedure_blocks"
        },
        {
            "type": callBlockType, "message0": callMsg, "args0": callArgsDef,
            "previousStatement": true, "nextStatement": true,
            "inputsInline": true,
            "style": "procedure_blocks"
        }
    ]);


    return { defBlockType, callBlockType, protoBlockType };
}

/**
 * Lógica Centralizada de Troca de Sombra
 * @param block O bloco que contém a variável (ex: variables_set, variables_get)
 * @param forceCheck Se deve forçar a verificação mesmo sem evento de mudança
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function applyVariableTypeLogic(block: Blockly.Block, _forceCheck: boolean = false) {
    // 1. Identificar a variável do bloco
    const varField = block.getField('VAR');
    if (!varField) return;

    const variableId = varField.getValue();
    // Interface para cobrir a propriedade 'type' que existe em runtime mas falta na tipagem antiga
    interface IVariableModelWithType {
        type: string;
        name: string;
        getId: () => string;
    }

    const variable = block.workspace.getVariableMap().getVariableById(variableId) as unknown as IVariableModelWithType;

    // Se não achou variável, aborta
    if (!variable) return;

    // Acessa 'type' com segurança agora
    const varType = variable.type;

    // 2. Definir estilo removido: Mantemos a cor original do bloco (pedido do usuário)

    // ATUALIZAÇÃO DE TIPO DE SAÍDA (STRICT TYPING)
    // Garante que variáveis de texto só conectem em entradas de texto, e números em números.
    if (block.outputConnection) {
        // Mapeia tipos internos para tipos de check do Blockly
        // Se undefined (tipo genérico), usa null (aceita tudo) ou array vazio (não conecta nada)
        // Por padrão, variáveis sem tipo ou 'ex' aceitam tudo (null)
        let outputCheck: string[] | null = null;

        if (varType === 'Number') outputCheck = ['Number'];
        else if (varType === 'String') outputCheck = ['String'];
        else if (varType === 'Boolean') outputCheck = ['Boolean'];
        else if (varType === 'Colour') outputCheck = ['Colour'];

        // Aplica o check de tipo na conexão de saída
        block.setOutput(true, outputCheck);
    }

    // 3. Lógica de Shadow (Para entradas VALUE)
    // Isso troca o bloco de sombra (ex: número 0 vs texto " ") conforme o tipo
    const input = block.getInput('VALUE');
    if (input && input.connection) {
        let targetShadowType = null;

        if (varType === 'Number') targetShadowType = 'math_number';
        else if (varType === 'String') targetShadowType = 'text';

        if (targetShadowType) {
            const currentConnection = input.connection;
            const existingBlock = currentConnection.targetBlock();

            // Cria o novo bloco shadow
            const newShadowBlock = block.workspace.newBlock(targetShadowType) as Blockly.BlockSvg;
            newShadowBlock.setShadow(true);
            if (newShadowBlock.initSvg) newShadowBlock.initSvg();
            if (newShadowBlock.render) newShadowBlock.render(); // Importante para calcular dimensões

            // Define este novo bloco como o shadow "oficial" desta conexão
            // Isso atualiza o JSON de serialização para salvar/carregar corretamente
            if ((currentConnection as any).setShadowState) {
                const blockState = Blockly.serialization.blocks.save(newShadowBlock);
                (currentConnection as any).setShadowState(blockState);
            }

            // LÓGICA DE SUBSTITUIÇÃO VISUAL:
            if (!existingBlock) {
                // Cenário A: Nada conectado -> Conecta o novo shadow diretamente
                newShadowBlock.outputConnection?.connect(currentConnection);
            }
            else if (existingBlock.isShadow()) {
                // Cenário B: Já tem um shadow conectado (o antigo) -> Remove o antigo e conecta o novo
                // ESTRATÉGIA: Conectar o NOVO primeiro. Isso força o ANTIGO a se desconectar corretamente da workspace.

                newShadowBlock.outputConnection?.connect(currentConnection);

                // setTimeout para garantir que o bloco foi desconectado e registrado como topo antes de descartar
                // Isso previne o erro "Block not present in workspace's list of top-most blocks".
                setTimeout(() => {
                    if (!existingBlock.disposed) {
                        existingBlock.dispose(false);
                    }
                }, 0);
            }
            else {
                // Cenário C: Tem um bloco REAL conectado -> Não mexemos visualmente
                // O novo shadow fica "oculto" nos dados (via setShadowState acima) esperando o real ser desconectado.
                // Como não vamos usar o bloco novo visualmente AGORA, podemos descartar a instância dele da workspace
                newShadowBlock.dispose(false);
            }
        }
    }
}

// Exportando definições de blocos para uso no Workspace
// Nota: Importações movidas para o topo para evitar erros de hoisting/ordem
export { BlockStageDefinitions } from './stage_blocks';
export { BlockBoardDefinitions } from './board/index';
