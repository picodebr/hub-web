import { compileCode } from '../services/code/compile';

/**
 * CompilerService - Interface com o Servidor de Compilação.
 *
 * Este serviço é responsável por enviar o código C++ gerado para um compilador
 * remoto (via API segura no servidor) e retornar o arquivo binário (.hex)
 * necessário para gravar na placa Arduino. Ele gerencia timeouts e erros de compilação.
 */
export interface CompileResponse {
  success: boolean;
  hex: string;
  logs: string;
}

export const CompilerService = {
  compile: async (code: string): Promise<CompileResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

    try {
      // const response = await fetch("/api/compile", {
      //     method: "POST",
      //     headers: {
      //         "Content-Type": "application/json"
      //     },
      //     body: JSON.stringify({ code }),
      //     signal: controller.signal
      // });

      const response = await compileCode(JSON.stringify({ code }));

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Erro no Servidor de Compilação, tente novamente mais tarde.');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const res = await response.json();

      // Lidar com possíveis erros retornados pelo proxy
      if (res.error) {
        throw new Error(res.error);
      }

      // Normalizar a resposta (a api externa as vezes retorna sucess com erro de digitação)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isSuccess = res.success || (res as any).sucess;

      if (!isSuccess) {
        // Formato legado: COMPILATION_ERROR|LOGS
        throw new Error('COMPILATION_ERROR|' + (res.logs || 'Erro desconhecido na compilação.'));
      }

      return {
        success: true,
        hex: res.hex,
        logs: res.logs,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // Se for erro de timeout do fetch
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Servidor Offline ou Erro de Conexão');
      }

      // Se for erro de conexão (API desligada/offline)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Servidor Offline ou Erro de Conexão');
      }

      throw error;
    }
  },
};
