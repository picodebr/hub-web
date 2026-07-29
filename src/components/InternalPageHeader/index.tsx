import { Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PlusButton } from '../Buttons/Plus';
import { useCustomRouter } from '@/_base/hooks';
import { ArrowLeft } from 'lucide-react';
import { InternalHeaderButton } from './components/Button';

interface IButtonProps {
  label: string;
  onClick: () => void;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  isLoading?: boolean;
  loadingText?: string;
}

interface IProps {
  title: string;
  description?: string;
  icon?: React.ReactElement;
  actions?: React.ReactElement[];
  buttons?: IButtonProps[];
  showBackButton?: boolean;
}

export const InternalPageHeader: React.FC<IProps> = ({ title, actions, buttons, description, icon, showBackButton }) => {
  const router = useCustomRouter();
  if (!title) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between mb-4 gap-4 px-2 mt-2"
    >
      <div className="flex items-center gap-3">
        {(!!showBackButton || !icon) && (
          <Flex
            userSelect="none"
            cursor="pointer"
            fontWeight="600"
            onClick={() => router.back()}
            pb="0.5rem"
            w="fit-content"
            pt="10px"
            transition="all 0.2s"
            _hover={{ transform: `scale(1.2)` }}
          >
            <ArrowLeft size={20} />
          </Flex>
        )}
        {!!icon && <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>}
        <div>
          <Text fontSize="24px" fontWeight="500">
            {title}
          </Text>
          {!!description && <p className="text-sm text-muted-foreground mt-0.5 whitespace-normal">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {buttons?.map((btn) => (
          <PlusButton
            key={btn.label}
            label={btn.label}
            leftIcon={btn.leftIcon}
            rightIcon={btn.rightIcon}
            onClick={btn.onClick}
            loadingText={btn.loadingText}
            isLoading={btn.isLoading}
          />
        ))}
        {!!actions && actions.map((action) => action)}
      </div>
    </motion.div>
  );
};
