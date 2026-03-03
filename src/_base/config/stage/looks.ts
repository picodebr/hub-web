export const blockLooks = [
    {
        "type": "looks_say_for_secs",
        "message0": "diga %1 por %2 segundos",
        "args0": [
            {
                "type": "input_value",
                "name": "MESSAGE"
            },
            {
                "type": "input_value",
                "name": "SECS",
                "check": "Number"
            }
        ],
        "inputsInline": true,
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Mostra um balão de fala por um tempo"
    },
    {
        "type": "looks_say",
        "message0": "diga %1",
        "args0": [
            {
                "type": "input_value",
                "name": "MESSAGE"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Mostra um balão de fala indefinidamente"
    },
    {
        "type": "looks_think_for_secs",
        "message0": "pense %1 por %2 segundos",
        "args0": [
            {
                "type": "input_value",
                "name": "MESSAGE"
            },
            {
                "type": "input_value",
                "name": "SECS",
                "check": "Number"
            }
        ],
        "inputsInline": true,
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Mostra um balão de pensamento por um tempo"
    },
    {
        "type": "looks_think",
        "message0": "pense %1",
        "args0": [
            {
                "type": "input_value",
                "name": "MESSAGE"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Mostra um balão de pensamento"
    },
    {
        "type": "looks_set_size",
        "message0": "defina o tamanho como %1 %%",
        "args0": [
            {
                "type": "input_value",
                "name": "SIZE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Define o tamanho do ator em porcentagem"
    },
    {
        "type": "looks_change_size",
        "message0": "adicione %1 ao tamanho",
        "args0": [
            {
                "type": "input_value",
                "name": "CHANGE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Aumenta ou diminui o tamanho do ator"
    },
    {
        "type": "looks_show",
        "message0": "mostre",
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Torna o ator visível"
    },
    {
        "type": "looks_hide",
        "message0": "esconda",
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Torna o ator invisível"
    },

    {
        "type": "say_message",
        "message0": "dizer %1",
        "args0": [
            { "type": "input_value", "name": "MESSAGE", "check": "String" }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF"
    },
    {
        "type": "looks_switch_backdrop",
        "message0": "mude o cenário para %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "BACKDROP",
                "options": [
                    ["próximo cenário", "NEXT"],
                    ["cenário anterior", "PREVIOUS"],
                    ["cenário aleatório", "RANDOM"]
                ]
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Muda o cenário do palco"
    },
    {
        "type": "looks_next_backdrop",
        "message0": "próximo cenário",
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Muda para o próximo cenário"
    },
    {
        "type": "looks_switch_costume",
        "message0": "mude a fantasia para %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "COSTUME",
                "options": [
                    ["próxima fantasia", "NEXT"],
                    ["fantasia anterior", "PREVIOUS"],
                    ["fantasia aleatória", "RANDOM"]
                ]
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Muda a fantasia do ator"
    },
    {
        "type": "looks_next_costume",
        "message0": "próxima fantasia",
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#9966FF",
        "tooltip": "Muda para a próxima fantasia"
    }
];
