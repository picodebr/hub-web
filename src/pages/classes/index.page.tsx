import { Avatar, AvatarGroup, Link, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Skeleton } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FiEdit2, FiMoreVertical, FiUsers } from 'react-icons/fi';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager, formatClassGrade, formatShortName } from '@/_base/utils';
import { Flex, Text } from '@chakra-ui/react';
import { useAsyncCallback } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { IHubClass } from '@/_base/interfaces/class';
import { addClass, listClasses, removeClass } from '@/_base/services/class';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { InputValueType } from '@/_base/interfaces/shared/InputValueType';

type ModalType = { class_code?: boolean; confirm_remove?: boolean; classCodeToRemove?: string };

const Classes: React.FC = () => {
  const [classCode, setClassCode] = useState<InputValueType<string>>({ value: '' });
  const [classes, setClasses] = useState<PageDataType<IHubClass>>({ data: [] });
  const [newClass, setNewClass] = useState<IHubClass | null>(null);
  const [modalOpt, setOpenOpt] = useState<ModalType>({});

  const getClasses = useAsyncCallback(async () => {
    const userClasses = await listClasses();

    setClasses({ _isLoading: false, data: userClasses });
  }, []);

  useEffect(() => {
    setClasses(() => ({ data: [{ id: '1' }, { id: '2' }, { id: '3' }] as any, _isLoading: true }));
    getClasses();
  }, []);

  const handleCheckClassCode = useAsyncCallback(async () => {
    try {
      if (classCode.value.replace(/\D/g, '').length !== 4) {
        setClassCode({ error: 'Código inválido', value: '' });
        return;
      }
      setClasses((s) => ({ ...s, _isLoading: true }));

      const addedClass = await addClass({ class_code: classCode.value });

      setNewClass(addedClass);
      setClasses((s) => ({ ...s, data: [addedClass, ...s.data] }));
    } catch {
      setClassCode({ error: 'Código inválido', value: '' });
    } finally {
      setClasses((s) => ({ ...s, _isLoading: false }));
    }
  }, []);

  const handleRemoveClass = useAsyncCallback(async () => {
    if (!modalOpt.classCodeToRemove) return;

    setClasses((s) => ({ ...s, _isLoading: true }));
    await removeClass(modalOpt.classCodeToRemove);

    setTimeout(() => {
      setClasses((s) => ({ data: s.data.filter((e) => e.code !== modalOpt.classCodeToRemove) }));
      onCloseModal();
    }, 1000);
  }, []);

  const onCloseModal = () => {
    setClassCode({ value: '' });
    setNewClass(null);
    setOpenOpt({});
  };

  return (
    <Flex direction="column" w="100%" h="69px" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap">
      <Flex align="center" justify="flex-end" h="fit-content">
        <Flex
          bgColor="white"
          w="fit-content"
          h="fit-content"
          border="1px"
          borderColor="gray300"
          padding="8px 14px"
          align="center"
          gap="8px"
          borderRadius="8px"
          fontSize="16px"
          fontWeight="600"
          color="gray700"
          boxShadow="sm"
          cursor="pointer"
          onClick={() => setOpenOpt({ class_code: true })}
        >
          <FaPlus />
          Adicionar Turma
        </Flex>
      </Flex>
      {!classes.data.length && !classes._isLoading ? (
        <EmptyPageData />
      ) : (
        classes.data.map((hubClass) => (
          <Skeleton key={hubClass.id} rounded="lg" isLoaded={!classes._isLoading}>
            <Flex
              h="fit-content"
              bgColor="white"
              borderRadius="10px"
              boxShadow="md"
              align="center"
              padding="20px 24px"
              color="primary700"
              gap="16px"
              fontSize="18px"
              minH="5.5rem"
              maxH="5.5rem"
            >
              <Flex flex="1" gap="1rem">
                <Link href={`/classes/${hubClass.id}`} transition="color 0.1s" color="#21E080" _hover={{ color: '#36c27c' }}>
                  <FiUsers fontSize="40px" />
                </Link>
                <Flex display="column" justify="space-between">
                  <Link href={`/classes/${hubClass.id}`}>
                    <Text fontWeight="700" transition="color 0.1s" _hover={{ color: 'indigo600' }}>
                      {formatClassGrade(hubClass.grade)} - {hubClass.display_name}
                    </Text>
                  </Link>
                  <AvatarGroup size="sm" max={10}>
                    {hubClass.students?.length ? (
                      hubClass.students.map((student) => (
                        <Avatar name={formatShortName(student.name, true)} title={student.name} src={student.avatar || undefined} />
                      ))
                    ) : (
                      <Flex align="flex-end">
                        <Text color="gray400" fontSize="14px">
                          Nenhum aluno cadastrado
                        </Text>
                      </Flex>
                    )}
                  </AvatarGroup>
                </Flex>
              </Flex>
              <Popover placement="left">
                <PopoverTrigger>
                  <Flex justify="flex-end" color="gray300">
                    <FiMoreVertical cursor="pointer" />
                  </Flex>
                </PopoverTrigger>
                <PopoverContent borderColor="gray300" w="fit-content" _hover={{ borderColor: 'error400' }}>
                  <PopoverArrow />
                  <PopoverBody cursor="pointer">
                    <Flex
                      align="center"
                      gap="0.5rem"
                      color="error400"
                      onClick={() => setOpenOpt({ confirm_remove: true, classCodeToRemove: hubClass.code })}
                    >
                      <Text>Remover Turma</Text>
                      <FaTrash />
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>
          </Skeleton>
        ))
      )}
      <SmallModal
        title="Código da turma"
        show={!!modalOpt.class_code}
        onConfirm={newClass ? onCloseModal : handleCheckClassCode}
        okText={newClass ? 'OK' : 'Confirmar'}
        onCancel={newClass ? undefined : onCloseModal}
        topIcon={newClass ? 'checked' : 'ray'}
      >
        <Flex direction="column" maxW="300px" gap="1rem">
          <Text color="gray500" fontSize="15px">
            {newClass
              ? `Parabéns, agora o ${formatClassGrade(newClass.grade)} também está contigo. Bons projetos`
              : 'Insira o código da nova turma para adicionar as turmas lecionadas'}
          </Text>
          {!newClass && (
            <TextInput
              placeholder="Digite o código"
              _placeholder={{ fontSize: '14px' }}
              value={classCode.value}
              onInputChange={(value) => setClassCode({ value })}
              error={classCode.error}
              leftElement={<FiEdit2 size="1rem" color="#98A2B3" />}
            />
          )}
        </Flex>
      </SmallModal>
      <SmallModal
        title="Remover turma"
        show={!!modalOpt.confirm_remove}
        onConfirm={handleRemoveClass}
        okText={newClass ? 'OK' : 'Confirmar'}
        onCancel={onCloseModal}
        topIcon="warning"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Tem certeza que deseja remover essa turma?
          </Text>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default Classes;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'classes';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Minhas turmas', user } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
