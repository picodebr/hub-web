import { useInputHandler } from '@/_base/hooks';
import { IHubGroup, IUpdateHubGroupParams, updateHubGroupSchema } from '@/_base/interfaces/group';
import { IHubUser } from '@/_base/interfaces/user';
import { formatCoin, formatShortName } from '@/_base/utils';
import { AvatarList } from '@/components/AvatarList';
import { GenericButton } from '@/components/Buttons/Generic';
import { NumberScaleInput } from '@/components/Inputs/NumberScale';
import { TextInput } from '@/components/Inputs/Text';
import { CoinIcon } from '@/components/Logo';
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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { GoGear } from 'react-icons/go';
import { IoChevronDownCircleOutline } from 'react-icons/io5';

interface IStudentDonation {
  student: IHubUser | null;
  donation: string;
}
interface IProps {
  group: IHubGroup;
  user: IHubUser;
  availableStudents: IHubUser[];
  onDonation: (data: IStudentDonation) => void;
  onUpdateGroup: (data: IUpdateHubGroupParams) => void;
}

const EMPTY_DONATION: IStudentDonation = { student: null, donation: `0` };

export const Members: React.FC<IProps> = ({ group, onDonation, user, availableStudents, onUpdateGroup }) => {
  const [studentDonationData, setStudentDonationData] = useState<IStudentDonation>(EMPTY_DONATION);
  const [openModal, setOpenModal] = useState(false);

  const { errors, onInputChange, data, submit, setData } = useInputHandler<IUpdateHubGroupParams>({
    schema: updateHubGroupSchema,
  });

  const handleUpdateGroup = () => {
    onUpdateGroup({ ...data, id: group.id });

    setOpenModal(false);
  };

  useEffect(() => {
    setData({ display_name: group.display_name, id: group.id, users: group.students.map((student) => student.id) });
  }, [group]);

  return (
    <Flex
      direction="column"
      display="flex"
      w="100%"
      h="fit-content"
      border="1px"
      borderColor="gray300"
      borderRadius="10px"
      bg="white"
      boxShadow="md"
      overflow="auto"
    >
      <Flex justify="space-between" align="center" p="10px 20px" borderBottom="1px" borderColor="gray300">
        <Text w="100%" fontSize="14px" color="gray600">
          Membros do Grupo
        </Text>
        {user.role === 'teacher' && (
          <GenericButton size="sm" label="Editar" rightIcon={<GoGear fontSize="18px" />} onClick={() => setOpenModal(true)} />
        )}
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
        onCancel={() => {
          setOpenModal(false);
          setData({ ...group, users: group.students.map((student) => student.id) });
        }}
        disableOkButton={!data.users?.length || !data.display_name}
        topIcon={'checked'}
      >
        <Flex direction="column" minW="350px" gap="1rem">
          <TextInput value={data?.display_name} onInputChange={(v) => onInputChange('display_name', v)} error={errors.display_name} />
          <Menu closeOnSelect={false} placement="right">
            <MenuButton
              as={Button}
              rightIcon={<IoChevronDownCircleOutline />}
              border="1px"
              borderColor="gray300"
              bg="white"
              onClick={() => {
                availableStudents.forEach((student) => {
                  const el = document.getElementsByClassName(student.id)[0];
                  if (el) el.setAttribute(`aria-checked`, `true`);
                });
              }}
            >
              Adicionar membros ao grupo
            </MenuButton>
            <MenuList borderColor="gray300" boxShadow="md" overflow="auto">
              <MenuOptionGroup type="checkbox">
                {availableStudents.length ? (
                  availableStudents.map((student) => (
                    <MenuItemOption
                      key={student.id}
                      value={student.id}
                      onClick={() =>
                        onInputChange(
                          `users`,
                          data.users?.find((id) => id === student.id)
                            ? data.users.filter((id) => id !== student.id)
                            : [...(data.users || []), student.id],
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
          <Menu closeOnSelect={false} placement="right">
            <MenuButton
              as={Button}
              rightIcon={<IoChevronDownCircleOutline />}
              border="1px"
              borderColor="gray300"
              bg="white"
              onClick={() => {
                availableStudents.forEach((student) => {
                  const el = document.getElementsByClassName(student.id)[0];
                  if (el) el.setAttribute(`aria-checked`, `true`);
                });
              }}
            >
              Remover membros do grupo
            </MenuButton>
            <MenuList borderColor="gray300" boxShadow="md" overflow="auto">
              <MenuOptionGroup type="checkbox">
                {group.students.length ? (
                  group.students.map((student) => (
                    <MenuItemOption
                      key={student.id}
                      value={student.id}
                      onClick={() =>
                        onInputChange(
                          `users`,
                          data.users?.find((id) => id === student.id)
                            ? data.users.filter((id) => id !== student.id)
                            : [...(data.users || []), student.id],
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
            <AvatarList
              users={[...availableStudents, ...group.students].filter((e) => data.users?.includes(e.id))}
              max={10}
              emptyMessage="Nenhum membro adicionado"
            />
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};
