import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isWeekend, isAfter, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AttendanceButton } from '@/components/Tailwind/AttendanceList/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Tailwind/AttendanceList/popover';
import { BiCalendar } from 'react-icons/bi';
import { Calendar } from '@/components/Tailwind/AttendanceList/calendar';
import { cn } from '@/_base/utils/cn';
import { FaGraduationCap, FaUsers } from 'react-icons/fa6';
import { Avatar, Flex, useColorMode, Spinner } from '@chakra-ui/react';
import { FiTrendingUp } from 'react-icons/fi';
import { formatShortName } from '@/_base/utils';
import { ICreateHubClassRollCall, IHubClass } from '@/_base/interfaces/class';
import { addRollCall } from '@/_base/services/class';

interface IProps {
  hub_class: IHubClass | null;
}

// --- Main Component ---
export const AttendanceList: React.FC<IProps> = ({ hub_class }) => {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Novos estados para controlar o debounce e o UI
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPendingSync, setIsPendingSync] = useState(false);

  const [attendanceMap, setAttendanceMap] = useState<Record<string, string[]>>(() => {
    const initialMap: Record<string, string[]> = {};

    if (hub_class?.roll_calls) {
      hub_class.roll_calls.forEach((rollCall) => {
        const dateKey = rollCall.roll_call_date.split('T')[0];
        const studentIds = rollCall.students_roll_calls.map((studentCall) => studentCall.hub_user_id);
        initialMap[dateKey] = studentIds;
      });
    }

    // const todayKey = format(today, 'yyyy-MM-dd');
    // if (!initialMap[todayKey]) {
    //   initialMap[todayKey] = hub_class?.students.map((s) => s.id) || [];
    // }

    return initialMap;
  });

  const { colorMode } = useColorMode();
  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const presentIds = attendanceMap[dateKey] ?? [];

  const toggleAttendance = useCallback(
    (studentId: string) => {
      setAttendanceMap((prev) => {
        const current = [...(prev[dateKey] ?? [])]; // Cópia para evitar mutação direta
        if (current.includes(studentId)) {
          current.splice(current.indexOf(studentId), 1);
        } else {
          current.push(studentId);
        }
        return { ...prev, [dateKey]: current };
      });

      // Sinaliza que houveram alterações que precisam ser salvas e bloqueia o input
      setHasUnsavedChanges(true);
      setIsPendingSync(true);
    },
    [dateKey],
  );

  // --- Efeito de Debounce para a Requisição ---
  useEffect(() => {
    // Se não houver alterações não salvas, não faz nada
    if (!hasUnsavedChanges) return;

    // Inicia o timer de 3 segundos
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
        // Aqui você pode adicionar um toast de erro se a requisição falhar
      } finally {
        // Libera a interface e reseta o aviso de alterações
        setIsPendingSync(false);
        setHasUnsavedChanges(false);
      }
    }, 3000);

    // Função de limpeza: se o attendanceMap mudar antes dos 3s, o useEffect roda novamente,
    // cancela o timer anterior e inicia um novo (esse é o segredo do debounce!)
    return () => clearTimeout(timer);
  }, [attendanceMap, dateKey, hasUnsavedChanges, hub_class?.id, selectedDate]);

  const attendancePercent = useMemo(
    () => Math.round((presentIds.length / (hub_class?.students.length || 1)) * 100),
    [presentIds.length, hub_class?.students.length],
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) setSelectedDate(startOfDay(date));
  };

  const toggleBg = colorMode === 'light' ? 'white' : 'gray.700';

  return (
    <Flex direction="column" overflow="hidden" gap="1rem">
      <Flex justify="space-between" gap="1rem">
        <StatCard icon={FaGraduationCap} label="Turma" value={hub_class?.display_name || 'Turma não encontrada'} />
        <StatCard icon={FaUsers} label="Alunos" value={hub_class?.students.length || 0} />
        <StatCard icon={FiTrendingUp} label="Presença" value={`${attendancePercent}%`} />

        {/* Date Picker Card */}
        <motion.div
          className="surface-elevated rounded-2xl p-4 flex gap-4 justify-start items-center sm:col-span-2 lg:col-span-1 w-full"
          whileHover={{ y: -2, boxShadow: '0 8px 30px -12px rgba(0,0,0,0.12)' }}
          transition={{ duration: 0.2 }}
          style={{ border: '1px solid var(--chakra-colors-gray100)', backgroundColor: `white`, height: `6rem` }}
        >
          <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', 'bg-primary/10 text-primary')}>
            <BiCalendar className="h-5 w-5" />
          </div>
          <Flex direction="column">
            <p className="text-md font-semibold mb-2">Dia da aula</p>
            <Popover>
              <PopoverTrigger asChild>
                {/* Aqui bloqueamos o botão e alteramos o conteúdo caso isPendingSync seja true */}
                <AttendanceButton
                  variant="outline"
                  className="w-full justify-start text-left font-medium gap-2 h-10 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isPendingSync}
                >
                  {isPendingSync ? <Spinner size="sm" color="gray.500" /> : <BiCalendar className="h-4 w-4 text-muted-foreground" />}
                  {isPendingSync ? 'Salvando...' : format(selectedDate, 'dd MMM yyyy', { locale: ptBR })}
                </AttendanceButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => isWeekend(date) || isAfter(startOfDay(date), today)}
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                  styles={{ cell: { width: `2.5rem` } }}
                  style={{ backgroundColor: toggleBg }}
                />
              </PopoverContent>
            </Popover>
          </Flex>
        </motion.div>

        <motion.div
          className="flex flex-col items-center bg-white justify-center rounded-md w-full gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ backgroundColor: toggleBg, height: `6rem` }}
        >
          <p className="text-md font-semibold tracking-tight">
            {presentIds.length} de {hub_class?.students.length || 0} alunos presentes
          </p>
          <p className="text-md bg-primary/10 text-primary p-2 rounded-md">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
        </motion.div>
      </Flex>

      {/* Student List */}
      <Flex w="100%" overflow="hidden">
        <motion.div
          className="surface-elevated rounded-2xl bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ overflowY: `auto`, width: `100%` }}
        >
          <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-3 border-b text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="w-10" />
            <span>Aluno</span>
            <span>Usuário</span>
            <span>Último Acesso</span>
            <span>Presença</span>
          </div>

          <AnimatePresence mode="popLayout">
            {hub_class?.students.map((student, i) => {
              const isPresent = presentIds.includes(student.id);
              return (
                <motion.div
                  key={`${student.id}-${dateKey}`}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => toggleAttendance(student.id)}
                  className={cn(
                    'grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 cursor-pointer transition-colors duration-200',
                    'hover:bg-muted/50',
                    i < (hub_class?.students.length || 0) - 1 && 'border-b border-border/50',
                  )}
                >
                  <div>
                    <Avatar name={formatShortName(student.name, true)} title={student.name} src={student.avatar || ``} h="40px" w="40px" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground sm:hidden">{student.username}</p>
                  </div>
                  <p className="hidden sm:block text-sm text-muted-foreground truncate">{student.username}</p>
                  <p className="hidden sm:block text-sm text-muted-foreground">
                    {student.metadata?.last_access ? new Date(student.metadata?.last_access).toLocaleDateString() : `-`}
                  </p>
                  <AttendanceToggle checked={isPresent} onToggle={() => toggleAttendance(student.id)} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </Flex>
    </Flex>
  );
};

// --- Toggle Component ---
function AttendanceToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'relative h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-success' : 'bg-muted',
      )}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle attendance"
    >
      <motion.div
        className="absolute top-1 left-1 h-6 w-6 rounded-full bg-card shadow-md"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

// --- Stat Card ---
function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent?: boolean }) {
  return (
    <motion.div
      className="surface-elevated rounded-2xl p-4 flex items-center gap-4 w-full"
      whileHover={{ y: -2, boxShadow: '0 8px 30px -12px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      style={{ border: '1px solid var(--chakra-colors-gray100)', backgroundColor: `white`, height: `6rem` }}
    >
      <div
        className={cn(
          'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
          accent ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-md text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
