import React, { useMemo } from "react";
import styled from "styled-components";
import { Collapse, Classes as BPClasses } from "@blueprintjs/core";
import { Classes, getTypographyByKey } from "design-system-old";
import { Button, Icon, Link } from "design-system";
import { useState } from "react";
import Connections from "./Connections";
import SuggestedWidgets from "./SuggestedWidgets";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { bindDataOnCanvas } from "actions/pluginActionActions";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getWidgets } from "sagas/selectors";
import AnalyticsUtil from "utils/AnalyticsUtil";
import type { AppState } from "@appsmith/reducers";
import { getDependenciesFromInverseDependencies } from "../Debugger/helpers";
import {
  BACK_TO_CANVAS,
  createMessage,
  NO_CONNECTIONS,
} from "@appsmith/constants/messages";
import type {
  SuggestedWidget,
  SuggestedWidget as SuggestedWidgetsType,
} from "api/ActionAPI";
import {
  getCurrentApplicationId,
  getCurrentPageId,
  getPagePermissions,
} from "selectors/editorSelectors";
import { builderURL } from "RouteBuilder";
import { hasManagePagePermission } from "@appsmith/utils/permissionHelpers";

const SideBar = styled.div`
  height: 100%;
  width: 100%;
  -webkit-animation: slide-left 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: slide-left 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

  & > div {
    margin-top: ${(props) => props.theme.spaces[11]}px;
  }

  & > a {
    margin-top: 0;
    margin-left: 0;
  }

  .icon-text {
    display: flex;

    .connection-type {
      ${getTypographyByKey("p1")}
    }
  }

  .icon-text:nth-child(2) {
    padding-top: ${(props) => props.theme.spaces[7]}px;
  }

  .description {
    ${getTypographyByKey("p1")}
    margin-left: ${(props) => props.theme.spaces[2] + 1}px;
    padding-bottom: ${(props) => props.theme.spaces[7]}px;
  }

  @-webkit-keyframes slide-left {
    0% {
      -webkit-transform: translateX(100%);
      transform: translateX(100%);
    }
    100% {
      -webkit-transform: translateX(0);
      transform: translateX(0);
    }
  }
  @keyframes slide-left {
    0% {
      -webkit-transform: translateX(100%);
      transform: translateX(100%);
    }
    100% {
      -webkit-transform: translateX(0);
      transform: translateX(0);
    }
  }
`;

const BackToCanvasLink = styled(Link)`
  margin-left: ${(props) => props.theme.spaces[1] + 1}px;
  margin-top: ${(props) => props.theme.spaces[11]}px;
`;

const Label = styled.span`
  cursor: pointer;
`;

const CollapsibleWrapper = styled.div<{ isOpen: boolean }>`
  .${BPClasses.COLLAPSE_BODY} {
    padding-top: ${(props) => props.theme.spaces[3]}px;
  }

  & > .icon-text:first-child {
    color: var(--ads-v2-color-fg);
    ${getTypographyByKey("h4")}
    cursor: pointer;
    .${Classes.ICON} {
      ${(props) => !props.isOpen && `transform: rotate(-90deg);`}
    }

    .label {
      padding-left: ${(props) => props.theme.spaces[1] + 1}px;
    }
  }
`;

const SnipingWrapper = styled.div`
  ${getTypographyByKey("p1")}
  margin-left: ${(props) => props.theme.spaces[2] + 1}px;

  img {
    max-width: 100%;
  }

  .image-wrapper {
    position: relative;
    margin-top: ${(props) => props.theme.spaces[1]}px;
  }

  .widget:hover {
    cursor: pointer;
  }
`;
const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: 100%;
  padding: ${(props) => props.theme.spaces[8]}px;
  text-align: center;
`;

type CollapsibleProps = {
  expand?: boolean;
  children: ReactNode;
  label: string;
};

export function Collapsible({
  children,
  expand = true,
  label,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(!!expand);

  useEffect(() => {
    setIsOpen(expand);
  }, [expand]);

  return (
    <CollapsibleWrapper isOpen={isOpen}>
      <Label className="icon-text" onClick={() => setIsOpen(!isOpen)}>
        <Icon name="down-arrow" size="lg" />
        <span className="label">{label}</span>
      </Label>
      <Collapse isOpen={isOpen} keepChildrenMounted>
        {children}
      </Collapse>
    </CollapsibleWrapper>
  );
}

export function useEntityDependencies(actionName: string) {
  const deps = useSelector((state: AppState) => state.evaluations.dependencies);
  const entityDependencies = useMemo(
    () =>
      getDependenciesFromInverseDependencies(
        deps.inverseDependencyMap,
        actionName,
      ),
    [actionName, deps.inverseDependencyMap],
  );
  const hasDependencies =
    entityDependencies &&
    (entityDependencies?.directDependencies.length > 0 ||
      entityDependencies?.inverseDependencies.length > 0);
  return {
    hasDependencies,
    entityDependencies,
  };
}

function ActionSidebar({
  actionName,
  entityDependencies,
  hasConnections,
  hasResponse,
  suggestedWidgets,
}: {
  actionName: string;
  hasResponse: boolean;
  hasConnections: boolean | null;
  suggestedWidgets?: SuggestedWidgetsType[];
  entityDependencies: {
    directDependencies: string[];
    inverseDependencies: string[];
  } | null;
}) {
  const dispatch = useDispatch();
  const widgets = useSelector(getWidgets);
  const applicationId = useSelector(getCurrentApplicationId);
  const pageId = useSelector(getCurrentPageId);
  const params = useParams<{
    pageId: string;
    apiId?: string;
    queryId?: string;
  }>();
  const handleBindData = () => {
    AnalyticsUtil.logEvent("SELECT_IN_CANVAS_CLICK", {
      actionName: actionName,
      apiId: params.apiId || params.queryId,
      appId: applicationId,
    });
    dispatch(
      bindDataOnCanvas({
        queryId: (params.apiId || params.queryId) as string,
        applicationId: applicationId as string,
        pageId: params.pageId,
      }),
    );
  };

  const hasWidgets = Object.keys(widgets).length > 1;

  const pagePermissions = useSelector(getPagePermissions);

  const canEditPage = hasManagePagePermission(pagePermissions);

  const showSuggestedWidgets =
    canEditPage && hasResponse && suggestedWidgets && !!suggestedWidgets.length;
  const showSnipingMode = hasResponse && hasWidgets;

  if (!hasConnections && !showSuggestedWidgets && !showSnipingMode) {
    return <Placeholder>{createMessage(NO_CONNECTIONS)}</Placeholder>;
  }

  return (
    <SideBar>
      <BackToCanvasLink
        kind="secondary"
        startIcon="arrow-left-line"
        target="_self"
        to={builderURL({ pageId })}
      >
        {createMessage(BACK_TO_CANVAS)}
      </BackToCanvasLink>

      {hasConnections && (
        <Connections
          actionName={actionName}
          entityDependencies={entityDependencies}
        />
      )}
      {canEditPage && hasResponse && Object.keys(widgets).length > 1 && (
        <Collapsible label="Connect widget">
          {/*<div className="description">Go to canvas and select widgets</div>*/}
          <SnipingWrapper>
            <Button
              className={"t--select-in-canvas"}
              kind="secondary"
              onClick={handleBindData}
              size="md"
            >
              Select widget
            </Button>
          </SnipingWrapper>
        </Collapsible>
      )}
      {showSuggestedWidgets && (
        <SuggestedWidgets
          actionName={actionName}
          hasWidgets={hasWidgets}
          suggestedWidgets={suggestedWidgets as SuggestedWidget[]}
        />
      )}
    </SideBar>
  );
}

export default ActionSidebar;
