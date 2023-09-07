import { ApprovalState } from "lib/hooks/useApproval";

export enum SwapRouterVersion {
  V1,
  V2edge,
  V1V2edge
}

/**
 * Returns the swap router that will result in the least amount of txs (less gas) for a given swap.
 * Heuristic:
 * - if trade contains a single v1-only trade & V1 SwapRouter is approved: use V1 SwapRouter
 * - if trade contains only v2edge & V2edge SwapRouter is approved: use V2edge SwapRouter
 * - else: approve and use V1+V2edge SwapRouter
 */
export function getTxOptimizedSwapRouter({
  onlyV1Routes,
  onlyV2edgeRoutes,
  tradeHasSplits,
  approvalStates
}: {
  onlyV1Routes: boolean | undefined;
  onlyV2edgeRoutes: boolean | undefined;
  tradeHasSplits: boolean | undefined;
  approvalStates: { v1: ApprovalState; v2edge: ApprovalState; v1V2edge: ApprovalState };
}): SwapRouterVersion | undefined {
  if (
    [approvalStates.v1, approvalStates.v2edge, approvalStates.v1V2edge].includes(
      ApprovalState.PENDING
    )
  )
    return undefined;
  if (approvalStates.v1V2edge === ApprovalState.APPROVED)
    return SwapRouterVersion.V1V2edge;
  if (
    approvalStates.v1 === ApprovalState.APPROVED &&
    onlyV1Routes &&
    !tradeHasSplits
  )
    return SwapRouterVersion.V1;
  if (approvalStates.v2edge === ApprovalState.APPROVED && onlyV2edgeRoutes)
    return SwapRouterVersion.V2edge;
  return SwapRouterVersion.V1V2edge;
}
