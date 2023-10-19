import { AdChannelType, AdTemplateType, IAd, ICreative } from '@/_base/interfaces/ad';
import { AdPlacementContent } from '@/pages/creatives/[campaign_id]/[id]/components/Placement/interfaces';

export const buildStaticCreative = (
  url: string,
  type: AdChannelType,
  dimension: string,
  content?: AdPlacementContent,
  template?: AdTemplateType,
): ICreative => {
  if (type === 'display') return { html: '', js: '', css: '' };
  const width = `${dimension?.split('x')[0]?.concat('px') || '100%'}`;
  const height = `${dimension?.split('x')[1]?.concat('px') || '100%'}`;

  const mimetype = 'video/mp4';

  const closeButton = `<span id="adz-x" onclick="event.preventDefault(); event.stopImmediatePropagation(); closeAd('adz');" style="position: absolute; top: 6px; right: 6px; width: 2rem; height: 2rem; color: #c1c1c1; border-radius: 50%; z-index: 9991; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer; transition: all 0.2s;">${svgCloseIcon}</span>`;

  const leftButton = `<button id="adz-r-btn" onclick="event.preventDefault(); event.stopImmediatePropagation(); console.log('Clicou no right button');" style="position: absolute; bottom: 6px; left: 6px; width: fit-content; height: 2rem; color: #fff; background-color: #e53e3e; border: 1px solid #b42424; border-radius: 8px; z-index: 9992; display: flex; align-items: center; justify-content: center; font-size: 1rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; padding: 0 4px">Esquerdo</button>`;
  const rightButton = `<button id="adz-r-btn" onclick="event.preventDefault(); event.stopImmediatePropagation(); console.log('Clicou no right button');" style="position: absolute; bottom: 6px; right: 6px; width: fit-content; height: 2rem; color: #fff; background-color: #805ad5; border: 1px solid #5e3aad; border-radius: 8px; z-index: 9992; display: flex; align-items: center; justify-content: center; font-size: 1rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; padding: 0 4px">Direito</button>`;

  // const leftButton = '';
  // const rightButton = '';

  const htmlWithMedia =
    type === 'image'
      ? `<img id="adz-b" src=${url} width=${width} height=${height} style="position:relative;">` + closeButton + rightButton + leftButton + `</img>`
      : `<div style="position: relative; width:${width}; height:${height};">` +
        closeButton +
        rightButton +
        leftButton +
        `<video id="adz-b" controls autoplay width=100% height=100%"><source src=${url} type=${mimetype} /></video></div>`;

  const stylesheet: Record<string, string> = { width, height, ...(content?.properties || ({} as any)) };
  const styleStr = Object.keys(stylesheet).reduce((acc, key) => acc.concat(`${key}: ${stylesheet[key]}; `), '');

  const wrapper = `<div id="adz" style="${styleStr}">` + htmlWithMedia + '</div>';

  const js = template === 'in-image' ? `${CREATIVE_TEMPLATE_RESOURCES.inImageTemplateJS}${closeButtonJS}` : closeButtonJS;

  return { html: wrapper, js, css: closeButtonCSS };
};

const svgCloseIcon = `<svg stroke="#c1c1c1" fill="#c1c1c1" stroke-width="0" viewBox="0 0 1024 1024" fill-rule="evenodd" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64Zm0 76c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372Zm128.013 198.826c.023.007.042.018.083.059l45.02 45.019c.04.04.05.06.058.083a.118.118 0 0 1 0 .07c-.007.022-.018.041-.059.082L557.254 512l127.861 127.862a.268.268 0 0 1 .05.06l.009.023a.118.118 0 0 1 0 .07c-.007.022-.018.041-.059.082l-45.019 45.02c-.04.04-.06.05-.083.058a.118.118 0 0 1-.07 0c-.022-.007-.041-.018-.082-.059L512 557.254 384.14 685.115c-.042.041-.06.052-.084.059a.118.118 0 0 1-.07 0c-.022-.007-.041-.018-.082-.059l-45.02-45.019c-.04-.04-.05-.06-.058-.083a.118.118 0 0 1 0-.07c.007-.022.018-.041.059-.082L466.745 512l-127.86-127.86a.268.268 0 0 1-.05-.061l-.009-.023a.118.118 0 0 1 0-.07c.007-.022.018-.041.059-.082l45.019-45.02c.04-.04.06-.05.083-.058a.118.118 0 0 1 .07 0c.022.007.041.018.082.059L512 466.745l127.862-127.86c.04-.041.06-.052.083-.059a.118.118 0 0 1 .07 0Z"></path></svg>`;

const closeButtonJS = `function closeAd(i) {document.getElementById(i).style.visibility='hidden'; return false;};`;

const closeButtonCSS = `#adz-x:hover {color: #fff; transform: scale(1.1);}`;

const inImageTemplateJS = `{const image = document.getElementById("adz-image");const overlay = document.getElementById("adz");const position = image.getBoundingClientRect();const parent = image.parentElement;parent.style = parent.style.cssText.concat("position: relative");overlay.style = overlay.style.cssText.concat("position: absolute; top: 0; left: 0; height:" + position.height + "px; width:" + position.width + "px; z-index: 9999");parent.insertAdjacentElement("beforeend", overlay);}`;

export const CREATIVE_TEMPLATE_RESOURCES = {
  closeButtonJS,
  closeButtonCSS,
  inImageTemplateJS,
};

export const EMPTY_AD_DATA: IAd = {
  id: '',
  name: '',
  creative: { html: '' },
  link: '',
  channel_type: 'display',
  template: 'none',
  start_at: '',
  end_at: '',
  created_by: '',
  campaign_id: '',
  campaign: {} as any,
  collected_data: [],
  cost_type: { currency_type: 'real' },
  created_at: '',
  updated_at: '',
  direct_publishers: [],
  targeting: {
    browsers: [],
  },
};
