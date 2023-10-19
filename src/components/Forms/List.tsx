import { VisibleIcon as TrashIcon } from '@/icons/visibility'; // Change to trash icon
import { AddIcon } from '@chakra-ui/icons';
import { Flex, InputGroup, Text, Tooltip, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { AppInput } from './Input';

interface IListInputProps {
  label?: string;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  w?: number | string;
  onChange?: (l: string[]) => void;
  value?: string[];
  description?: string;
  help?: string;
}

export const ListInput = (props: IListInputProps) => {
  const intl = useIntl();
  const [allItems, setAllItems] = useState<string[]>([]);

  useEffect(() => {
    if (props.value) {
      if (props.value.length > 0) {
        setAllItems(props.value);
      } else {
        setAllItems(['']);
      }
    } else {
      setAllItems(['']);
    }
  }, [props.value]);

  const editLine = (v: string, pos: number) => {
    const cloneObj = [...allItems];
    cloneObj[pos] = v;
    setAllItems(cloneObj);

    if (props.onChange) {
      props.onChange(cloneObj);
    }
  };

  const addNewLine = () => {
    const cloneObj = [...allItems];
    cloneObj.push('');
    setAllItems(cloneObj);

    if (props.onChange) {
      props.onChange(cloneObj);
    }
  };

  const removeLine = (pos: number) => {
    const cloneObj = [...allItems];
    cloneObj.splice(pos, 1);

    if (cloneObj.length === 0) {
      cloneObj.push('');
    }

    setAllItems(cloneObj);
  };

  const baseColor = 'gray.500';
  const errorColor = '#BA1B1B';
  const placeholderColor = '#AAA4B8';
  const borderColor = '#6D23F8';

  return (
    <Flex w={props.w ? props.w : '100%'} flexDirection="column" color={baseColor} gap={1} position="relative">
      {props.label ? (
        <Text color="black" fontSize="14px">
          {props.label}
        </Text>
      ) : null}
      <InputGroup>
        <VStack w="100%">
          {allItems.map((x, k) => (
            <AppInput
              key={k}
              value={x}
              onChange={(e) => editLine(e.currentTarget.value, k)}
              leftElement={
                <Tooltip
                  label={intl.formatMessage({
                    defaultMessage: 'Remove item from list',
                  })}
                >
                  <TrashIcon cursor="pointer" onClick={() => removeLine(k)} />
                </Tooltip>
              }
              rightElement={
                <>
                  {allItems.length - 1 === k ? (
                    <Tooltip
                      label={intl.formatMessage({
                        defaultMessage: 'Add a new item to the list',
                      })}
                    >
                      <AddIcon cursor="pointer" onClick={addNewLine} />
                    </Tooltip>
                  ) : undefined}
                </>
              }
            />
          ))}
        </VStack>
      </InputGroup>
      {props.error ? (
        <Text fontSize={12} color={errorColor}>
          {props.error.message as string}
        </Text>
      ) : null}
      {props.description ? (
        <Text paddingX={2} fontSize="13px" opacity={0.5}>
          {props.description}
        </Text>
      ) : null}
    </Flex>
  );
};
