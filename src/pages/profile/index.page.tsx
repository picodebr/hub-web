import { Flex, Progress, Text, Tooltip } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { GetServerSideProps } from 'next';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaChartLine } from 'react-icons/fa6';
import { MdOutlineArtTrack } from 'react-icons/md';

import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { usePageContext } from '@/_base/hooks/Page';
import { IAdmin } from '@/_base/interfaces/admin';
import { getProfile, updateProfile } from '@/_base/services/admin';
import { IUpdateProfileDTO, updateProfileSchema } from '@/_base/services/admin/interface';
import {
  documentFormatter,
  forceTokenExpiration,
  formatCurrency,
  getUserInitials,
  logError,
  refineSchemaWithPassword,
  updateApiToken,
} from '@/_base/utils';
import { BoxInfo } from '@/components/BoxInfo';
import { AppButton } from '@/components/Forms/Button';
import { AppInput, AppPassword } from '@/components/Forms/Input';
import { SimpleForm } from '@/components/SimpleForm';
import { ISimpleFormItem } from '@/components/SimpleForm/interfaces';
import { StarIcon } from '@chakra-ui/icons';
import zxcvbn from 'zxcvbn';

interface IPageProps {
  admin: IAdmin;
}

const Profile: React.FC<IPageProps> = () => {
  const toast = useCustomToast();
  const { admin, setAdmin } = usePageContext();
  const [newPass, setNewPass] = useState('');

  const isPrimaryAdmin = useMemo(() => admin.id === admin.org?.primary_admin_id, [admin.id, admin.org?.primary_admin_id]);
  const passStrong: number = useMemo(() => zxcvbn(newPass).score, [newPass]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IUpdateProfileDTO>({
    resolver: zodResolver(refineSchemaWithPassword(updateProfileSchema)),
  });

  const handleUpdate = useAsyncCallback(async (dto: IUpdateProfileDTO) => {
    const { response } = await updateProfile(dto);
    setAdmin((e) => ({ ...e, ...response }));
    toast({ title: 'Account updated!', status: 'success' });
  }, []);

  const profileFormItems: ISimpleFormItem[] = [
    {
      label: 'Federal document',
      children: <AppInput fontSize="0.975rem" border="none" size="xs" value={documentFormatter(admin.federal_document) || '----'} isDisabled />,
    },
    {
      label: 'Name',
      required: true,
      children: (
        <AppInput fontSize="0.975rem" border="none" error={errors.name} size="xs" {...register('name', { required: true, value: admin.name })} />
      ),
    },
    {
      label: 'Email',
      required: true,
      children: (
        <AppInput fontSize="0.975rem" border="none" error={errors.email} size="xs" {...register('email', { required: true, value: admin.email })} />
      ),
    },
  ];

  const passwordFormItems: ISimpleFormItem[] = [
    {
      label: 'Current password',
      required: true,
      children: <AppPassword fontSize="0.975rem" border="none" error={errors.password} size="xs" {...register('password', { required: false })} />,
    },
    {
      label: 'New password',
      required: true,
      children: (
        <AppPassword
          fontSize="0.975rem"
          border="none"
          error={errors.new_password}
          size="xs"
          {...register('new_password', { required: false, onChange: (e) => setNewPass(e.target.value) })}
        />
      ),
    },
    {
      label: 'Confirm new password',
      required: true,
      children: (
        <AppPassword
          fontSize="0.975rem"
          border="none"
          error={errors.confirm_password}
          size="xs"
          {...register('confirm_password', { required: false })}
        />
      ),
    },
  ];

  const addressFormItems: ISimpleFormItem[] = [
    {
      label: 'Street',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert street"
          size="xs"
          error={errors.address?.address}
          {...register('address.address', { required: false, value: admin.address?.address || '' })}
        />
      ),
    },
    {
      label: 'Number',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert number"
          size="xs"
          error={errors.address?.number}
          {...register('address.number', { required: false, value: admin.address?.number || '' })}
        />
      ),
    },
    {
      label: 'Complement',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert complement"
          size="xs"
          error={errors.address?.complement}
          {...register('address.complement', { required: false, value: admin.address?.complement || '' })}
        />
      ),
    },
    {
      label: 'Neighborhood',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert neighborhood"
          size="xs"
          error={errors.address?.neighborhood}
          {...register('address.neighborhood', { required: false, value: admin.address?.neighborhood || '' })}
        />
      ),
    },
    {
      label: 'City',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert City"
          size="xs"
          error={errors.address?.city}
          {...register('address.city', { required: false, value: admin.address?.city || '' })}
        />
      ),
    },
    {
      label: 'State',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert state"
          size="xs"
          error={errors.address?.state}
          {...register('address.state', { required: false, value: admin.address?.state || '' })}
        />
      ),
    },
    {
      label: 'Country',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert country"
          size="xs"
          error={errors.address?.country}
          {...register('address.country', { required: false, value: admin.address?.country || '' })}
        />
      ),
    },
    {
      label: 'Zip code',
      children: (
        <AppInput
          fontSize="0.975rem"
          border="none"
          placeholder="Insert zip code"
          size="xs"
          error={errors.address?.zip_code}
          {...register('address.zip_code', { required: false, value: admin.address?.zip_code || '' })}
        />
      ),
    },
  ];

  return (
    <Flex w="100%" overflow="hidden" h="100%" gap="0.6rem" direction="column">
      <Flex w="100%" align="center" justify="space-between">
        <Text padding="0.5rem 1rem" fontSize="1.5rem" fontWeight="bold" color="text.black">
          My Account
        </Text>
        <AppButton label="Save changes" onClick={handleSubmit(handleUpdate)} isDisabled={!!newPass && passStrong < 3} />
      </Flex>
      <Flex borderRadius="md" w="100%" h="100%" justify="center">
        <Flex
          className="left-content"
          direction="column"
          justify="flex-start"
          flex="1"
          maxW="43rem"
          align="center"
          gap="1.5rem"
          padding="1rem 1.5rem 1rem 1rem"
          borderRight="1px"
          borderColor="border.light"
          overflow="hidden auto"
        >
          <Flex align="center" w="100%" gap="0.75rem">
            <Flex
              border="2px solid"
              bg="bg.white"
              borderColor="secondary"
              minW="6rem"
              minH="6rem"
              borderRadius="50%"
              justify="center"
              align="center"
              position="relative"
            >
              {isPrimaryAdmin && (
                <Flex
                  position="absolute"
                  border="1px"
                  borderColor="secondary"
                  top="0"
                  right="0"
                  w="1.5rem"
                  h="1.5rem"
                  borderRadius="50%"
                  align="center"
                  justify="center"
                  bg="bg.white"
                >
                  <Tooltip label="You are the primary admin" placement="top" hasArrow arrowSize={6}>
                    <StarIcon color="yellow.400" />
                  </Tooltip>
                </Flex>
              )}
              <Text color="primary" fontWeight="extrabold" fontSize="2.85rem" letterSpacing={2}>
                {getUserInitials(admin.name)}
              </Text>
            </Flex>
            <Flex direction="column" fontSize="1.175rem">
              <Flex color="text.gray" gap="0.5rem">
                Organization: <Text color="text.black">{admin.org?.name}</Text>
              </Flex>
              <Flex color="text.gray" gap="0.5rem">
                {isPrimaryAdmin ? 'Org credit limit: ' : 'Credit limit: '}
                <Text color="text.black">{formatCurrency(isPrimaryAdmin ? admin.org?.credit_account.value : admin.credit_account.value)}</Text>
              </Flex>
              <Flex color="text.gray" gap="0.5rem">
                Expires:{' '}
                <Text color="text.black">
                  {admin.credit_account.expires_in ? moment(admin.credit_account.expires_in).format('DD/MM/YYYY') : 'never'}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <SimpleForm items={profileFormItems} />
          <Flex w="100%" justify="center" gap="1.5rem">
            <BoxInfo label="Campaigns" value={admin.campaigns?.length || 0} icon={<FaChartLine />} />
            <BoxInfo label="Creatives" value={admin.ads?.length || 0} icon={<MdOutlineArtTrack fontSize="2rem" />} />
          </Flex>
          <Text>Account created at {moment(admin.created_at).format('DD/MM/YYYY')}</Text>
        </Flex>

        <Flex
          className="right-content"
          direction="column"
          flex="1"
          h="calc(100% - 4rem)"
          maxW="43rem"
          gap="1.5rem"
          padding="1rem 1rem 1rem 1.5rem"
          overflow="hidden auto"
        >
          <Text mb="-1rem" fontSize="1.125rem" fontWeight="bold" w="100%" color="text.gray">
            Change password
          </Text>
          <SimpleForm items={passwordFormItems} />
          <Text margin="-1.2rem 0" w="100%" color="text.gray">
            Password strong
          </Text>
          <Progress max={4} value={!newPass ? 0 : passStrong || 1} size="md" colorScheme={passStrong < 3 ? 'red' : 'green'} rounded={10} />

          <Text mb="-1rem" fontSize="1.125rem" fontWeight="bold" w="100%" color="text.gray">
            Change address
          </Text>
          <SimpleForm items={addressFormItems} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'profile';
  try {
    updateApiToken(req);

    const { response: admin } = await getProfile();

    return { props: { admin, selectedPage, pageTitle: 'Profile' } };
  } catch (err: any) {
    forceTokenExpiration(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
