import {
  createBasicElementsPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createImagePlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createPlateUI,
  createPlugins,
  createSelectOnBackspacePlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
  createTodoListPlugin,
  createLinkPlugin,
  createListPlugin,
  createTablePlugin,
  createMediaEmbedPlugin,
  createAlignPlugin,
  createHighlightPlugin,
  createIndentPlugin,
  createAutoformatPlugin,
  createDeserializeMdPlugin,
} from '@udecode/plate';
import { CONFIG } from './config';

let components = createPlateUI();
// components = withStyledPlaceHolders(components);

export default createPlugins(
  [
    // createParagraphPlugin(),
    // createBlockquotePlugin(),
    // createTodoListPlugin(),
    // createHeadingPlugin(),
    // createImagePlugin(),
    // createHorizontalRulePlugin(),
    // createLineHeightPlugin(CONFIG.lineHeight),
    // createLinkPlugin(),
    // createListPlugin(),
    // createTablePlugin(),
    // createMediaEmbedPlugin(),
    // createExcalidrawPlugin(),
    // createCodeBlockPlugin(),
    // createAlignPlugin(CONFIG.align),
    // createBoldPlugin(),
    // createCodePlugin(),
    // createItalicPlugin(),
    // createHighlightPlugin(),
    // createUnderlinePlugin(),
    // createStrikethroughPlugin(),
    // createSubscriptPlugin(),
    // createSuperscriptPlugin(),
    // createFontBackgroundColorPlugin(),
    // createFontFamilyPlugin(),
    // createFontColorPlugin(),
    // createFontSizePlugin(),
    // createFontWeightPlugin(),
    // createKbdPlugin(),
    // createNodeIdPlugin(),
    // createIndentPlugin(CONFIG.indent),
    // createAutoformatPlugin(CONFIG.autoformat),
    // createResetNodePlugin(CONFIG.resetBlockType),
    // createSoftBreakPlugin(CONFIG.softBreak),
    // createExitBreakPlugin(CONFIG.exitBreak),
    // createNormalizeTypesPlugin(CONFIG.forceLayout),
    // createTrailingBlockPlugin(CONFIG.trailingBlock),
    // createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
    // createComboboxPlugin(),
    // createMentionPlugin(),
    // createDeserializeMdPlugin(),
    // createDeserializeCsvPlugin(),
    // createDeserializeDocxPlugin(),
    // createJuicePlugin(),

    // marks
    createBoldPlugin(), // bold mark
    createItalicPlugin(), // italic mark
    createUnderlinePlugin(), // underline mark
    createStrikethroughPlugin(), // strikethrough mark
    createCodePlugin(), // code mark
  ],
  {
    components,
  }
);
