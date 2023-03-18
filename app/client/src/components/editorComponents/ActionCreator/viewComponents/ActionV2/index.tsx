import clsx from "clsx";
import TreeStructure from "components/utils/TreeStructure";
import { Icon, TooltipComponent } from "design-system-old";
import { klona } from "klona/lite";
import React, { useCallback, useEffect } from "react";
import { ActionCreatorContext } from "../..";
import { AppsmithFunction } from "../../constants";
import { TActionBlock } from "../../types";
import { chainableFns } from "../../utils";
import ActionCard from "./ActionCardV2";
import ActionSelector from "./ActionSelectorV2";

const EMPTY_ACTION_BLOCK: TActionBlock = {
  code: "",
  actionType: AppsmithFunction.none,
  success: { blocks: [] },
  error: { blocks: [] },
};

export default function ActionV2(props: {
  actionBlock: TActionBlock;
  onChange: (actionBlock: TActionBlock) => void;
  className?: string;
  id: string;
  supportCallback?: boolean;
  variant?: string;
}) {
  const { id } = props;
  const [actionBlock, setActionBlock] = React.useState(props.actionBlock);
  const { error, success } = actionBlock;
  const { blocks: successBlocks } = success;
  const { blocks: errorBlocks } = error;
  const [isOpen, open] = React.useState(false);

  const { selectBlock, selectedBlockId } = React.useContext(
    ActionCreatorContext,
  );

  useEffect(() => {
    setActionBlock(props.actionBlock);
  }, [props.actionBlock]);

  const [touched, setTouched] = React.useState(false);

  const [callbacksExpanded, setCallbacksExpanded] = React.useState(false);

  const handleCardSelection = useCallback(() => {
    if (selectedBlockId === id) return;
    selectBlock(id);
    setTouched(true);
  }, [id, selectedBlockId]);

  useEffect(() => {
    open(selectedBlockId === id);
  }, [selectedBlockId, id]);

  const handleAddSuccessBlock = useCallback(() => {
    const {
      success: { blocks },
    } = actionBlock;
    const lastAction = blocks[blocks.length - 1];
    if (lastAction?.actionType === AppsmithFunction.none) {
      selectBlock(`${id}_success_${blocks.length - 1}`);
      return;
    }
    const newActionBlock = klona(actionBlock);
    newActionBlock.success.blocks.push({ ...EMPTY_ACTION_BLOCK, type: "then" });
    setActionBlock(newActionBlock);
    selectBlock(`${id}_success_${blocks.length}`);
  }, [actionBlock]);

  const handleAddErrorBlock = useCallback(() => {
    const {
      error: { blocks },
    } = actionBlock;
    const lastAction = blocks[blocks.length - 1];
    if (lastAction?.actionType === AppsmithFunction.none) {
      selectBlock(`${id}_failure_${blocks.length - 1}`);
      return;
    }
    const newActionBlock = klona(actionBlock);
    newActionBlock.error.blocks.push({ ...EMPTY_ACTION_BLOCK, type: "catch" });
    setActionBlock(newActionBlock);
    selectBlock(`${id}_failure_${blocks.length}`);
  }, [actionBlock]);

  const actionsCount =
    successBlocks.filter(
      ({ actionType }) => actionType !== AppsmithFunction.none,
    ).length +
    errorBlocks.filter(({ actionType }) => actionType !== AppsmithFunction.none)
      .length;

  const areCallbacksApplicable =
    chainableFns.includes(actionBlock.actionType) && props.supportCallback;

  const showCallbacks = selectedBlockId === id || touched;

  const callbackBlocks = [
    {
      label: "On success",
      handleAddBlock: handleAddSuccessBlock,
      callbacks: successBlocks,
      blockType: "success",
      tooltipContent:
        "Show a message, chain other Actions, or both when the parent Action block runs successfully. All nested Actions run at the same time.",
    },
    {
      label: "On failure",
      handleAddBlock: handleAddErrorBlock,
      callbacks: errorBlocks,
      blockType: "failure",
      tooltipContent:
        "Show a message, chain Actions, or both when the parent Action block fails to run. All nested Actions run at the same time.",
    },
  ];

  return (
    <div className={props.className}>
      <ActionSelector
        action={actionBlock}
        id={id}
        onChange={props.onChange}
        open={isOpen}
      >
        <ActionCard
          actionBlock={actionBlock}
          id={id}
          onSelect={handleCardSelection}
          selected={isOpen}
          variant={props.variant}
        />
      </ActionSelector>
      {showCallbacks && areCallbacksApplicable ? (
        <button
          className="flex w-full justify-between bg-gray-50 px-2 py-1 border-[1px] border-gray-200 border-t-transparent"
          onClick={() => {
            setCallbacksExpanded((prev) => !prev);
            setTouched(true);
          }}
        >
          <span className="text-gray-800 underline underline-offset-2 decoration-dashed decoration-gray-300">
            Callbacks
          </span>
          <div className="flex gap-1">
            <span className="text-gray-800">
              {actionsCount > 0 ? actionsCount : "No"} actions
            </span>
            <Icon
              fillColor="var(--ads-color-gray-700)"
              name={callbacksExpanded ? "expand-less" : "expand-more"}
              size="extraLarge"
            />
          </div>
        </button>
      ) : null}
      {callbacksExpanded && areCallbacksApplicable ? (
        <TreeStructure>
          <ul className="tree flex flex-col gap-0">
            {callbackBlocks.map(
              ({
                blockType,
                callbacks,
                handleAddBlock,
                label,
                tooltipContent,
              }) => (
                <li key={label}>
                  <div className="flex flex-col">
                    <button
                      className={clsx(
                        "action-callback-add",
                        "flex justify-between bg-gray-50 border-[1px] border-gray-200 box-border",
                        selectedBlockId === `${id}_${blockType}_0` &&
                          "border-b-gray-500",
                      )}
                      onClick={handleAddBlock}
                    >
                      <TooltipComponent
                        boundary="viewport"
                        content={tooltipContent}
                        popoverClassName="!max-w-[300px]"
                      >
                        <span className="text-gray-800 underline underline-offset-2 decoration-dashed decoration-gray-300 px-2 py-1">
                          {label}
                        </span>
                      </TooltipComponent>
                      <span className="icon w-7 h-7 flex items-center justify-center">
                        <Icon
                          fillColor="var(--ads-color-black-700)"
                          name="plus"
                          size="extraLarge"
                        />
                      </span>
                    </button>
                    {callbacks.map((cActionBlock, index) => (
                      <ActionV2
                        actionBlock={cActionBlock}
                        className={`mt-0`}
                        id={`${id}_${blockType}_${index}`}
                        key={`${id}_${blockType}_${index}`}
                        onChange={(
                          childActionBlock: TActionBlock,
                          del?: boolean,
                        ) => {
                          const newActionBlock = klona(actionBlock);
                          const blocks =
                            blockType === "failure"
                              ? newActionBlock.error.blocks
                              : newActionBlock.success.blocks;
                          let isDummyBlockDelete = false;
                          if (del) {
                            isDummyBlockDelete =
                              blocks[index].actionType ===
                              AppsmithFunction.none;
                            blocks.splice(index, 1);
                          } else {
                            blocks[index] = childActionBlock;
                          }
                          if (isDummyBlockDelete) {
                            setActionBlock(newActionBlock);
                          } else {
                            props.onChange(newActionBlock);
                          }
                        }}
                        variant="callbackBlock"
                      />
                    ))}
                  </div>
                </li>
              ),
            )}
          </ul>
        </TreeStructure>
      ) : null}
    </div>
  );
}