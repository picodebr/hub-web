import styled from 'styled-components';

interface IContainerProps {
  backgroundColor?: string;
}

export const Container = styled.div<IContainerProps>`
  --primary-color: ${(props) => props.theme.colors.primary};
  --secondary-color: ${(props) => props.theme.colors.pageBackground};
  --border-color: ${(props) => props.theme.colors.inputBorder};
  --border-width: 1px;
  --value-container-padding: 0 0.25rem;
  --control-min-height: initial;
  --background-color: ${(props) => props.backgroundColor || props.theme.colors.cardBackground};

  width: 100%;
  position: relative;
`;

export const Title = styled.span`
  font-weight: 500;
  background-color: var(--background-color);
  color: ${(props) => props.theme.colors.text};
`;

export const StyledSelect = {
  indicatorSeparator: () => ({
    display: 'none',
  }),

  clearIndicator: (provided: any) => ({
    ...provided,
    color: 'var(--secondary-color)',
  }),

  indicatorsContainer: (provided: any) => ({
    ...provided,
    background: 'var(--primary-color)',
    width: 'auto',
    height: 'auto',
    justifyContent: 'center',
    top: '10px',
    right: '5px',
    borderRadius: '0 0.35rem 0.35rem 0',
  }),

  multiValue: (provided: any) => ({
    ...provided,
    display: 'flex',
    backgroundColor: 'var(--primary-color)',
    color: 'var(--secondary-color)',
    borderRadius: '0.35rem ',
    paddingLeft: '0.5rem',
  }),

  multiValueLabel: (provided: any) => ({
    ...provided,
    color: 'var(--secondary-color)',
  }),

  multiValueRemove: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--primary-color)',
    color: 'var(--secondary-color)',
    borderRadius: '0 0.35rem 0.35rem 0',
  }),

  valueContainer: (provided: any) => ({
    ...provided,
    padding: 'var(--value-container-padding)',
  }),

  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: 'var(--secondary-color)',
  }),

  singleValue: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--primary-color)',
    color: 'var(--secondary-color)',
    padding: '0 1rem',
    width: 'fit-content',
    borderRadius: '0.5rem',
  }),

  menu: (provided: any) => ({
    ...provided,
    display: 'flex',
    flexDirection: 'column',
    color: 'var(--primary-color)',
    height: '8rem',
    width: '100%',
    zIndex: '9999',
  }),

  control: (provided: any) => ({
    ...provided,
    border: 'var(--border-width) solid var(--border-color)',
    borderRadius: '0.5rem',
    minHeight: 'var(--control-min-height)',
    backgroundColor: 'var(--background-color)',
  }),
};

export const Error = styled.div`
  color: ${(props) => props.theme.colors.caution};
  display: flex;
  align-items: center;
  font-size: 14px;

  #icon {
    margin: 0 0.25rem;
  }
`;
