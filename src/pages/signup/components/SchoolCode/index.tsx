import { Flex, Text } from '@chakra-ui/react';
import { Select } from 'antd';
import { FiChevronLeft } from 'react-icons/fi';
import { Dispatch, SetStateAction } from 'react';

import { InputValueType } from '@/_base/interfaces/shared';
import IRegisterUser from '@/_base/interfaces/user/IRegisterUser';
import { GenericButton } from '@/components/Buttons/Generic';
import { SignUpPageStepsType } from '../../interfaces';

interface IProps {
  primaryCode: InputValueType<string>;
  onInputChange: (field: keyof IRegisterUser, value: any) => void;
  availableSchools: Array<{ value: string; label: string }>;
  setStep: Dispatch<SetStateAction<SignUpPageStepsType>>;
}

export const SchoolCodeStep: React.FC<IProps> = ({ onInputChange, primaryCode, availableSchools, setStep }) => {
  return (
    <Flex direction="column" h="100%" justify="space-between" align="center" gap="2rem">
      <Flex padding="12px 0 0 0" width="100%" color="gray300" pt="1.5rem" gap="8px" cursor="pointer" onClick={() => setStep('USER_TYPE')}>
        <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
        <Text textAlign="left">Voltar</Text>
      </Flex>
      <Flex direction="column" width="100%" gap="16px" flex="1">
        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Quais são suas escolas?
          </Text>
          <Text color="gray500">Selecione as escolas da rede de ensino</Text>
        </Flex>
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%', fontSize: `16px`, fontWeight: `500` }}
          placeholder="Selecione as escolas"
          onChange={(e) => onInputChange(`school_codes`, e)}
          options={availableSchools}
        />
      </Flex>

      <GenericButton label="Avançar" onClick={() => setStep('FORM')} marginTop="8px" w="100%" isDisabled={!primaryCode.valid} />
    </Flex>
  );
};
