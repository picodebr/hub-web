// import React, { useEffect, useMemo, memo } from 'react';
// import Blockly from 'blockly';

// import { BlocklyDiv } from './styles';

// import { IBlockly, ToolboxConfig } from '../../utils/challenges';
// import { BlocklyComponent } from '../../utils/customBlocks';
// import textToDom from '../../utils/textToDom';
// import getCustomBlock from '../../utils/getCustomBlock';
// import { MazePlayer } from '../../interfaces';

// export interface Props {
//   blocklyConfig: IBlockly;
//   blocklyToolboxConfig: ToolboxConfig;
//   blocklyWorkspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
//   workspaceCode?: string;
//   onWorkspaceCodeChange?(workspaceCode: string): void;
//   setRemainingBlocks: React.Dispatch<React.SetStateAction<number>>;
//   style?: React.CSSProperties;
//   challengeId: string;
//   player: MazePlayer;
// }

// export interface Toolbox {
//   kind: string;
//   contents: {
//     kind: string;
//     type: BlocklyComponent | string;
//   }[];
// }

// const BlocklyWidget: React.FC<Props> = memo(function BlocklyWidget({
//   blocklyConfig,
//   blocklyToolboxConfig,
//   blocklyWorkspaceRef,
//   workspaceCode,
//   onWorkspaceCodeChange,
//   setRemainingBlocks,
//   style,
//   challengeId,
//   ...rest
// }) {
//   const { blocks } = blocklyToolboxConfig;
//   useEffect(() => {
//     window.Blockly = Blockly;
//   }, []);

//   useEffect(() => {
//     if (!blocks.custom) return;

//     blocks.custom.forEach((blockType) => {
//       const block = getCustomBlock(blockType, rest.player);
//       if (!block) return;

//       Blockly.Blocks[blockType] = {
//         init() {
//           (this as any).jsonInit(block);
//         },
//       };
//       (Blockly as any).JavaScript[blockType] = block.generatorCallback;
//     });
//   }, [blocks, rest.player]);

//   const toolbox: Toolbox = useMemo(() => {
//     if (!blocks.builtin && !blocks.custom) return { kind: '', contents: [] };
//     const config: Toolbox = {
//       kind: 'flyoutToolbox',
//       contents: [],
//     };

//     if (blocks.builtin && Array.isArray(blocks.builtin)) {
//       blocks.builtin.forEach((type) => config.contents.push({ kind: 'block', type }));
//     }

//     if (blocks.custom && Array.isArray(blocks.custom)) {
//       blocks.custom.forEach((type) => config.contents.push({ kind: 'block', type }));
//     }

//     return config;
//   }, [blocks]);

//   useEffect(() => {
//     const blocklyDiv = document.querySelector('.blockly-div');
//     if (!blocklyDiv) return () => ({});
//     const workspace = Blockly.inject(blocklyDiv, {
//       ...blocklyConfig,
//       toolbox: toolbox as unknown as HTMLElement,
//       trashcan: true,
//       move: { scrollbars: true },
//     });

//     blocklyWorkspaceRef.current = workspace;

//     workspace.addChangeListener(() => {
//       setRemainingBlocks(workspace.remainingCapacity());
//       if (onWorkspaceCodeChange) {
//         onWorkspaceCodeChange(Blockly.Xml.workspaceToDom(workspace).outerHTML);
//       }
//     });
//     (Blockly as any).JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
//     (Blockly as any).JavaScript.addReservedWords('highlightBlock');
//     const dom = textToDom(workspaceCode || '');
//     if (dom && blocks.custom?.length) Blockly.Xml.domToWorkspace(dom, workspace);

//     return workspace.dispose.bind(workspace);

//     // DO NOT INCLUDE ANY DEPENDECY
//   }, [challengeId]);

//   return <BlocklyDiv id="blockly-div" className="blockly-div" style={style} />;
// });

// export default BlocklyWidget;
