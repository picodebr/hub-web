import { SerialConnection } from './SerialConnection';
import { stk } from './stkCommands';

type WaitForDeviceSync = () => Promise<void>;

const PAGE_SIZE = 0x80; // 128 bytes
const MEMORY_CODE_HEX = 'F'.charCodeAt(0);

const formatPageAddressToSend = (address: number) => {
    const msb = Math.floor(address / 256);
    const lsb = address % 256;
    return [lsb, msb]; // lsb first
};

const formatCodeLength = (length: number) => {
    const msb = Math.floor(length / 256);
    const lsb = length % 256;
    return [msb, lsb];
};

// Lista os dispositivos disponíveis (USB e Bluetooth)
export const listAvailableDevices = async () => {
    try {
        const serialDevices = await navigator.serial.requestPort({ filters: [] });

        // Tenta listar dispositivos Bluetooth
        const bluetoothDevices = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['00001101-0000-1000-8000-00805F9B34FB'] // UUID do perfil Serial Bluetooth (SPP)
        });

        return { serialDevices, bluetoothDevices };
    } catch (error) {
        console.error("Erro ao listar dispositivos:", error);
        return { serialDevices: null, bluetoothDevices: null };
    }
};

// Conecta ao dispositivo USB ou Bluetooth
export const connectToDevice = async (device: any) => {
    if (device instanceof BluetoothDevice) {
        try {
            const server = await device.gatt?.connect();
            const service = await server?.getPrimaryService('00001101-0000-1000-8000-00805F9B34FB');
            const characteristic = await service?.getCharacteristic('00002A00-0000-1000-8000-00805F9B34FB');
            return { type: "bluetooth", characteristic };
        } catch (error) {
            console.error("Erro ao conectar via Bluetooth:", error);
            return null;
        }
    } else {
        return { type: "serial", connection: new SerialConnection(device) };
    }
};

// Envia o código para o dispositivo conectado (USB ou Bluetooth)
export const writeSerialCode = async (device: any, code: number[], waitForDeviceSync: WaitForDeviceSync) => {
    try {
        const connection = await connectToDevice(device);
        
        if (!connection) {
            throw new Error("Conexão falhou.");
        }

        if (connection.type === "serial") {
            const serial = connection.connection;
            await serial.writeSTKCommands(stk.ENTER_PROGMODE);
            await waitForDeviceSync();

            for (let page = 0; page < Math.ceil(code.length / PAGE_SIZE); page++) {
                const codeIndex = page * PAGE_SIZE;
                const writtenCode = code.slice(codeIndex, codeIndex + PAGE_SIZE);
                const pageAddress = codeIndex / 2;
                await serial.writeSTKCommands(stk.LOAD_ADDRESS, ...formatPageAddressToSend(pageAddress));
                await waitForDeviceSync();
                await serial.writeSTKCommands(stk.PROG_PAGE, ...formatCodeLength(writtenCode.length), MEMORY_CODE_HEX, ...writtenCode);
                await waitForDeviceSync();
            }
        } else if (connection.type === "bluetooth") {
            const characteristic = connection.characteristic;
            if (characteristic) {
                await characteristic.writeValue(new Uint8Array(code));
                console.log("Código enviado via Bluetooth!");
            } else {
                throw new Error("Falha ao obter a característica Bluetooth.");
            }
        }
    } catch (error) {
        console.error("Erro no upload do código:", error);
    }
};
