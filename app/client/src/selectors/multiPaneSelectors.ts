import type { AppState } from "@appsmith/reducers";

export const getTabsPaneWidth = (state: AppState) =>
  state.ui.multiPaneConfig.tabsPaneWidth;

export const isMultiPaneActive = (state: AppState) =>
  state.ui.users.featureFlag.data.multiple_panes === true;

export const getPaneCount = (state: AppState) =>
  state.ui.multiPaneConfig.paneCount;
