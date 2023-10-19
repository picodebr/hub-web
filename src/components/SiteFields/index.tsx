import { IPublisherSite, IPublisherSitePage } from '@/_base/interfaces/publisher';
import { ICreatePublisherDTO } from '@/services/publisher/interface';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useCallback } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FaTrash } from 'react-icons/fa6';
import { IoIosCloseCircle } from 'react-icons/io';
import { RxCardStackPlus } from 'react-icons/rx';
import { AppButton } from '../Forms/Button';
import { AppInput } from '../Forms/Input';

const EMPTY_SITE: IPublisherSite = {
  id: '',
  name: '',
  url: '',
  pages: [],
};

const EMPTY_SITE_PAGE: IPublisherSitePage = {
  id: '',
  name: '',
  path: '',
};

interface IProps {
  sites: IPublisherSite[];
  onChange: (data: IPublisherSite[]) => void;
  register: UseFormRegister<ICreatePublisherDTO>;
  errors: FieldErrors<ICreatePublisherDTO>;
  editEnabled?: boolean;
}

export const SiteFields: React.FC<IProps> = ({ sites, onChange, register, errors, editEnabled = true }) => {
  const handleSiteChange = useCallback(
    (index: number, site?: IPublisherSite) => {
      const newSites = [...sites];

      newSites[index] = site || (null as any);
      onChange(newSites.filter((e) => e));
    },
    [sites, onChange],
  );

  const handleSitePageChange = useCallback(
    (siteIndex: number, pageIndex: number, site: IPublisherSite, page?: IPublisherSitePage) => {
      const newSites = [...sites];

      site.pages[pageIndex] = page || (null as any);
      site.pages = site.pages.filter((e) => e);

      newSites[siteIndex] = site || (null as any);

      onChange(newSites.filter((e) => e));
    },
    [sites, onChange],
  );

  return (
    <Flex direction="column" gap="1rem" padding="1rem" border="1px" borderColor="gray.300" borderRadius="md" bg="gray.50">
      <Flex align="center" justify="space-between">
        <Text color="black.100" fontWeight="600" fontStyle="italic">
          Sites
        </Text>
        <AppButton
          label="Add site"
          btntype="outline"
          size="xs"
          bg="white"
          onClick={() => onChange([EMPTY_SITE, ...sites.filter((e) => !!e.name)])}
          isDisabled={!editEnabled}
        />
      </Flex>
      {sites.map((site, siteIndex) => (
        <Flex
          key={`site-${siteIndex + 1}`}
          border="1px"
          color="gray.600"
          borderColor="gray.200"
          borderRadius="md"
          padding="0.5rem"
          direction="column"
          gap="0.5rem"
          transition="all 0.2s"
          bg="white"
          position="relative"
        >
          <Box
            title="Remove contact"
            position="absolute"
            right="-0.5rem"
            top="-0.5rem"
            fontSize="1.35rem"
            transition="all 0.2s"
            cursor="pointer"
            color="#b96969"
            _hover={{ color: '#ad4a4a' }}
            onClick={() => editEnabled && handleSiteChange(siteIndex)}
            zIndex="2"
            display={site.name && site.url ? 'block' : 'none'}
          >
            <IoIosCloseCircle />
          </Box>
          <Flex borderBottom="1px" color="gray.600" borderColor="gray.200" direction="column" gap="0.5rem">
            <AppInput
              fontSize="0.975rem"
              border="none"
              label={
                <Text fontWeight="600" color="text.gray">
                  Site name
                </Text>
              }
              placeholder="My site"
              size="xs"
              isDisabled={!editEnabled}
              value={site.name}
              error={(errors.sites || [])[siteIndex]?.name}
              {...register(`sites.${siteIndex}.name`, { required: true, value: site.name || '' })}
              onChange={(e) => handleSiteChange(siteIndex, { ...site, name: e.target.value })}
            />
          </Flex>
          <Flex borderBottom="1px" color="gray.600" borderColor="gray.200" direction="column" gap="0.5rem">
            <AppInput
              fontSize="0.975rem"
              border="none"
              label={
                <Text fontWeight="600" color="text.gray">
                  Site URL
                </Text>
              }
              placeholder="https://mysite.com"
              size="xs"
              value={site.url}
              isDisabled={!editEnabled}
              error={(errors.sites || [])[siteIndex]?.url}
              {...register(`sites.${siteIndex}.url`, { required: true, value: site.url || '' })}
              onChange={(e) => handleSiteChange(siteIndex, { ...site, url: e.target.value })}
            />
          </Flex>

          <Flex direction="column" mt="1rem" gap="1rem" borderRadius="md">
            <Flex align="center" gap="1rem" justify="space-between" padding={1}>
              <Text color="black.100" fontWeight="600" fontStyle="italic">
                Site pages
              </Text>
              <Flex
                color="primaryLight"
                gap={1}
                cursor="pointer"
                _hover={{ opacity: '0.9' }}
                onClick={() =>
                  onChange([...sites.map((e, i) => (i === siteIndex ? { ...e, pages: [EMPTY_SITE_PAGE, ...e.pages.filter((e) => !!e.name)] } : e))])
                }
              >
                <Text>New</Text>
                <RxCardStackPlus fontSize="1.5rem" />
              </Flex>
            </Flex>

            {/* Site pages list */}
            {site.pages.map((page, pageIndex) => (
              <Flex key={`${siteIndex}-page-${pageIndex + 1}`}>
                <Flex
                  w="100%"
                  border="1px"
                  color="gray.600"
                  borderColor="gray.200"
                  borderRadius="md"
                  direction="column"
                  transition="all 0.2s"
                  bg="white"
                  position="relative"
                >
                  <Flex borderBottom="1px" color="gray.600" borderColor="gray.200" padding="0.5rem" gap="0.5rem">
                    <Text fontSize="0.875rem" color="text.gray" w="5rem">
                      Page name
                    </Text>
                    <AppInput
                      fontSize="0.975rem"
                      border="none"
                      placeholder="Mainscreen"
                      size="xs"
                      value={page.name}
                      isDisabled={!editEnabled}
                      error={((errors.sites || [])[siteIndex]?.pages || [])[pageIndex]?.name}
                      {...register(`sites.${siteIndex}.pages.${pageIndex}.name`, { required: true, value: page.name || '' })}
                      onChange={(e) => handleSitePageChange(siteIndex, pageIndex, site, { ...page, name: e.target.value })}
                    />
                  </Flex>

                  <Flex color="gray.600" padding="0.5rem" gap="0.5rem">
                    <Text fontSize="0.875rem" color="text.gray" w="5rem">
                      Page path
                    </Text>
                    <AppInput
                      fontSize="0.975rem"
                      border="none"
                      placeholder="pages/mainscreen"
                      size="xs"
                      value={page.path}
                      isDisabled={!editEnabled}
                      error={((errors.sites || [])[siteIndex]?.pages || [])[pageIndex]?.path}
                      {...register(`sites.${siteIndex}.pages.${pageIndex}.path`, { required: true, value: page.path || '' })}
                      onChange={(e) => handleSitePageChange(siteIndex, pageIndex, site, { ...page, path: e.target.value })}
                    />
                  </Flex>
                </Flex>
                <Flex
                  height="fit-content"
                  title="Remove page"
                  fontSize="1rem"
                  paddingLeft="0.45rem"
                  py={2}
                  alignSelf="center"
                  align="center"
                  transition="all 0.2s"
                  cursor="pointer"
                  color="#b96969"
                  _hover={{ color: '#ad4a4a' }}
                  onClick={() => editEnabled && handleSitePageChange(siteIndex, pageIndex, site)}
                  zIndex="2"
                >
                  <FaTrash />
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};
