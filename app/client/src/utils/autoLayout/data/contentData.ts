export const CONTAINER_WITH_TEXT_WIDGET = {
  "0": {
    widgetName: "MainContainer",
    backgroundColor: "none",
    rightColumn: 1224,
    snapColumns: 64,
    detachFromLayout: true,
    widgetId: "0",
    topRow: 0,
    bottomRow: 297.53125,
    containerStyle: "none",
    snapRows: 47,
    parentRowSpace: 1,
    type: "CANVAS_WIDGET",
    canExtend: true,
    version: 78,
    minHeight: 490,
    useAutoLayout: true,
    parentColumnSpace: 1,
    responsiveBehavior: "fill",
    dynamicBindingPathList: [],
    leftColumn: 0,
    children: ["1"],
    positioning: "vertical",
    flexLayers: [
      {
        children: [
          {
            id: "1",
            align: "start",
          },
        ],
      },
    ],
  },
  3: {
    mobileBottomRow: 7,
    widgetName: "Text1",
    displayName: "Text",
    iconSVG: "/static/media/icon.97c59b523e6f70ba6f40a10fc2c7c5b5.svg",
    searchTags: ["typography", "paragraph", "label"],
    topRow: 0,
    bottomRow: 4,
    parentRowSpace: 10,
    type: "TEXT_WIDGET",
    hideCard: false,
    mobileRightColumn: 64,
    animateLoading: true,
    overflow: "NONE",
    fontFamily: "{{appsmith.theme.fontFamily.appFont}}",
    parentColumnSpace: 18.5625,
    dynamicTriggerPathList: [],
    leftColumn: 0,
    dynamicBindingPathList: [
      {
        key: "truncateButtonColor",
      },
      {
        key: "fontFamily",
      },
      {
        key: "borderRadius",
      },
    ],
    shouldTruncate: false,
    truncateButtonColor: "{{appsmith.theme.colors.primaryColor}}",
    text: "Label Label Label Label ",
    key: "4doabtw6p3",
    isDeprecated: false,
    rightColumn: 64,
    textAlign: "LEFT",
    dynamicHeight: "AUTO_HEIGHT",
    widgetId: "3",
    minWidth: 450,
    isVisible: true,
    fontStyle: "BOLD",
    textColor: "#231F20",
    version: 1,
    parentId: "2",
    renderMode: "CANVAS",
    isLoading: false,
    mobileTopRow: 3,
    responsiveBehavior: "fill",
    borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
    mobileLeftColumn: 0,
    maxDynamicHeight: 9000,
    fontSize: "1rem",
    alignment: "start",
    minDynamicHeight: 4,
  },
  "2": {
    mobileBottomRow: 100,
    widgetName: "Canvas1",
    displayName: "Canvas",
    topRow: 0,
    bottomRow: 277.53125,
    parentRowSpace: 1,
    type: "CANVAS_WIDGET",
    canExtend: false,
    hideCard: true,
    minHeight: 100,
    mobileRightColumn: 64,
    parentColumnSpace: 1,
    leftColumn: 0,
    dynamicBindingPathList: [],
    children: ["3"],
    key: "ab5j0zc6sp",
    isDeprecated: false,
    rightColumn: 64,
    detachFromLayout: true,
    widgetId: "2",
    containerStyle: "none",
    minWidth: 450,
    isVisible: true,
    version: 1,
    parentId: "1",
    renderMode: "CANVAS",
    isLoading: false,
    mobileTopRow: 0,
    responsiveBehavior: "fill",
    mobileLeftColumn: 0,
    flexLayers: [
      {
        children: [
          {
            id: "3",
            align: "start",
          },
        ],
      },
    ],
  },
  1: {
    boxShadow: "{{appsmith.theme.boxShadow.appBoxShadow}}",
    mobileBottomRow: 36,
    widgetName: "Container1",
    borderColor: "#E0DEDE",
    isCanvas: true,
    displayName: "Container",
    iconSVG: "/static/media/icon.1977dca3370505e2db3a8e44cfd54907.svg",
    searchTags: ["div", "parent", "group"],
    topRow: 0,
    bottomRow: 27.753125,
    parentRowSpace: 10,
    type: "CONTAINER_WIDGET",
    hideCard: false,
    shouldScrollContents: true,
    mobileRightColumn: 64,
    animateLoading: true,
    parentColumnSpace: 18.84375,
    leftColumn: 0,
    dynamicBindingPathList: [
      {
        key: "borderRadius",
      },
      {
        key: "boxShadow",
      },
    ],
    children: ["2"],
    borderWidth: "1",
    flexVerticalAlignment: "start",
    key: "4pbxn6c6w2",
    backgroundColor: "#FFFFFF",
    isDeprecated: false,
    rightColumn: 64,
    dynamicHeight: "AUTO_HEIGHT",
    widgetId: "1",
    containerStyle: "card",
    minWidth: 450,
    isVisible: true,
    version: 1,
    parentId: "0",
    renderMode: "CANVAS",
    isLoading: false,
    mobileTopRow: 26,
    responsiveBehavior: "fill",
    borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
    mobileLeftColumn: 0,
    maxDynamicHeight: 9000,
    alignment: "start",
    minDynamicHeight: 10,
  },
};
