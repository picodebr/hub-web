# Dashboard Components - New Architecture

## Overview

Esta pasta contém os componentes refatorados da página de Perfil antiga (feita em Chakra UI) para a nova arquitetura do Dashboard usando **Tailwind CSS**, **Lucide React** e **Framer Motion**.

## Componentes

### 1. **AccountSettings.tsx**
Gerencia as configurações da conta do usuário com funcionalidade de leitura/escrita.

**Features:**
- Edição de Nome, Username e Biografia
- Toggle de modo escuro/claro
- Salvar alterações com integração de API
- Estados de loading e feedback visual

**Props:**
```typescript
interface AccountSettingsProps {
  user: IHubUser;
  isDark: boolean;
  onToggleTheme: () => void;
}
```

**Uso:**
```tsx
<AccountSettings 
  user={currentUser} 
  isDark={isDark} 
  onToggleTheme={toggleTheme} 
/>
```

---

### 2. **MyCertificates.tsx**
Exibe uma lista de certificados do usuário com links para download.

**Features:**
- Listagem scrollável de certificados
- Ícone de link externo para acessar o certificado
- Estados de loading
- Mensagem vazia customizada

**Props:**
```typescript
interface MyCertificatesProps {
  isDark: boolean;
}
```

**Uso:**
```tsx
<MyCertificates isDark={isDark} />
```

---

### 3. **RecentProjects.tsx**
Carrossel horizontal dos projetos recentes do professor.

**Features:**
- Scroll horizontal com overflow customizado
- Cards com thumbnail (imagem ou ícone padrão)
- Navegação ao clicar no card
- Informações de data e status

**Props:**
```typescript
interface RecentProjectsProps {
  isDark: boolean;
  schoolId?: string;
}
```

**Uso:**
```tsx
<RecentProjects 
  isDark={isDark} 
  schoolId={school?.hub_school_id} 
/>
```

---

### 4. **QuickGuide.tsx**
Accordion interativo com FAQ da plataforma.

**Features:**
- Accordion funcional sem dependência do Chakra
- Animações suaves com Framer Motion
- Expandir/colapsar items
- 6 FAQs pré-configuradas

**Props:**
```typescript
interface QuickGuideProps {
  isDark: boolean;
}
```

**Uso:**
```tsx
<QuickGuide isDark={isDark} />
```

---

### 5. **StudentExtract.tsx**
Painel de extrato financeiro do aluno com histórico de transações.

**Features:**
- Cards resumidos de total recebido/gasto
- Lista detalhada de transações
- Ícones de trending up/down
- Cores customizadas por tipo de transação

**Props:**
```typescript
interface StudentExtractProps {
  isDark: boolean;
}
```

**Uso:**
```tsx
<StudentExtract isDark={isDark} />
```

---

## Dashboard.tsx

Componente integrador que organiza todos os painéis em layouts responsivos baseado no tipo de usuário.

**Features:**
- Layout diferente para students vs teachers
- Grid responsiva (1 coluna mobile, 2+ desktop)
- Animações em cascata com Framer Motion
- Integração com hooks customizados

**Uso:**
```tsx
<Dashboard isDark={isDark} onToggleTheme={toggleTheme} />
```

---

## Padrão de Refatoração

### ✅ O que foi mantido:
- Toda a lógica de chamadas de API (`getStudentExtract`, `listUserCertificates`, etc)
- Estados de loading e erro
- Formatação de dados (moeda, datas)
- Funcionalidades de edição/atualização

### ✅ O que foi mudado:
- **Chakra UI** → **HTML nativo + Tailwind CSS**
- **useColorMode** → **Dark mode com classes do Tailwind** (`dark:` prefix)
- **Accordion (Chakra)** → **Accordion customizado com useState**
- **Box, Flex, Grid** → **divs com classes Tailwind**
- **Icons** → **Lucide React** ao invés de React Icons
- **Animações** → **Framer Motion** (motion.div, AnimatePresence)

### Classes Tailwind Customizadas:

```css
/* Dark mode */
.dark:bg-gray-800
.dark:text-white
.dark:border-gray-700
.dark:bg-gray-700

/* Hover effects */
.hover:translate-y-[-2px]
.hover:bg-gray-100

/* Animations */
.animate-float1
.animate-float2
```

---

## Estrutura de Arquivos

```
src/components/dashboard/
├── AccountSettings.tsx
├── MyCertificates.tsx
├── RecentProjects.tsx
├── QuickGuide.tsx
├── StudentExtract.tsx
├── Dashboard.tsx
└── index.ts (barrel export)
```

---

## Como Usar

### Importação direta:
```tsx
import { AccountSettings, MyCertificates } from '@/components/dashboard';
```

### Ou importar o Dashboard completo:
```tsx
import Dashboard from '@/components/dashboard/Dashboard';

function ProfilePage() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <Dashboard 
      isDark={isDark} 
      onToggleTheme={() => setIsDark(!isDark)} 
    />
  );
}
```

---

## Animações Padrão

Todos os componentes seguem as variantes de animação:

```typescript
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};
```

---

## Dark Mode

O dark mode é controlado via classe `dark` no elemento raiz e props `isDark` passadas aos componentes:

```tsx
<div className={isDark ? 'dark' : ''}>
  <Dashboard isDark={isDark} onToggleTheme={toggle} />
</div>
```

---

## Responsividade

- **Mobile**: 1 coluna (grid-cols-1)
- **Tablet**: 2 colunas (md:grid-cols-2)
- **Desktop**: 2-3 colunas conforme layout
- **Scrollbar customizado**: Classes de overflow com gap padronizado

---

## Dependencies

- `framer-motion` - Animações
- `lucide-react` - Ícones
- `tailwindcss` - Estilos
- `moment` - Formatação de datas
- APIs do `@/_base/services/...` - Chamadas de servidor

---

## Próximas Etapas

- [ ] Implementar skeleton loaders
- [ ] Adicionar filtros nos componentes de lista
- [ ] Expandir animações com Framer Motion
- [ ] Criar versões de tablet otimizadas
- [ ] Adicionar testes unitários

---

**Versão**: 1.0  
**Última atualização**: Abril 2026
