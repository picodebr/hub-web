import { IHubGroup } from '@/_base/interfaces/group';
import { SmallModal } from '@/components/Modal/Small';
import { Avatar, AvatarBadge, Divider, Flex, Image, Input, Text, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { IoIosSend } from 'react-icons/io';

interface IProps {
  group: IHubGroup;
}

export const Members: React.FC<IProps> = ({ group }) => {
  const [sendCoins, setSendCoins] = useState(false);
  return (
    <Flex direction="column" display="flex" w="100%" h="fit-content" border="1px" borderColor="gray300" borderRadius="10px" bg="white">
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
            <Flex direction="column">
              <Text color="gray700" fontSize="14px" fontWeight="600">
                {student.name}
              </Text>
              <Text color="gray500" fontSize="14px">
                @{student.username}
              </Text>
            </Flex>
            <Flex w="100%" align="center" justify="flex-end" gap="4px">
              <Text fontWeight="600">4</Text>
              <Image src="/icons/coin.svg" />
              <Flex label="Enviar coins" cursor="pointer" onClick={setSendCoins}>
                <IoIosSend size="25px" color="primary500" />
              </Flex>
            </Flex>
          </Flex>
          {i < arr.length - 1 && <Divider color="gray300" />}
          <SmallModal show={!!sendCoins} title="Enviar coins para aluno(a)?" onConfirm={setSendCoins} onCancel={!!sendCoins}>
            <Flex>
              <Input placeholder="Digite quantas coins deseja enviar"></Input>
            </Flex>
          </SmallModal>
        </Flex>
      ))}
    </Flex>
  );
};
