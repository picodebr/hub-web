import { GetServerSideProps } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flex, Text, Skeleton, Divider } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { FaMinus, FaPlus, FaSave } from 'react-icons/fa';
import { getStockMaker, updateStockMaker } from '@/_base/services/storeMaker';
import { IStockMaker } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { PlusButton } from '@/components/Buttons/Plus';
import { TextInput } from '@/components/Inputs/Text';
import { Image } from 'antd';

const Stock: React.FC = () => {
  const [unSavedstock, setUnsavedStock] = useState<IStockMaker[]>([]);
  const [stock, setStock] = useState<IStockMaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Flex direction="column" flex="1" overflow="hidden" gap="1rem" userSelect="none">
      <PlusButton label="Salvar" rightIcon={<FaSave />} alignSelf="flex-end" warning={needSave} onClick={handleSave} isLoading={isLoading} />
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
    </Flex>
  );
};

export default Stock;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'stock';

  return { props: { selectedPage, pageTitle: 'Estoque', showBackButton: false } };
};
