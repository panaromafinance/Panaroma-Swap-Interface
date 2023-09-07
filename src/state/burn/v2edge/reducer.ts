import { createReducer } from "@reduxjs/toolkit";

import { selectPercent } from "./actions";

interface BurnV2edgeState {
  readonly percent: number;
}

const initialState: BurnV2edgeState = {
  percent: 0
};

export default createReducer<BurnV2edgeState>(initialState, (builder) =>
  builder.addCase(selectPercent, (state, { payload: { percent } }) => {
    return {
      ...state,
      percent
    };
  })
);
