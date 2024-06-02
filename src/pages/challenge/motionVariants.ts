import { Variants } from 'framer-motion';

type ChallengeVariant = `health`;

export const challengeVariants: Record<ChallengeVariant, Variants> = {
  health: {
    default: {
      scale: 1,
    },
    animate: {
      scale: [0.5, 2],
      transition: {
        ease: 'easeInOut',
        duration: 0.15,
      },
    },
  },
};
