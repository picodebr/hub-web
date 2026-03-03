/**
 * BlockService - Serviço centralizado para gerenciamento de blocos Blockly e toolboxes.
 *
 * Este serviço é responsável por:
 * 1. Registrar as definições dos blocos no core do Blockly.
 * 2. Fornecer a configuração da interface (toolbox) dependendo do modo de uso (Palco vs Placa).
 */

import * as Blockly from 'blockly/core';
import { BlockStageDefinitions } from '../config/stage_blocks';
import { BlockBoardDefinitions } from '../config/board';
import { ToolboxDefinition } from '../config/toolbox';

export class BlockService {
  // Controla se os blocos já foram registrados para evitar duplicidade
  private static blocksRegistered = false;

  /**
   * Registra todas as definições de blocos no Blockly.
   * Deve ser chamado uma única vez durante a inicialização da aplicação.
   */
  public static registerAllBlocks(): void {
    if (this.blocksRegistered) {
      return;
    }

    try {
      // 1. Registra os blocos do modo "Stage" (Palco/Visual)
      // Estes blocos são usados para a lógica de animação e interação visual.
      BlockStageDefinitions.forEach((blockDef: any) => {
        if (!Blockly.Blocks[blockDef.type]) {
          Blockly.Blocks[blockDef.type] = {
            init: function () {
              this.jsonInit(blockDef);
            },
          };
        }
      });

      // 2. Registra os blocos do modo "Board" (Placa/Arduino)
      // Estes blocos são usados para gerar código C++ para o hardware.
      BlockBoardDefinitions.forEach((blockDef: any) => {
        if (!Blockly.Blocks[blockDef.type]) {
          Blockly.Blocks[blockDef.type] = {
            init: function () {
              this.jsonInit(blockDef);
            },
          };
        }
      });

      this.blocksRegistered = true;
    } catch (error) {
      console.error('[BlockService] Erro ao registrar blocos:', error);
      throw error;
    }
  }

  /**
   * Obtém a configuração da toolbox para o modo Stage.
   * Retorna a definição completa das categorias e blocos disponíveis no "Palco".
   */
  public static getStageToolbox(): any {
    // Importa a configuração do arquivo de toolbox centralizado
    return ToolboxDefinition;
  }

  /**
   * Obtém a configuração da toolbox para o modo Board (Placa).
   * Retorna os blocos específicos para programação de hardware/microcontrolador.
   */
  public static getBoardToolbox(): any {
    // return BoardToolboxDefinition;
    return undefined;
  }

  /**
   * Obtém a toolbox correta baseada no modo atual.
   * @param isUploadMode - True para modo Placa (Board), false para modo Palco (Stage).
   */
  public static getToolbox(isUploadMode: boolean): any {
    return isUploadMode ? this.getBoardToolbox() : this.getStageToolbox();
  }

  /**
   * Reseta o estado de registro.
   * Útil para testes automatizados ou recarregamento a quente (hot reload).
   */
  public static resetRegistration(): void {
    this.blocksRegistered = false;
  }
}

// Funções de conveniência exportadas para facilitar o uso em outros componentes
export const registerBlocks = () => BlockService.registerAllBlocks();
export const getToolbox = (isUploadMode: boolean) => BlockService.getToolbox(isUploadMode);
