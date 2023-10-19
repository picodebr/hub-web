import { Flex, Text } from '@chakra-ui/react';
import { BsCalendarDateFill } from 'react-icons/bs';
import { DateRangePicker } from 'rsuite';

interface IProps {
  startTime: Date | null;
  endTime: Date | null;
  onChange: (data: [Date, Date]) => void;
  onClean: () => void;
  showLabel?: boolean;
}

export const TimeRangeInput: React.FC<IProps> = ({ startTime, endTime, onChange, onClean, showLabel = true }) => {
  return (
    <Flex direction="column" gap="0.5rem" w="100%" style={{ zIndex: '1000000000' }}>
      {showLabel && (
        <Flex color="text.black" fontSize="1.125rem" align="center" gap="0.5rem">
          <BsCalendarDateFill />
          <Text fontWeight="bold">Interval</Text>
        </Flex>
      )}
      <DateRangePicker
        size="lg"
        format="dd-MM-yyyy"
        placeholder="Choose a interval"
        value={[startTime, endTime] as any}
        onChange={onChange as any}
        onClean={onClean}
        style={{ zIndex: '1000000000' }}
      />
    </Flex>
  );
};
