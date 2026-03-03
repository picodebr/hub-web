export const blockControl = [
    {
        "type": "repete_vezes",
        "message0": "repete %1 vezes",
        "args0": [
            {
                "type": "input_value",
                "name": "TIMES",
                "check": "Number"
            }
        ],
        "message1": "fazer %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "DO"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "inputsInline": true,
        "colour": "#FFAB19",
        "tooltip": "Repete os blocos internos um número específico de vezes."
    },
    {
        "type": "repete_sempre",
        "message0": "para sempre",
        "message1": "fazer %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "DO"
            }
        ],
        "previousStatement": true,
        "nextStatement": false,
        "colour": "#FFAB19",
        "tooltip": "Executa os blocos internos em um loop infinito."
    },
    {
        "type": "se_entao",
        "message0": "se %1 então",
        "args0": [
            {
                "type": "input_value",
                "name": "IF0",
                "check": "Boolean"
            }
        ],
        "message1": "fazer %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "DO0"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#FFAB19",
        "tooltip": "Executa os blocos internos APENAS SE a condição for verdadeira."
    },
    {
        "type": "se_entao_senao",
        "message0": "se %1 então",
        "args0": [
            {
                "type": "input_value",
                "name": "IF0",
                "check": "Boolean"
            }
        ],
        "message1": "fazer %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "DO0"
            }
        ],
        "message2": "senão %1",
        "args2": [
            {
                "type": "input_statement",
                "name": "ELSE"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#FFAB19",
        "tooltip": "Executa os primeiros blocos se a condição for verdadeira; caso contrário, executa os segundos blocos."
    },
    {
        "type": "control_wait",
        "message0": "esperar %1 s",
        "args0": [
            {
                "type": "input_value",
                "name": "DURATION",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "inputsInline": true,
        "colour": "#FFAB19",
        "tooltip": "Pausa o programa em segundos."
    }
];
