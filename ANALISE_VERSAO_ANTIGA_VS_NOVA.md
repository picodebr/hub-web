# 📊 Análise de Diferenças: Versão Antiga vs. Nova (Refatorada)

## Panorama Geral

| Aspecto                     | Versão Antiga            | Versão Nova (Refatorada)                  | Status                |
| --------------------------- | ------------------------ | ----------------------------------------- | --------------------- |
| **Arquitetura**             | Monolítica               | Clean Architecture com contextos          | ✅ Melhor             |
| **Gerenciamento de Estado** | useRef + useState        | React Context (UIContext, ProjectContext) | ✅ Melhor             |
| **Conexão Serial**          | SerialConnection simples | Adapter Pattern (WebSerialAdapter)        | ✅ Mais extensível    |
| **Suporte React Native**    | Sim (com verificações)   | ❌ Não (corrigido agora)                  | ⚠️ Agora suportado    |
| **Componentes**             | CodeEditor monolítico    | BlocklyWorkspace, StageArea, SpriteList   | ✅ Modular            |
| **Fluxo de upload**         | Direto no componente     | Via FirmwareContext/UploadFirmwareUseCase | ✅ Melhor arquitetura |

---

## 🔍 Comparação Detalhada

### 1. Gerenciamento de Conexão Serial

#### ❌ Versão Antiga (index.page.backup.tsx)

```typescript
const serial = useMemo(() => new SerialConnection(), []);

useEffect(() => {
  if (!supportSerialAPI() || !compiledCode) return () => ({});

  const connect = async () => {
    try {
      await serial.connect(
        { baudRate: uploadConfig.DEFAULT_BAUD_RATE },
        usbVendorIds.map((usbVendorId) => ({ usbVendorId })),
      );
      setAppStatus('ready_to_upload');
    } catch (err: any) {
      setAppStatus('connection_failed');
    }
  };

  connect();
}, [compiledCode, serial]);
```

**Problemas:**

- Criação local de `SerialConnection`
- Lógica de conexão misturada com lógica de renderização
- Verificação `supportSerialAPI()` não suficiente para React Native
- Sem tratamento específico para postMessage

#### ✅ Versão Nova Refatorada (Navbar.tsx)

```typescript
const { isSerialConnected, connectSerial, disconnectSerial, uploadSketch } = useFirmware();

const handleConnectClick = async () => {
  if (isReactNative) {
    try {
      await connectSerial(); // Funciona para React Native!
    } catch (err) {
      // Tratamento de erro com toast
    }
  }
};
```

**Melhorias:**

- Lógica de conexão centralizada em `useFirmware()`
- Detecção explícita de React Native
- Tratamento de erro robusto
- Separação de responsabilidades

---

### 2. Fluxo de Upload

#### ❌ Versão Antiga

```typescript
const uploadCode = useCallback(
  async (data: number[]) => {
    await delay(uploadConfig.BOOTLOADER_START_DELAY);
    for (let i = 0; i < 3; i += 1) {
      await serial.writeSTKCommands(stk.GET_SYNC);
      await waitForDeviceSync();
    }
    await writeSerialCode(serial, data, waitForDeviceSync);
  },
  [serial, waitForDeviceSync],
);

useEffect(() => {
  if (!supportSerialAPI() || !compiledCode || appStatus !== 'ready_to_upload') return;

  const upload = async () => {
    try {
      setAppStatus('uploading');
      await uploadCode(compiledCode.build_data);
      setAppStatus('uploaded');
    } catch {
      setAppStatus('upload_failed');
    }
  };
  upload();
}, [appStatus, compiledCode, serial, uploadCode]);
```

**Problemas:**

- Lógica de upload espalhada em múltiplos useEffects
- Difícil de testar
- Acoplada com renderização

#### ✅ Versão Nova Refatorada

```typescript
const uploadSketch = useCallback(
  async () => {
    setIsBusy(true);
    setIsUploading(true);
    setShowRocket(true);

    try {
      await UploadFirmwareUseCase.execute(
        uploadCode,
        {
          isSerialConnected: hardware.isSerialConnected,
          currentPort: hardware.serialPort,
          disconnectSerial: hardware.disconnectSerial,
          connectSerial: hardware.connectSerial,
        },
        {
          /* callbacks */
        },
      );
    } finally {
      setIsUploading(false);
      setIsBusy(false);
    }
  },
  [
    /* ... */
  ],
);
```

**Melhorias:**

- Lógica encapsulada em Use Case
- Fácil de testar e mockar
- Separa orchestração da renderização
- Suporta React Native automaticamente

---

### 3. Detecção de Ambiente

#### ❌ Versão Antiga

```typescript
const postMessage = useMemo(() => {
  if (typeof window === 'undefined') return undefined;
  const webview = (window as any).ReactNativeWebView;
  return webview?.postMessage.bind(webview);
}, []);

// Apenas para enviar orientação, não para serial
useEffect(() => {
  postMessage && postMessage(JSON.stringify({ orientation: 'landscape' }));
  return () => postMessage && postMessage(JSON.stringify({ orientation: 'portrait' }));
}, [postMessage]);
```

**Problema:**

- `postMessage` apenas para orientação, não para serial
- Web Serial API assumida como disponível

#### ✅ Versão Nova Refatorada

```typescript
// Em WebSerialAdapter.ts
private detectEnvironment() {
  if (typeof window !== 'undefined') {
    const webview = (window as any).ReactNativeWebView;
    if (webview && webview.postMessage) {
      this.isReactNative = true;
      this.postMessage = webview.postMessage.bind(webview);
    }
  }
}

// Em Navbar.tsx
const [isReactNative, setIsReactNative] = useState(false);
useEffect(() => {
  const webview = (window as any).ReactNativeWebView;
  setIsReactNative(!!webview);
}, []);
```

**Melhorias:**

- Detecção feita em múltiplos pontos (adapter + navbar)
- Comportamento diferenciado por ambiente
- Suporte real a postMessage para serial

---

### 4. Componentes

#### ❌ Versão Antiga (Monolítica)

```typescript
// Tudo em um arquivo index.page.tsx
const Code: React.FC<IProps> = ({ project }) => {
  // 500+ linhas
  // - CodeEditor
  // - Simulator
  // - SerialMonitor
  // - Modal de projeto
  // - Upload logic
  // - Serial logic
  // Tudo junto!
};
```

#### ✅ Versão Nova Refatorada (Modular)

```typescript
// Componentes separados
const NewCode: React.FC<IProps> = ({ project }) => {
  return (
    <Flex>
      <CodeNavbar project={project} />
      <BlocklyWorkspace />
      <StageArea />
      <SpriteList />
      <MLRecognitionWindow />
      <CodePreview />
      {/* Modais e componentes separados */}
    </Flex>
  );
};
```

**Melhorias:**

- Componentes reutilizáveis
- Responsabilidade única
- Mais fácil de manter

---

## 🔗 Fluxo de Arquitetura

### ❌ Versão Antiga

```
index.page.backup.tsx
├── useState (múltiplos)
├── SerialConnection (local)
├── headerEvents (EventEmitter global)
├── useEffects (10+)
└── Tudo junto (renderização + lógica)
```

### ✅ Versão Nova Refatorada

```
Navbar.tsx (Smart Component)
├── useFirmware() ──→ FirmwareContext
│                     ├── useHardwareManager()
│                     │   └── SerialService
│                     │       └── WebSerialAdapter ✅ (Suporta React Native)
│                     └── UploadFirmwareUseCase
├── useUI() ──→ UIContext
└── useProject() ──→ ProjectContext

BlocklyWorkspace.tsx (Dumb Component)
StageArea.tsx (Dumb Component)
```

---

## 📈 Por que a Refatoração Quebrou React Native

A refatoração mudou de:

```
SerialConnection (simples, local)
  ↓
Verificação postMessage local
```

Para:

```
WebSerialAdapter (complexo, centralizado)
  ↓
❌ Assumia Web Serial API sempre disponível
  ↓
❌ Sem verificação de React Native
```

**Mas agora está corrigido** com:

```
WebSerialAdapter (complexo, centralizado)
  ↓
✅ Detecta React Native
  ↓
✅ Usa postMessage se React Native
  ↓
✅ Usa Web Serial API se web
```

---

## 🧪 Teste Comparativo

### Cenário: Conectar placa Arduino

#### Versão Antiga

```
[Na Web] ✅ Funciona
- Click em Conectar
- SerialConnection.connect()
- navigator.serial.requestPort()
- Diálogo aparece
- Placa conecta

[No React Native] ⚠️ Parcialmente
- Click em Conectar
- SerialConnection.connect()
- navigator.serial.requestPort() ❌ Não existe
- ERRO
- Mas postMessage também não era usado para serial
```

#### Versão Antiga (Backup)

```
[Na Web] ✅ Funciona
- supportSerialAPI() = true
- Fluxo web normal

[No React Native] ⚠️ Parcialmente
- supportSerialAPI() = false
- Usa postMessage ✅
- Funciona se o lado nativo tratar
```

#### Versão Nova (Agora Corrigida)

```
[Na Web] ✅ Funciona
- Detecta: isReactNative = false
- Fluxo Web normal
- navigator.serial.requestPort()

[No React Native] ✅ Funciona
- Detecta: isReactNative = true
- Usa postMessage
- Envia REQUEST_SERIAL_PORT
- Aguarda SERIAL_PORT_SELECTED
```

---

## 💡 Lições Aprendidas

1. **Refatoração de arquitetura é importante**, mas pode quebrar suportes laterais
2. **Abstrações centralizadas (Adapters)** facilitam suporte a múltiplos ambientes
3. **Testes cross-platform** são essenciais
4. **Detecção de ambiente deve ser feita em camadas baixas** (adapter, não component)
5. **Protocolo de comunicação estruturado** (JSON) é fundamental para integração com nativo

---

## 🎯 Conclusão

A refatoração foi bem-sucedida em melhorar a arquitetura e manutenibilidade, mas **acidentalmente quebroucreou compatibilidade com React Native**.

A solução implementada restaura a compatibilidade enquanto **mantém os benefícios arquiteturais** da nova versão.

**Antes**: Versão monolítica com suporte ad-hoc a React Native  
**Depois**: Arquitetura limpa com suporte a React Native integrado na camada de adapter  
**Resultado**: ✅ Melhor de ambos os mundos
