import type { OccupiedSpace } from "constants/CanvasEditorConstants";
import { getMovementMap } from "./reflowHelpers";
import type {
  BlockSpace,
  CollidingSpaceMap,
  CollisionMap,
  GridProps,
  MovementLimitMap,
  OrientationAccessors,
  PrevReflowState,
  ReflowedSpaceMap,
  SecondOrderCollisionMap,
  SpaceAttributes,
  SpaceMap,
} from "./reflowTypes";
import { ReflowDirection } from "./reflowTypes";
import {
  changeExitContainerDirection,
  filterCommonSpaces,
  buildArrayToCollisionMap,
  getAccessor,
  getCollidingSpaceMap,
  getDelta,
  getMaxSpaceAttributes,
  getModifiedOccupiedSpacesMap,
  getOrientationAccessors,
  getShouldReflow,
  getSpacesMapFromArray,
  getSortedOccupiedSpaces,
  getSortedNewPositions,
  getSortedCollidingSpaces,
  getCalculatedDirection,
  getOrientationAccessor,
  initializeMovementLimitMap,
  verifyMovementLimits,
} from "./reflowUtils";

/**
 * Reflow method that returns the displacement metrics of all other colliding spaces
 * This is the entry point for the reflow algorithm, It is all pure javascript methods from this point onwards
 *
 * @param newSpacePositions new/current positions array of the dragging/resizing space/block
 * @param OGSpacePositions original positions array of the space before movement
 * @param occupiedSpaces array of all the occupied spaces on the canvas
 * @param direction direction of movement of the moving space
 * @param gridProps properties of the canvas's grid
 * @param forceDirection boolean to force the direction on certain scenarios
 * @param shouldResize boolean to indicate if colliding spaces should resize
 * @param prevReflowState this contains a map of reference to the key values of previous reflow method call to back trace widget movements
 * @param exitContainerId sting, Id of recent exit container
 * @param mousePosition mouse Position on canvas grid
 * @param shouldReflowDropTarget boolean which indicates if we should reflow drop targets
 * @param onTimeout indicates if the reflow is called on timeout
 * @returns movement information of the dragging/resizing space and other colliding spaces
 */
export function reflow(
  newSpacePositions: BlockSpace[],
  OGSpacePositions: OccupiedSpace[],
  occupiedSpaces: BlockSpace[],
  direction: ReflowDirection,
  gridProps: GridProps,
  forceDirection = false,
  shouldResize = true,
  prevReflowState: PrevReflowState = {} as PrevReflowState,
  exitContainerId?: string,
  mousePosition?: OccupiedSpace,
  shouldReflowDropTarget = true,
  onTimeout = false,
) {
  const newSpacePositionsMap = getSpacesMapFromArray(newSpacePositions);
  const OGSpacePositionsMap = getSpacesMapFromArray(OGSpacePositions);
  const occupiedSpacesMap = getSpacesMapFromArray(occupiedSpaces);

  const [primaryDirection, secondaryDirection] = getCalculatedDirection(
    newSpacePositionsMap,
    prevReflowState.prevSpacesMap,
    direction,
  );

  //initializing variables
  let movementLimitMap: MovementLimitMap =
    initializeMovementLimitMap(newSpacePositions);
  const globalCollidingSpaces: CollidingSpaceMap = {
    horizontal: {},
    vertical: {},
  };

  // Reflow is split into two orientation, current direction's orientation is done first
  //and based on that reflowed values, opposite orientation is taken up next.
  //for example, if primary direction is LEFT or RIGHT, then the horizontal orientation of reflow is calculated first
  let currentDirection = forceDirection ? direction : primaryDirection;

  if (!OGSpacePositionsMap || currentDirection === ReflowDirection.UNSET) {
    return {
      movementMap: prevReflowState.prevMovementMap,
      movementLimit: {
        canHorizontalMove: true,
        canVerticalMove: true,
      },
    };
  }

  const currentAccessor = getAccessor(currentDirection);
  const { isHorizontal } = currentAccessor;

  // This Mutates occupiedSpacesMap to filter out the common spaces with newSpacePositionsMap
  filterCommonSpaces(newSpacePositionsMap, occupiedSpacesMap);

  //The primary and secondary accessors for maximum and minium dimensions of a space
  const maxSpaceAttributes = getMaxSpaceAttributes(currentAccessor);

  //The primary and secondary Orientations
  const orientation: OrientationAccessors =
    getOrientationAccessors(isHorizontal);

  const delta = getDelta(newSpacePositionsMap, OGSpacePositionsMap, direction);

  //Reflow in the primary orientation
  const {
    collidingSpaces: primaryCollidingSpaces,
    currSpacePositionMap: primarySpacePositionMap,
    isColliding: primaryIsColliding,
    movementMap: primaryMovementMap,
    movementVariablesMap: primaryMovementVariablesMap,
    secondOrderCollisionMap: primarySecondOrderCollisionMap,
    shouldRegisterContainerTimeout: primaryShouldRegisterContainerTimeout,
  } = getOrientationalMovementInfo(
    newSpacePositionsMap,
    occupiedSpacesMap,
    currentDirection,
    isHorizontal,
    gridProps,
    delta,
    shouldResize,
    forceDirection,
    exitContainerId,
    shouldReflowDropTarget,
    onTimeout,
    mousePosition,
    maxSpaceAttributes.primary,
    prevReflowState,
  );

  globalCollidingSpaces[orientation.primary] = buildArrayToCollisionMap(
    primaryCollidingSpaces,
  );
  getShouldReflow(movementLimitMap, primaryMovementVariablesMap, delta);

  //Reflow in the opposite/secondary orientation
  if (!forceDirection && secondaryDirection)
    currentDirection = secondaryDirection;

  const {
    collidingSpaces: secondaryCollidingSpaces,
    currSpacePositionMap: secondarySpacePositionMap,
    isColliding: secondaryIsColliding,
    movementMap,
    movementVariablesMap: secondaryMovementVariablesMap,
    secondOrderCollisionMap,
    shouldRegisterContainerTimeout: secondaryShouldRegisterContainerTimeout,
  } = getOrientationalMovementInfo(
    primarySpacePositionMap,
    occupiedSpacesMap,
    currentDirection,
    !isHorizontal,
    gridProps,
    delta,
    shouldResize,
    forceDirection,
    exitContainerId,
    shouldReflowDropTarget,
    onTimeout,
    mousePosition,
    maxSpaceAttributes.secondary,
    prevReflowState,
    primaryMovementMap || {},
    globalCollidingSpaces[orientation.primary],
    primarySecondOrderCollisionMap,
  );

  if (secondaryIsColliding) {
    globalCollidingSpaces[orientation.secondary] = buildArrayToCollisionMap(
      secondaryCollidingSpaces,
    );
    getShouldReflow(movementLimitMap, secondaryMovementVariablesMap, delta);
  }

  // If we are not reflowing drop targets, verify the limits of dragging widget
  if (!shouldReflowDropTarget && newSpacePositions.length === 1) {
    movementLimitMap = verifyMovementLimits(
      movementLimitMap,
      secondarySpacePositionMap,
      occupiedSpacesMap,
    );
  }

  if (!primaryIsColliding && !secondaryIsColliding) {
    return {
      movementLimitMap,
      spacePositionMap: secondarySpacePositionMap,
      shouldRegisterContainerTimeout:
        primaryShouldRegisterContainerTimeout ||
        secondaryShouldRegisterContainerTimeout,
    };
  }

  return {
    movementLimitMap,
    movementMap: movementMap || primaryMovementMap,
    collidingSpaceMap: globalCollidingSpaces,
    secondOrderCollisionMap:
      secondOrderCollisionMap || primarySecondOrderCollisionMap,
    shouldRegisterContainerTimeout:
      primaryShouldRegisterContainerTimeout ||
      secondaryShouldRegisterContainerTimeout,
    spacePositionMap: secondarySpacePositionMap,
  };
}

/**
 * Reflow method that returns the movement variables in a particular orientation, like "horizontal" or "vertical"
 * movement variables involve movementMap of the reflowed spaces, movement Limits of moving/dragging/resizing spaces/blocks
 *
 * @param newSpacePositionsMap new/current positions map of the dragging/resizing space/block
 * @param occupiedSpacesMap all the occupied spaces map on the canvas
 * @param direction direction of movement of the moving space
 * @param isHorizontal boolean to indicate if the orientation is horizontal
 * @param gridProps properties of the canvas's grid
 * @param delta X and Y distance from original positions
 * @param shouldResize boolean to indicate if colliding spaces should resize
 * @param forceDirection boolean to force the direction on certain scenarios
 * @param exitContainerId string, Id of recent exit container
 * @param shouldReflowDropTarget boolean which indicates if we should reflow drop targets
 * @param onTimeout indicates if the reflow is called on timeout
 * @param mousePosition mouse Position on canvas grid
 * @param maxSpaceAttributes object containing accessors for maximum and minimum dimensions in a particular direction
 * @param prevReflowState this contains a map of reference to the key values of previous reflow method call to back trace widget movements
 * @param primaryMovementMap movement map/information from previous run of the algorithm
 * @param primaryCollisionMap direct collision spaces map on the previous run of the algorithm
 * @returns movement information of the dragging/resizing space and other colliding spaces
 */
function getOrientationalMovementInfo(
  newSpacePositionsMap: SpaceMap,
  occupiedSpacesMap: SpaceMap,
  direction: ReflowDirection,
  isHorizontal: boolean,
  gridProps: GridProps,
  delta = { X: 0, Y: 0 },
  shouldResize: boolean,
  forceDirection: boolean,
  exitContainerId: string | undefined,
  shouldReflowDropTarget = true,
  onTimeout = false,
  mousePosition: OccupiedSpace | undefined,
  maxSpaceAttributes: { max: SpaceAttributes; min: SpaceAttributes },
  prevReflowState: PrevReflowState,
  primaryMovementMap?: ReflowedSpaceMap,
  primaryCollisionMap?: CollisionMap,
  primarySecondOrderCollisionMap?: SecondOrderCollisionMap,
) {
  const { prevCollidingSpaceMap, prevMovementMap, prevSpacesMap } =
    prevReflowState;
  const accessors = getAccessor(direction);
  const orientationAccessor = getOrientationAccessor(isHorizontal);

  //modifying the occupied space's dimension based on the orientation and previous movement maps
  //for example,  if current orientation is horizontal, then top and bottom of the spaces is modified to be equal to previous reflowed Y values
  const orientationOccupiedSpacesMap = getModifiedOccupiedSpacesMap(
    occupiedSpacesMap,
    primaryMovementMap || prevMovementMap,
    isHorizontal,
    gridProps,
    maxSpaceAttributes.max,
    maxSpaceAttributes.min,
  );

  const sortedOccupiedSpaces = getSortedOccupiedSpaces(
    orientationOccupiedSpacesMap,
    accessors,
  );

  const newSpacePositions = getSortedNewPositions(
    newSpacePositionsMap,
    accessors,
  );

  const prevCollisionMap =
    (prevCollidingSpaceMap && prevCollidingSpaceMap[orientationAccessor]) || {};

  //gets a map of all colliding spaces of the current dragging spaces
  const {
    collidingSpaceMap,
    currSpacePositions,
    isColliding,
    shouldRegisterContainerTimeout,
  } = getCollidingSpaceMap(
    newSpacePositions,
    sortedOccupiedSpaces,
    direction,
    prevCollidingSpaceMap,
    isHorizontal,
    prevSpacesMap,
    forceDirection,
    primaryCollisionMap,
    shouldReflowDropTarget,
    onTimeout,
    mousePosition,
  );

  const currSpacePositionMap = getSpacesMapFromArray(currSpacePositions);
  const collidingSpaces = getSortedCollidingSpaces(
    collidingSpaceMap,
    isHorizontal,
    prevCollisionMap,
  );

  if (!collidingSpaces.length)
    return { currSpacePositionMap, shouldRegisterContainerTimeout };

  if (
    !primaryMovementMap &&
    shouldReflowDropTarget &&
    Object.keys(currSpacePositionMap).length === 1
  ) {
    changeExitContainerDirection(
      collidingSpaceMap,
      exitContainerId,
      mousePosition,
      currSpacePositionMap,
    );
  }

  //if it is the first orientation, we use the original positions of the occupiedSpaces
  const currentOccupiedSpaces = !!primaryCollisionMap
    ? sortedOccupiedSpaces
    : getSortedOccupiedSpaces(occupiedSpacesMap, accessors);
  const currentOccupiedSpacesMap = !!primaryCollisionMap
    ? orientationOccupiedSpacesMap
    : occupiedSpacesMap;

  const { movementMap, movementVariablesMap, secondOrderCollisionMap } =
    getMovementMap(
      currSpacePositions,
      currSpacePositionMap,
      currentOccupiedSpaces,
      currentOccupiedSpacesMap,
      occupiedSpacesMap,
      collidingSpaces,
      collidingSpaceMap,
      gridProps,
      delta,
      shouldResize,
      direction,
      isHorizontal,
      prevReflowState,
      primaryMovementMap,
      primarySecondOrderCollisionMap,
    );

  return {
    movementMap,
    movementVariablesMap,
    secondOrderCollisionMap,
    isColliding,
    collidingSpaces,
    currSpacePositionMap,
    shouldRegisterContainerTimeout,
  };
}
