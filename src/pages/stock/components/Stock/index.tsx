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
import { LuPin } from 'react-icons/lu';
import { TbChartInfographic } from 'react-icons/tb';
import { formatClassGrade, formatShortName } from '@/_base/utils';

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
  const [stockToView, setStockToView] = useState<IStockMaker | null>(null);

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
        p="1rem 1rem 1rem 0"
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
                backgroundColor: `${stock.quantity <= 3 && !(stock.store_item?.metadata?.is_service || stock.metadata.is_service) ? '#ffe8e8' : 'white'}`,
                boxShadow: 'md',
                flexDirection: 'column',
                padding: '20px',
                justifyContent: 'space-between',
                gap: '0.5rem',
                border: `1px solid ${stock.quantity <= 3 && !(stock.store_item?.metadata?.is_service || stock.metadata.is_service) ? '#f32a2a66' : '#cccccc66'}`,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.75 }}
                style={{
                  display: `flex`,
                  position: 'absolute',
                  top: '-0.4rem',
                  right: '-0.4rem',
                  width: '28px',
                  height: '28px',
                  backgroundColor: `#529dff`,
                  borderRadius: '6px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: '1',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '1px 1px 0 0 ',
                }}
                onClick={() => setStockToView(stock)}
              >
                <TbChartInfographic fontSize="19px" />
                <Flex
                  position="absolute"
                  top="-0.5rem"
                  right="-0.5rem"
                  zIndex="20"
                  border="1px"
                  w="1.1rem"
                  h="1.1rem"
                  justify="center"
                  align="center"
                  borderColor={`#529dff`}
                  color={`#529dff`}
                  borderRadius="50%"
                  bg="white"
                >
                  {stock.interested_users?.length + stock.cart_additions?.length}
                </Flex>
              </motion.button>
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
                {stock.store_item?.metadata?.is_service || stock.metadata.is_service ? (
                  <Flex>
                    <Text>•➤ Serviço</Text>
                  </Flex>
                ) : (
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
                )}
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

      <Modal isOpen={!!stockToView} onClose={() => setStockToView(null)} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`${stockToView?.store_item?.name} | Métricas`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex w="100%" h="100%" gap="1rem">
              <Flex flex="1" direction="column" border="1px" borderColor="gray300" overflow="hidden" borderRadius="md">
                <Text align="center" fontWeight="500" fontSize="18px" p="0.5rem">
                  No carrinho
                </Text>

                <Flex p="0.5rem" direction="column" maxH="600px" overflow="auto" gap="1rem">
                  {stockToView?.cart_additions?.map((student) => (
                    <Flex direction="column" gap="0.25rem" key={student.id} borderBottom="1px" borderColor="gray300" pb="1rem">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="500">{formatShortName(student.name, true)}</Text>
                        <Text fontWeight="500" color="primary700">
                          {formatClassGrade(student.grade)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" align="center" color="gray600" fontSize="14px">
                        <Text>{student.group_name}</Text>
                        <Text>{student.class_name}</Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
              <Flex flex="1" direction="column" border="1px" borderColor="gray300" overflow="hidden" borderRadius="md">
                <Text align="center" fontWeight="500" fontSize="18px" p="0.5rem">
                  Demonstrou interesse
                </Text>

                <Flex p="0.5rem" direction="column" maxH="600px" overflow="auto" gap="1rem">
                  {stockToView?.interested_users?.map((student) => (
                    <Flex direction="column" gap="0.25rem" key={student.id} borderBottom="1px" borderColor="gray300" pb="1rem">
                      <Flex justify="space-between" align="center">
                        <Text></Text>
                        <Text fontWeight="500" color="primary700">
                          {formatClassGrade(student.grade)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" align="center" color="gray600" fontSize="14px">
                        <Text fontWeight="500">{formatShortName(student.name, true)}</Text>
                        <Text>{student.class_name}</Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};
