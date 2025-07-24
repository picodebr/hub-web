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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { UploadOutlined } from '@ant-design/icons';
import { Upload, Image } from 'antd'; // Adicionei o Upload do Ant Design
import type { UploadFile } from 'antd';

import { TextInput } from '@/components/Inputs/Text';
import { NumberInput } from '@/components/Inputs/Number';
import { addStockMakerSchema, EMPTY_STOCK_MAKER_ITEM, IAddStockMakerParams, IStockMaker } from '@/_base/interfaces/storeMaker';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useAsyncCallback, useCustomToast, useInputHandler } from '@/_base/hooks';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { addItemInStockMaker } from '@/_base/services/storeMaker';
import { useSelectedSchool } from '@/components/Page/components/Header';

interface IProps {
  isLoading: boolean;
  stock: IStockMaker[];
  setStock: Dispatch<SetStateAction<IStockMaker[]>>;
  setUnsavedStock: Dispatch<SetStateAction<IStockMaker[]>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  onCloseModal: () => void;
  modalIsOpen: boolean;
}

export const StockPage: React.FC<IProps> = ({ isLoading, stock, setStock, setIsLoading, setUnsavedStock, onCloseModal, modalIsOpen }) => {
  const [fileToUpload, setFileToUpload] = useState<UploadFile | null>(null);

  const { data, onInputChange, submit, errors } = useInputHandler<IAddStockMakerParams>({
    schema: addStockMakerSchema,
    data: EMPTY_STOCK_MAKER_ITEM,
  });
  const toast = useCustomToast();
  const { school } = useSelectedSchool();

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
      onCloseModal();
    },
    [data, fileToUpload],
    true,
    () => setIsLoading(false),
  );
  return (
    <motion.div
      key={'Stock'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, width: `100%`, height: `100%`, overflow: `hidden` }}
    >
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
                backgroundColor: `${stock.quantity <= 3 ? '#ffe8e8' : 'white'}`,
                boxShadow: 'md',
                flexDirection: 'column',
                padding: '20px',
                justifyContent: 'space-between',
                gap: '0.5rem',
                border: `1px solid ${stock.quantity <= 3 ? '#f32a2a66' : '#cccccc66'}`,
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
      <Modal isOpen={modalIsOpen} onClose={onCloseModal}>
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

                <Flex flex="1" justify="space-between" gap="1rem">
                  <Flex align="center" direction="column" justify="space-between" gap="0.5rem" flex="1">
                    <Text color="gray700" fontSize="13.5px" whiteSpace="nowrap" fontWeight="500">
                      É Reutilizável?
                    </Text>
                    <Switch isChecked={data.reusable} onChange={(e) => onInputChange(`reusable`, e.target.checked)} flex="1" pt="0.5rem" />
                  </Flex>
                  <Flex align="center" direction="column" justify="space-between" gap="0.5rem" flex="1">
                    <Text color="gray700" fontSize="13.5px" whiteSpace="nowrap" fontWeight="500">
                      É um serviço?
                    </Text>
                    <Switch isChecked={data.is_service} onChange={(e) => onInputChange(`is_service`, e.target.checked)} flex="1" pt="0.5rem" />
                  </Flex>
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
            <Button onClick={onCloseModal}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};
