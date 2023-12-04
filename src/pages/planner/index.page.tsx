import { GetServerSideProps } from 'next';
import { useState, React } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Header } from 'rsuite';
import { useDrag } from 'react-dnd';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Link, Progress, Text } from '@chakra-ui/react';

const Planner: React.FC = () => ({ isDragging, text }) {
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item: { text },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1
      })
    }),
    []
  )
  return (
    <div ref={dragRef} style={{ opacity }}>
      {text}
    </div>
  )
}

export default Planner;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'planner';

  try {
    cookieManager.updateToken(req);

    // await validateSession();

    return { props: { selectedPage, pageTitle: 'Meus planejamentos' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
