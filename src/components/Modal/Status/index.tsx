import React from 'react';

import { Container, Content, MessageContainer, MessageImage, MessageText } from './styles';

import { IStatusModalProps, statusModalContent } from './interfaces';

export const StatusModal: React.FC<IStatusModalProps> = ({ status }) => {
  const content = statusModalContent[status];
  const show = !!(content.message || content.imageUrl);

  return (
    <Container data-show={show}>
      <Content>
        <MessageContainer>
          {content.imageUrl && <MessageImage data-rotate={!!content.rotateImage} source={content.imageUrl} />}
          {content.message && <MessageText> {content.message} </MessageText>}
        </MessageContainer>
      </Content>
    </Container>
  );
};
