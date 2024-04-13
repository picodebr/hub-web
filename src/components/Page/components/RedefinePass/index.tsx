import { Flex, Image, Modal, ModalContent, ModalHeader, ModalOverlay, Text, useToast } from '@chakra-ui/react';
import { IRedefinePassProps } from './interfaces';
import { useCallback, useMemo, useState } from 'react';
import { InputValueType } from '@/_base/interfaces/shared';
import { PasswordInput } from '@/components/Inputs/Password';
import { GenericButton } from '@/components/Buttons/Generic';
import { showErrorToClient } from '@/_base/utils';
import { redefinePassword } from '@/_base/services/user';

interface IRedefineData {
  password: InputValueType<string>;
  password_confirmation: InputValueType<string>;
}

export const RedefinePass: React.FC<IRedefinePassProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(!!user?.metadata?.redefine_password);
  const [redefineData, setRedefineData] = useState<IRedefineData>({ password: { value: '' }, password_confirmation: { value: '' } });
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const handleUpdatePassword = useCallback(async () => {
    if (!redefineData.password.value) return;
    setIsLoading(true);
    try {
      await redefinePassword(redefineData.password.value);
      toast({ description: `Senha redefinida com sucesso!`, status: `success` });
      setIsOpen(false);
    } catch (err) {
      showErrorToClient(err, toast);
    } finally {
      setIsLoading(false);
    }
  }, [redefineData.password.value]);

  const canSubmit = useMemo<boolean>(
    () => !!redefineData.password.valid && redefineData.password_confirmation.value === redefineData.password.value,
    [redefineData],
  );

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} closeOnOverlayClick={false} closeOnEsc={false} isCentered autoFocus>
      <ModalOverlay />
      <ModalContent bg="white" p="0.75rem" maxH="100%" overflow="hidden auto">
        <ModalHeader opacity="0.9">
          <Flex gap="0.35rem">
            <Text fontWeight="500" opacity="0.8">
              Olá,
            </Text>
            <Text>{user?.name?.split(` `)[0] || `PiCoder`}!</Text>
          </Flex>
          <Text fontWeight="500" opacity="0.8">
            Vamos redefinir sua senha?
          </Text>
        </ModalHeader>
        <Image src="/images/redefine-pass.png" border="1px" borderColor="gray200" borderRadius="md" m="1rem" w="15rem" alignSelf="center" />
        <Flex direction="column" p="1rem">
          <PasswordInput
            label="Senha"
            error={redefineData.password.error}
            value={redefineData.password.value}
            onInputChange={(value) => setRedefineData((e) => ({ ...e, password: { ...e.password, value } }))}
            passStrong={2}
            onPassStrongUnreached={() => setRedefineData((e) => ({ ...e, password: { ...e.password, valid: false } }))}
            onPassStrongReached={() => setRedefineData((e) => ({ ...e, password: { ...e.password, valid: true } }))}
          />
          <PasswordInput
            label="Confirmar Senha"
            error={redefineData.password_confirmation.error}
            value={redefineData.password_confirmation.value}
            onInputChange={(value) => setRedefineData((e) => ({ ...e, password_confirmation: { value } }))}
          />
          <GenericButton label="Redefinir" mt="2rem" isDisabled={!canSubmit} onClick={() => handleUpdatePassword()} isLoading={isLoading} />
        </Flex>
      </ModalContent>
    </Modal>
  );
};
