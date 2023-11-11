import { validateSession } from '@/_base/services/auth';
import { logError, tokenManager } from '@/_base/utils';
import { GetServerSideProps } from 'next';

export default function Home() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    tokenManager.updateToken(req);

    await validateSession();

    return {
      redirect: { destination: '/home', permanent: false },
    };
  } catch (err: any) {
    tokenManager.forceExpires(res);
    logError('root', err);

    return {
      redirect: { destination: '/login', permanent: false },
    };
  }
};
