import { validateSession } from '@/_base/services/auth';
import { forceTokenExpiration, logError, updateApiToken } from '@/_base/utils';
import { GetServerSideProps } from 'next';

export default function Home() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    updateApiToken(req);

    await validateSession();

    return {
      redirect: { destination: '/home', permanent: false },
    };
  } catch (err: any) {
    forceTokenExpiration(res);
    logError('root', err);

    return {
      redirect: { destination: '/login', permanent: false },
    };
  }
};
