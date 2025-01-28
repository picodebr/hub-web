import { GenericButton } from '@/components/Buttons/Generic';
import { DateInput } from '@/components/Inputs/Date';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { Flex, Text } from '@chakra-ui/react';
import { MdMailOutline } from 'react-icons/md';
import { InputHandlerErrorType } from '@/_base/hooks/InputHandler/interfaces';
import IRegisterUser from '@/_base/interfaces/user/IRegisterUser';
import { Dispatch, SetStateAction } from 'react';
import { FiUser } from 'react-icons/fi';
import { formatDateInput } from '@/_base/utils';
import { generateUsername } from '@/_base/utils/usernameUtils';

interface IProps {
  isGoogleSignin: boolean;
  canSubmit: boolean;
  submitLoading: boolean;
  data: IRegisterUser;
  user?: IRegisterUser;
  errors: InputHandlerErrorType<IRegisterUser>;
  setPasswordIsValid: Dispatch<SetStateAction<boolean>>;
  onInputChange: (field: keyof IRegisterUser, value: any) => void;
  submit: (cb: (args?: any) => any) => void;
  handleRegisterUser: () => Promise<void>;
}

export const FormStep: React.FC<IProps> = ({
  data,
  errors,
  onInputChange,
  isGoogleSignin,
  setPasswordIsValid,
  submit,
  canSubmit,
  handleRegisterUser,
  submitLoading,
}) => {
  return (
    <Flex direction="column" h="100%" justify="space-between" align="center" gap="1.25rem" overflow="hidden">
      <Flex direction="column" gap="8px" marginTop="2rem">
        <Text fontWeight="600" fontSize="20px" color="gray900">
          Informe os seus dados
        </Text>
        <Text color="gray500">Faça o cadastro e desfrute de uma experiência completa</Text>
      </Flex>
      <Flex //Inputs
        direction="column"
        width="100%"
        gap="12px"
        overflow="hidden auto"
      >
        <TextInput
          label="Nome Completo"
          value={data.name}
          error={errors.name}
          isDisabled={isGoogleSignin}
          onInputChange={(value) => {
            onInputChange('name', value);
            const username = generateUsername(value);
            onInputChange('username', username);
          }}
        />
        <TextInput
          label="Nome de Usuário"
          value={data.username}
          placeholder=""
          error={errors.username}
          onInputChange={(value) => onInputChange('username', value)}
          leftElement={<FiUser />}
        />

        <TextInput
          label="E-mail (opcional para alunos)"
          value={data.email}
          isDisabled={isGoogleSignin}
          error={errors.email}
          onInputChange={(value) => onInputChange('email', value)}
          leftElement={<MdMailOutline />}
        />

        <DateInput
          label="Data de Nascimento"
          value={formatDateInput(data.birthdate)}
          error={errors.birthdate}
          onInputChange={(value) => onInputChange('birthdate', value ? new Date(value) : '')}
        />

        <PasswordInput
          label="Senha"
          error={errors.password}
          value={data?.password}
          onInputChange={(value) => onInputChange('password', value)}
          passStrong={2}
          onPassStrongReached={() => setPasswordIsValid(true)}
          onPassStrongUnreached={() => setPasswordIsValid(false)}
        />

        <PasswordInput
          label="Confirmar Senha"
          error={errors.password_confirmation}
          value={data?.password_confirmation}
          onInputChange={(v) => onInputChange('password_confirmation', v)}
        />
      </Flex>

      <GenericButton
        label="Cadastrar"
        onClick={() => submit(handleRegisterUser)}
        isLoading={submitLoading}
        marginTop="8px"
        w="100%"
        isDisabled={!canSubmit}
      />
    </Flex>
  );
};
