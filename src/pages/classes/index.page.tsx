import { Badge, Checkbox, Link, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Skeleton } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FiMoreVertical, FiUsers } from 'react-icons/fi';

import { Flex, Text } from '@chakra-ui/react';
import { useAsyncCallback, useAuth, useCustomToast } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { IHubClass } from '@/_base/interfaces/class';
import { addClasses, listAllClasses, listMyClasses, removeClass } from '@/_base/services/class';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { AvatarList } from '@/components/AvatarList';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { sortGrades, sortGradesByClass } from '@/_base/utils';

type ModalType = { class_code?: boolean; confirm_remove?: boolean; classCodeToRemove?: string };

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<PageDataType<IHubClass>>({ data: [] });
  const [allClasses, setAllClasses] = useState<IHubClass[]>([]);
  const [modalOpt, setOpenOpt] = useState<ModalType>({});
  const [selectedClasses, setSelectedClasses] = useState<IHubClass[]>([]);

  const { school } = useSelectedSchool();
  const { user } = useAuth();
  const toast = useCustomToast();

  const getClasses = useAsyncCallback(async (school_id: string) => {
    if (!school_id) return;
    const [userClasses, schoolClasses] = await Promise.all([listMyClasses(school_id), listAllClasses(school_id)]);
    setAllClasses(schoolClasses);
    setClasses({ _isLoading: false, data: user.role === `master` ? allClasses : userClasses });
  }, []);

  useEffect(() => {
    setClasses(() => ({ data: [{ id: '1' }, { id: '2' }, { id: '3' }] as any, _isLoading: true }));
    getClasses(school?.hub_school_id || ``);
  }, [school]);

  const handleAddClasses = useAsyncCallback(async () => {
    try {
      setClasses((s) => ({ ...s, _isLoading: true }));

      const newClasses = await addClasses({ class_ids: selectedClasses.map((e) => e.id) });

      setClasses((s) => ({ ...s, data: [...newClasses, ...s.data], _isLoading: false }));
      onCloseModal();
    } catch {
      toast({ status: `error`, description: `Ocorreu um erro ao vincular as turmas, por favor tente novamente` });
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
    setSelectedClasses([]);
    setOpenOpt({});
  };

  const classIsAvailable = (hubClass: IHubClass): boolean => {
    return !classes.data?.find((e) => e.id === hubClass.id);
  };

  const handleChangeSelectedClass = (hubClass: IHubClass, adding: boolean) => {
    if (!selectedClasses.find((e) => e.id === hubClass.id) && adding) setSelectedClasses((s) => [hubClass, ...s]);
    if (!adding) setSelectedClasses((s) => s.filter((e) => e.id !== hubClass.id));
  };

  return (
    <Flex direction="column" w="100%" h="100%" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap" overflow="hidden auto">
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
              align="center"
              padding="20px 24px"
              color="primary700"
              gap="16px"
              fontSize="18px"
              minH="5.5rem"
              maxH="5.5rem"
            >
              <Flex flex="1" gap="1rem">
                <Link
                  href={`/classes/${hubClass.id}?_p=${hubClass.display_name}`}
                  transition="color 0.1s"
                  color="#21E080"
                  _hover={{ color: '#36c27c' }}
                >
                  <FiUsers fontSize="40px" />
                </Link>
                <Flex display="column" justify="space-between">
                  <Link href={`/classes/${hubClass.id}?_p=${hubClass.display_name}`}>
                    <Text fontWeight="700" transition="color 0.1s" _hover={{ color: 'indigo600' }}>
                      {hubClass.display_name}
                    </Text>
                  </Link>
                  <AvatarList users={hubClass.students} max={10} />
                </Flex>
                <Badge h="fit-content" fontSize="14px" colorScheme="purple">
                  {['6', '7', '8', '9'].includes(hubClass.grade) && `#${hubClass.code}`}
                </Badge>
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
        title={`Turmas da escola ${school?.display_name}`}
        show={!!modalOpt.class_code}
        onConfirm={handleAddClasses}
        okText="Confirmar"
        size="lg"
        isLoading={classes._isLoading}
        onCancel={onCloseModal}
        topIcon="ray"
        disableOkButton={!selectedClasses.length}
      >
        <Flex direction="column" gap="1rem">
          {sortGradesByClass(allClasses).map((hubClass) => (
            <Flex
              key={hubClass.id}
              h="fit-content"
              bgColor="white"
              borderRadius="10px"
              border="1px"
              borderColor="gray200"
              align="center"
              padding="20px 24px"
              color="primary700"
              gap="16px"
              fontSize="18px"
              minH="5.5rem"
              maxH="5.5rem"
            >
              <Flex flex="1" gap="1rem" justify="space-between" filter={classIsAvailable(hubClass) ? '' : 'grayscale(0.7)'} overflow="hidden">
                <Text fontWeight="700" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" title={hubClass.display_name}>
                  {hubClass.display_name}
                </Text>
                <Checkbox
                  defaultChecked={!classIsAvailable(hubClass)}
                  isDisabled={!classIsAvailable(hubClass)}
                  size="lg"
                  visibility="visible"
                  border="2px"
                  p="0.25rem"
                  color="primary700"
                  colorScheme="blue"
                  borderRadius="4px"
                  onChange={(v) => handleChangeSelectedClass(hubClass, v.target.checked)}
                />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </SmallModal>
      <SmallModal
        title="Remover turma"
        show={!!modalOpt.confirm_remove}
        onConfirm={handleRemoveClass}
        okText="Confirmar"
        isLoading={classes._isLoading}
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

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'classes';

  return { props: { selectedPage, pageTitle: 'Minhas turmas', showBackButton: false } };
};
