/**
 * CombinedProviders - Wrapper que combina todos os provedores de contexto.
 *
 * Centraliza os contextos (Serial, Projeto, Stage) em um único componente para
 * evitar o "nesting hell" (aninhamento excessivo) no layout principal da aplicação.
 * A ordem dos provedores importa caso um dependa do outro.
 */

/**
 * Agregador central de todos os Context Providers da aplicação.
 */
import React, { ReactNode } from 'react';
import { SerialProvider } from './SerialContext';
import { ProjectProvider } from './ProjectContext';
import { UIProvider } from './UIContext';
import { FirmwareProvider } from './FirmwareContext';
import { RuntimeProvider } from './RuntimeContext';

export function CombinedProviders({ children }: { children: ReactNode }) {
  return (
    <SerialProvider>
      <UIProvider>
        <FirmwareProvider>
          <ProjectProvider>
            <RuntimeProvider>{children}</RuntimeProvider>
          </ProjectProvider>
        </FirmwareProvider>
      </UIProvider>
    </SerialProvider>
  );
}
