import { IContact } from '@/_base/interfaces/contact';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useCallback } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { IoIosCloseCircle } from 'react-icons/io';
import { AppButton } from '../Forms/Button';
import { AppInput } from '../Forms/Input';

const EMPTY_CONTACT: IContact = {
  email: '',
  name: '',
  phone: '',
};

type GenericFields = { contacts: IContact[]; [x: string]: any };

interface IProps {
  contacts: IContact[];
  onChange: (data: IContact[]) => void;
  register: UseFormRegister<GenericFields>;
  errors: FieldErrors<GenericFields>;
  editEnabled?: boolean;
}

export const ContactFields: React.FC<IProps> = ({ contacts, onChange, register, errors, editEnabled = true }) => {
  const handleChange = useCallback(
    (index: number, contact?: IContact) => {
      const newContacts = [...contacts];

      newContacts[index] = contact || (null as any);
      onChange(newContacts.filter((e) => e));
    },
    [contacts, onChange],
  );

  return (
    <Flex direction="column" gap="1rem" padding="1rem" border="1px" borderColor="gray.300" borderRadius="md" bg="gray.50">
      <Flex align="center" justify="space-between">
        <Text color="black.100" fontWeight="600" fontStyle="italic">
          Contacts
        </Text>
        <AppButton
          label="Add contact"
          btntype="outline"
          size="xs"
          bg="white"
          onClick={() => onChange([...contacts.filter((e) => !!e.name), EMPTY_CONTACT])}
          isDisabled={!editEnabled}
        />
      </Flex>
      {contacts.map((contact, index) => (
        <Flex
          key={index}
          border="1px"
          color="gray.600"
          borderColor="gray.200"
          borderRadius="md"
          padding="0 0.5rem"
          direction="column"
          gap="0.5rem"
          transition="all 0.2s"
          bg="white"
          position="relative"
          _hover={{
            boxShadow: 'md',
            borderColor: 'gray.100',
          }}
        >
          <Box
            title="Remove contact"
            position="absolute"
            right="-0.5rem"
            top="-0.5rem"
            fontSize="1.35rem"
            transition="all 0.2s"
            cursor="pointer"
            color="#ad4a4a"
            _hover={{ color: '#cf3e3e' }}
            onClick={() => editEnabled && handleChange(index)}
          >
            <IoIosCloseCircle />
          </Box>
          <Flex borderBottom="1px" color="gray.600" borderColor="gray.200" direction="column" gap="0.5rem">
            <AppInput
              fontSize="0.975rem"
              border="none"
              label={
                <Text fontWeight="600" color="text.gray">
                  Name
                </Text>
              }
              placeholder="User"
              size="xs"
              isDisabled={!editEnabled}
              value={contact.name}
              error={(errors.contacts || [])[index]?.name}
              {...register(`contacts.${index}.name`, { required: true, value: contact.name || '' })}
              onChange={(e) => handleChange(index, { ...contact, name: e.target.value })}
            />
          </Flex>
          <Flex borderBottom="1px" color="gray.600" borderColor="gray.200" direction="column" gap="0.5rem">
            <AppInput
              fontSize="0.975rem"
              border="none"
              label={
                <Text fontWeight="600" color="text.gray">
                  E-mail
                </Text>
              }
              placeholder="user@example.com"
              size="xs"
              isDisabled={!editEnabled}
              value={contact.email}
              error={(errors.contacts || [])[index]?.email}
              {...register(`contacts.${index}.email`, { required: true, value: contact.email || '' })}
              onChange={(e) => handleChange(index, { ...contact, email: e.target.value })}
            />
          </Flex>
          <Flex borderBottom="1px" color="gray.600" borderColor="gray.200" direction="column" gap="0.5rem">
            <AppInput
              fontSize="0.975rem"
              border="none"
              label={
                <Text fontWeight="600" color="text.gray">
                  Phone
                </Text>
              }
              placeholder="(99) 99999-9999"
              size="xs"
              mask="(99) 99999-9999"
              isDisabled={!editEnabled}
              value={contact.phone}
              error={(errors.contacts || [])[index]?.phone}
              {...register(`contacts.${index}.phone`, { required: true, value: contact.phone || '' })}
              onChange={(e) => handleChange(index, { ...contact, phone: e.target.value })}
            />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};
