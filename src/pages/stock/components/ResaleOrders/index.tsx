import { Flex, Grid, Text, Image, Avatar, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { SmallModal } from '@/components/Modal/Small';
import { IStoreMakerResale } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useAuth, useCustomToast } from '@/_base/hooks';
import { acceptResaleStockItem, getStockResales } from '@/_base/services/storeMaker';
import { useSelectedSchool } from '@/components/Page/components/Header';

interface IProps {}

export const ResaleOrders: React.FC<IProps> = () => {
  const [selectedStoreItem, setSelectedStoreItem] = useState<IStoreMakerResale | null>(null);
  const [storeMakerList, setStoreMakerList] = useState<IStoreMakerResale[]>([]);

  const { school } = useSelectedSchool();
  const { user } = useAuth();

  useEffect(() => {
    if (!school?.hub_school_id) return;
    (async () => {
      const results = await getStockResales(school?.hub_school_id || ``);
      setStoreMakerList(results.filter((e) => !e.approved_at && e.seller_group.project?.user_id === user.id));
    })();
  }, [school]);

  const toast = useCustomToast();

  const handleAcceptResale = useAsyncCallback(async () => {
    if (!selectedStoreItem) return;
    await acceptResaleStockItem(selectedStoreItem.id);
    setStoreMakerList((e) => e.filter((i) => i.id !== selectedStoreItem.id));
    handleCloseModal();
    toast({ status: `success`, title: `Revenda aceita`, position: `top` });
  }, [selectedStoreItem]);

  const handleCloseModal = () => {
    setSelectedStoreItem(null);
  };

  return (
    <motion.div
      key={'ResaleOrders'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, width: `100%`, height: `100%`, overflow: `hidden` }}
    >
      <Flex gap="1rem" flex="1" direction={{ base: `column-reverse`, lg: `row` }}>
        <Flex
          flex="1"
          bgColor="white"
          flexDirection="row"
          borderRadius="12px"
          padding="20px"
          gap="20px"
          textAlign="left"
          display="flex"
          overflow="hidden auto"
          border="1px"
          borderColor="gray200"
          transition="ease-in-out 0.3s"
        >
          {storeMakerList.length ? (
            <Grid
              gap="1rem"
              gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(10rem, 1fr))', lg: 'repeat(auto-fill, minmax(12rem, 1fr))' }}
              gridTemplateRows="minmax(min-content, max-content)"
              padding="2rem"
              borderRadius="md"
              flex="1"
              overflow="hidden auto"
            >
              {storeMakerList.map((item, i) => (
                <Flex key={`${item.id} - ${i}`} position="relative" w="fit-content" h="fit-content">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.75 }}
                    style={{
                      display: `flex`,
                    }}
                    onClick={() => {
                      setSelectedStoreItem(item);
                    }}
                  >
                    <Flex
                      direction="column"
                      gap="0.5rem"
                      cursor="pointer"
                      fontWeight="500"
                      color="gray700"
                      fontSize="14px"
                      align="center"
                      justify="space-between"
                      height={{ base: `13.5rem`, lg: '15.5rem' }}
                      width={{ base: `11rem`, lg: '13rem' }}
                      border="1px"
                      borderColor="gray300"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Image src={item.store_maker_item.picture} maxHeight={{ base: `8rem`, lg: `10rem` }} w="100%" />
                      <Flex direction="column" gap="9px" minH="3.5rem" maxH="3.5rem" w="100%">
                        <Text noOfLines={2} px="0.5rem" flex="1" fontSize="13px" fontWeight="400">
                          {item.store_maker_item.name}
                        </Text>
                        <Flex align="center" justify="space-between" p="0 0.5rem 0 1rem">
                          <Text>{`${item?.quantity || 0} ${item?.quantity === 1 ? 'unidade' : 'unidades'}`}</Text>
                          <Flex align="center" justify="center" gap="0.25rem" pr="0.5rem">
                            <Image src="/icons/coin.svg" />
                            <Text w="fit-content" fontSize="14px" display="flex" color="primary700" fontWeight="500">
                               R$ {item.price}
                            </Text>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  </motion.button>
                </Flex>
              ))}
            </Grid>
          ) : (
            <Flex h="100%" w="100%">
              <Text margin="auto" fontSize="16px" fontWeight="500">
                Nenhuma solicitação encontrada
              </Text>
            </Flex>
          )}
        </Flex>

        <SmallModal
          title={selectedStoreItem?.store_maker_item.name}
          show={!!selectedStoreItem}
          onConfirm={handleAcceptResale}
          onCancel={handleCloseModal}
          onCloseModal={handleCloseModal}
          okText="Aceitar revenda"
          size="lg"
        >
          <Flex direction="column" gap="1rem" w="100%" minW="25rem" align="center">
            <Flex
              bgImage={selectedStoreItem?.store_maker_item.picture}
              bgPosition="center"
              bgRepeat="no-repeat"
              bgSize="cover"
              w="15rem"
              h="15rem"
              border="1px"
              borderRadius="md"
              borderColor="gray300"
            />
            <Text fontSize="14px" color="gray600">
              {`${selectedStoreItem?.quantity || 0} ${selectedStoreItem?.quantity === 1 ? 'unidade' : 'unidades'} sendo ${
                selectedStoreItem?.quantity === 1 ? 'vendida' : 'vendidas'
              } para`}
              <b style={{ marginLeft: `0.25rem` }}>{`${selectedStoreItem?.metadata.target_buyer === `teacher` ? 'o professor' : 'os grupos'}`}</b>
            </Text>
            <Text>{selectedStoreItem?.store_maker_item.description}</Text>

            <Flex>
              <Text fontSize="15px" display="flex" align="center" gap="9px" fontWeight="500" mr="0.75rem">
                Valor da revenda
              </Text>
              <Text fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500" mr="0.2rem">
                {selectedStoreItem?.price}
              </Text>
              <Image src="/icons/coin.svg" />
            </Flex>
            <Accordion allowMultiple w="100%" fontWeight="500" color="gray700">
              <AccordionItem border="none">
                <AccordionButton justifyContent="space-between">
                  <Text fontSize={{ base: `15px`, xl: '16px' }}>{selectedStoreItem?.seller_group.display_name}</Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel fontWeight="400">
                  {selectedStoreItem?.seller_group.students.map((student) => (
                    <Flex key={student.id} direction="column">
                      <Flex h="fit-content" gap="12px" p="12px" w="100%" align="center">
                        <Avatar src={student.avatar || undefined} size="sm" />
                        <Flex direction="column" flex="1">
                          <Text color="gray700" fontSize="14px" fontWeight="600">
                            {student.name}
                          </Text>
                          <Text color="gray500" fontSize="14px">
                            @{student.username}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Flex direction="column"></Flex>
          </Flex>
        </SmallModal>
      </Flex>
    </motion.div>
  );
};
