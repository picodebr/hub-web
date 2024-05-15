import styled, { createGlobalStyle } from 'styled-components';

export const BlocklyGlobals = createGlobalStyle`

  .scratchCategoryMenu {
    width: ${(props) => props.theme.dimensions.blocksCategoryWidth}px;
  }

  .scratchCategoryMenuItem.categorySelected {
    background-color: ${(props) => props.theme.colors.blocksAreaBackground};
  }

  .blocklyFlyout {
    transform: translate(
      ${(props) => props.theme.dimensions.blocksCategoryWidth}px,
      0
    ) !important;
    background-color: ${(props) => props.theme.colors.blocksAreaBackground};
    width: ${(props) => props.theme.dimensions.blocksAreaWidth}px;
    border-right: 1px solid ${(props) => props.theme.colors.toolboxFlyoutBorder};
  
  }

  .blocklyFlyoutLabelText {
    font-family: Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
      Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
      sans-serif;
    font-weight: 500;
  }

  .blocklyFlyoutBackground {
    fill: none;
  }

  .blocklyMainBackground {
    stroke: none;
  }

  .blocklySvg {
    background-color: transparent;
  }

  .scratchCategoryItemBubble {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.125rem;
  }
`;

export const Container = styled.div`
  --blocks-category-width: ${(props) => props.theme.dimensions.blocksCategoryWidth}px;
  --blocks-area-width: ${(props) => props.theme.dimensions.blocksAreaWidth}px;
  --blocks-nav-width: calc(var(--blocks-category-width) + var(--blocks-area-width));
  --blocks-header-height: ${(props) => props.theme.dimensions.blocksHeaderHeight}px;

  background-color: ${(props) => props.theme.colors.pageBackground};
  color: ${(props) => props.theme.colors.text};
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    height: calc(100vh - ${(props) => props.theme.dimensions.mobileHeader}px);
  }
`;

export const BlocklyDiv = styled.div`
  grid-area: blockly;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;
