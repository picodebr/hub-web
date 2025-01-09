import { GetServerSideProps } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Flex,
  Text,
  Skeleton,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Switch,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMinus, FaPlus, FaSave } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { UploadOutlined } from '@ant-design/icons';
import { Upload, Image } from 'antd'; // Adicionei o Upload do Ant Design
import type { UploadFile } from 'antd';

import { addItemInStockMaker, getStockMaker, updateStockMaker } from '@/_base/services/storeMaker';
import { IStockMaker } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useCustomToast, useInputHandler } from '@/_base/hooks';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { PlusButton } from '@/components/Buttons/Plus';
import { TextInput } from '@/components/Inputs/Text';
import { addStockMakerSchema, EMPTY_STOCK_MAKER_ITEM } from '@/_base/interfaces/storeMaker/IAddStockMakerParams';
import { NumberInput } from '@/components/Inputs/Number';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';

const Stock: React.FC = () => {
  const [unSavedstock, setUnsavedStock] = useState<IStockMaker[]>([]);
  const [stock, setStock] = useState<IStockMaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [fileToUpload, setFileToUpload] = useState<UploadFile | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isReusable, setIsReusable] = useState(false);

  const { data, onInputChange, submit, errors } = useInputHandler({ schema: addStockMakerSchema, data: EMPTY_STOCK_MAKER_ITEM });

  const toast = useCustomToast();
  const { school } = useSelectedSchool();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const results = await getStockMaker(school?.hub_school_id || ``);
        setStock(results);
        setUnsavedStock(results);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar o estoque` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const needSave = useMemo(() => JSON.stringify(unSavedstock) !== JSON.stringify(stock), [unSavedstock, stock]);

  const handleSave = useAsyncCallback(
    async () => {
      setIsLoading(true);
      await updateStockMaker({ items: stock.map((s) => ({ id: s.id, quantity: s.quantity })) });
      setUnsavedStock(stock);
    },
    [stock],
    true,
    () => setIsLoading(false),
  );

  const onChangeQuantity = useCallback((item: IStockMaker) => {
    setStock((e) => e.map((s) => (s.id === item.id ? item : s)));
  }, []);

  const handleAddItem = useAsyncCallback(
    async () => {
      setIsLoading(true);

      if (!fileToUpload) {
        toast({ title: `Selecione uma imagem para o componente` });
        return;
      }

      const presignedUrl = await getPresignedUrl(fileToUpload?.type || ``, `store-maker`);

      await uploadFile(presignedUrl.link, fileToUpload as any);

      const newItem = await addItemInStockMaker({ ...data, image: presignedUrl.path, hub_school_id: school?.hub_school_id || `` });

      setStock((prev) => [...prev, newItem]);
      setUnsavedStock((prev) => [...prev, newItem]);
      onClose();
    },
    [data, fileToUpload],
    true,
    () => setIsLoading(false),
  );

  return (
    <Flex direction="column" flex="1" overflow="hidden" gap="1rem" userSelect="none">
      <Flex w="100%" justify="flex-end" gap="1rem">
        <PlusButton label="Adicionar Item" rightIcon={<IoMdAdd />} alignSelf="flex-end" onClick={onOpen} isLoading={isLoading} />
        <PlusButton label="Salvar" rightIcon={<FaSave />} alignSelf="flex-end" warning={needSave} onClick={handleSave} isLoading={isLoading} />
      </Flex>

      <Skeleton
        display="grid"
        overflow="hidden auto"
        isLoaded={!isLoading}
        gap="1rem"
        gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
        gridTemplateRows="minmax(min-content, max-content)"
        borderRadius="md"
        pb="1rem"
        flex="1"
      >
        {stock
          .sort((a, b) => a.store_item.name?.localeCompare(b.store_item.name, undefined, { sensitivity: 'base' }))
          .map((stock) => (
            <motion.div
              key={stock.id}
              initial={{ scale: 0 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              style={{
                display: `flex`,
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: 'md',
                flexDirection: 'column',
                padding: '20px',
                justifyContent: 'space-between',
                gap: '0.5rem',
                border: `1px solid #cccccc66`,
              }}
            >
              <Image
                src={stock.hub_user_id ? stock.metadata.image : stock.store_item.picture}
                height="180"
                width="180"
                alt="test"
                style={{ alignSelf: 'center', justifySelf: 'center' }}
              />
              <Flex direction="column" gap="0.75rem" w="100%">
                <Text color="gray600">{stock.hub_user_id ? stock.metadata.name : stock.store_item.name}</Text>
                <Divider />
                <Flex justify="space-between" align="center" w="100%" color="gray500">
                  <Flex
                    fontSize="12px"
                    cursor="pointer"
                    onClick={() => onChangeQuantity({ ...stock, quantity: stock.quantity - 1 })}
                    transition="all 0.1s"
                    _hover={{ transform: `scale(1.15)` }}
                  >
                    <FaMinus />
                  </Flex>
                  <Flex w="50px">
                    <TextInput
                      value={stock.quantity?.toString() || ''}
                      onInputChange={(value) => onChangeQuantity({ ...stock, quantity: Number(value.replace(/\D/g, '')) })}
                      fontSize="14px"
                      fontWeight="500"
                      color="gray500"
                      p="0"
                      textAlign="center"
                    />
                  </Flex>
                  <Flex
                    fontSize="12px"
                    cursor="pointer"
                    onClick={() => onChangeQuantity({ ...stock, quantity: stock.quantity + 1 })}
                    transition="all 0.1s"
                    _hover={{ transform: `scale(1.15)` }}
                  >
                    <FaPlus />
                  </Flex>
                </Flex>
              </Flex>
            </motion.div>
          ))}
      </Skeleton>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar componente ao estoque</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap="1rem">
              <TextInput value={data.name} error={errors.name} onInputChange={(value) => onInputChange('name', value)} label="Nome do componente" />
              <Flex gap="1rem">
                <NumberInput
                  value={data.quantity}
                  error={errors.quantity}
                  onInputChange={(value) => onInputChange('quantity', Number(value))}
                  label="Quantidade"
                />

                <Flex align="center" direction="column" justify="space-between" gap="0.5rem">
                  <Text color="gray700" fontSize="13.5px" whiteSpace="nowrap" fontWeight="500">
                    É Reutilizável?
                  </Text>
                  <Switch isChecked={isReusable} onChange={(e) => setIsReusable(e.target.checked)} flex="1" pt="0.5rem" />
                </Flex>
              </Flex>
              <Upload beforeUpload={(file: UploadFile) => setFileToUpload(file)} fileList={fileToUpload ? [fileToUpload] : []}>
                <Button leftIcon={<UploadOutlined />}>Selecione a Imagem</Button>
              </Upload>
              {fileToUpload && <Image src={fileToUpload ? URL.createObjectURL(fileToUpload as any) : ``} alt="Imagem selecionada" />}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => submit(handleAddItem)} isLoading={isLoading}>
              Adicionar
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Stock;
export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'stock';

  return { props: { selectedPage, pageTitle: 'Estoque', showBackButton: false } };
};
