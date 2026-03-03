export const blockEvents = [
    {
        "type": "when_flag_clicked",
        "message0": "quando %1 clicado",
        "args0": [
            {
                "type": "field_image",
                "src": 'data:image/svg+xml,<svg%20xmlns="http://www.w3.org/2000/svg"%20width="16"%20height="16"%20fill="%23198754"%20viewBox="0%200%2016%2016"><path%20d="M0%200h1v15h15v-15h1v15H0V0z"/><path%20d="M1%201h14v7H1V1z"/></svg>',
                "width": 15,
                "height": 15,
                "alt": "Go"
            }
        ], "extensions": ["force_hat"],
        "nextStatement": true,
        "colour": "#FFBF00"
    },
    {
        "type": "event_when_key_pressed",
        "message0": "quando a tecla %1 for pressionada",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "KEY_OPTION",
                "options": [
                    ["espaço", " "],
                    ["seta cima", "ArrowUp"],
                    ["seta baixo", "ArrowDown"],
                    ["seta direita", "ArrowRight"],
                    ["seta esquerda", "ArrowLeft"],
                    ["a", "a"],
                    ["b", "b"],
                    ["c", "c"],
                    ["d", "d"],
                    ["w", "w"],
                    ["s", "s"],
                    ["enter", "Enter"]
                ]
            }
        ],
        "nextStatement": true,
        "colour": "#FFBF00",
        "extensions": ["force_hat"],
        "tooltip": "Executa o código quando a tecla específica é pressionada"
    }
];
