import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isWeekend, isAfter, startOfDay, differenceInMonths, isWithinInterval, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx'; // Importação necessária para o Excel real
import { BiCalendar } from 'react-icons/bi';
import { FaGraduationCap, FaUsers } from 'react-icons/fa6';
import { FiTrendingUp, FiSearch, FiDownload } from 'react-icons/fi';
import {
  Avatar,
  Flex,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Box,
  Grid,
  Badge,
  useToast,
  Divider,
  VStack,
} from '@chakra-ui/react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/Tailwind/AttendanceList/popover';
import { Calendar } from '@/components/Tailwind/AttendanceList/calendar';
import { cn } from '@/_base/utils/cn';
import { formatShortName } from '@/_base/utils';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { ICreateHubClassRollCall, IHubClass } from '@/_base/interfaces/class';
import { addRollCall } from '@/_base/services/class';

interface IProps {
  hub_class: IHubClass | null;
}

export const AttendanceList: React.FC<IProps> = ({ hub_class }) => {
  const today = startOfDay(new Date());
  const { colorMode } = useDarkMode();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPendingSync, setIsPendingSync] = useState(false);

  const { isOpen: isExportOpen, onOpen: onOpenExport, onClose: onExportClose } = useDisclosure();
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');

  const [attendanceMap, setAttendanceMap] = useState<Record<string, string[]>>(() => {
    const initialMap: Record<string, string[]> = {};
    if (hub_class?.roll_calls) {
      hub_class.roll_calls.forEach((rollCall) => {
        const dateKey = rollCall.roll_call_date.split('T')[0];
        const studentIds = rollCall.students_roll_calls.map((studentCall) => studentCall.hub_user_id);
        initialMap[dateKey] = studentIds;
      });
    }
    return initialMap;
  });

  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const presentIds = attendanceMap[dateKey] ?? [];

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return hub_class?.students || [];
    const lowerTerm = searchTerm.toLowerCase();
    return (hub_class?.students || []).filter((s) => s.name.toLowerCase().includes(lowerTerm) || s.username.toLowerCase().includes(lowerTerm));
  }, [hub_class?.students, searchTerm]);

  const attendancePercent = useMemo(
    () => Math.round((presentIds.length / (hub_class?.students.length || 1)) * 100),
    [presentIds.length, hub_class?.students.length],
  );

  const toggleAttendance = useCallback(
    (studentId: string) => {
      setAttendanceMap((prev) => {
        const current = [...(prev[dateKey] ?? [])];
        if (current.includes(studentId)) {
          current.splice(current.indexOf(studentId), 1);
        } else {
          current.push(studentId);
        }
        return { ...prev, [dateKey]: current };
      });
      setHasUnsavedChanges(true);
      setIsPendingSync(true);
    },
    [dateKey],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(async () => {
      try {
        const payload: ICreateHubClassRollCall = {
          roll_call_date: selectedDate.toISOString(),
          students: attendanceMap[dateKey] || [],
          hub_class_id: hub_class?.id || '',
        };
        await addRollCall(payload);
      } catch (error) {
        console.error('Erro ao salvar lista de chamada:', error);
      } finally {
        setIsPendingSync(false);
        setHasUnsavedChanges(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [attendanceMap, dateKey, hasUnsavedChanges, hub_class?.id, selectedDate]);

  // --- Lógica de Exportação para XLSX (Excel Profissional) ---
  const handleExportXLSX = () => {
    if (!exportStartDate || !exportEndDate || !hub_class) return;

    const start = startOfDay(new Date(exportStartDate));
    const end = startOfDay(new Date(exportEndDate));

    if (differenceInMonths(end, start) > 6) {
      toast({ title: 'Período muito longo', description: 'O limite máximo é de 6 meses.', status: 'warning' });
      return;
    }

    // 1. Criar o intervalo de dias (apenas dias úteis ou dias que tiveram chamada)
    const daysInterval = eachDayOfInterval({ start, end }).filter((day) => !isWeekend(day));

    // 2. Montar o cabeçalho: [Data, Aluno 1, Aluno 2, ...]
    const header = ['Data', ...hub_class.students.map((s) => s.name)];

    // 3. Montar as linhas (Matriz)
    const rows = daysInterval.map((day) => {
      const currentKey = format(day, 'yyyy-MM-dd');
      const presentInThisDay = attendanceMap[currentKey] || [];

      const rowData = [format(day, 'dd/MM/yyyy')];

      hub_class.students.forEach((student) => {
        // Usamos 'P' para presente e vazio para falta, padrão em diários de classe
        rowData.push(presentInThisDay.includes(student.id) ? 'P' : 'F');
      });

      return rowData;
    });

    // 4. Gerar o Workbook do Excel
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chamada');

    // Ajustar largura das colunas automaticamente
    const colWidths = header.map((h) => ({ wch: h.length + 5 }));
    worksheet['!cols'] = colWidths;

    // 5. Salvar o arquivo
    XLSX.writeFile(workbook, `Chamada_${hub_class.display_name}_Relatorio.xlsx`);

    onExportClose();
    toast({ title: 'Planilha Gerada!', status: 'success' });
  };

  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" gap="1.5rem" h="100%">
      {/* Dashboard Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="1rem">
        <StatCard icon={FaGraduationCap} label="Turma" value={hub_class?.display_name || '...'} bg={bgCard} border={borderColor} />
        <StatCard icon={FaUsers} label="Alunos" value={hub_class?.students.length || 0} bg={bgCard} border={borderColor} />
        <StatCard icon={FiTrendingUp} label="Presença" value={`${attendancePercent}%`} bg={bgCard} border={borderColor} />
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg={bgCard}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          p="1rem"
          boxShadow="sm"
        >
          <Text fontSize="12px" color="gray.500" fontWeight="bold" textTransform="uppercase">
            Presentes Agora
          </Text>
          <Text fontSize="28px" fontWeight="800" color="primary.500" mt="1">
            {presentIds.length}
          </Text>
        </Flex>
      </Grid>

      {/* Toolbar */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap="1rem"
        justify="space-between"
        align="center"
        bg={bgCard}
        p="1rem"
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Pesquisar aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="lg"
            variant="filled"
            _focus={{ bg: 'white', border: '1px solid', borderColor: 'primary.500' }}
          />
        </InputGroup>

        <Flex gap="3" align="center">
          <Popover>
            <PopoverTrigger asChild>
              <Button leftIcon={isPendingSync ? <Spinner size="xs" /> : <BiCalendar />} variant="outline" borderRadius="lg" minW="220px">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none shadow-2xl" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(startOfDay(d))}
                disabled={(date) => isWeekend(date) || isAfter(startOfDay(date), today)}
                locale={ptBR}
                className="rounded-xl bg-white p-3"
              />
            </PopoverContent>
          </Popover>

          <Button colorScheme="green" leftIcon={<FiDownload />} onClick={onOpenExport} borderRadius="lg">
            Exportar Excel
          </Button>
        </Flex>
      </Flex>

      {/* Tabela de Alunos */}
      <Box bg={bgCard} borderRadius="xl" border="1px solid" borderColor={borderColor} boxShadow="sm" overflow="hidden" flex="1">
        <Grid
          templateColumns="auto 1fr 1fr 1fr auto"
          gap="4"
          px="6"
          py="4"
          bg="gray.50"
          fontSize="12px"
          fontWeight="bold"
          color="gray.500"
          textTransform="uppercase"
          display={{ base: 'none', md: 'grid' }}
        >
          <Box w="40px" />
          <Text>Nome do Aluno</Text>
          <Text>Username</Text>
          <Text>Último Acesso</Text>
          <Text textAlign="center">Status</Text>
        </Grid>

        <Flex direction="column" overflowY="auto" maxH="60vh">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, i) => (
              <motion.div
                key={`${student.id}-${dateKey}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => toggleAttendance(student.id)}
              >
                <Grid
                  templateColumns={{ base: 'auto 1fr auto', md: 'auto 1fr 1fr 1fr auto' }}
                  gap="4"
                  px="6"
                  py="3"
                  alignItems="center"
                  cursor="pointer"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  _hover={{ bg: 'primary.25' }}
                >
                  <Avatar size="sm" name={student.name} src={student.avatar || ``} />
                  <Text fontWeight="600" isTruncated>
                    {student.name}
                  </Text>
                  <Text fontSize="13px" color="gray.500" display={{ base: 'none', md: 'block' }}>
                    @{student.username}
                  </Text>
                  <Text fontSize="13px" color="gray.500" display={{ base: 'none', md: 'block' }}>
                    {student.metadata?.last_access ? format(new Date(student.metadata.last_access), 'dd/MM/yy') : '-'}
                  </Text>
                  <Flex justify="center">
                    <AttendanceToggle checked={presentIds.includes(student.id)} onToggle={() => toggleAttendance(student.id)} />
                  </Flex>
                </Grid>
              </motion.div>
            ))}
          </AnimatePresence>
        </Flex>
      </Box>

      {/* Modal de Exportação */}
      <Modal isOpen={isExportOpen} onClose={onExportClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Relatório de Frequência</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="6">
            <VStack spacing="4" align="stretch">
              <Text fontSize="14px" color="gray.500">
                Selecione o período para gerar a planilha formatada (.xlsx).
              </Text>
              <Grid templateColumns="1fr 1fr" gap="4">
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb="1">
                    Início
                  </Text>
                  <Input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb="1">
                    Fim
                  </Text>
                  <Input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} />
                </Box>
              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderRadius="0 0 16px 16px">
            <Button variant="ghost" mr="3" onClick={onExportClose}>
              Cancelar
            </Button>
            <Button colorScheme="green" leftIcon={<FiDownload />} onClick={handleExportXLSX} isDisabled={!exportStartDate || !exportEndDate}>
              Baixar Planilha
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

// --- Componentes Auxiliares ---
function AttendanceToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <Box
      as="button"
      onClick={(e: any) => {
        e.stopPropagation();
        onToggle();
      }}
      w="56px"
      h="28px"
      borderRadius="full"
      position="relative"
      bg={checked ? 'success500' : 'gray.300'}
      transition="0.3s"
    >
      <motion.div
        style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '3px', left: '3px' }}
        animate={{ x: checked ? 28 : 0 }}
      />
    </Box>
  );
}

function StatCard({ icon: Icon, label, value, bg, border }: any) {
  return (
    <Flex align="center" gap="4" bg={bg} p="4" borderRadius="xl" border="1px solid" borderColor={border} boxShadow="sm">
      <Flex h="12" w="12" align="center" justify="center" borderRadius="lg" bg="primary.50" color="primary.500">
        <Icon size="20px" />
      </Flex>
      <Box>
        <Text fontSize="12px" color="gray.500" fontWeight="bold" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="20px" fontWeight="800" color="primary.900">
          {value}
        </Text>
      </Box>
    </Flex>
  );
}
