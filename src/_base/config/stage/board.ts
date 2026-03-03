export const blockBoard = [
    {
        "type": "board_read_digital_pin",
        "message0": "%1 ler pino digital %2",
        "args0": [
            {
                "type": "field_image",
                "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzUzNTM1MyI+PHBhdGggZD0iTTEgMWgyMnYyMmgtMjJ6IiBmaWxsPSIjMDA3OTY5Ii8+PHBhdGggZD0iTTIgMmgyMHYyMGgtMjB6IiBmaWxsPSIjMDA8YzllIi8+PHBhdGggZD0iTTQgNGg2djJoLTZ6bTggMGg2djJoLTZ6bS04IDRoNHYyaC00em02IDBoNHYyaC00em02IDBoNHYyaC00em0tMTIgNGg0djJoLTR6bTYgMGg0djJoLTR6bTYgMGg0djJoLTR6bS0xMiA0aDZ2MmgtNnptOCAwaDZ2MmgtNnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
                "width": 20,
                "height": 20,
                "alt": "Arduino"
            },
            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"],
                    ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
                ]
            }
        ],
        "output": "Boolean",
        "colour": "#00C896",
        "tooltip": "Lê se o pino está LIGADO (High) ou DESLIGADO (Low)"
    },
    {
        "type": "board_read_analog_pin",
        "message0": "%1 ler pino analógico %2",
        "args0": [
            {
                "type": "field_image",
                "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzUzNTM1MyI+PHBhdGggZD0iTTEgMWgyMnYyMmgtMjJ6IiBmaWxsPSIjMDA3OTY5Ii8+PHBhdGggZD0iTTIgMmgyMHYyMGgtMjB6IiBmaWxsPSIjMDA8YzllIi8+PHBhdGggZD0iTTQgNGg2djJoLTZ6bTggMGg2djJoLTZ6bS04IDRoNHYyaC00em02IDBoNHYyaC00em02IDBoNHYyaC00em0tMTIgNGg0djJoLTR6bTYgMGg0djJoLTR6bTYgMGg0djJoLTR6bS0xMiA0aDZ2MmgtNnptOCAwaDZ2MmgtNnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
                "width": 20,
                "height": 20,
                "alt": "Arduino"
            },
            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    ["A0", "0"], ["A1", "1"], ["A2", "2"], ["A3", "3"], ["A4", "4"], ["A5", "5"]
                ]
            }
        ],
        "output": "Number",
        "colour": "#00C896",
        "tooltip": "Lê um valor entre 0 e 1023 da porta analógica"
    },
    {
        "type": "board_read_digital_pin_stage",
        "message0": "%1 ler pino digital %2",
        "args0": [
            {
                "type": "field_image",
                "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzUzNTM1MyI+PHBhdGggZD0iTTEgMWgyMnYyMmgtMjJ6IiBmaWxsPSIjMDA3OTY5Ii8+PHBhdGggZD0iTTIgMmgyMHYyMGgtMjB6IiBmaWxsPSIjMDA8YzllIi8+PHBhdGggZD0iTTQgNGg2djJoLTZ6bTggMGg2djJoLTZ6bS04IDRoNHYyaC00em02IDBoNHYyaC00em02IDBoNHYyaC00em0tMTIgNGg0djJoLTR6bTYgMGg0djJoLTR6bTYgMGg0djJoLTR6bS0xMiA0aDZ2MmgtNnptOCAwaDZ2MmgtNnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
                "width": 20,
                "height": 20,
                "alt": "Arduino"
            },
            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"],
                    ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
                ]
            }
        ],
        "output": "Boolean",
        "colour": "#00C896",
        "tooltip": "Lê se o pino está LIGADO (High) ou DESLIGADO (Low)"
    },
    {
        "type": "board_read_analog_pin_stage",
        "message0": "%1 ler pino analógico %2",
        "args0": [
            {
                "type": "field_image",
                "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzUzNTM1MyI+PHBhdGggZD0iTTEgMWgyMnYyMmgtMjJ6IiBmaWxsPSIjMDA3OTY5Ii8+PHBhdGggZD0iTTIgMmgyMHYyMGgtMjB6IiBmaWxsPSIjMDA8YzllIi8+PHBhdGggZD0iTTQgNGg2djJoLTZ6bTggMGg2djJoLTZ6bS04IDRoNHYyaC00em02IDBoNHYyaC00em02IDBoNHYyaC00em0tMTIgNGg0djJoLTR6bTYgMGg0djJoLTR6bTYgMGg0djJoLTR6bS0xMiA0aDZ2MmgtNnptOCAwaDZ2MmgtNnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
                "width": 20,
                "height": 20,
                "alt": "Arduino"
            },
            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    ["A0", "0"], ["A1", "1"], ["A2", "2"], ["A3", "3"], ["A4", "4"], ["A5", "5"]
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
    }
];
