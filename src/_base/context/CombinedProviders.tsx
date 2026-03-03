/**
 * CombinedProviders - Wrapper que combina todos os provedores de contexto.
 *
 * Centraliza os contextos (Serial, Projeto, Stage) em um único componente para
 * evitar o "nesting hell" (aninhamento excessivo) no layout principal da aplicação.
 * A ordem dos provedores importa caso um dependa do outro.
 */

'use client';

import React, { ReactNode } from 'react';
import { SerialProvider } from './SerialContext';
import { ProjectProvider } from './ProjectContext';
import { StageProvider } from './StageContext';

export function CombinedProviders({ children }: { children: ReactNode }) {
  return (
    <SerialProvider>
      <ProjectProvider>
        <StageProvider>{children}</StageProvider>
      </ProjectProvider>
    </SerialProvider>
  );
}
