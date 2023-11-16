/* eslint-disable no-console */
import { Flex, Text } from '@chakra-ui/react';
import ReCAPTCHA from 'react-google-recaptcha';
import { PiWarningCircleBold } from 'react-icons/pi';

import { IAppReCaptchaProps } from './interfaces';

export const AppReCaptcha: React.FC<IAppReCaptchaProps> = ({ onChange, error }) => {
  return (
    <Flex direction="column">
      <Flex align="center" border={error ? '2px solid #ca3939' : ''} borderRadius="4px">
        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY || ''} onChange={onChange} onError={console.error} hl="pt" />
      </Flex>
      <Flex color="red.500" gap="0.3rem" align="center" w="100%" pb="0.25rem" fontSize="1.05rem" display={error ? 'flex' : 'none'}>
        <PiWarningCircleBold fontSize="1rem" />
        <Text letterSpacing={0.35} fontSize="13px">
          {error}
        </Text>
      </Flex>
    </Flex>
  );
};
