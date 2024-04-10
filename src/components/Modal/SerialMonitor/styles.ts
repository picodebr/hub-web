import { darken } from 'polished';
import styled from 'styled-components';

interface IComponentProps {
  opened?: boolean;
}

interface IBaudItemProps {
  selected: boolean;
}

export const Wrapper = styled.div<IComponentProps>`
  --translateX: ${(props) => (props.opened ? '0' : '100vw')};

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  pointer-events: ${(props) => (props.opened ? 'default' : 'none')};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  background-color: ${(props) => (props.opened ? '#00000044' : '')};
`;

export const Container = styled.div`
  --headerHeight: 5rem;

  width: 25rem;
  height: 100%;
  max-height: 765px;
  padding: 0.25rem 0.5rem;
  height: 100%;

  background-color: ${(props) => props.theme.colors.serialMonitorBackground};
  border-radius: 0.25rem;
  color: ${(props) => props.theme.colors.text};
  transition: all 0.5s;
  transform: translateX(var(--translateX));
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.serialMonitorBorder};

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    height: calc(100% - ${(props) => props.theme.dimensions.mobileHeader}px);
    margin-top: ${(props) => props.theme.dimensions.mobileHeader}px;
    width: 20rem;
  }
`;

export const HeaderWrapper = styled.div`
  height: var(--headerHeight);
  width: 100%;
  display: flex;
  flex-direction: column;

  border-bottom: 1px solid ${(props) => props.theme.colors.serialMonitorBorder};
`;

const HeaderContent = styled.div`
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderTopContent = styled(HeaderContent)``;

export const HeaderBottomContent = styled(HeaderContent)``;

export const BaudOptions = styled.div<IComponentProps>`
  --translate: ${(props) => (props.opened ? '0' : '-100%')};
  --opacity: ${(props) => (props.opened ? '1' : '0')};
  --optionsHeight: ${(props) => (props.opened ? '20rem' : '1px')};

  position: absolute;
  top: var(--actionButtonHeight);
  background-color: ${(props) => props.theme.colors.serialMonitorActionButton};
  z-index: -1;
  border-radius: 0 0 0.25rem 0.25rem;
  padding: 0.25rem;
  width: 100%;
  height: var(--optionsHeight);
  overflow-y: auto;

  transition: height 0.2s;
  /* transform: translateY(var(--translate)); */
  opacity: var(--opacity);

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    --optionsHeight: ${(props) => (props.opened ? '15rem' : '1px')};
  }
`;

export const BaudItem = styled.div<IBaudItemProps>`
  --selectedColor: ${(props) => darken(0.2, props.theme.colors.serialMonitorActionButton)};
  padding: 0.125rem 0.25rem;

  background-color: ${(props) => (props.selected ? 'var(--selectedColor)' : props.theme.colors.serialMonitorActionButton)};

  &:hover {
    background-color: var(--selectedColor);
  }
`;

export const ActionButton = styled.div<IComponentProps>`
  --actionButtonHeight: 1.75rem;
  --rotateArrow: ${(props) => (props.opened ? '180deg' : '0')};

  height: var(--actionButtonHeight);
  display: flex;
  column-gap: 0.15rem;
  align-items: center;
  justify-content: center;
  font-size: 0.825rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.2rem;
  background-color: ${(props) => props.theme.colors.serialMonitorActionButton};

  cursor: pointer;
  user-select: none;
  position: relative;

  &:hover {
    background-color: ${(props) => darken(0.1, props.theme.colors.serialMonitorActionButton)};
  }

  &[data-type='disconnect'] {
    svg {
      font-size: 1.125rem;
    }
  }

  &[data-type='remove'] {
    svg {
      padding-left: 0.125rem;
      font-size: 0.9rem;
    }
  }

  &[data-type='select'] {
    z-index: 2;
    background-color: ${(props) => props.theme.colors.serialMonitorActionButton};

    border-radius: ${(props) => (props.opened ? '0.2rem 0.2rem 0 0' : '0.2rem')};

    svg {
      font-size: 0.925rem;
      transition: transform 0.2s;
      transform: rotate(var(--rotateArrow));
    }
  }
`;

export const LogList = styled.div`
  --listMarginTop: 0.5rem;
  --discount: calc(var(--headerHeight) + var(--listMarginTop));

  height: calc(100% - var(--discount));
  margin-top: var(--listMarginTop);
  display: flex;
  flex-direction: column;
  row-gap: 0.5rem;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
`;

export const LogItem = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
`;

export const LogText = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  border-radius: 0.2rem;
  background-color: ${(props) => props.theme.colors.serialMonitorLogBackground};
`;

export const LogDate = styled.div`
  width: fit-content;
  font-size: 0.75rem;
  margin-left: 0.3rem;
`;
