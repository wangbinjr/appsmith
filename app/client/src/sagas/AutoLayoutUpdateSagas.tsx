import { updateAndSaveLayout } from "actions/pageActions";
import {
  ReduxAction,
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "ce/constants/ReduxActionConstants";
import log from "loglevel";
import { CanvasWidgetsReduxState } from "reducers/entityReducers/canvasWidgetsReducer";
import { all, call, put, select, takeLatest } from "redux-saga/effects";
import {
  alterLayoutForDesktop,
  alterLayoutForMobile,
} from "utils/autoLayout/AutoLayoutUtils";
import { getWidgets } from "./selectors";
import { AppPositioningTypes } from "reducers/entityReducers/pageListReducer";
import { MAIN_CONTAINER_WIDGET_ID } from "constants/WidgetConstants";
import {
  getCurrentAppPositioningType,
  getMainCanvasProps,
} from "selectors/editorSelectors";
import { MainCanvasReduxState } from "reducers/uiReducers/mainCanvasReducer";
import { updateLayoutForMobileBreakpointAction } from "actions/autoLayoutActions";
import CanvasWidgetsNormalizer from "normalizers/CanvasWidgetsNormalizer";
import convertDSLtoAuto from "utils/DSLConversions/fixedToAutoLayout";
import { convertNormalizedDSLToFixed } from "utils/DSLConversions/autoToFixedLayout";

export function* updateLayoutForMobileCheckpoint(
  actionPayload: ReduxAction<{
    parentId: string;
    isMobile: boolean;
    canvasWidth: number;
  }>,
) {
  try {
    const start = performance.now();
    const { canvasWidth, isMobile, parentId } = actionPayload.payload;
    const allWidgets: CanvasWidgetsReduxState = yield select(getWidgets);
    const updatedWidgets: CanvasWidgetsReduxState = isMobile
      ? alterLayoutForMobile(allWidgets, parentId, canvasWidth)
      : alterLayoutForDesktop(allWidgets, parentId);
    yield put(updateAndSaveLayout(updatedWidgets));
    log.debug(
      "Auto Layout : updating layout for mobile viewport took",
      performance.now() - start,
      "ms",
    );
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.WIDGET_OPERATION_ERROR,
      payload: {
        action: ReduxActionTypes.RECALCULATE_COLUMNS,
        error,
      },
    });
  }
}

export function* updateLayoutPositioningSaga(
  actionPayload: ReduxAction<AppPositioningTypes>,
) {
  try {
    const currPositioningType: AppPositioningTypes = yield select(
      getCurrentAppPositioningType,
    );
    const payloadPositioningType = actionPayload.payload;

    if (currPositioningType === payloadPositioningType) return;

    const allWidgets: CanvasWidgetsReduxState = yield select(getWidgets);

    if (payloadPositioningType === AppPositioningTypes.AUTO) {
      const denormalizedDSL = CanvasWidgetsNormalizer.denormalize(
        MAIN_CONTAINER_WIDGET_ID,
        { canvasWidgets: allWidgets },
      );

      const autoDSL = convertDSLtoAuto(denormalizedDSL);
      log.debug("autoDSL", autoDSL);

      yield put(
        updateAndSaveLayout(
          CanvasWidgetsNormalizer.normalize(autoDSL).entities.canvasWidgets,
        ),
      );

      yield call(recalculateOnPageLoad);
    } else {
      yield put(
        updateAndSaveLayout(convertNormalizedDSLToFixed(allWidgets, "DESKTOP")),
      );
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.WIDGET_OPERATION_ERROR,
      payload: {
        action: ReduxActionTypes.RECALCULATE_COLUMNS,
        error,
      },
    });
  }
}

export function* recalculateOnPageLoad() {
  const appPositioningType: AppPositioningTypes = yield select(
    getCurrentAppPositioningType,
  );
  const mainCanvasProps: MainCanvasReduxState = yield select(
    getMainCanvasProps,
  );

  yield put(
    updateLayoutForMobileBreakpointAction(
      MAIN_CONTAINER_WIDGET_ID,
      appPositioningType === AppPositioningTypes.AUTO
        ? mainCanvasProps?.isMobile
        : false,
      mainCanvasProps.width,
    ),
  );
}
export default function* layoutUpdateSagas() {
  yield all([
    takeLatest(
      ReduxActionTypes.RECALCULATE_COLUMNS,
      updateLayoutForMobileCheckpoint,
    ),
    takeLatest(
      ReduxActionTypes.UPDATE_LAYOUT_POSITIONING,
      updateLayoutPositioningSaga,
    ),
  ]);
}
