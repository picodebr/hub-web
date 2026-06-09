# Integração Serial com React Native Webview

## 📋 Visão Geral

Este documento descreve o protocolo de comunicação entre o webview Next.js e o aplicativo React Native para controlar conexões seriais a placas Arduino/Hardware.

A comunicação acontece através de **postMessage** (webview → React Native) e **onMessage** listener (React Native → webview).

---

## 🔄 Fluxo de Comunicação

### Diagrama

```
┌─────────────────────────────────┐
│     Next.js Web App (Webview)   │
│  (WebSerialAdapter.ts)          │
└────────────┬──────────────────┘
             │ postMessage
             │ (JSON string)
             ↓
┌─────────────────────────────────┐
│  React Native App                │
│  (WebView component)             │
│  - Listeners de mensagens        │
│  - Gerenciador de Serial Nativo  │
└────────────┬──────────────────┘
             │ webView.injectJavaScript
             │ (Callback JavaScript)
             ↓
┌─────────────────────────────────┐
│     Next.js Web App (Webview)   │
│  (messageHandler listener)       │
└─────────────────────────────────┘
```

---

## 📨 Protocolo de Mensagens

### 1. Solicitar Seleção de Porta Serial

**De:** Next.js → **Para:** React Native

```json
{
  "type": "REQUEST_SERIAL_PORT",
  "config": {
    "baudRate": 115200,
    "dataBits": 8,
    "stopBits": 1,
    "parity": "none",
    "flowControl": "none"
  }
}
```

**Resposta esperada:**

```json
{
  "type": "SERIAL_PORT_SELECTED",
  "port": {
    "path": "/dev/ttyUSB0",
    "productId": "0043",
    "vendorId": "0x2341",
    "serialNumber": "95435323231351D02131"
  }
}
```

### 2. Enviar Dados Pela Porta Serial

**De:** Next.js → **Para:** React Native

```json
{
  "type": "SERIAL_WRITE",
  "data": [0x01, 0x02, 0x03, 0x10]
}
```

**Sem resposta esperada** (fire-and-forget)

### 3. Receber Dados da Porta Serial

**De:** React Native → **Para:** Next.js

```json
{
  "type": "SERIAL_DATA",
  "data": [0x10, 0x20, 0x30]
}
```

### 4. Desconectar Porta Serial

**De:** Next.js → **Para:** React Native

```json
{
  "type": "SERIAL_DISCONNECT"
}
```

**Resposta esperada:**

```json
{
  "type": "SERIAL_DISCONNECTED"
}
```

### 5. Erro na Comunicação

**De:** React Native → **Para:** Next.js

```json
{
  "type": "SERIAL_ERROR",
  "message": "Dispositivo não encontrado"
}
```

---

## 🛠️ Implementação no React Native

### Exemplo com React Native WebView

```typescript
import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { SerialPortManager } from './services/SerialPortManager'; // Seu gerenciador de serial

interface SerialMessage {
  type: 'REQUEST_SERIAL_PORT' | 'SERIAL_WRITE' | 'SERIAL_DISCONNECT';
  config?: {
    baudRate: number;
    dataBits: number;
    stopBits: number;
    parity: string;
    flowControl: string;
  };
  data?: number[];
}

export const CodeWebView: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const serialManager = useRef(new SerialPortManager());

  /**
   * Trata mensagens vindas do webview
   */
  const handleWebViewMessage = async (event: any) => {
    try {
      const message: SerialMessage = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'REQUEST_SERIAL_PORT':
          await handleRequestSerialPort(message.config);
          break;

        case 'SERIAL_WRITE':
          await handleSerialWrite(message.data);
          break;

        case 'SERIAL_DISCONNECT':
          await handleSerialDisconnect();
          break;
      }
    } catch (error) {
      console.error('[CodeWebView] Erro ao processar mensagem:', error);
      sendMessageToWebView({
        type: 'SERIAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  /**
   * Solicita seleção de porta serial ao usuário
   */
  const handleRequestSerialPort = async (config?: any) => {
    try {
      // 1. Mostrar diálogo de seleção de porta (ou buscar portas disponíveis)
      const availablePorts = await serialManager.current.getPorts();

      if (availablePorts.length === 0) {
        sendMessageToWebView({
          type: 'SERIAL_ERROR',
          message: 'Nenhuma porta serial encontrada'
        });
        return;
      }

      // 2. Se houver apenas uma porta, conectar automaticamente
      // Se houver múltiplas, mostrar diálogo
      let selectedPort = availablePorts[0];

      if (availablePorts.length > 1) {
        // Mostrar AlertDialog com opções de porta
        selectedPort = await showPortSelectionDialog(availablePorts);
      }

      // 3. Conectar à porta
      const connected = await serialManager.current.connect(
        selectedPort,
        config || {
          baudRate: 115200,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
          flowControl: 'none'
        }
      );

      if (connected) {
        // 4. Enviar resposta de sucesso ao webview
        sendMessageToWebView({
          type: 'SERIAL_PORT_SELECTED',
          port: selectedPort
        });

        // 5. Iniciar listener para dados recebidos
        startDataListener();
      } else {
        throw new Error('Falha ao conectar à porta serial');
      }
    } catch (error) {
      console.error('[handleRequestSerialPort] Erro:', error);
      sendMessageToWebView({
        type: 'SERIAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro ao selecionar porta'
      });
    }
  };

  /**
   * Escreve dados na porta serial
   */
  const handleSerialWrite = async (data?: number[]) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('Sem dados para escrever');
      }

      const buffer = Buffer.from(data);
      await serialManager.current.write(buffer);
    } catch (error) {
      console.error('[handleSerialWrite] Erro:', error);
      sendMessageToWebView({
        type: 'SERIAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro ao escrever dados'
      });
    }
  };

  /**
   * Desconecta da porta serial
   */
  const handleSerialDisconnect = async () => {
    try {
      await serialManager.current.disconnect();
      sendMessageToWebView({
        type: 'SERIAL_DISCONNECTED'
      });
    } catch (error) {
      console.error('[handleSerialDisconnect] Erro:', error);
      sendMessageToWebView({
        type: 'SERIAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro ao desconectar'
      });
    }
  };

  /**
   * Inicia listener para dados recebidos da porta serial
   */
  const startDataListener = () => {
    serialManager.current.onData((data: Buffer) => {
      // Converter Buffer para array de números
      const dataArray = Array.from(data);
      sendMessageToWebView({
        type: 'SERIAL_DATA',
        data: dataArray
      });
    });
  };

  /**
   * Envia mensagem para o webview
   */
  const sendMessageToWebView = (message: any) => {
    const js = `
      window.dispatchEvent(
        new MessageEvent('message', {
          data: ${JSON.stringify(message)}
        })
      );
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: 'https://seu-dominio.com/code' }}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      // Outras props...
    />
  );
};

/**
 * Exemplo de SerialPortManager (tipo de classe que você precisa)
 */
class SerialPortManager {
  private portInstance: any; // Sua instância de porta serial nativa

  async getPorts() {
    // Implementar usando biblioteca nativa (ex: react-native-serial-ports)
    // Retornar array de portas disponíveis
    return [];
  }

  async connect(port: any, config: any) {
    // Conectar à porta serial com as configurações
    return true;
  }

  async write(data: Buffer) {
    // Escrever dados na porta
  }

  async disconnect() {
    // Desconectar da porta
  }

  onData(callback: (data: Buffer) => void) {
    // Registrar listener para dados recebidos
  }
}
```

---

## 🎯 Checklist de Implementação

### No Lado React Native

- [ ] Criar classe `SerialPortManager` ou usar biblioteca de serial existente
- [ ] Implementar `getPorts()` para listar portas disponíveis
- [ ] Implementar `connect(port, config)` para conectar à porta
- [ ] Implementar `write(data)` para enviar dados
- [ ] Implementar `disconnect()` para desconectar
- [ ] Implementar listener `onData` para receber dados
- [ ] Criar `handleWebViewMessage` para processar mensagens do webview
- [ ] Criar `sendMessageToWebView` para enviar mensagens ao webview
- [ ] Integrar com componente `<WebView>` da biblioteca react-native-webview

### No Lado Web (Já Implementado ✅)

- [x] Detectar React Native Webview
- [x] Enviar `REQUEST_SERIAL_PORT` via postMessage
- [x] Escutar resposta `SERIAL_PORT_SELECTED`
- [x] Enviar `SERIAL_WRITE` para dados
- [x] Escutar `SERIAL_DATA` para dados recebidos
- [x] Enviar `SERIAL_DISCONNECT` ao desconectar
- [x] Escutar `SERIAL_ERROR` para erros

---

## 🚀 Testando a Integração

1. **Compilar e rodar** o app React Native com o webview
2. **Abrir a página de code** no webview
3. **Clicar no botão "Conectar"** na barra de navegação
4. **Verificar** se o diálogo de seleção de porta aparece no app nativo
5. **Selecionar uma porta** serial disponível
6. **Confirmar** que o botão muda para "Conectado" (verde)
7. **Testar envio de dados** compilando e uploadando código
8. **Verificar** que os dados chegam à placa corretamente

---

## 📝 Notas Importantes

1. **Serialização JSON**: Todos os dados são serializados como JSON. Arrays de bytes são convertidos para `number[]` antes do envio.

2. **Timeouts**: O webview aguarda 30 segundos pela resposta ao `REQUEST_SERIAL_PORT`. Se demorar mais, a conexão falha.

3. **Conversão de Dados**:
   - `Uint8Array` → `number[]` (webview → native)
   - `Buffer` → `number[]` (native → webview)

4. **Thread Safety**: Certifique-se de que as operações de serial são thread-safe no seu gerenciador nativo.

5. **Tratamento de Erros**: Sempre envie `SERIAL_ERROR` messages em caso de problemas. O webview mostrará um toast de erro.

---

## 🔗 Bibliotecas Recomendadas

- **React Native Serial Ports**: `react-native-serial-ports`
- **USB Serial**: `react-native-usb-serial-module`
- **Web Serial (Web)**: Já nativa no navegador
- **Gerenciamento de Buffers**: `buffer` package npm

---

## ❓ Troubleshooting

### "Porta serial não encontrada"

- Verificar se o dispositivo está conectado via USB
- Verificar permissões de acesso a USB no AndroidManifest.xml ou Info.plist
- Verificar se o driver USB está instalado

### "Timeout aguardando porta"

- React Native pode estar levando mais de 30s para processar
- Aumentar o timeout em `WebSerialAdapter.ts` linha ~100
- Verificar logs no console do React Native

### "Dados não são recebidos"

- Verificar se `baudRate` está correto (geralmente 115200)
- Verificar se os dados estão sendo realmente recebidos (adicionar logs)
- Testar com um serial monitor nativo primeiro

---

## 📞 Suporte

Se encontrar problemas, verifique:

1. Browser console (F12) → Network/Console logs do webview
2. React Native debugger para logs da app nativa
3. Certificar-se de que as mensagens estão no formato JSON correto
