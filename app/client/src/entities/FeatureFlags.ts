type FeatureFlags = {
  APP_TEMPLATE?: boolean;
  JS_EDITOR?: boolean;
  TEMPLATES_PHASE_2?: boolean;
  multiple_panes?: boolean;
  auto_layout?: boolean;
  ask_ai?: boolean;
  color_header?: boolean;
  color_footer?: boolean;
  beta_user?: boolean;
};

export const defaultFlags: FeatureFlags = {
  APP_TEMPLATE: true,
  JS_EDITOR: true,
  TEMPLATES_PHASE_2: true,
  multiple_panes: false,
  auto_layout: true,
  ask_ai: false,
  color_header: false,
  color_footer: false,
  beta_user: false,
};

export default FeatureFlags;
