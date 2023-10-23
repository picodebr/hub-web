import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  PinInput,
  PinInputField,
  PinInputProps,
  Text,
  Textarea,
  TextareaProps,
  Tooltip,
} from '@chakra-ui/react';
import React, { forwardRef } from 'react';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form/dist/types';

interface IAppInput {
  label?: any;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  mask?: string;
  w?: number | string;
  description?: string;
  hideError?: boolean;
}

interface IAppInputSpecs {
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  help?: string;
}

interface IAppPin {
  digits: number;
}

const baseColor = 'gray.500';
const errorColor = '#BA1B1B';
const placeholderColor = '#AAA4B8';
const borderColor = '#6D23F8';

export const AppInput = forwardRef(
  (
    { label, error, mask, w, description, leftElement, rightElement, help, hideError, ...otherProps }: Merge<IAppInput, IAppInputSpecs> & InputProps,
    ref,
  ) => (
    <Flex w={w ? w : '100%'} flexDirection="column" color={baseColor} gap={1} position="relative">
      {label ? <Text fontSize="14px">{label}</Text> : null}
      <InputGroup>
        {leftElement ? <InputLeftElement width="3.5rem">{leftElement}</InputLeftElement> : null}
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          type="text"
          borderColor={baseColor}
          color={baseColor}
          isInvalid={error ? true : false}
          errorBorderColor={errorColor}
          fontSize="14px"
          bg="white"
          _placeholder={{
            color: placeholderColor,
            opacity: 0.5,
            fontSize: '14px',
          }}
          _focus={{ borderColor, outline: 'none' }}
          _focusVisible={{ outline: 'none' }}
          {...Object.assign(otherProps, { mask })}
        />
        {rightElement ? <InputRightElement width="3.5rem">{rightElement}</InputRightElement> : null}
        {help ? (
          <InputRightElement width="3.5rem">
            <Tooltip label={help}>{/* <InfoIcon /> */}</Tooltip>
          </InputRightElement>
        ) : null}
      </InputGroup>
      {error && !hideError ? (
        <Text fontSize={12} color={errorColor}>
          {error.message as string}
        </Text>
      ) : null}
      {description ? (
        <Text paddingX={2} fontSize="13px" opacity={0.5}>
          {description}
        </Text>
      ) : null}
    </Flex>
  ),
);

export const AppTextArea = forwardRef(
  ({ label, error, mask, w, description, leftElement, rightElement, help, ...otherProps }: Merge<IAppInput, IAppInputSpecs> & TextareaProps, ref) => (
    <Flex w={w ? w : '100%'} flexDirection="column" color={baseColor} gap={1} position="relative">
      {label ? (
        <Text color="black" fontSize="14px">
          {label}
        </Text>
      ) : null}
      <Textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        type="text"
        borderColor={baseColor}
        resize="vertical"
        color={baseColor}
        isInvalid={error ? true : false}
        errorBorderColor={errorColor}
        fontSize="14px"
        bg="white"
        _placeholder={{
          color: placeholderColor,
          opacity: 0.5,
          fontSize: '14px',
        }}
        _focus={{ borderColor, outline: 'none' }}
        _focusVisible={{ outline: 'none' }}
        {...Object.assign(otherProps, { mask })}
      />
      {error ? (
        <Text fontSize={12} color={errorColor}>
          {error.message as string}
        </Text>
      ) : null}
      {description ? (
        <Text paddingX={2} fontSize="13px" opacity={0.5}>
          {description}
        </Text>
      ) : null}
    </Flex>
  ),
);

export const AppPassword = forwardRef(({ label, error, mask, w, description, ...otherProps }: IAppInput & InputProps, ref) => {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  return (
    <Flex w={w ? w : '100%'} flexDirection="column" color={baseColor} gap={1} position="relative">
      {label ? (
        <Text color="black" fontSize="14px">
          {label}
        </Text>
      ) : null}
      <InputGroup>
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          type={show ? 'text' : 'password'}
          borderColor={baseColor}
          color={baseColor}
          isInvalid={error ? true : false}
          errorBorderColor={errorColor}
          fontSize="14px"
          bg="white"
          _placeholder={{ color: placeholderColor, opacity: 0.5 }}
          _focus={{ borderColor }}
          _focusVisible={{ outline: 'none' }}
          {...Object.assign(otherProps, { mask })}
        />
        <InputRightElement width="3.5rem" h="100%" margin="auto">
          {/* {show ? (
            <VisibleIcon _hover={{ cursor: 'pointer' }} onClick={handleClick} />
          ) : (
            <NonVisibleIcon _hover={{ cursor: 'pointer' }} onClick={handleClick} />
          )} */}
        </InputRightElement>
      </InputGroup>
      {error ? (
        <Text fontSize={12} color={errorColor}>
          {error.message as string}
        </Text>
      ) : null}
      {description ? (
        <Text paddingX={2} fontSize="13px" opacity={0.5}>
          {description}
        </Text>
      ) : null}
    </Flex>
  );
});

export const AppPin = forwardRef(({ digits, ...otherProps }: IAppPin & Omit<PinInputProps, 'children'>, ref) => {
  const allItems: any[] = [];
  for (let i = 0; i < digits; i++) {
    allItems.push(
      <PinInputField
        key={i}
        borderColor={baseColor}
        color={baseColor}
        _placeholder={{ color: placeholderColor, opacity: 0.2 }}
        _focus={{ borderColor }}
        bg="white"
        _focusVisible={{ outline: 'none' }}
        h={14}
        fontSize={26}
      />,
    );
  }

  return <PinInput {...otherProps}>{allItems}</PinInput>;
});
