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
  Input,
  Switch,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMinus, FaPlus, FaSave } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { UploadOutlined } from '@ant-design/icons';
import { Upload, message, Image } from 'antd'; // Adicionei o Upload do Ant Design
import type { UploadFile } from 'antd';

import { getStockMaker, updateStockMaker } from '@/_base/services/storeMaker';
import { IStockMaker } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { PlusButton } from '@/components/Buttons/Plus';
import { TextInput } from '@/components/Inputs/Text';

const Stock: React.FC = () => {
  const [unSavedstock, setUnsavedStock] = useState<IStockMaker[]>([]);
  const [stock, setStock] = useState<IStockMaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]); // Adicionando estado do upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemName, setItemName] = useState('');
  const [itemPhoto, setItemPhoto] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [isReusable, setIsReusable] = useState(false);

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

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files[]', file as any);
    });
    setUploading(true);

    //Alterar p/ nossa API, esse ta o padrão do antd
    try {
      const response = await fetch('https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      setItemPhoto(data.url);
      message.success('Upload realizado com sucesso!');
    } catch (error) {
      message.error('Falha no upload');
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      store_item: { name: itemName, picture: itemPhoto },
      quantity: itemQuantity,
      reusable: isReusable,
    };
    setStock((prev) => [...prev, newItem as IStockMaker]);
    onClose();
  };

  const uploadProps = {
    beforeUpload: (file: UploadFile) => {
      setFileList([...fileList, file]);
      const imageURL = URL.createObjectURL(file as any);
      setImagePreview(imageURL);
      return false;
    },
    fileList,
  };

  return (
    <Flex direction="column" flex="1" overflow="hidden" gap="1rem" userSelect="none">
      <Flex w="100%" justify="flex-end" gap="1rem">
        <PlusButton label="Adicionar Item" rightIcon={<IoMdAdd />} alignSelf="flex-end" warning={needSave} onClick={onOpen} isLoading={isLoading} />
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
              <Image src={stock.store_item.picture} height="180" width="180" alt="test" style={{ alignSelf: 'center', justifySelf: 'center' }} />
              <Flex direction="column" gap="0.75rem" w="100%">
                <Text color="gray600">{stock.store_item.name}</Text>
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
          <ModalHeader>Adicionar Item Personalizado</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="Nome do Item" value={itemName} onChange={(e) => setItemName(e.target.value)} mb={4} />
            <Input type="number" placeholder="Quantidade" value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))} mb={4} />

            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading}>
                Selecione a Imagem
              </Button>
            </Upload>
            {imagePreview && <Image src={imagePreview} alt="Imagem selecionada" style={{ marginTop: '20px' }} />}

            <Flex align="center" justify="space-between" mt={4}>
              <Text>É Reutilizável?</Text>
              <Switch isChecked={isReusable} onChange={(e) => setIsReusable(e.target.checked)} />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddItem} isLoading={isLoading || uploading}>
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
