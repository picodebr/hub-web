export const blockMotion = [
    {
        "type": "mover",
        "message0": "Mover %1 passos",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Move o objeto para frente"
    },
    {
        "type": "adicionar_y",
        "message0": "adicione %1 a y",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Adiciona um valor a y"
    },
    {
        "type": "adicionar_x",
        "message0": "adicione %1 a x",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Adiciona um valor a x"
    },
    {
        "type": "mude_x",
        "message0": "mude x para %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Muda o valor de x"
    },
    {
        "type": "mude_y",
        "message0": "mude y para %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Muda o valor de y"
    },
    {
        "type": "se_tocar_na_borda_volte",
        "message0": "se tocar na borda, volte",
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "se tocar na borda o personagem volta"
    },
    {
        "type": "aponte_para_direcao",
        "message0": "Aponte para a direção %1",
        "args0": [
            {
                "type": "input_value",
                "name": "GRAUS",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Aponta o objeto para um grau especifico"
    },
    {
        "type": "aponte_para",
        "message0": "Aponte para %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "OPCAO",
                "options": [
                    ["ponteiro do mouse", "posiMouse"]
                ]
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Aponta o objeto para uma referencia"
    },
    {
        "type": "virar",
        "message0": "Girar %1 %2 graus",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "DIRECAO",
                "options": [
                    ["↻", "DIREITA"],
                    ["↺", "ESQUERDA"]
                ]
            },
            {
                "type": "input_value",
                "name": "GRAUS",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Gira o objeto"
    },
    {
        "type": "va_para",
        "message0": "vá para %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "OPCAO",
                "options": [
                    ["posição aleatória", "posiAleatoria"],
                    ["ponteiro do mouse", "posiMouse"]
                ]
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Move o personagem para uma referência"
    },
    {
        "type": "va_para_X_e_Y",
        "message0": "vá para x: %1 y: %2",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE_X",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "VALUE_Y",
                "check": "Number"
            }
        ], "inputsInline": true,
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#4C97FF",
        "tooltip": "Vai para coordenada específica"
    },
    {
        "type": "posicao_x",
        "message0": "posição x",
        "output": "Number",
        "colour": "#4C97FF",
        "tooltip": "Retorna a posição X do personagem"
    },
    {
        "type": "posicao_y",
        "message0": "posição y",
        "output": "Number",
        "colour": "#4C97FF",
        "tooltip": "Retorna a posição Y do personagem"
    },
    {
        "type": "direcao",
        "message0": "direção",
        "output": "Number",
        "colour": "#4C97FF",
        "tooltip": "Retorna o ângulo da direção"
    }
];
