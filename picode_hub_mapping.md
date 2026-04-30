# 🗺️ Mapeamento: `D:\picode_hub_code` → `hub-web`

> Documento de referência para encontrar onde cada arquivo/módulo do `picode_hub_code` está (ou deveria estar) no projeto `hub-web`.

---

## 📌 Visão Geral das Estruturas

| Projeto | Caminho Base | Framework | Router |
|---|---|---|---|
| **picode_hub_code** | `C:\Users\Vitor Weber\Desktop\picode_hub_code\` | Next.js 14 (App Router) | `app/` directory |
| **hub-web** | `C:\Users\Vitor Weber\Desktop\hub-web\src` | Next.js (Pages Router) | `src/pages/` + `src/_base/` |

> [!IMPORTANT]
> O `hub-web` tem uma separação especial: o código da engine Scratch/PiCode (VM, hooks, contextos, serviços) fica em **`src/_base/`**, enquanto o resto do app (páginas, componentes de UI, API) fica em `src/`.

---

## 🔁 Mapeamento por Camada

### 1. VM (Máquina Virtual Scratch)

| picode_hub_code | hub-web |
|---|---|
| `app/vm/PicoVM.ts` | `src/_base/vm/PicoVM.ts` |
| `app/vm/BlockInterpreter.ts` | `src/_base/vm/BlockInterpreter.ts` |
| `app/vm/Thread.ts` | `src/_base/vm/Thread.ts` |
| `app/vm/types.ts` | `src/_base/vm/types.ts` |
| *(não existe)* | `src/_base/vm/SpriteBlockRegistry.ts` ← **novo no hub-web** |

> [!NOTE]
> O `hub-web` tem um arquivo a mais: `SpriteBlockRegistry.ts`. O `BlockInterpreter.ts` do hub-web é menor (~44kb vs ~49kb), provavelmente mais recente/refatorado.

---

### 2. Engine (WebGL / Renderização)

| picode_hub_code | hub-web |
|---|---|
| `app/engine/webgl/WebGLRenderer.ts` | `src/_base/engine/webgl/WebGLRenderer.ts` |
| `app/engine/webgl/CollisionEngine.ts` | `src/_base/engine/webgl/CollisionEngine.ts` |
| `app/engine/webgl/TextureManager.ts` | `src/_base/engine/webgl/TextureManager.ts` |
| `app/engine/webgl/Math3D.ts` | `src/_base/engine/webgl/Math3D.ts` |
| `app/engine/webgl/Shaders.ts` | `src/_base/engine/webgl/Shaders.ts` |
| `app/engine/webgl/index.ts` | `src/_base/engine/webgl/index.ts` |

---

### 3. Contextos React

| picode_hub_code | hub-web |
|---|---|
| `app/context/ProjectContext.tsx` | `src/_base/context/ProjectContext.tsx` |
| `app/context/StageContext.tsx` | `src/_base/context/StageContext.tsx` |
| `app/context/RuntimeContext.tsx` | `src/_base/context/RuntimeContext.tsx` |
| `app/context/ExecutionRunnerContext.tsx` | `src/_base/context/ExecutionRunnerContext.tsx` |
| `app/context/FirmwareContext.tsx` | `src/_base/context/FirmwareContext.tsx` |
| `app/context/SerialContext.tsx` | `src/_base/context/SerialContext.tsx` |
| `app/context/UIContext.tsx` | `src/_base/context/UIContext.tsx` |
| `app/context/CombinedProviders.tsx` | `src/_base/context/CombinedProviders.tsx` |

---

### 4. Services

| picode_hub_code | hub-web |
|---|---|
| `app/services/ProjectService.ts` | `src/_base/services/ProjectService.ts` |
| `app/services/SpriteService.ts` | `src/_base/services/SpriteService.ts` |
| `app/services/CostumeService.ts` | `src/_base/services/CostumeService.ts` |
| `app/services/SoundService.ts` | `src/_base/services/SoundService.ts` |
| `app/services/BackdropService.ts` | `src/_base/services/BackdropService.ts` |
| `app/services/VariableService.ts` | `src/_base/services/VariableService.ts` |
| `app/services/ExecutionEngine.ts` | `src/_base/services/ExecutionEngine.ts` |
| `app/services/CodeExecutor.ts` | `src/_base/services/CodeExecutor.ts` |
| `app/services/CompilerService.ts` | `src/_base/services/CompilerService.ts` |
| `app/services/SerialService.ts` | `src/_base/services/SerialService.ts` |
| `app/services/SerializationService.ts` | `src/_base/services/SerializationService.ts` |
| `app/services/LibraryService.ts` | `src/_base/services/LibraryService.ts` |
| `app/services/LegacyProjectManager.ts` | `src/_base/services/LegacyProjectManager.ts` |
| `app/services/StageBoard.ts` | `src/_base/services/StageBoard.ts` |
| `app/services/UploadService.ts` | `src/_base/services/UploadService.ts` |

> [!NOTE]
> Os serviços em `hub-web` também têm acesso aos serviços de **API do backend** via `src/_base/services/` (subpastas: `auth`, `code`, `codeProject`, `compile`, `upload`, etc.)

---

### 5. Hooks

| picode_hub_code | hub-web |
|---|---|
| `app/hooks/useStageRunner.ts` | `src/_base/hooks/useStageRunner.ts` |
| `app/hooks/usePicoVM.ts` | `src/_base/hooks/usePicoVM.ts` |
| `app/hooks/useCodeExecution.ts` | `src/_base/hooks/useCodeExecution.ts` |
| `app/hooks/useBlocklySync.ts` | `src/_base/hooks/useBlocklySync.ts` |
| `app/hooks/useBlocklyCodeGenerator.ts` | `src/_base/hooks/useBlocklyCodeGenerator.ts` |
| `app/hooks/useHardwareManager.ts` | `src/_base/hooks/useHardwareManager.ts` |
| `app/hooks/useSpriteManager.ts` | `src/_base/hooks/useSpriteManager.ts` |
| `app/hooks/useKeyboardInput.ts` | `src/_base/hooks/useKeyboardInput.ts` |
| `app/hooks/useMLScripts.ts` | `src/_base/hooks/useMLScripts.ts` |
| `app/hooks/useMLScriptsLoader.ts` | `src/_base/hooks/useMLScriptsLoader.ts` |
| `app/hooks/useSandboxExecutor.ts` | `src/_base/hooks/useSandboxExecutor.ts` |
| `app/hooks/useSerialLine.ts` | `src/_base/hooks/useSerialLine.ts` |
| `app/hooks/useProjectDrop.ts` | `src/_base/hooks/useProjectDrop.ts` |
| `app/hooks/analysis_stub.ts` | `src/_base/hooks/analysis_stub.ts` |
| **Sub-hooks Blockly** | |
| `app/hooks/blockly/useBlocklyInit.ts` | `src/_base/hooks/blockly/useBlocklyInit.ts` |
| `app/hooks/blockly/useBlocklyModeSwitch.ts` | `src/_base/hooks/blockly/useBlocklyModeSwitch.ts` |
| `app/hooks/blockly/useBlocklyToolboxCallbacks.ts` | `src/_base/hooks/blockly/useBlocklyToolboxCallbacks.ts` |
| `app/hooks/blockly/useBlocklyFlyout.ts` | `src/_base/hooks/blockly/useBlocklyFlyout.ts` |
| `app/hooks/blockly/useBlocklyContextMenu.ts` | `src/_base/hooks/blockly/useBlocklyContextMenu.ts` |
| `app/hooks/blockly/useBlocklyMotionSync.ts` | `src/_base/hooks/blockly/useBlocklyMotionSync.ts` |
| `app/hooks/blockly/useBlocklyVariableSync.ts` | `src/_base/hooks/blockly/useBlocklyVariableSync.ts` |

---

### 6. Domain (Entidades & Ports)

| picode_hub_code | hub-web |
|---|---|
| `app/domain/entities/Backdrop.ts` | `src/_base/domain/entities/Backdrop.ts` |
| `app/domain/entities/Sprite.ts` | `src/_base/domain/entities/Sprite.ts` |
| `app/domain/entities/Project.ts` | `src/_base/domain/entities/Project.ts` |
| `app/domain/entities/Monitor.ts` | `src/_base/domain/entities/Monitor.ts` |
| `app/domain/entities/ISprite.ts` | `src/_base/domain/entities/ISprite.ts` |
| `app/domain/entities/IProject.ts` | `src/_base/domain/entities/IProject.ts` |
| `app/domain/entities/IBlockly.ts` | `src/_base/domain/entities/IBlockly.ts` |
| `app/domain/entities/IMLModel.ts` | `src/_base/domain/entities/IMLModel.ts` |
| `app/domain/entities/ISerial.ts` | `src/_base/domain/entities/ISerial.ts` |
| `app/domain/entities/Execution.ts` | `src/_base/domain/entities/Execution.ts` |
| `app/domain/entities/IPaintEditor.ts` | `src/_base/domain/entities/IPaintEditor.ts` |
| `app/domain/entities/IGlobal.ts` | `src/_base/domain/entities/IGlobal.ts` |
| `app/domain/entities/ICompile.ts` | `src/_base/domain/entities/ICompile.ts` |
| `app/domain/entities/ICustomBlock.ts` | `src/_base/domain/entities/ICustomBlock.ts` |
| `app/domain/entities/IBackdrop.ts` | `src/_base/domain/entities/IBackdrop.ts` |
| `app/domain/entities/IUpload.ts` | `src/_base/domain/entities/IUpload.ts` |
| `app/domain/ports/IHardwareBoard.ts` | `src/_base/domain/ports/IHardwareBoard.ts` |
| `app/domain/ports/IProjectRepository.ts` | `src/_base/domain/ports/IProjectRepository.ts` |
| `app/domain/ports/ISerialPortAdapter.ts` | `src/_base/domain/ports/ISerialPortAdapter.ts` |

---

### 7. Adapters

| picode_hub_code | hub-web |
|---|---|
| `app/adapters/BrowserFileSystem.ts` | `src/_base/adapters/BrowserFileSystem.ts` |
| `app/adapters/LocalStorageProjectRepository.ts` | `src/_base/adapters/LocalStorageProjectRepository.ts` |
| `app/adapters/WebSerialAdapter.ts` | `src/_base/adapters/WebSerialAdapter.ts` |
| `app/adapters/mappers/ProjectMapper.ts` | `src/_base/adapters/mappers/ProjectMapper.ts` |

---

### 8. Use Cases

| picode_hub_code | hub-web |
|---|---|
| `app/use-cases/ConnectSerialUseCase.ts` | `src/_base/use-cases/ConnectSerialUseCase.ts` |
| `app/use-cases/LoadProjectUseCase.ts` | `src/_base/use-cases/LoadProjectUseCase.ts` |
| `app/use-cases/SaveProjectUseCase.ts` | `src/_base/use-cases/SaveProjectUseCase.ts` |
| `app/use-cases/UploadFirmwareUseCase.ts` | `src/_base/use-cases/UploadFirmwareUseCase.ts` |

---

### 9. Geradores de Código Blockly

| picode_hub_code | hub-web |
|---|---|
| `app/generators/custom_generators.ts` | `src/_base/generators/custom_generators.ts` |
| `app/generators/board.ts` | `src/_base/generators/board.ts` |
| `app/generators/stage.ts` | `src/_base/generators/stage.ts` |
| `app/generators/board/` | `src/_base/generators/board/` |
| `app/generators/stage/` | `src/_base/generators/stage/` |

---

### 10. Configuração / Definições de Blocos Blockly

| picode_hub_code | hub-web |
|---|---|
| `app/config/custom_definitions.ts` | `src/_base/config/custom_definitions.ts` |
| `app/config/sprite_library.ts` | `src/_base/config/sprite_library.ts` |
| `app/config/stage_blocks.ts` | `src/_base/config/stage_blocks.ts` |
| `app/config/blockly/` | `src/_base/config/blockly/` |
| `app/config/blocks/` | `src/_base/config/blocks/` |
| `app/config/extensions/` | `src/_base/config/extensions/` |
| `app/config/toolbox/` | `src/_base/config/toolbox/` |
| *(não existe no picode)* | `src/_base/config/baud.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/config/browserKeys.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/config/events.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/config/iconList.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/config/storage.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/config/toolbox.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/config/upload.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/config/usbVendorIds.ts` ← **só no hub-web** |

---

### 11. Lib (Utilitários de Baixo Nível)

| picode_hub_code | hub-web |
|---|---|
| `app/lib/EventEmitter.ts` | `src/_base/lib/EventEmitter.ts` |
| `app/lib/HeadlessBlocklyRunner.ts` | `src/_base/lib/HeadlessBlocklyRunner.ts` |
| `app/lib/byteUtils.ts` | `src/_base/lib/byteUtils.ts` |
| `app/lib/dragState.ts` | `src/_base/lib/dragState.ts` |
| `app/lib/serialConfig.ts` | `src/_base/lib/serialConfig.ts` |
| `app/lib/stk500.ts` | `src/_base/lib/stk500.ts` |
| `app/lib/audio/AudioEffects.ts` | `src/_base/lib/audio/AudioEffects.ts` |
| `app/lib/audio/AudioRecorder.ts` | `src/_base/lib/audio/AudioRecorder.ts` |
| `app/lib/blockly/BlockBuilder.ts` | `src/_base/lib/blockly/BlockBuilder.ts` |
| `app/lib/blockly/categories.ts` | `src/_base/lib/blockly/categories.ts` |
| `app/lib/blockly/contextMenu.ts` | `src/_base/lib/blockly/contextMenu.ts` |
| `app/lib/blockly/procedureToolbox.ts` | `src/_base/lib/blockly/procedureToolbox.ts` |
| `app/lib/blockly/utils.ts` | `src/_base/lib/blockly/utils.ts` |
| `app/lib/blockly/variableToolbox.ts` | `src/_base/lib/blockly/variableToolbox.ts` |
| *(não existe no picode)* | `src/_base/lib/ml.ts` ← **só no hub-web** |
| *(não existe no picode)* | `src/_base/lib/webcam.ts` ← **só no hub-web** |

---

### 12. Blocks (Service de Blocos)

| picode_hub_code | hub-web |
|---|---|
| `app/blocks/BlockService.ts` | `src/_base/blocks/BlockService.ts` |
| `app/blocks/index.ts` | `src/_base/blocks/index.ts` |

---

### 13. Componentes React

| picode_hub_code | hub-web |
|---|---|
| `app/components/Navbar.tsx` | ❓ **Sem equivalente direto** — hub-web usa componente de Navbar do `src/components/` mais complexo |
| `app/components/CodePreview.tsx` | ❓ **Sem equivalente direto** |
| **Blockly** | |
| `app/components/blockly/BlocklyWorkspace.tsx` | *(integrado via `src/components/scratch/` e `src/_base/hooks/`)* |
| `app/components/blockly/BlocklyTabHeader.tsx` | *(sem equivalente direto)* |
| `app/components/blockly/BlocklyModals.tsx` | *(sem equivalente direto)* |
| `app/components/blockly/DirectionPicker.tsx` | `src/components/scratch/` ou componente Blockly interno |
| `app/components/blockly/ExtensionButton.tsx` | *(sem equivalente direto)* |
| **Editors** | |
| `app/components/editors/SoundEditor.tsx` | `src/components/scratch/` |
| `app/components/editors/CostumeEditor.tsx` | `src/components/scratch/` |
| `app/components/editors/BackdropEditor.tsx` | `src/components/scratch/` |
| `app/components/editors/PaintEditor/` | `src/components/scratch/` |
| **ML** | |
| `app/components/ml/MLRecognitionWindow.tsx` | `src/components/scratch/` (modal de câmera AI) |
| `app/components/ml/MLExtensionModal.tsx` | `src/components/scratch/` |
| `app/components/ml/MLLoader.tsx` | *(sem equivalente direto)* |
| **Monitors** | |
| `app/components/monitors/MLMonitorModal.tsx` | `src/components/scratch/` |
| `app/components/monitors/HumidityModal.tsx` | `src/components/scratch/` |
| `app/components/monitors/LuminosityModal.tsx` | `src/components/scratch/` |
| `app/components/monitors/PercentageModal.tsx` | `src/components/scratch/` |
| **Modals** | |
| `app/components/modals/VariableModal.tsx` | `src/components/ScratchNewVariableModal/` |
| `app/components/modals/ListModal.tsx` | *(integrado)* |
| `app/components/modals/ProcedureModal.tsx` | *(sem equivalente direto)* |
| `app/components/modals/SpriteGalleryModal.tsx` | `src/components/scratch/` |
| `app/components/modals/ExtensionModal.tsx` | `src/components/scratch/` |
| `app/components/modals/BroadcastModal.tsx` | *(sem equivalente direto)* |
| **Stage** | |
| `app/components/stage/StageArea.tsx` | `src/components/scratch/` ou `src/components/Simulator/` |
| `app/components/stage/StageColumn.tsx` | *(integrado na página de código)* |
| `app/components/stage/StageMonitor.tsx` | `src/components/scratch/` |
| `app/components/stage/StageListMonitor.tsx` | `src/components/scratch/` |
| `app/components/stage/StageBridge.tsx` | `src/components/scratch/` |
| `app/components/stage/AskModal.tsx` | *(sem equivalente direto)* |
| **Sprites** | |
| `app/components/sprites/SpriteList.tsx` | `src/components/scratch/` |
| `app/components/sprites/SpriteGrid.tsx` | *(integrado no SpriteList)* |
| `app/components/sprites/SpritePropertiesPanel.tsx` | *(integrado na UI)* |
| **Serial** | |
| `app/components/serial/SerialMonitor.tsx` | `src/components/scratch/` |

---

### 14. Estilos CSS

| picode_hub_code | hub-web |
|---|---|
| `app/styles/blockly.css` | `src/styles/blockly.css` |
| `app/styles/panels.css` | `src/styles/panels.css` |
| `app/styles/features.css` | `src/styles/features.css` |
| `app/styles/components.css` | `src/styles/components.css` |
| `app/styles/ai-modal.css` | `src/styles/ai-modal.css` |
| `app/styles/dropdown.css` | `src/styles/dropdown.css` |
| `app/styles/layout.css` | `src/styles/layout.css` |
| `app/styles/theme.css` | `src/styles/theme.css` |
| `app/globals.css` | `src/styles/globals.css` *(muito maior — inclui todo o design system)* |
| *(não existe)* | `src/styles/code-globals.css` ← **só no hub-web** |
| *(não existe)* | `src/styles/colors.ts` ← **só no hub-web** |
| *(não existe)* | `src/styles/themes.ts` ← **só no hub-web** |

---

### 15. Página Principal (Editor de Código)

| picode_hub_code | hub-web |
|---|---|
| `app/page.tsx` *(editor completo)* | `src/pages/code/[folder_id]/[project_id]/index.page.tsx` |
| `app/layout.tsx` | `src/pages/_app.page.tsx` + `src/pages/_document.page.tsx` |

---

## 🆕 O que existe **só no hub-web** (não tem no picode_hub_code)

### Camadas de App Completo (não presentes no picode)
- `src/pages/` — ~27 páginas: login, signup, courses, groups, ranking, planner, exam, community, etc.
- `src/_base/services/` — APIs de backend: auth, code, codeProject, compile, upload, user, etc.
- `src/_base/interfaces/` — Interfaces adicionais: api, events, gpt
- `src/_base/classes/` — Classes utilitárias da plataforma
- `src/_base/errors/` — Tratamento de erros (Zod)
- `src/_base/utils/` — ~45 utilitários: formatadores, validadores, managers de token, etc.
- `src/components/` — ~28 componentes de UI da plataforma (Kanban, LearnBot, LessonPage, etc.)
- `src/_base/hooks/` — Hooks da plataforma: Auth, TensorFlow, VisionLab, HubTour, etc.

---

## ⚠️ Diferenças Importantes a Atentar

| Aspecto | picode_hub_code | hub-web |
|---|---|---|
| **Router** | App Router (`app/`) | Pages Router (`src/pages/`) |
| **Scratch components** | `app/components/` (direto) | `src/components/scratch/` (subpasta) |
| **Configuração** | `app/config/` (só Blockly) | `src/_base/config/` + muitos extras |
| **VM** | 4 arquivos | 5 arquivos (+`SpriteBlockRegistry.ts`) |
| **Lib** | 8 arquivos + 2 pastas | 10 arquivos + 2 pastas (+`ml.ts`, +`webcam.ts`) |
| **Estilos** | Vanilla CSS (`app/styles/`) | CSS + TypeScript theme system (`src/styles/`) |
| **Blockly Hub** | Autônomo (`app/components/blockly/`) | Integrado via `src/components/scratch/` + hooks |

---

## 📁 Estrutura Resumida do hub-web (`src/_base/`)

```
src/_base/
├── adapters/              ← BrowserFileSystem, WebSerial, LocalStorage, Mappers
│   └── mappers/
├── blocks/                ← BlockService
├── classes/               ← api/, events/, gpt/
├── config/                ← Definições Blockly, blocos, toolbox, extensões
│   ├── blockly/
│   ├── blocks/
│   ├── extensions/
│   └── toolbox/
├── context/               ← Todos os Providers React
├── domain/
│   ├── entities/          ← Tipos e Interfaces de domínio
│   └── ports/             ← Portas (interfaces de hardware, repositório)
├── engine/
│   └── webgl/             ← Renderer, Colisão, Texturas, Shaders
├── errors/                ← Zod error handlers
├── generators/            ← Code generators Blockly
│   ├── board/
│   └── stage/
├── hooks/                 ← Todos os hooks da engine
│   ├── blockly/           ← Sub-hooks Blockly
│   └── (hooks de plataforma: Auth, TensorFlow, VisionLab...)
├── interfaces/            ← api/, events/, gpt/
├── lib/                   ← EventEmitter, HeadlessBlockly, stk500, audio, blockly
│   ├── audio/
│   └── blockly/
├── services/              ← Services da engine + APIs de backend
│   ├── auth/, code/, compile/, upload/... (APIs)
│   └── (services da engine: ProjectService, SpriteService, etc.)
├── use-cases/             ← ConnectSerial, LoadProject, SaveProject, UploadFirmware
├── utils/                 ← ~45 utilitários gerais
└── vm/                    ← PicoVM, BlockInterpreter, Thread, types, SpriteBlockRegistry
```
