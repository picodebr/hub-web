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
import { FaMinus, FaPlus, FaSearch } from 'react-icons/fa';
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
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const filteredStock = stock.filter((item) => {
    const name = item.hub_user_id ? item.metadata.name : item.store_item.name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <motion.div
      key={'Stock'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Flex direction="column" w="100%" h="100%">
        <Flex align="center" w="100%">
          <Flex align="center" gap="0.75rem" px="1rem" py="0.75rem" bg="#f5f5f5" borderRadius="10px" maxW="300px" w="100%">
            <FaSearch color="#999" fontSize="16px" />
            <TextInput
              placeholder="Buscar item..."
              value={searchQuery}
              onInputChange={setSearchQuery}
              fontSize="14px"
              w="100%"
              border="none"
              bg="transparent"
              p="0"
              _focus={{ outline: 'none', boxShadow: 'none' }}
              _placeholder={{ color: '#999' }}
            />
          </Flex>
        </Flex>
        {!filteredStock?.length ? (
          <Text fontSize="16px" fontWeight="500" w="100%" textAlign="center" pt="2rem">
            Nenhuma solicitação encontrada
          </Text>
        ) : (
          <Skeleton
            display="grid"
            isLoaded={!isLoading}
            gap="1rem"
            gridTemplateColumns="repeat(3, 1fr)"
            gridTemplateRows="minmax(min-content, max-content)"
            borderRadius="lg"
            p="2rem 0"
            flex="1"
            h="100%"
          >
            {filteredStock
              .sort((a, b) => a.store_item.name?.localeCompare(b.store_item.name, undefined, { sensitivity: 'base' }))
              .map((stock) => (
                <motion.div
                  key={stock.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  style={{
                    display: `flex`,
                    borderRadius: '16px',
                    backgroundColor: `white`,
                    flexDirection: 'column',
                    padding: '20px',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    border: `1px solid #e8e8e8`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Flex justify="center" align="center" h="160px" w="100%" bg="#f9f9f9" borderRadius="12px">
                    <Image
                      src={stock.hub_user_id ? stock.metadata.image : stock.store_item.picture}
                      height="140"
                      width="140"
                      alt="test"
                      style={{ objectFit: 'contain', maxHeight: `140px` }}
                    />
                  </Flex>

                  <Flex direction="column" gap="0.75rem" w="100%">
                    <Text color="#1a1a1a" fontSize="15px" fontWeight="600" lineHeight="1.4" noOfLines={2}>
                      {stock.hub_user_id ? stock.metadata.name : stock.store_item.name}
                    </Text>
                  </Flex>

                  {stock.store_item?.metadata?.is_service || stock.metadata.is_service ? (
                    <Flex px="12px" py="8px" bg="#f0f0f0" borderRadius="8px" align="center" justify="center">
                      <Text fontSize="12px" color="#666" fontWeight="500">
                        Serviço
                      </Text>
                    </Flex>
                  ) : (
                    <Flex justify="space-between" align="center" w="100%" bg="#f9f9f9" borderRadius="10px" p="8px" gap="0.5rem">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChangeQuantity({ ...stock, quantity: Math.max(0, stock.quantity - 1) })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: '#666',
                          fontSize: '14px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (e.currentTarget) {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (e.currentTarget) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <FaMinus />
                      </motion.button>

                      <Flex flex="1" justify="center">
                        <TextInput
                          value={stock.quantity?.toString() || '0'}
                          onInputChange={(value) => onChangeQuantity({ ...stock, quantity: Math.max(0, Number(value.replace(/\D/g, ''))) })}
                          fontSize="14px"
                          fontWeight="600"
                          color="#1a1a1a"
                          p="0"
                          textAlign="center"
                          border="none"
                          bg="transparent"
                          _focus={{ outline: 'none', boxShadow: 'none' }}
                        />
                      </Flex>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChangeQuantity({ ...stock, quantity: stock.quantity + 1 })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: '#666',
                          fontSize: '14px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (e.currentTarget) {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (e.currentTarget) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <FaPlus />
                      </motion.button>
                    </Flex>
                  )}
                </motion.div>
              ))}
          </Skeleton>
        )}
      </Flex>

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
