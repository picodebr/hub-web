import { IHubGroup } from '@/_base/interfaces/group';
import { IHubUser } from '@/_base/interfaces/user';
import { formatCoin } from '@/_base/utils';
import { NumberScaleInput } from '@/components/Inputs/NumberScale';
import { CoinIcon } from '@/components/Logo';
import { SmallModal } from '@/components/Modal/Small';
import { Avatar, AvatarBadge, Divider, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';

interface IStudentDonation {
  student: IHubUser | null;
  donation: string;
}
interface IProps {
  group: IHubGroup;
  user: IHubUser;
  onDonation: (data: IStudentDonation) => void;
}

const EMPTY_DONATION: IStudentDonation = { student: null, donation: `0` };

export const Members: React.FC<IProps> = ({ group, onDonation, user }) => {
  const [studentDonationData, setStudentDonationData] = useState<IStudentDonation>(EMPTY_DONATION);

  return (
    <Flex direction="column" display="flex" w="100%" h="fit-content" border="1px" borderColor="gray300" borderRadius="10px" bg="white" boxShadow="md">
      <Flex>
        <Text h="58px" w="100%" align="left" p="20px" fontSize="14px" color="gray600" borderBottom="1px" borderColor="gray300">
          Membros do Grupo
        </Text>
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
    </Flex>
  );
};
