# Refatoração de Design System - UI/UX Padronização

## 📋 Resumo de Mudanças Aplicadas

Este documento descreve todas as mudanças aplicadas para refatorar o CSS/Componentes seguindo diretrizes rigorosas de UI/UX.

---

## 1. 🎨 Sistema de Espaçamento (Spacing System)

### Base: Múltiplos de 8px

**Arquivo:** `src/styles/global.ts` e `src/styles/globals.css`

```
xs:  0.25rem (4px)
sm:  0.5rem  (8px)   ← Base Unit
md:  1rem    (16px)  ← 2 units
lg:  1.5rem  (24px)  ← 3 units
xl:  2rem    (32px)  ← 4 units
2xl: 3rem    (48px)  ← 6 units
3xl: 4rem    (64px)  ← 8 units
```

### Aplicação Global

- Todos os componentes respeitam este sistema
- Distância Navbar → Conteúdo: **1.5rem (24px)** padronizado
- Padding lateral em páginas: **1.5rem a 2rem** consistente

**Referência em Tailwind:**
```tailwind
p-xs, p-sm, p-md, p-lg, p-xl, p-2xl
m-xs, m-sm, m-md, m-lg, m-xl, m-2xl
gap-xs, gap-sm, gap-md, gap-lg, gap-xl, gap-2xl
```

---

## 2. 🔲 Border Radius - Estilo Orgânico e Suave

### Valores Padronizados

**Arquivo:** `tailwind.config.js` e `src/styles/globals.css`

```
xs:    0.25rem  (4px)
sm:    0.5rem   (8px)
md:    0.75rem  (12px)
lg:    1rem     (16px)  ← Padrão para cards
xl:    1.5rem   (24px)  ← Moderno e suave
2xl:   2rem     (32px)  ← Extra suave
full:  9999px   (Circular)
```

### Aplicação por Componente

| Elemento | Border Radius | Exemplo |
|----------|--------------|---------|
| Botões pequenos | `md` (12px) | Ícones, mini buttons |
| Botões padrão | `lg` (16px) | Botões normais |
| Cards | `lg` (16px) | Componentes principais |
| Containers grandes | `xl` (24px) | Modais, painéis |
| Navbar/Sidebar | `xl` (24px) | Top-right rounded |
| Badges | `full` (circular) | Tags, status |

---

## 3. 💫 Sistema de Sombras (Box-Shadow)

### Níveis de Elevação

**Arquivo:** `src/styles/globals.css` e `design-system.css`

```
soft:      0 2px 8px rgba(0, 0, 0, 0.04)
sm:        0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)
md:        0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
lg:        0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
xl:        0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
elevation: 0 8px 16px rgba(0, 0, 0, 0.08)
```

### Uso por Componente

| Nível | Componentes | Quando usar |
|-------|-------------|-------------|
| **soft** | Inputs, cards pequenos | Fundo cinza, elemento sutil |
| **md** | Cards padrão, navegação | Container principal |
| **lg** | Cards com hover, modais | Destaque, hover state |
| **xl** | Modais principais | Elemento de máxima importância |

### Mudanças Aplicadas

- ✅ **Navbar:** `box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.08)` (antes: `0px 4px 12px`)
- ✅ **Cards:** Sombra suave no estado padrão, elevada no hover
- ✅ **Modais:** Sombra `xl` com backdrop blur

---

## 4. 🎯 Componentes Específicos

### Navbar/Sidebar

**Arquivo:** `src/components/Page/components/Navbar/index.tsx`

#### Mudanças Aplicadas:

1. **BorderRadius Top-Right:**
   - ✅ Antes: `borderRadius="0 16px 16px 0"` (base arredondado em 2 lados)
   - ✅ Depois: `borderRadius="0 24px 0 0"` (apenas top-right suave, conexão reta na base)

2. **Sombra Elegante:**
   - ✅ Antes: `boxShadow="0px 4px 12px rgba(0,0,0,0.03)"` + `border="1px solid"`
   - ✅ Depois: `boxShadow="0px 8px 24px rgba(0, 0, 0, 0.08)"` + `border="none"`

3. **Espaçamento Padrão:**
   - ✅ Padding: `p="1rem"` (consistente com spacing system)
   - ✅ Gap entre items: `gap="0.75rem"` → `gap="0.5rem"`

4. **Dividers:**
   - ✅ Antes: `borderColor="gray200" opacity={0.6}`
   - ✅ Depois: `borderColor="gray100" opacity={0.5}` (mais discreto)

5. **Menu Items:**
   - ✅ Padding: `8px 10px` → `10px 12px`
   - ✅ BorderRadius: `8px` → `12px`

6. **Ícone de Câmera:**
   - ✅ BoxShadow elevado: `0 2px 8px rgba(0,0,0,0.1)`
   - ✅ Hover adiciona elevação: `0 4px 12px rgba(0,0,0,0.15)`

### Page Layout

**Arquivo:** `src/components/Page/index.tsx`

#### Mudanças Aplicadas:

1. **Centralização com Max-Width:**
   ```jsx
   maxW="100%"
   p={{ base: fullScreenOnMobile ? '0' : '1.5rem 1rem', lg: '1.5rem 2rem' }}
   ```

2. **Espaçamento Consistente:**
   - ✅ Mobile: `1.5rem 1rem` (24px top/bottom, 16px sides)
   - ✅ Desktop: `1.5rem 2rem` (24px top/bottom, 32px sides)
   - ✅ Gap entre Navbar e conteúdo: padronizado em `1.5rem`

### Blockly Layout

**Arquivo:** `src/styles/layout.css`

#### Mudanças Aplicadas:

1. **Container:**
   - ✅ Adicionado `border-radius: 16px`
   - ✅ Adicionado `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`

2. **Injection Container:**
   - ✅ BorderRadius: `border-radius: 16px 0 0 16px` (arredonda left, reto no right)
   - ✅ BoxShadow inset: `inset 0 2px 4px rgba(0, 0, 0, 0.05)`

---

## 5. 📜 Scrollbars - Discreto e Suave

### Estilo Aplicado

**Arquivo:** `src/styles/globals.css`

```css
*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: #d0d5dd;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

*::-webkit-scrollbar-thumb:hover {
  background: #a3a9b3;
}
```

### Características:

- ✅ Largura: `6px` (fino e discreto)
- ✅ BorderRadius: `12px` (suave)
- ✅ Cor padrão: `#d0d5dd` (cinza claro)
- ✅ Cor hover: `#a3a9b3` (cinza médio)
- ✅ Track: Transparente (não polui visual)
- ✅ Transição suave ao hover

---

## 6. 🌍 Design System Global

**Arquivo:** `src/styles/design-system.css` (novo)

### Recursos Inclusos:

1. **Elevação (Shadows):** `.shadow-soft`, `.elevation-1/2/3/4`
2. **Border Radius:** `.radius-sm/md/lg/xl/2xl/full`
3. **Cards:** `.card`, `.card-subtle` com hover interativo
4. **Botões:** `.btn-primary`, `.btn-secondary` com transições
5. **Inputs:** Estilo consistente com focus states
6. **Navegação:** `.nav-item`, `.menu-item` com hover/active
7. **Modais:** `.modal`, `.modal-overlay` com backdrop blur
8. **Badges:** `.badge-primary/success/warning/error`
9. **Ícones:** `.icon`, `.icon-button` com hover
10. **Tooltips:** Estilo padronizado
11. **Utilities:** Spacing utilities (`p-xs`, `m-md`, `gap-lg`, etc.)
12. **Dark Mode:** Suporte para tema escuro

---

## 7. 📊 Tailwind Config

**Arquivo:** `tailwind.config.js`

### Adições:

```javascript
spacing: {
  'xs': '0.25rem',  // 4px
  'sm': '0.5rem',   // 8px
  'md': '1rem',     // 16px
  'lg': '1.5rem',   // 24px
  'xl': '2rem',     // 32px
  '2xl': '3rem',    // 48px
}

borderRadius: {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  'full': '9999px',
}

boxShadow: {
  'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  'elevation': '0 8px 16px rgba(0, 0, 0, 0.08)',
  'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
}
```

---

## 8. 📁 Global.ts - Variáveis Padronizadas

**Arquivo:** `src/styles/global.ts`

### Novos Exports:

```typescript
export const spacing = { xs, sm, md, lg, xl, '2xl', '3xl' }
export const borderRadius = { xs, sm, md, lg, xl, '2xl', 'full' }
export const shadows = { xs, sm, md, lg, xl, elevation, soft }
export const dimensions = { 
  header, 
  navbar, 
  container,
  contentGap
}
```

---

## 9. ✅ Checklist de Implementação

- ✅ Spacing System (múltiplos de 8px)
- ✅ Border Radius suave e orgânico (16px, 24px, 32px)
- ✅ Box-Shadow elegante em lugar de bordas sólidas
- ✅ Navbar com sombra 0.08 opacity e top-right arredondado
- ✅ Navbar sem border-bottom-right-radius (reto na base)
- ✅ Ícones alinhados e consistentes
- ✅ Scrollbars finas, discretas e suaves
- ✅ Centralização de conteúdo com padding consistente
- ✅ Design System global criado e importado
- ✅ Tailwind Config atualizado
- ✅ Global.ts com variáveis padronizadas

---

## 10. 🚀 Como Usar

### Spacing
```html
<!-- Tailwind -->
<div class="p-md m-lg gap-xl"></div>

<!-- Chakra UI (continuará funcionando) -->
<Flex p="1rem" m="1.5rem" gap="2rem"></Flex>
```

### Border Radius
```html
<div class="rounded-lg"></div> <!-- 16px -->
<div class="rounded-xl"></div> <!-- 24px -->
<div class="rounded-2xl"></div> <!-- 32px -->
```

### Shadows
```html
<div class="shadow-md"></div> <!-- Padrão -->
<div class="shadow-lg"></div> <!-- Destaque -->
<div class="elevation-4"></div> <!-- Elevação máxima -->
```

### Componentes
```html
<div class="card"></div> <!-- Card com hover -->
<button class="btn-primary"></button>
<input class="radius-lg"> <!-- Input arredondado -->
```

---

## 11. 📝 Notas Importantes

1. **Chakra UI Integration:** Todas as mudanças são compatíveis com Chakra UI
2. **Backwards Compatibility:** Classes antigas ainda funcionam onde não foram alteradas
3. **Performance:** Scrollbars otimizadas não impactam performance
4. **Responsividade:** Sistema mantém breakpoints originais
5. **Dark Mode:** Design System inclui suporte completo

---

## 12. 🔍 Próximos Passos (Opcional)

1. Aplicar `.card` class a componentes Card existentes
2. Migrar inputs para usar classes de estilo
3. Refatorar Modais com novo design
4. Aplicar theme provider para cores dinâmicas
5. Testes de acessibilidade com novo design

---

**Data de Refatoração:** 2024-12-15
**Status:** ✅ Completo
**Versão:** 1.0
