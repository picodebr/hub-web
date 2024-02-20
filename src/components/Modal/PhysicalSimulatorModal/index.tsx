import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import { LoadingPhysicalSimulator } from '../../LoadingPhysicalSimulator';
import { IPhysicalSimulatorModalProps } from './interfaces';

import { Container, BackgroundMask, Content, IFrame, CloseButton, CloseIcon } from './styles';
import { getOriginFromUrl } from '@/_base/utils';

const _PhysicalSimulatorModal: React.FC<IPhysicalSimulatorModalProps> = ({ show, loadingProgress, iframeRef, iframeUrl, onClose, onLoad }) => {
  const backgroundMaskRef = useRef<HTMLDivElement>(null);

  const [renderIframe, setRenderIframe] = useState(false);

  useEffect(() => {
    if (!show) return;

    setRenderIframe(true);
  }, [show]);

  useEffect(() => {
    const ref = backgroundMaskRef.current;
    if (!ref) return () => ({});

    const handleMaskClick = (e: Event) => {
      if (e.target !== ref) return;

      e.stopPropagation();
      onClose(false);
    };

    ref.addEventListener('mousedown', handleMaskClick);
    ref.addEventListener('touchstart', handleMaskClick);

    return () => {
      ref.removeEventListener('mousedown', handleMaskClick);
      ref.removeEventListener('touchstart', handleMaskClick);
    };
  }, [onClose]);

  const physicalSimulatorOrigin = useMemo(() => getOriginFromUrl(iframeUrl), [iframeUrl]);

  return (
    <Container data-show={show}>
      <BackgroundMask ref={backgroundMaskRef}>
        <Content>
          <CloseButton onClick={() => onClose(false)}>
            <CloseIcon>
              <BsArrowLeft />
            </CloseIcon>
            Voltar
          </CloseButton>

          {renderIframe && <IFrame ref={iframeRef} src={iframeUrl} onLoad={onLoad} allow={`camera ${physicalSimulatorOrigin}`} />}

          <LoadingPhysicalSimulator progress={loadingProgress} afterLoadDelay={2_000} />
        </Content>
      </BackgroundMask>
    </Container>
  );
};

export const PhysicalSimulatorModal = memo(_PhysicalSimulatorModal);
