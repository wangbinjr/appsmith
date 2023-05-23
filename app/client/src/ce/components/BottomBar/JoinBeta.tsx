import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { joinBetaChannelInit } from "actions/userActions";
import { Button } from "design-system";

export const JoinBeta = () => {
  const isBetaUser = useSelector(
    (state) => state.ui.users.featureFlag.data.beta_user,
  );
  const dispatch = useDispatch();
  if (isBetaUser) {
    return null;
  }
  const onClick = () => dispatch(joinBetaChannelInit());
  return (
    <Button kind="tertiary" onClick={onClick} size="md">
      Join Beta
    </Button>
  );
};
