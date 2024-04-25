import React, { useEffect, useState } from 'react';
import { ILoadingPhysicalSimulator } from './interfaces';

import { Content, Container, ImageContainer, ProgressWrapper, ProgressBarContainer, ProgressBar, ProgressNumber } from './styles';

export const LoadingPhysicalSimulator: React.FC<ILoadingPhysicalSimulator> = ({ progress, afterLoadDelay }) => {
  const [show, setShow] = useState(progress < 1);

  const formattedProgress = Math.round((Math.min(Math.max(progress, 0), 1) || 0) * 100);

  useEffect(() => {
    if (progress !== 1) return () => ({});

    const desc = setTimeout(() => {
      setShow(false);
    }, afterLoadDelay);

    return () => clearTimeout(desc);
  }, [afterLoadDelay, progress]);

  return (
    <Container data-show={show}>
      <Content>
        <ImageContainer src="/loading/rocket-picode.gif" />

        <ProgressWrapper>
          <ProgressBarContainer>
            <ProgressBar progress={formattedProgress} />
          </ProgressBarContainer>
          <ProgressNumber>{formattedProgress}%</ProgressNumber>
        </ProgressWrapper>
      </Content>
    </Container>
  );
};
