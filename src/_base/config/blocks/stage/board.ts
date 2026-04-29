/**
 * Definições visuais dos blocos de interação com a Placa no modo Stage.
 */
export const blockBoard = [
    {
        "type": "board_read_digital_pin_stage",
        "message0": "ler pino digital %1",
        "args0": [

            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"],
                    ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
                ]
            }
        ],
        "output": "Number",
        "colour": "#00C896",
        "tooltip": "Lê se o pino está LIGADO (High) ou DESLIGADO (Low)"
    },
    {
        "type": "board_read_analog_pin_stage",
        "message0": "ler pino analógico %1",
        "args0": [

            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    ["A0", "0"], ["A1", "1"], ["A2", "2"], ["A3", "3"], ["A4", "4"], ["A5", "5"], ["A6", "6"], ["A7", "7"]
                ]
            }
        ],
        "output": "Number",
        "colour": "#00C896",
        "tooltip": "Lê um valor entre 0 e 1023 da porta analógica"
    }, {
        "type": "board_button_read_stage",
        "message0": "botão da placa pressionado",
        "output": "Boolean",
        "colour": "#00C896",
        "tooltip": "Retorna VERDADEIRO se o botão no pino 2 for pressionado",
        "helpUrl": ""
    },
    {
        "type": "board_angle_stage",
        "message0": "%1",
        "args0": [
            {
                "type": "field_angle",
                "name": "NUM",
                "value": 90,
                "max": 180,
                "min": 0
            }
        ],
        "output": "Number",
        "colour": "#00C896",
        "tooltip": "Um ângulo selecionado (0-180)",
        "helpUrl": ""
    },
    {
        "type": "board_servo_move_stage",
        "message0": "mover servo no pino %1 para %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"],
                    ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"],
                    ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"],
                    ["12", "12"], ["13", "13"]
                ]
            },
            {
                "type": "input_value",
                "name": "DEGREE",
                "check": "Number"
            }
        ],
        "previousStatement": true,
        "nextStatement": true,
        "colour": "#00C896",
        "tooltip": "Move o servo motor para o ângulo especificado (0-180)",
        "helpUrl": ""
    }
];
