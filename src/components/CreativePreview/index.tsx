import { IAd } from '@/_base/interfaces/ad';
import { CircularProgress, Flex, Modal, ModalCloseButton, ModalContent, ModalOverlay, useUpdateEffect } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { IoCloseCircle } from 'react-icons/io5';

interface IProps {
  html: string;
  css?: string;
  js?: string;
  show: boolean;
  onClose: () => void;
  ad?: IAd;
}

export const CreativePreview: React.FC<IProps> = ({ html, show, onClose, ad, css, js }) => {
  const ref = useRef<HTMLIFrameElement>();
  const [isLoading, setIsLoading] = useState(false);

  useUpdateEffect(() => {
    setIsLoading(true);
    const timeoutID = setTimeout(() => {
      if (!html) return;

      const iframe = ref?.current;
      const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
      const targetElement = (ad as any)?.injection || ad?.template === 'injectable' ? doc?.getElementById('aw-spot') : doc?.body;

      if (!doc || !targetElement) return;

      const anchor = doc.createElement('a');
      const stylesheet = doc.createElement('style');
      const script = doc.createElement('script');

      const adHTML = ad?.template === 'in-image' ? `<div id="adz" > ${html.replace('adz', 'adz-b')} </div>` : html;

      stylesheet.innerHTML = css || '';
      targetElement.appendChild(stylesheet);

      (anchor as any).style = 'text-decoration: none; color: unset;';
      anchor.insertAdjacentHTML('beforeend', html);
      anchor.href = ad?.link || '';
      anchor.target = '_blank';
      targetElement.insertAdjacentElement('beforeend', anchor);
      script.innerHTML = js || '';
      targetElement.appendChild(script);

      let domReady = (cb: any) => {
        doc.readyState === 'interactive' || document.readyState === 'complete' ? cb() : doc.addEventListener('DOMContentLoaded', cb);
      };

      domReady(() => {
        // Display body when DOM is loaded
        doc.body.style.visibility = 'visible';
        setIsLoading(false);
      });
    }, 1000);
    return () => {
      clearTimeout(timeoutID);
    };
  }, [ad, html, css, js]);

  return (
    <Modal isOpen={show} onClose={() => onClose()} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton
          size="lg"
          mr="1rem"
          title="Close"
          w="fit-content"
          gap="0.5rem"
          display="flex"
          justifyContent="center"
          border="1px solid"
          padding="0 1rem"
          bg="#2a075d"
          color="white"
          _hover={{ opacity: '0.75' }}
          zIndex="3"
        >
          <IoCloseCircle style={{ fontSize: '1.25rem' }} />
          Close Preview
        </ModalCloseButton>
        <Flex>
          {isLoading && (
            <CircularProgress isIndeterminate color="primaryLight" position="fixed" top="50%" left="50%" width="5rem" height="5rem" zIndex="5" />
          )}
          <Flex height="100%" width="100%" padding="1rem" bg="gray.600" zIndex="1">
            <iframe
              ref={ref as any}
              style={{ height: 'calc(100vh - 2rem)', width: '100%', borderRadius: '1rem', zIndex: 2 }}
              src="/page/index.html"
            ></iframe>
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  );
};
