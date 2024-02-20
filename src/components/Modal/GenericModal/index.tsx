import React, { useRef } from 'react';

import { AiFillCloseSquare } from 'react-icons/ai';

import {
  Container,
  Content,
  Footer,
  ConfirmButton,
  ContentWrapper,
  Header,
  Icon,
  CancelButton,
} from './styles';

import { IGenericModalProps } from './interfaces';

export const GenericModal: React.FC<IGenericModalProps> = ({
  show,
  onClose,
  children,
  title,
  confirmButtonTitle,
  onSave,
  cancelButtonTitle,
  buttonDisabled,
  ...rest
}) => {
  const containerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

  const handleContainerMouseDown: React.MouseEventHandler<
    HTMLDivElement
  > = e => {
    if (e.target === containerRef.current) onClose();
  };

  const handleContainerTouchStart: React.TouchEventHandler<
    HTMLDivElement
  > = e => {
    if (e.target === containerRef.current) onClose();
  };

  return (
    <Container
      {...rest}
      onMouseDown={handleContainerMouseDown}
      onTouchStart={handleContainerTouchStart}
      ref={containerRef}
      data-show={show}
    >
      <ContentWrapper>
        <Header>
          {title}{' '}
          <Icon onClick={() => onClose()}>
            <AiFillCloseSquare />
          </Icon>
        </Header>
        <Content>{children}</Content>
        <Footer>
          {cancelButtonTitle && (
            <CancelButton onClick={() => onClose()}>
              {cancelButtonTitle}
            </CancelButton>
          )}
          <ConfirmButton
            onClick={() => onSave && onSave()}
            data-disabled={buttonDisabled}
          >
            {confirmButtonTitle || 'OK'}
          </ConfirmButton>
        </Footer>
      </ContentWrapper>
    </Container>
  );
};
