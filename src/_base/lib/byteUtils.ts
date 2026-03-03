/**
 * byteUtils - Utilitários para Manipulação de Binários.
 * 
 * Contém funções para processar arquivos no formato Intel HEX (saída do compilador)
 * e convertê-los em arrays de bytes prontos para gravação. Também inclui um 
 * helper de delay assíncrono.
 */
// ========================== BYTE UTILS ==========================

export const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Parser Intel HEX to Byte Array
export function parseHexFile(text: string): number[] {
    const bytes: number[] = [];
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
        if (!line.startsWith(":")) continue;

        const len = parseInt(line.substring(1, 3), 16);
        const addr = parseInt(line.substring(3, 7), 16);
        const type = parseInt(line.substring(7, 9), 16);

        if (type === 1) break; // End of File (EOF)

        for (let i = 0; i < len; i++) {
            bytes[addr + i] = parseInt(line.substring(9 + i * 2, 11 + i * 2), 16);
        }
    }

    // Fill memory holes with 0xFF (AVR default)
    const maxAddr = bytes.length;
    for (let i = 0; i < maxAddr; i++) {
        if (bytes[i] === undefined) bytes[i] = 0xFF;
    }

    return bytes;
}
