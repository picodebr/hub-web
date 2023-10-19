import {
  Box,
  Divider,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  StackDivider,
  Text,
  VStack,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { HiOutlineBellAlert } from 'react-icons/hi2';
import { TbWorld } from 'react-icons/tb';

import { useAsyncCallback } from '@/_base/hooks';
import { IAd } from '@/_base/interfaces/ad';
import { IAdmin } from '@/_base/interfaces/admin';
import { ICampaign } from '@/_base/interfaces/campaign';
import { INotification } from '@/_base/interfaces/notification';
import { listCampaignsWithMetrics } from '@/_base/services/campaign';
import { listNotifications, updateNotification } from '@/_base/services/notification';
import { forceTokenExpiration, logError, notificationMetadataMapper, updateApiToken } from '@/_base/utils';
import { AppSelect } from '@/components/Forms/Select';
import { dimensions } from '@/styles/global';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  SubTitle,
  Tooltip,
} from 'chart.js';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { BsFillBarChartFill } from 'react-icons/bs';
import { ImFileEmpty } from 'react-icons/im';
import { MdOutlineKeyboardArrowRight, MdOutlineNotificationImportant } from 'react-icons/md';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip, SubTitle);

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const hours = [
  '00h',
  '01h',
  '02h',
  '03h',
  '04h',
  '05h',
  '06h',
  '07h',
  '08h',
  '09h',
  '10h',
  '11h',
  '12h',
  '13h',
  '14h',
  '15h',
  '16h',
  '17h',
  '18h',
  '19h',
  '20h',
  '21h',
  '22h',
  '23h',
];

type SelectedAdType = Array<IAd & { position: number | null }>;
interface IProps {
  admin: IAdmin;
  campaigns: ICampaign[];
  notifications: INotification[];
}

const Home: React.FC<IProps> = ({ campaigns, notifications: _notifications, admin }) => {
  const [notifications, setNotifications] = useState<INotification[]>(_notifications);
  const [targetCampaign, setTargetCampaign] = useState<ICampaign | null>(null);
  const [selectedAds, setSelectedAds] = useState<SelectedAdType>([]);

  const lineMultiAxisChartData: ChartData<'line', number[], string> = useMemo(
    () => ({
      labels: hours,
      datasets: selectedAds
        .filter((e) => e.position !== null)
        .sort((a, b) => (a?.position || 0) - (b?.position || 0))
        .map((ad, i) => ({
          ...ad,
          label: ad.name,
          backgroundColor: i === 0 ? '#FFE0E6' : i === 1 ? '#A7D7F7' : '#FFF5DD',
          borderColor: i === 0 ? '#E68E9F' : i === 1 ? '#5090BB' : '#d6cc6f',
          data: Array.from(
            { length: new Date().getHours() },
            (_, i) => ad.collected_data.flatMap((e) => e.event_mapping.clicks.filter((e) => new Date(e.registered_at).getHours() === i + 1)).length,
          ),
        })),
    }),
    [selectedAds],
  );

  const doughnutChartData: ChartData<'line', number[], string> = useMemo(() => {
    const values = { desktop: 0, mobile: 0 };

    selectedAds.flatMap((ad) => ad.collected_data.forEach((e) => (e.is_mobile ? (values.mobile += 1) : (values.desktop += 1))));

    if (!values.desktop && !values.mobile) {
      values.desktop += -1;
      values.mobile += -1;
    }
    return {
      labels: ['Desktop', 'Mobile'],
      datasets: [
        {
          data: [values.desktop, values.mobile],
          backgroundColor: ['#FFE0E6', '#A7D7F7'],
          borderColor: ['#E68E9F', '#5090BB'],
          borderWidth: 1,
        },
      ],
    };
  }, [selectedAds]);

  const handleChange = (id: string, position: number) => {
    setSelectedAds((e) => e.map((ad) => ({ ...ad, position: id === ad.id ? position : position === ad.position ? null : ad.position })));
  };

  const handleChangeCampaign = (id: string) => {
    const campaign = campaigns.find((e) => e.id === id) || null;
    if (campaign) {
      setTargetCampaign(campaign);
      setSelectedAds(campaign.ads.map((e) => ({ ...e, position: null })));
    }
  };

  const handleOpenNotification = useAsyncCallback(async (id: string) => {
    await updateNotification({ id, viewed: true });
    setNotifications((e) => e.map((n) => (n.id === id ? { ...n, viewed: true } : n)));
  }, []);

  return (
    <Flex flex="4" direction="column" gap="1rem">
      {/* Top Content */}
      <Flex flex="1" gap="1rem" maxH={`calc(50% - ${dimensions.header.height} / 2)`} minH={`calc(50% - ${dimensions.header.height} / 2)`}>
        {/* Insights */}
        <Flex
          flex="2"
          direction="column"
          overflow="hidden"
          bg="bg.white"
          padding="1rem 0.25rem 1rem 1rem"
          gap="0.5rem"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Flex align="center" gap="0.25rem">
            <HiOutlineBellAlert fontSize="1.5rem" />
            <Text fontSize="1.125rem" fontWeight="bold" color="text.black">
              Insights
            </Text>
          </Flex>
          <Flex overflow="hidden auto" w="100%" h="100%" gap="0.5rem" direction="column" paddingRight="0.75rem" paddingTop="0.5rem">
            {!notifications.length ? (
              <Flex h="90%" w="100%" align="center" justify="center" color="text.gray" fontSize="1.875rem" gap="1rem">
                <Text>Empty data</Text>
                <ImFileEmpty />
              </Flex>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <Flex
                  key={notification.id}
                  h="4rem"
                  border="1px"
                  borderColor="border.light"
                  rounded="md"
                  color="text.black"
                  bg={notification.viewed ? 'bg.white' : 'bg.gray'}
                >
                  <Flex direction="column" overflow="hidden" w="100%" padding="0.35rem 0.35rem 0.35rem 0.6rem">
                    <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" fontWeight="bold">
                      {notification.title}
                    </Text>
                    <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {notification.subtitle || ''}
                    </Text>
                  </Flex>
                  <Popover placement="right" onOpen={() => handleOpenNotification(notification.id)}>
                    <PopoverTrigger>
                      <Flex
                        h="100%"
                        minW="2rem"
                        align="center"
                        justify="center"
                        cursor="pointer"
                        transition="all 0.15s"
                        _hover={{ bg: notification.viewed ? 'bg.gray' : 'bg.white' }}
                        position="relative"
                      >
                        <Flex
                          borderRadius="50%"
                          w="1.5rem"
                          h="1.5rem"
                          position="absolute"
                          align="center"
                          justify="center"
                          top="-0.5rem"
                          right="-0.5rem"
                          bg="notification.unread"
                          color="text.white"
                          display={notification.viewed ? 'none' : 'flex'}
                        >
                          <MdOutlineNotificationImportant />
                        </Flex>
                        <MdOutlineKeyboardArrowRight />
                      </Flex>
                    </PopoverTrigger>
                    <PopoverContent marginRight="1rem" minW="25rem" boxShadow="md">
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader>
                        <Text fontWeight="bold" color="text.black" mb="0.25rem">
                          {notification.title}
                        </Text>
                        <Text fontWeight="light" color="text.gray">
                          {notification.subtitle}
                        </Text>
                      </PopoverHeader>
                      <PopoverBody>
                        {!!notification.metadata && (
                          <Text fontWeight="light" color="text.gray" fontSize="14px">
                            Updated fields
                          </Text>
                        )}
                        {!!notification.metadata && (
                          <VStack
                            divider={<StackDivider borderColor="gray.300" />}
                            spacing={0}
                            align="stretch"
                            border="1px solid"
                            borderColor="gray.300"
                            borderRadius="md"
                            overflow="hidden"
                            marginTop="0.5rem"
                          >
                            {Object.keys(notificationMetadataMapper(notification.metadata)).map((key) => (
                              <Flex key={key} h="2rem">
                                <Flex
                                  padding="0 0.5rem"
                                  align="center"
                                  flex="2"
                                  borderRight="1px solid"
                                  borderRightColor="gray.300"
                                  color="black.100"
                                  bg="gray.50"
                                  fontSize="14px"
                                >
                                  <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                    {key}
                                  </Text>
                                </Flex>
                                <Flex padding="0 0.5rem" align="center" flex="5" bg="white" fontSize="14px" overflow="auto hidden">
                                  <Text whiteSpace="nowrap" overflow="auto">
                                    {notificationMetadataMapper(notification.metadata)[key]}
                                  </Text>
                                </Flex>
                              </Flex>
                            ))}
                          </VStack>
                        )}
                        {!!notification.metadata && <Divider m="0.5rem 0" />}
                        <Text textAlign="right" color="text.gray">
                          {moment(notification.created_at).format('DD/MM/YYYY - HH:mm')}
                        </Text>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Flex>
              ))
            )}
          </Flex>
        </Flex>

        {/* Campaign and ad selection */}
        <Flex direction="column" flex="1" maxW="50%" gap="1rem" justify="space-between">
          <Flex borderRadius="md" padding="0.75rem 0.5rem" bg="bg.white" border="1px" borderColor="gray.200" flex="1" maxH="4.5rem">
            <Flex align="center" gap="0.25rem">
              <TbWorld fontSize="1.65rem" />
            </Flex>
            <Flex fontSize="1.35rem" fontWeight="bold" gap="0.5rem" align="center" justify="center" flex="1">
              <Text>{admin.org.name}</Text>
            </Flex>
          </Flex>

          <Flex direction="column" borderRadius="md" padding="0.75rem 0.5rem 1rem" bg="bg.white" border="1px" borderColor="gray.200" flex="1">
            <Flex align="center" gap="0.25rem" mb="0.25rem">
              <HiOutlineBellAlert fontSize="1.5rem" />
              <Text fontSize="1.125rem" fontWeight="bold" color="text.black" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                Select a campaign to view metrics
              </Text>
            </Flex>
            <Flex padding="0 1rem" align="center" flex="2">
              <AppSelect
                borderColor="gray.300"
                placeholder=" "
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                fontSize="0.975rem"
                onChange={(e) => handleChangeCampaign(e.target.value)}
              >
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaigns.find((e) => e.name === campaign.name)?.name || ''}
                  </option>
                ))}
              </AppSelect>
            </Flex>
            <Text padding="0 0.5rem 0.25rem" fontSize="1.125rem" color="text.gray">
              Creatives
            </Text>
            <VStack
              divider={<StackDivider borderColor="gray.300" />}
              spacing={0}
              align="stretch"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              margin="0 0.5rem"
              bg="#fff"
              overflow="hidden auto"
            >
              <Flex minH="3rem">
                <Flex padding="0.5rem" align="center" borderRight="1px solid" borderRightColor="gray.300" color="black.100" bg="gray.50">
                  <Box w="20px" h="20px" bg="#FFE0E6" border="1px" borderColor="#E68E9F" />
                </Flex>
                <Flex padding="0 1rem" align="center" flex="2">
                  <AppSelect
                    placeholder=" "
                    border="none"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    fontSize="0.975rem"
                    onChange={(e) => handleChange(e.target.value, 1)}
                  >
                    {selectedAds.map((ad) => (
                      <option key={ad.id} value={ad.id} disabled={ad.position !== null}>
                        {ad.name || ''}
                      </option>
                    ))}
                  </AppSelect>
                </Flex>
              </Flex>
              <Flex minH="3rem">
                <Flex padding="0.5rem" align="center" borderRight="1px solid" borderRightColor="gray.300" color="black.100" bg="gray.50">
                  <Box w="20px" h="20px" bg="#A7D7F7" border="1px" borderColor="#5090BB" />
                </Flex>
                <Flex padding="0 1rem" align="center" flex="2">
                  <AppSelect
                    placeholder=" "
                    border="none"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    fontSize="0.975rem"
                    onChange={(e) => handleChange(e.target.value, 2)}
                  >
                    {selectedAds.map((ad) => (
                      <option key={ad.id} value={ad.id} disabled={ad.position !== null}>
                        {ad.name || ''}
                      </option>
                    ))}
                  </AppSelect>
                </Flex>
              </Flex>
              <Flex minH="3rem">
                <Flex padding="0.5rem" align="center" borderRight="1px solid" borderRightColor="gray.300" color="black.100" bg="gray.50">
                  <Box w="20px" h="20px" bg="#FFF5DD" border="1px" borderColor="#d6cc6f" />
                </Flex>
                <Flex padding="0 1rem" align="center" flex="2">
                  <AppSelect
                    placeholder=" "
                    border="none"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    fontSize="0.975rem"
                    onChange={(e) => handleChange(e.target.value, 3)}
                  >
                    {selectedAds.map((ad) => (
                      <option key={ad.id} value={ad.id} disabled={ad.position !== null}>
                        {ad.name || ''}
                      </option>
                    ))}
                  </AppSelect>
                </Flex>
              </Flex>
            </VStack>
          </Flex>
        </Flex>
      </Flex>

      {/* Bottom Content */}
      <Flex
        flex="5"
        overflow="hidden"
        justify="space-around"
        border="1px"
        padding="0.5rem 0.5rem 1.5rem"
        borderRadius="0.5rem"
        borderColor="gray.200"
        bg="#fff"
      >
        {/* Clickthrough rate */}
        <Flex w="100%" direction="column">
          <Flex align="center" gap="0.25rem" padding="0.5rem 0.5rem 0.25rem">
            <BsFillBarChartFill fontSize="1.15rem" />
            <Text fontSize="1.125rem" fontWeight="bold" color="text.black">
              Clickthrough rate
            </Text>
          </Flex>
          <Line
            data={lineMultiAxisChartData}
            height="90"
            options={{
              responsive: true,
              interaction: { mode: 'index' as const, intersect: false },
              plugins: { title: { display: true, text: 'Click per hour - Yesterday' } },
              scales: {
                y: { type: 'linear', display: true, position: 'left' },
                x: { type: 'category', display: true, position: 'left', grid: { display: false } },
              },
            }}
          />
        </Flex>

        <Flex direction="column" margin="auto" h="90%">
          <Text textAlign="center">Most viewed </Text>
          <Doughnut
            data={doughnutChartData as any}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  fullSize: true,
                },
              },
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'home';

  try {
    updateApiToken(req);

    const [{ response: data }, { response: notifications }] = await Promise.all([listCampaignsWithMetrics(), listNotifications()]);

    return { props: { selectedPage, notifications, pageTitle: 'Home', campaigns: data.campaigns, admin: data.admin } };
  } catch (err: any) {
    forceTokenExpiration(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
