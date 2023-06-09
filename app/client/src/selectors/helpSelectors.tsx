import type { AppState } from "@appsmith/reducers";

export const getHelpModalOpen = (state: AppState): boolean =>
  state.ui.help.modalOpen;

export const getDefaultRefinement = (state: AppState): string => {
  return state.ui.help.defaultRefinement || "";
};
