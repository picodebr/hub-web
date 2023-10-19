import { Flex, Progress, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import zxcvbn from 'zxcvbn';

import { useAsyncCallback } from '@/_base/hooks/AsyncCallback';
import { IAdmin } from '@/_base/interfaces/admin';
import { updateProfile } from '@/_base/services/admin';
import { IUpdatePasswordDTO, updatePasswordSchema } from '@/_base/services/admin/interface';
import { createOrg } from '@/_base/services/org';
import { ICreateOrgDTO, orgSchema } from '@/_base/services/org/interface';
import { formatShortName } from '@/_base/utils';
import { refineSchemaWithPassword } from '@/_base/utils/refinePasswordSchema';
import { AppInput, AppPassword } from '@/components/Forms/Input';
import { Modal } from '@/components/Modal';
import { useMemo, useState } from 'react';

interface IFirstAccessProps {
  admin: IAdmin;
  setAdmin: React.Dispatch<React.SetStateAction<IAdmin>>;
}

export const FirstAccess: React.FC<IFirstAccessProps> = ({ admin, setAdmin }) => {
  const [newPass, setNewPass] = useState('');

  const passStrong: number = useMemo(() => zxcvbn(newPass).score, [newPass]);

  const {
    handleSubmit: handlePassSubmit,
    register: registerPass,
    formState: { errors: passErrors },
  } = useForm<IUpdatePasswordDTO>({
    resolver: zodResolver(refineSchemaWithPassword(updatePasswordSchema)),
  });

  const {
    handleSubmit: handleOrgSubmit,
    register: registerOrg,
    formState: { errors: orgErrors },
  } = useForm<ICreateOrgDTO>({
    resolver: zodResolver(orgSchema),
  });

  const handleChangePassword = useAsyncCallback(async (dto: IUpdatePasswordDTO) => {
    const { response } = await updateProfile(dto);
    setAdmin((e) => ({ ...e, ...response }));
  }, []);

  const handleCreateOrg = useAsyncCallback(async (dto: ICreateOrgDTO) => {
    const { response } = await createOrg(dto);
    setAdmin((e) => ({ ...e, org_id: response.id }));
  }, []);

  return (
    <>
      <Modal
        show={!!admin.id && !admin.password_updated_at && !!admin.org_id}
        title="Set new password"
        onConfirm={handlePassSubmit(handleChangePassword)}
        okText="Save"
        disableCancelButton
        disableOkButton={passStrong < 3}
        overlay={{ bg: 'none', backdropFilter: 'auto', backdropInvert: '30%', backdropBlur: '5px' }}
        motionPreset="slideInBottom"
      >
        <Flex flexDir="column" gap={4}>
          <AppPassword
            label="Current password"
            error={passErrors.password}
            border={'none'}
            bg={'#f7f7f7'}
            borderLeft={'3px solid #81BE73'}
            borderRadius={'0'}
            autoComplete="off"
            {...registerPass('password', { required: true })}
          />
          <AppPassword
            label="New password"
            error={passErrors.new_password}
            border={'none'}
            bg={'#f7f7f7'}
            borderLeft={'3px solid #81BE73'}
            borderRadius={'0'}
            {...registerPass('new_password', { required: true, onChange: (e) => setNewPass(e.target.value) })}
          />
          <Flex direction="column">
            <Progress max={4} value={!newPass ? 0 : passStrong || 1} size="md" colorScheme={passStrong < 3 ? 'red' : 'green'} rounded={10} />
            <Text color="gray.500" fontSize={14}>
              Password strong
            </Text>
          </Flex>
          <AppPassword
            label="Confirm password"
            error={passErrors.confirm_password}
            border={'none'}
            bg={'#f7f7f7'}
            borderLeft={'3px solid #81BE73'}
            borderRadius={'0'}
            {...registerPass('confirm_password', { required: true })}
          />
        </Flex>
      </Modal>
      <Modal
        show={!!admin.id && !admin.org_id}
        title="Welcome"
        onConfirm={handleOrgSubmit(handleCreateOrg)}
        okText="Create"
        disableCancelButton
        overlay={{ bg: 'none', backdropFilter: 'auto', backdropInvert: '30%', backdropBlur: '5px' }}
        motionPreset="scale"
      >
        <Flex flexDir="column" gap={4}>
          <Text color="gray.600" fontSize="1.15rem">
            Hello {formatShortName(admin.name, true)}!
          </Text>
          <Text color="gray.500" marginBottom="0.5rem">
            Please, create your organization to continue.
          </Text>
          <AppInput
            label="Organization name"
            error={orgErrors.name}
            border={'none'}
            bg={'#f7f7f7'}
            borderLeft={'3px solid #81BE73'}
            borderRadius={'0'}
            autoComplete="off"
            {...registerOrg('name', { required: true })}
          />
        </Flex>
      </Modal>
    </>
  );
};
