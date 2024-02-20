import { defaultToolbox } from '../toolbox';

export const scratchConfig = {
  mediaPath: '/scratch/media/',
};

export const defaultBlocklyConfig = {
  comments: true,
  disable: false,
  collapse: false,
  media: scratchConfig.mediaPath,
  readOnly: false,
  rtl: false,
  scrollbars: true,
  toolbox: defaultToolbox,
  toolboxPosition: 'start',
  horizontalLayout: false,
  sounds: true,
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.675,
    maxScale: 4,
    minScale: 0.25,
    scaleSpeed: 1.1,
  },
  colours: {
    fieldShadow: 'rgba(255, 255, 255, 0.3)',
    dragShadowOpacity: 0.6,
  },
};
