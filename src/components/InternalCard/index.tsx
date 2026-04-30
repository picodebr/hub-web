import { Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { ElementType } from 'react';

interface IActionProps {
  label: string;
  onClick: () => void;
  Icon?: ElementType;
  important?: boolean;
}

interface IProps {
  index: number;
  title: string;
  onClick: () => void;
  Icon?: ElementType;
  content?: React.ReactElement;
  showFooterIcon?: boolean;
  footer?: React.ReactElement;
  actions?: IActionProps[];
  maxH?: string;
  minH?: string;
}

export const InternalCard: React.FC<IProps> = ({
  index,
  onClick,
  content,
  Icon,
  title,
  showFooterIcon,
  footer,
  actions,
  maxH = `240px`,
  minH = `240px`,
}) => {
  const gradient = FOLDER_GRADIENTS[index % FOLDER_GRADIENTS.length];

  return (
    <motion.div
      key={`${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={{ maxHeight: maxH, minHeight: minH }}
      className="relative rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer border border-border/50 bg-card flex flex-col"
    >
      {/* Área do Gradiente Superior */}
      {content || (
        <>
          <div
            className={`h-32 bg-gradient-to-br ${gradient}  relative overflow-hidden shrink-0`}
            style={{ margin: `1rem 1rem 0 1rem`, borderRadius: `1rem` }}
          >
            {!!Icon && <Icon className="absolute -bottom-3 -right-3 w-24 h-24 text-white/20" strokeWidth={1.5} />}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30 shadow-lg transition-transform duration-300 group-hover:scale-110">
                {!!Icon && <Icon className="w-7 h-7 text-white" strokeWidth={2} />}
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
        </>
      )}
      {/* Conteúdo do Card */}
      <div className="flex flex-col flex-1 relative bg-white dark:bg-zinc-900" style={{ padding: `0 1rem 1rem 1rem` }}>
        {/* Botão de Opções (Menu Chakra UI flutuante sobre a divisão) */}
        {!!actions?.length && (
          <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
            <Menu>
              <MenuButton
                className="p-1.5 group-hover:opacity-100 hover:bg-background transition-all"
                _hover={{ transform: `scale(1.2)` }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-5 h-5 text-foreground" />
              </MenuButton>
              <MenuList borderColor="gray.200" color="gray.600" minW="160px" borderRadius="xl" shadow="xl" p={2}>
                {actions.map(({ Icon, ...action }) => (
                  <MenuItem
                    key={action.label}
                    gap="0.5rem"
                    borderRadius="md"
                    _hover={{ bg: action.important ? 'red.50' : 'gray.100' }}
                    color={action.important ? `red.500` : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                  >
                    {!!Icon && <Icon className="w-4 h-4" />}
                    <Text fontSize="sm" fontWeight="500">
                      {action.label}
                    </Text>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </div>
        )}

        <p className="font-semibold text-foreground text-xl mb-1 mt-3 truncate group-hover:text-primary transition-colors pr-8">{title}</p>

        <div className="flex items-center gap-2 flex-1">
          {showFooterIcon && (
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0`}>
              {!!Icon && <Icon className="w-3 h-3" />}
            </div>
          )}
          {!!footer && footer}
        </div>
      </div>
    </motion.div>
  );
};

const FOLDER_GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-cyan-400 to-sky-600',
];
