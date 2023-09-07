import { createAction } from "@reduxjs/toolkit";

export enum Field {
  CURRENCY_A = "CURRENCY_A",
  CURRENCY_B = "CURRENCY_B"
}

export enum Bound {
  LOWER = "LOWER",
  UPPER = "UPPER"
}

export const typeInput = createAction<{
  field: Field;
  typedValue: string;
  noLiquidity: boolean;
}>("mintV2edge/typeInputMint");
export const typeStartPriceInput = createAction<{ typedValue: string }>(
  "mintV2edge/typeStartPriceInput"
);
export const typeLeftRangeInput = createAction<{ typedValue: string }>(
  "mintV2edge/typeLeftRangeInput"
);
export const typeRightRangeInput = createAction<{ typedValue: string }>(
  "mintV2edge/typeRightRangeInput"
);
export const resetMintState = createAction<void>("mintV2edge/resetMintState");
export const setFullRange = createAction<void>("mintV2edge/setFullRange");
