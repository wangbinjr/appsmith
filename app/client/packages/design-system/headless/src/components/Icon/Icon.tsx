import React from "react";
import type {
  AriaLabelingProps,
  DOMProps,
  StyleProps,
} from "@react-types/shared";
import type { ReactElement } from "react";
import { filterDOMProps } from "@react-aria/utils";

export interface IconProps extends DOMProps, AriaLabelingProps, StyleProps {
  "aria-label"?: string;
  children: ReactElement;
  "aria-hidden"?: boolean | "false" | "true";
}

export function Icon(props: IconProps) {
  const {
    "aria-hidden": ariaHiddenProp,
    "aria-label": ariaLabel,
    children,
    ...otherProps
  } = props;

  let ariaHidden = ariaHiddenProp;

  if (!ariaHiddenProp) {
    ariaHidden = undefined;
  }

  return React.cloneElement(children, {
    ...filterDOMProps(otherProps),
    focusable: "false",
    "aria-label": ariaLabel,
    "aria-hidden": ariaLabel ? ariaHidden || undefined : true,
    role: "img",
    "data-icon": "",
  });
}