import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { IProject } from '@/_base/interfaces/project';
import { PageDataType } from '@/_base/interfaces/shared';
import { IHubUser } from '@/_base/interfaces/user';
import { createGroup, listAvailableUsersForGroupByProject, updateGroup } from '@/_base/services/group';
import { listAvailableProjectsForStudent } from '@/_base/services/project';
import { formatCoin, formatShortName } from '@/_base/utils';
import { AvatarList } from '@/components/AvatarList';
import { GenericButton } from '@/components/Buttons/Generic';
import { NumberScaleInput } from '@/components/Inputs/NumberScale';
import { TextInput } from '@/components/Inputs/Text';
import { CoinIcon } from '@/components/Logo';
import { GenericModal } from '@/components/Modal/GenericModal';
import { IGenericModalProps } from '@/components/Modal/GenericModal/interfaces';
import { SmallModal } from '@/components/Modal/Small';
import {
  Avatar,
  AvatarBadge,
  Button,
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { IoChevronDownCircleOutline } from 'react-icons/io5';

interface IStudentDonation {
  student: IHubUser | null;
  donation: string;
}
interface IProps {
  group: IHubGroup;
  user: IHubUser;
  onDonation: (data: IStudentDonation) => void;
}

// interface IManageGroup {
//   group: IHubGroup | null;
//   student: IHubUser | null;
//   display_name: string | null;
//   user: IHubUser | null;
// }

const EMPTY_DONATION: IStudentDonation = { student: null, donation: `0` };
// const NO_GROUP_MANAGEMENT: IManageGroup = { group: null, student: null, display_name: '', user: null };

export const Members: React.FC<IProps> = ({ group, onDonation, user }) => {
  const [studentDonationData, setStudentDonationData] = useState<IStudentDonation>(EMPTY_DONATION);
  const [availableProjects, setAvailableProjects] = useState<IProject[]>([]);
  const [availableStudents, setAvailableStudents] = useState<IHubUser[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const toast = useToast();
  const { errors, onInputChange, data, submit, setData } = useInputHandler<ICreateHubGroupParams>({
    schema: createHubGroupSchema,
  });

  const handleUpdateGroup = useAsyncCallback(
    async () => {
      const updatedGroup = await updateGroup({ ...data, id: group.id } as any);

      setOpenModal(false);
      toast({ status: `success`, description: `Grupo adicionado` });
    },
    [],
    undefined,
  );

  const loadAvailableStudents = useAsyncCallback(async () => {
    // const students = await listAvailableUsersForGroupByProject(group.project?.id || ``);
    setAvailableStudents(group.students);
  }, []);

  useEffect(() => {
    loadAvailableStudents();
    setData({ ...group, users: group.students.map((student) => student.id) });
    console.log(group);
  }, [group]);

  return (
    <Flex direction="column" display="flex" w="100%" h="fit-content" border="1px" borderColor="gray300" borderRadius="10px" bg="white" boxShadow="md">
      <Flex justify="space-between" align="center">
        <Text h="58px" w="100%" align="left" p="20px" fontSize="14px" color="gray600" borderBottom="1px" borderColor="gray300">
          Membros do Grupo
        </Text>
        <GenericButton mr="12px" label="Editar Membros" size="sm" onClick={() => setOpenModal(true)} />
      </Flex>
      <Flex h="fit-content" gap="12px" p="12px 20px">
        <Avatar src={group.educator?.avatar || undefined} />
        <Flex direction="column">
          <Text color="gray700" fontSize="14px" fontWeight="600">
            {group.educator?.name}
          </Text>
          <Text color="gray500" fontSize="14px">
            Professor(a) responsável
          </Text>
        </Flex>
      </Flex>
      <Divider />
      {group.students.map((student, i, arr) => (
        <Flex key={student.id} direction="column">
          <Flex h="fit-content" gap="12px" p="12px 20px" w="100%">
            <Avatar src={student.avatar || undefined}>
              <AvatarBadge boxSize="1.25em" bg="green.500" />
            </Avatar>
            <Flex direction="column" flex="1">
              <Text color="gray700" fontSize="14px" fontWeight="600">
                {student.name}
              </Text>
              <Text color="gray500" fontSize="14px">
                @{student.username}
              </Text>
            </Flex>
            <Tooltip label={student.id !== user.id ? `Fazer doação para ${student.name}` : ``}>
              <Flex
                align="center"
                justify="center"
                cursor={student.id !== user.id ? 'pointer' : `default`}
                onClick={() => student.id !== user.id && setStudentDonationData((e) => ({ ...e, student }))}
                position="relative"
                p="0.5rem"
                gap="0.25rem"
                _hover={student.id !== user.id ? { filter: `brightness(0.9)` } : undefined}
              >
                <Text fontWeight="600" color={(student.metadata.coins || 0) > 0 ? 'green' : 'red'}>
                  {formatCoin(student.metadata.coins || 0)}
                </Text>
                <CoinIcon />

                {student.id !== user.id && (
                  <Flex position="absolute" bottom="0.45rem" right="0.25rem" fontSize="1.1rem" color="primary300">
                    <FaPlus />
                  </Flex>
                )}
              </Flex>
            </Tooltip>
          </Flex>
          {i < arr.length - 1 && <Divider color="gray300" />}
          <SmallModal
            topIcon="checked"
            show={!!studentDonationData.student}
            title="Quantas moedas você deseja doar?"
            okText="Doar"
            onConfirm={() => {
              onDonation(studentDonationData);
              setStudentDonationData(EMPTY_DONATION);
            }}
            onCancel={() => setStudentDonationData(EMPTY_DONATION)}
          >
            <Flex>
              <NumberScaleInput
                value={studentDonationData.donation || ``}
                onInputChange={(donation) => setStudentDonationData((e) => ({ ...e, donation }))}
                max={user.metadata.coins || 0}
              />
            </Flex>
          </SmallModal>
        </Flex>
      ))}
      <SmallModal
        title="Alterar informação do grupo"
        show={openModal}
        onConfirm={() => submit(handleUpdateGroup)}
        okText="Atualizar"
        onCancel={() => setOpenModal(false)}
        disableOkButton={!data.users?.length || !data.hub_project_class_id || !data.display_name || !group.project?.educator}
        topIcon={'checked'}
      >
        <Flex direction="column" minW="350px" gap="1rem">
          <TextInput value={data?.display_name} onInputChange={(v) => onInputChange('display_name', v)} error={errors.display_name} />
          <Menu closeOnSelect={false} placement="right">
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} border="1px" borderColor="gray300" bg="white">
              Remover membros do grupo
            </MenuButton>
            <MenuList borderColor="gray300" boxShadow="md">
              <MenuOptionGroup type="checkbox">
                {availableStudents.length ? (
                  availableStudents.map((student) => (
                    <MenuItemOption
                      key={student.id}
                      value={student.id}
                      onClick={() =>
                        onInputChange(
                          `users`,
                          data.users.find((id) => id === student.id) ? data.users.filter((id) => id !== student.id) : [...data.users, student.id],
                        )
                      }
                    >
                      {student.name}
                    </MenuItemOption>
                  ))
                ) : (
                  <MenuItem isDisabled>Nenhum membro disponível</MenuItem>
                )}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          {!!group.project && (
            <Flex direction="column" gap="0.25rem" bg="gray100" p="0.5rem" borderRadius="md" position="relative">
              <Text alignSelf="flex-end" fontSize="14px" color="gray400" position="absolute">
                {group.educator && `Professor`}
              </Text>
              <Flex align="center" gap="0.5rem">
                {group.educator ? (
                  <>
                    <Avatar
                      name={formatShortName(group.educator?.name || '', true)}
                      title={group.educator?.name}
                      src={group.educator?.avatar || undefined}
                      cursor="pointer"
                    />
                    <Text>{formatShortName(group.educator?.name || '', true)}</Text>
                  </>
                ) : (
                  <Text color="primary500">Esse projeto não está sendo lecionado por nenhum professor.</Text>
                )}
              </Flex>
            </Flex>
          )}
          <Flex align="center" gap="0.5rem">
            <Text fontSize="15px" fontWeight="500">
              Membros:
            </Text>
            <AvatarList users={group.students.filter((e) => data.users?.includes(e.id))} max={10} emptyMessage="Nenhum membro adicionado" />
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};
