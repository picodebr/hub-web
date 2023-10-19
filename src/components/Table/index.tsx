import { Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { FaCode } from 'react-icons/fa';
import { ImFileEmpty } from 'react-icons/im';
import { IoOpen } from 'react-icons/io5';
import { SecureDeletePopover } from '../Popover/SecureDelete';
import { IAppTableProps } from './interfaces';

export const AppTable: React.FC<IAppTableProps> = ({ columns, dataSource, onDelete, onView, onTagView, deleteButtonDisabled }) => {
  return (
    <TableContainer position="relative" border="1px solid" h="100%" borderColor="gray.200" borderRadius="md" bg="white" overflowY="auto">
      <Table variant="striped">
        <Thead>
          <Tr>
            {columns.map((e) => (
              <Th key={e.key}>{e.label}</Th>
            ))}
            {!!onTagView && <Th w="4rem">Tag</Th>}
            {!!onView && <Th w="4rem">View</Th>}
            {!!onDelete && <Th w="4rem">Delete</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {dataSource.length ? (
            dataSource.map((v, i) => (
              <Tr key={`${i + 1}`}>
                {columns.map((c) => (
                  <Td key={c.key}>{v[c.key] || ''}</Td>
                ))}
                {!!onTagView && (
                  <Td>
                    <Flex
                      onClick={() => onTagView(v.key)}
                      cursor="pointer"
                      _hover={{ color: '#6133ce', boxShadow: 'md' }}
                      transition="all 0.15s"
                      justify="center"
                      align="center"
                      fontSize="1.125rem"
                      border="1px"
                      w="1.65rem"
                      h="1.65rem"
                      borderRadius="md"
                      bg="#fff"
                      color="#5f4894"
                    >
                      <FaCode />
                    </Flex>
                  </Td>
                )}
                {!!onView && (
                  <Td>
                    <Flex
                      onClick={() => onView(v.key)}
                      cursor="pointer"
                      _hover={{ color: '#6133ce', boxShadow: 'md' }}
                      transition="all 0.15s"
                      justify="center"
                      fontSize="1.125rem"
                      border="1px"
                      w="1.65rem"
                      h="1.65rem"
                      align="center"
                      padding="0 0 0.1rem 0.1rem"
                      borderRadius="md"
                      bg="#fff"
                      color="#5f4894"
                      margin="auto"
                    >
                      <IoOpen />
                    </Flex>
                  </Td>
                )}
                {!!onDelete && (
                  <Td>
                    <SecureDeletePopover title="Permanently delete?" onDelete={() => onDelete(v.key)} isDisabled={deleteButtonDisabled} />
                  </Td>
                )}
              </Tr>
            ))
          ) : (
            <Flex h="90%" w="100%" position="absolute" align="center" justify="center" color="black.100" fontSize="1.875rem" gap="1rem">
              <Text>Empty data</Text>
              <ImFileEmpty />
            </Flex>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
