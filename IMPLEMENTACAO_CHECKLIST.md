# ✅ Checklist de Implementação e Verificação

## Parte 1: ✅ Lado Web (JÁ IMPLEMENTADO)

### Modificações realizadas no código web

- [x] **WebSerialAdapter.ts**
  - [x] Adicionado detecção de React Native Webview
  - [x] Adicionado propriedade `isReactNative`
  - [x] Adicionado propriedade `postMessage`
  - [x] Adicionado método `detectEnvironment()`
  - [x] Modificado `setupGlobalListeners()` para suportar React Native
  - [x] Modificado `connect()` para usar postMessage em React Native
  - [x] Modificado `write()` para usar postMessage em React Native
  - [x] Modificado `disconnect()` para usar postMessage em React Native
  - [x] Adicionado tratamento de mensagens do React Native

- [x] **Navbar.tsx**
  - [x] Adicionado detecção de React Native
  - [x] Adicionado estado `isReactNative`
  - [x] Adicionado useEffect para detectar React Native no mount
  - [x] Adicionado handler `handleConnectClick()`
  - [x] Modificado botão Conectar para usar `handleConnectClick`
  - [x] Adicionado tratamento de erro com toast

### Testes Web

- [ ] Abrir em navegador Chrome/Firefox/Edge
- [ ] Clicar em "Conectar"
- [ ] Verificar se diálogo de porta serial aparece
- [ ] Conectar a uma porta serial
- [ ] Verificar se botão muda para "Conectado" (verde)
- [ ] Testar desconexão

---

## Parte 2: ⏳ Lado React Native (FALTA IMPLEMENTAR)

### Criar listeners no WebView

**Arquivo**: Seu componente React Native com WebView

- [ ] Criar função `handleWebViewMessage` que recebe mensagens do webview
- [ ] Fazer parse JSON da mensagem
- [ ] Criar switch/case para cada tipo de mensagem

### Implementar handlers de mensagem

- [ ] **REQUEST_SERIAL_PORT**
  - [ ] Obter lista de portas seriais disponíveis (usar biblioteca nativa)
  - [ ] Se nenhuma porta: enviar SERIAL_ERROR
  - [ ] Se uma porta: conectar automaticamente
  - [ ] Se múltiplas: mostrar AlertDialog nativo
  - [ ] Após seleção: conectar à porta
  - [ ] Enviar resposta SERIAL_PORT_SELECTED com dados da porta

- [ ] **SERIAL_WRITE**
  - [ ] Pegar dados do array
  - [ ] Converter para Buffer (se necessário)
  - [ ] Escrever na porta serial
  - [ ] Em caso de erro: enviar SERIAL_ERROR

- [ ] **SERIAL_DISCONNECT**
  - [ ] Desconectar da porta serial
  - [ ] Limpar listeners de dados
  - [ ] Enviar resposta SERIAL_DISCONNECTED

### Implementar fluxo de dados de entrada

- [ ] Criar listener para dados recebidos da porta serial
- [ ] Ao receber dados: enviar SERIAL_DATA para webview
- [ ] Converter dados para array (se necessário)

### Função de envio de mensagens para webview

- [ ] Criar função `sendMessageToWebView(message)`
- [ ] Usar `webView.injectJavaScript()` com `window.dispatchEvent()`
- [ ] Garantir que mensagens estão em JSON válido

---

## Parte 3: 🧪 Testes de Integração

### Teste 1: Conectar placa via React Native

- [ ] Conectar placa Arduino/STM32 ao celular/tablet via USB
- [ ] Abrir app React Native
- [ ] Navegar para página de code
- [ ] Clicar botão "Conectar"
- [ ] Verificar se diálogo nativo de seleção de porta aparece
- [ ] Selecionar a porta correta
- [ ] Verificar se conexão é estabelecida (botão fica verde)
- [ ] Verificar logs do React Native

### Teste 2: Upload de código

- [ ] Com placa conectada, compilar código blockly
- [ ] Mudar para modo "Upload"
- [ ] Clicar "Carregar"
- [ ] Verificar se upload progride (foguete aparece)
- [ ] Verificar se código é executado na placa

### Teste 3: Desconexão

- [ ] Com placa conectada, clicar "Conectado" (botão verde)
- [ ] Verificar se desconecta
- [ ] Botão volta para "Conectar"

### Teste 4: Erros

- [ ] Clicar conectar sem placa conectada
- [ ] Verificar se mensagem de erro aparece
- [ ] Clicar OK e tentar novamente

---

## Parte 4: 📦 Dependências Necessárias

### Sua app React Native precisa de

- [ ] `react-native-webview` (provavelmente já tem)
- [ ] Biblioteca para gerenciar Serial nativa:
  - [ ] Android: `react-native-usb-serial-module` ou `serial-over-usb`
  - [ ] iOS: Implementar com USB framework nativo
  - Ou usar: `react-native-serial-ports` (se compatível)

### Verificar permissões

**Android** (`AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.USB_PERMISSION" />
```

**iOS** (`Info.plist`):

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>App precisa acessar dispositivos serial</string>
```

---

## Parte 5: 📊 Verificação de Logs

### Logs esperados na Web (F12 → Console)

```
[WebSerialAdapter] Ambiente detectado: React Native
[WebSerialAdapter] Enviando REQUEST_SERIAL_PORT
[WebSerialAdapter] Porta conectada
```

### Logs esperados no React Native

```
[CodeWebView] Mensagem recebida: REQUEST_SERIAL_PORT
[CodeWebView] Abrindo diálogo de seleção
[CodeWebView] Porta selecionada: /dev/ttyUSB0
[CodeWebView] Conectando à porta...
[CodeWebView] Enviando SERIAL_PORT_SELECTED
```

---

## Parte 6: 🐛 Troubleshooting

### Problema: "Porta serial não encontrada"

- [ ] Verificar se dispositivo está conectado via USB
- [ ] Verificar se driver USB está instalado
- [ ] Verificar se permissões de USB estão ativas
- [ ] Testar com serial monitor nativo primeiro

**Ação**: Adicionar logs em `handleRequestSerialPort` para ver portas disponíveis

### Problema: "Timeout aguardando porta"

- [ ] Aumentar timeout em WebSerialAdapter.ts (linha ~110)
- [ ] Verificar se React Native está processando mensagens
- [ ] Adicionar logs em `handleWebViewMessage`

**Ação**: Aumentar timeout de 30s para 60s e adicionar logs

### Problema: "Dados não são recebidos"

- [ ] Verificar se baudRate está correto (geralmente 115200)
- [ ] Verificar se dados estão sendo realmente recebidos
- [ ] Testar com serial monitor nativo
- [ ] Adicionar logs em `onData` listener

**Ação**: Adicionar console.log em todos os listeners

### Problema: "WebView não recebe mensagens"

- [ ] Verificar sintaxe de `injectJavaScript`
- [ ] Verificar se JSON é válido
- [ ] Verificar se listener está registrado no webview

**Ação**: Testar com mensagem simples (sem dados de serial)

---

## Parte 7: 📋 Documentação a Consultar

| Documento                                    | Propósito                                       |
| -------------------------------------------- | ----------------------------------------------- |
| `REACT_NATIVE_WEBVIEW_SERIAL_INTEGRATION.md` | **Guia completo** de implementação React Native |
| `BOTAO_CONECTAR_FIX_SUMMARY.md`              | Resumo das mudanças e como funcionam            |
| `ANALISE_VERSAO_ANTIGA_VS_NOVA.md`           | Comparação arquitetura antigas vs nova          |
| `src/_base/adapters/WebSerialAdapter.ts`     | Código-fonte com comentários                    |
| `src/pages/code/.../components/Navbar.tsx`   | Código-fonte do novo Navbar                     |

---

## Parte 8: 🎯 Milestones

### Milestone 1: Setup Inicial (Esta semana)

- [ ] Ler `REACT_NATIVE_WEBVIEW_SERIAL_INTEGRATION.md` completamente
- [ ] Entender o protocolo de mensagens
- [ ] Preparar ambiente React Native para development

### Milestone 2: Implementação Básica (Semana 1-2)

- [ ] Implementar `handleWebViewMessage` no WebView
- [ ] Implementar handler para `REQUEST_SERIAL_PORT`
- [ ] Testar envio/recebimento de mensagens

### Milestone 3: Integração Serial (Semana 2-3)

- [ ] Implementar gerenciador de serial nativo
- [ ] Testar conexão com placa real
- [ ] Implementar listeners de dados

### Milestone 4: Testes e Polish (Semana 3-4)

- [ ] Teste completo de integração
- [ ] Tratamento de edge cases
- [ ] Documentação de problemas e soluções

---

## Parte 9: 👥 Quem Faz O Quê

| Tarefa                                | Responsável                    |
| ------------------------------------- | ------------------------------ |
| Modificar WebSerialAdapter            | Backend/Frontend (Já Feito ✅) |
| Modificar Navbar                      | Backend/Frontend (Já Feito ✅) |
| **Implementar React Native handlers** | **Você / Time React Native**   |
| **Testar integração**                 | **QA / Você**                  |
| **Deploy**                            | **DevOps / Release**           |

---

## Parte 10: 🚀 Go-Live Checklist

Antes de fazer deploy em produção:

- [ ] Todos os testes passando (web e React Native)
- [ ] Sem erros de console
- [ ] Sem erros no React Native debugger
- [ ] Documentação atualizada
- [ ] Versão do app incrementada
- [ ] Release notes escritas
- [ ] Beta testing com usuários reais
- [ ] Monitoramento de erros ativado
- [ ] Rollback plan em caso de problema

---

## 📞 Próximas Etapas

1. **Agora**: Ler os documentos gerados
2. **Hoje/Amanhã**: Começar implementação React Native
3. **Esta semana**: Primeira conexão serial funcionando
4. **Próxima semana**: Testes e refinamento
5. **Semana seguinte**: Deploy em staging
6. **Semana final**: Deploy em produção

---

## 📝 Notas Importantes

⚠️ **A implementação web está completa, mas os testes devem ser feitos!**

✅ O protocolo está bem definido e documentado

✅ A arquitetura é escalável para outros ambientes (Electron, Tauri, etc.)

❌ Não esqueça de testar em dispositivo real (não apenas emulador)

💡 Se encontrar problemas, abra uma issue com logs completos

🎉 Parabéns por melhorar a arquitetura!
