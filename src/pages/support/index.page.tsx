import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { SetStateAction, useState } from 'react';
import { FiChevronLeft, FiUser } from 'react-icons/fi';
// import { AiFillCheckCircle } from 'react-icons/ai';

const Support: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  return (
    <Flex
      backgroundColor="bg.white"
      width="400px"
      height="fit-content"
      margin="auto"
      borderRadius="12px"
      boxShadow="md"
      align="center"
      padding="24px"
      direction="column"
      gap="20px"
    >
      <Logo />
      <Flex padding="12px 0" width="100%" color="text.lightGray" align="center" gap="8px">
        <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
        Voltar
      </Flex>
      <Flex //Inputs
        direction="column"
        width="100%"
        gap="12px"
      >
        <TextInput value={username} onInputChange={(value) => setUsername(value)} label="Nome de Usuário" leftElement={<FiUser />} />
        <TextInput value={email} onInputChange={(value) => setEmail(value)} label="E-mail" />
        <TextAreaInput
          value={description}
          onInputChange={(value: SetStateAction<string>) => setDescription(value)}
          placeholder="Fale sobre o problema..."
          label="Descrição"
          resize="none"
        />
      </Flex>
      <Link //Button "send" on support page
        href="/support_sent"
        width="100%"
      >
        <Flex color="text.white" align="center" justify="center" borderRadius="8px" padding="10px 18px" bg="secondary">
          <Text fontWeight="600">Enviar</Text>
        </Flex>
      </Link>
    </Flex>
  );
};

export default Support;

//Support message SENT

// const supportSent: React.FC = () => {
//   return (
//     <Flex
//       backgroundColor="bg.white"
//       width="400px"
//       height="fit-content"
//       margin="auto"
//       borderRadius="12px"
//       boxShadow="md"
//       align="center"
//       padding="24px"
//       direction="column"
//     >
//       <Logo />
//       <Flex width="100%" color="primary" align="center" >
//         <AiFillCheckCircle fontSize="45px" style={{ marginTop: '2px' }} />
//       </Flex>
//       <Flex padding="20px 0" width="100%" color="text.lightGray" align="center" gap="8px">
//         <Flex direction="column" gap="8px">
//           <Text fontWeight="600" fontSize="20px" color="text.black">
//             Enviado com sucesso!
//           </Text>
//           <Text color="text.gray">Sua mensagem foi enviada e recebida pela nossa equipe e dentro de 24h iremos te retornar no e-mail informado</Text>
//         </Flex>
//       </Flex>
//       <Link //Button "voltar" on message sent
//         href="/login"
//         width="100%"
//       >
//         <Flex color="text.white" align="center" justify="center" borderRadius="8px" padding="10px 18px" bg="secondary">
//           <Text fontWeight="600">Voltar</Text>
//         </Flex>
//       </Link>
//     </Flex>
//   );
// };

// export default supportSent;
