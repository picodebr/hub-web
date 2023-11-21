import { Flex, Text } from '@chakra-ui/react';
import { DatePicker, DatePickerProps } from 'rsuite';

export const DateInput: React.FC<DatePickerProps & { error?: string; label?: string }> = ({ label, error, ...props }) => (
  <Flex direction="column">
    {!!label && (
      <Text color="gray700" fontSize="13.5px" fontWeight="500" pb="0.25rem">
        {label}
      </Text>
    )}
    <DatePicker
      {...(props as any)}
      style={{
        width: '100%',
        border: '1px solid #D0D5DD',
        borderRadius: '5px',
        padding: '3px',
        backgroundColor: '#FFFFFF !important',
      }}
      appearance="subtle"
    />
    {!!error && (
      <Flex align="center" gap="0.25rem" color="error500">
        <Text fontSize="12.5px">{error}</Text>
      </Flex>
    )}
  </Flex>
);
