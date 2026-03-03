/**
 * Componente RocketLoader - Animação de carregamento visual (Foguete).
 * 
 * Este componente é exibido durante o processo de upload do código para a placa.
 * Ele fornece feedback visual sobre o progresso e o resultado da operação.
 */

'use client';

import { useState, useEffect } from 'react';

interface RocketLoaderProps {
    isVisible: boolean; // Controla se o overlay está visível
    phase: 'ready' | 'compiling' | 'flying' | 'success' | 'failure' | ''; // Fase atual do upload
    errorMessage?: string; // Mensagem de erro personalizada
}

export default function RocketLoader({ isVisible, phase, errorMessage }: RocketLoaderProps) {
    const [countdown, setCountdown] = useState(4);

    // Reset do contador sempre que a fase muda ou se torna visível
    useEffect(() => {
        if (isVisible && phase === 'failure') {
            setCountdown(3);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isVisible, phase]);

    return (
        /* O ID e as classes CSS controlam a animação via estilos (provavelmente em index.css ou similar) */
        <div id="loader-rocket" className={`phase-${phase} ${isVisible ? 'visible' : ''}`}>

            {/* Cenário Espacial */}
            <div className="scene-container">
                {/* Contêiner do Foguete */}
                <div className="rocket-container">
                    <img src="/img/logoPi.png" className="rocket-icon" alt="Pico Logo" />
                    {/* Efeito de fumaça/fogo do foguete */}
                    <div className="rocket-fumes">
                        <span></span><span></span><span></span><span></span>
                    </div>
                </div>
            </div>

            {/* Interface de Texto e Feedback do Usuário */}
            <div className="loader-ui text-center">

                {/* Mensagens de Preparação e Voo */}
                {(phase === 'ready' || phase === 'compiling' || phase === 'flying') && (
                    <h4 className="loading-text text-white fw-bold">
                        {phase === 'ready' ? 'Preparando...' : (phase === 'compiling' ? 'Compilando...' : 'Carregando...')}
                    </h4>
                )}

                {/* Mensagem de Sucesso */}
                {phase === 'success' && (
                    <div className="success-message">
                        <h2 className="text-white fw-bold mb-3">Upload Concluído!</h2>
                        <div className="text-white-50 mb-4 small">O código está rodando na placa.</div>
                    </div>
                )}

                {/* Mensagem de Erro (Falha) */}
                {phase === 'failure' && (
                    <div className="failure-message text-white">
                        <h2 className="fw-bold mb-3">Falha no Upload</h2>
                        <div className="error-detail-box">
                            {errorMessage || 'Verifique a conexão ou o código.'}
                        </div>
                        {/* Indicador visual de fechamento automático */}
                        <div className="mt-4 d-flex align-items-center justify-content-center text-white-50">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            <span className="small">Fechando em {countdown}s...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
