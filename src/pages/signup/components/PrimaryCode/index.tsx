import { Flex, Text } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';
import { FiChevronLeft } from 'react-icons/fi';

import { GenericButton } from '@/components/Buttons/Generic';
import { CodeInput } from '@/components/Inputs/Code';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { SignUpPageStepsType } from '../../interfaces';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';
import { InputValueType } from '@/_base/interfaces/shared';
import { HubUserType, hubUserTypes } from '@/_base/interfaces/user';

interface IProps {
  primaryCode: InputValueType<string>;
  captcha: IReCAPTCHAData;
  userType?: HubUserType;
  setPrimaryCode: Dispatch<SetStateAction<InputValueType<string>>>;
  setCaptcha: Dispatch<SetStateAction<IReCAPTCHAData>>;
  setStep: Dispatch<SetStateAction<SignUpPageStepsType>>;
}

export const PrimaryCodeStep: React.FC<IProps> = ({ setPrimaryCode, primaryCode, captcha, userType, setCaptcha, setStep }) => {
  return (
    <Flex direction="column" h="100%" justify="space-between" align="center" gap="2rem">
      <Flex padding="12px 0 0 0" width="100%" color="gray300" pt="1.5rem" gap="8px" cursor="pointer" onClick={() => setStep('USER_TYPE')}>
        <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
        <Text textAlign="left">Voltar</Text>
      </Flex>
      <Flex direction="column" width="100%" align="center" gap="16px">
        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Informe o código de acesso
          </Text>
          {userType === `student` ? (
            <Text color="gray500">Informe o código da sua turma, que deve ser disponibilizado pelo seu professor.</Text>
          ) : (
            <Text color="gray500">Informe o código de acesso disponibilizado pela equipe PiCode.</Text>
          )}
        </Flex>
        <CodeInput
          onFill={(value) => setPrimaryCode((e) => ({ ...e, value }))}
          error={primaryCode.error}
          onChange={() => setPrimaryCode((e) => ({ ...e, error: '' }))}
        />
      </Flex>
      <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

      <GenericButton
        label="Avançar"
        onClick={() => setStep(userType === `student` ? 'FORM' : 'SCHOOL_CODE')}
        marginTop="8px"
        w="100%"
        isDisabled={!primaryCode.valid}
      />
    </Flex>
  );
};
