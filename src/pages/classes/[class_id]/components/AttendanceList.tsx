import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isWeekend, isAfter, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AttendanceButton } from '@/components/Tailwind/AttendanceList/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Tailwind/AttendanceList/popover';
import { BiCalendar, BiTrendingUp } from 'react-icons/bi';
import { Calendar } from '@/components/Tailwind/AttendanceList/calendar';
import { cn } from '@/_base/utils/cn';
import { FaCalendar, FaGraduationCap, FaUsers } from 'react-icons/fa6';
import { background, Flex, useColorMode } from '@chakra-ui/react';
import { FiTrendingUp } from 'react-icons/fi';

// --- Types ---
interface Student {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastAccess: string;
}

// --- Main Component ---
export const AttendanceList: React.FC = () => {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  // attendance: dateKey -> Set of student IDs present
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Set<string>>>(() => {
    const todayKey = format(today, 'yyyy-MM-dd');
    return { [todayKey]: new Set(['1', '2', '4', '6', '8', '10']) };
  });
  const { colorMode } = useColorMode();

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const presentIds = attendanceMap[dateKey] ?? new Set<string>();

  const toggleAttendance = useCallback(
    (studentId: string) => {
      setAttendanceMap((prev) => {
        const current = new Set(prev[dateKey] ?? []);
        if (current.has(studentId)) current.delete(studentId);
        else current.add(studentId);
        return { ...prev, [dateKey]: current };
      });
    },
    [dateKey],
  );

  const attendancePercent = useMemo(() => Math.round((presentIds.size / STUDENTS.length) * 100), [presentIds.size]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) setSelectedDate(startOfDay(date));
  };

  const toggleBg = colorMode === 'light' ? 'white' : 'gray.700';
  return (
    <Flex direction="column" overflow="hidden" gap="1rem">
      {/* Header: Stats + Date Picker */}
      <Flex justify="space-between" gap="1rem">
        <StatCard icon={FaGraduationCap} label="Turma" value="3º Ano - EM" />
        <StatCard icon={FaUsers} label="Alunos" value={STUDENTS.length} />
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
            <p className="text-md font-semibold  mb-2">Dia da aula</p>
            <Popover>
              <PopoverTrigger asChild>
                <AttendanceButton variant="outline" className="w-full justify-start text-left font-medium gap-2 h-10 rounded-xl">
                  <BiCalendar className="h-4 w-4 text-muted-foreground" />
                  {format(selectedDate, 'dd MMM yyyy', { locale: ptBR })}
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
            {presentIds.size} de {STUDENTS.length} alunos presentes
          </p>
          <p className="text-md bg-primary/10 text-primary p-2 rounded-md">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
        </motion.div>
      </Flex>

      {/* Student List */}
      <motion.div
        className="surface-elevated rounded-2xl  bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ overflowY: `auto` }}
      >
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-3 border-b text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="w-10" />
          <span>Aluno</span>
          <span>Usuário</span>
          <span>Último Acesso</span>
          <span>Presença</span>
        </div>

        <AnimatePresence mode="popLayout">
          {STUDENTS.map((student, i) => {
            const isPresent = presentIds.has(student.id);
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
                  i < STUDENTS.length - 1 && 'border-b border-border/50',
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'h-10 w-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0',
                    AVATAR_COLORS[i % AVATAR_COLORS.length],
                  )}
                >
                  {student.avatar}
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <p className="font-medium truncate">{student.name}</p>
                  <p className="text-sm text-muted-foreground sm:hidden">{student.username}</p>
                </div>

                {/* Username - desktop */}
                <p className="hidden sm:block text-sm text-muted-foreground truncate">{student.username}</p>

                {/* Last Access - desktop */}
                <p className="hidden sm:block text-sm text-muted-foreground">{student.lastAccess}</p>

                {/* Toggle */}
                <AttendanceToggle checked={isPresent} onToggle={() => toggleAttendance(student.id)} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
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

// --- Mock Data ---
const STUDENTS: Student[] = [
  { id: '1', name: 'Ana Beatriz Costa', username: '@anabcosta', avatar: 'AB', lastAccess: 'Hoje às 14:00' },
  { id: '2', name: 'Bruno Henrique Silva', username: '@brunohs', avatar: 'BH', lastAccess: 'Hoje às 13:45' },
  { id: '3', name: 'Camila Rodrigues', username: '@camilar', avatar: 'CR', lastAccess: 'Há 1 dia' },
  { id: '4', name: 'Daniel Oliveira', username: '@danielo', avatar: 'DO', lastAccess: 'Hoje às 10:30' },
  { id: '5', name: 'Elena Martins', username: '@elenam', avatar: 'EM', lastAccess: 'Há 2 dias' },
  { id: '6', name: 'Felipe Andrade', username: '@felipea', avatar: 'FA', lastAccess: 'Hoje às 09:15' },
  { id: '7', name: 'Gabriela Santos', username: '@gabis', avatar: 'GS', lastAccess: 'Há 3 dias' },
  { id: '8', name: 'Henrique Lima', username: '@henriquel', avatar: 'HL', lastAccess: 'Hoje às 15:20' },
  { id: '9', name: 'Isabela Ferreira', username: '@isabelaf', avatar: 'IF', lastAccess: 'Há 1 dia' },
  { id: '10', name: 'João Pedro Almeida', username: '@joaopa', avatar: 'JP', lastAccess: 'Hoje às 11:00' },
];

const AVATAR_COLORS = [
  'from-primary to-blue-600',
  'from-violet-500 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-green-600',
  'from-cyan-400 to-teal-600',
  'from-indigo-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
  'from-lime-400 to-green-500',
  'from-sky-400 to-blue-500',
];
