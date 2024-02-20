import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LearnBotSimulator } from '../LearnBotSimulator';
import { ILearnBotSimulatorState } from '../LearnBotSimulator/interfaces';
import { ISimulatorProps } from './interfaces';
import { isIframeOriginAllowed } from './util/isIframeOriginAllowed';
import { useThrottle } from '@/_base/hooks';
import { IProjectSourceCode } from '@/_base/interfaces/codeProject/IProject';
import { PhysicalSimulatorModal } from '../Modal/PhysicalSimulatorModal';

const IFRAME_MESSAGE_THROTTLE_MS = 34;

export const Simulator: React.FC<ISimulatorProps> = ({ showModal, codeHandlerRef, sourceCodeRef, iframeUrl, onCloseModal, onSourceCodeChange }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const simulator = useMemo(() => new LearnBotSimulator(sourceCodeRef.current?.simulation_elements_layout || []), [sourceCodeRef]);
  const [simulationStatus, setSimulationStatus] = useState(() => simulator.getState().simulation.status);
  const [loadingProgress, setLoadingProgress] = useState(() => simulator.getState().simulation.loading);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!isIframeOriginAllowed(e.origin, iframeUrl)) return;

      const parsedData = JSON.parse(e.data);

      // eslint-disable-next-line no-console
      console.log('[SIMULATOR] << From iframe:', parsedData);

      simulator.setState(parsedData);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [iframeUrl, simulator]);

  useEffect(() => {
    (codeHandlerRef as any).current = (codeString: string) => {
      setCode(codeString);
    };
  }, [codeHandlerRef]);

  const sendMessageToIframe = useThrottle(
    (message, label) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow) return;

      const stringifiedMessage = JSON.stringify(message);

      // eslint-disable-next-line no-console
      console.log(label, JSON.parse(stringifiedMessage));

      iframeWindow.postMessage(stringifiedMessage, { targetOrigin: '*' });
    },
    [iframeRef],
    IFRAME_MESSAGE_THROTTLE_MS,
  );

  useEffect(() => {
    const handleStateChange = (state: ILearnBotSimulatorState) => {
      setLoadingProgress(state.simulation.loading);
      setSimulationStatus(state.simulation.status);
      setError(state.simulation.error);

      onSourceCodeChange({
        ...(sourceCodeRef.current as IProjectSourceCode),
        simulation_elements_layout: simulator.getElementsLayout(),
      });

      sendMessageToIframe(state, '[SIMULATOR] To iframe >>');
    };

    simulator.addListener('statechange', handleStateChange);

    return () => {
      simulator.removeListener('statechange', handleStateChange);
    };
  }, [sourceCodeRef, simulator, sendMessageToIframe, onSourceCodeChange]);

  useEffect(() => {
    (window as any).simulator = simulator;

    if (simulationStatus !== 'running') return;

    simulator.start(code);
  }, [code, simulationStatus, simulator]);

  useEffect(() => {
    !showModal && simulator.stop();
  }, [showModal, simulator]);

  const handleIframeLoad = useCallback(
    (event?: any) => {
      const state = simulator.getState();
      const reason = event !== undefined ? 'onload' : 'timeout';

      sendMessageToIframe(state, `[SIMULATOR] Sending initial state by "${reason}" >>`);
    },
    [simulator, sendMessageToIframe],
  );

  useEffect(() => {
    if (loadingProgress === 1 || error) return () => ({});

    const desc = setInterval(handleIframeLoad, 1_000);

    return () => desc && clearInterval(desc);
  }, [loadingProgress, error, handleIframeLoad]);

  return (
    <PhysicalSimulatorModal
      show={showModal}
      iframeRef={iframeRef}
      iframeUrl={iframeUrl}
      loadingProgress={loadingProgress}
      onClose={onCloseModal}
      onLoad={handleIframeLoad}
    />
  );
};
