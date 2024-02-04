import {
  Button,
  Center,
  Flex,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SimpleGrid,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';

import { IColorPickerProps } from './interfaces';
import { isColorLight } from '@/_base/utils';

const DEFAULT_COLOR = '#718096';

export const ColorPicker: React.FC<IColorPickerProps> = ({
  onChange,
  label,
  hoverLabel,
  enableInput = true,
  color = DEFAULT_COLOR,
  wrapText = false,
}) => {
  const [selectedColor, setSelectedColor] = useState(color);

  const colors = [
    '',
    '#FFFFFF',
    '#cccccc',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#d63f47',
    '#FFCDD2',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#000000',
    '#212121',
    '#333333',
    '#4CAF50',
    '#009688',
    '#2196F3',
    '#03A9F4',
    '#795548',
    '#607D8B',
  ];

  const handleChangeColor = (hex: string) => {
    setSelectedColor(hex);
    onChange(hex);
  };

  return (
    <Flex direction="column" gap={1} align="center">
      {label && (
        <Text fontSize="14px" color="text.gray" textAlign="center" whiteSpace={wrapText ? 'normal' : 'nowrap'}>
          {label}
        </Text>
      )}
      <Flex h="fit-content" w="fit-content">
        <Popover variant="picker">
          <PopoverTrigger>
            <Flex align="center" justify="center" gap="0.5rem">
              <Tooltip label={hoverLabel}>
                <Button
                  aria-label={selectedColor}
                  background={selectedColor}
                  height="2rem"
                  width="2rem"
                  padding={0}
                  minWidth="unset"
                  border="1px"
                  borderColor="gray300"
                  borderRadius={3}
                >
                  {selectedColor ? '' : <IoMdClose fontSize="1.5rem" color="#db3f3f" />}
                </Button>
              </Tooltip>
            </Flex>
          </PopoverTrigger>
          <PopoverContent width="170px" borderColor="gray300">
            <PopoverArrow bg={selectedColor || '#000'} />
            <PopoverCloseButton color="white" />
            <PopoverHeader height="100px" backgroundColor={selectedColor || '#fff'} borderTopLeftRadius={5} borderTopRightRadius={5} color="white">
              <Center height="100%" color={!selectedColor || isColorLight(selectedColor) ? 'text.black' : 'text.white'}>
                {enableInput && (selectedColor || 'Empty')}
              </Center>
            </PopoverHeader>
            <PopoverBody height="fit-content" pb="1rem">
              <SimpleGrid columns={5} spacing={2}>
                {colors.map((c) => (
                  <Button
                    key={c}
                    aria-label={c}
                    background={c}
                    height="22px"
                    width="22px"
                    padding={0}
                    minWidth="unset"
                    border="1px"
                    borderColor="gray300"
                    borderRadius={3}
                    _hover={{ background: c }}
                    onClick={() => {
                      handleChangeColor(c);
                    }}
                  >
                    {c ? '' : <IoMdClose color="#db3f3f" />}
                  </Button>
                ))}
              </SimpleGrid>
              {enableInput && (
                <Input
                  borderRadius={3}
                  marginTop={3}
                  size="sm"
                  value={selectedColor || 'Empty'}
                  onChange={(e) => {
                    handleChangeColor(e.target.value);
                  }}
                />
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
    </Flex>
  );
};
