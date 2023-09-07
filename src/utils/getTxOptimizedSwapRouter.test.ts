import { ApprovalState } from 'lib/hooks/useApproval'

import { getTxOptimizedSwapRouter, SwapRouterVersion } from './getTxOptimizedSwapRouter'

const getApprovalState = (approved: SwapRouterVersion[]) => ({
  v1: approved.includes(SwapRouterVersion.V1) ? ApprovalState.APPROVED : ApprovalState.NOT_APPROVED,
  v2edge: approved.includes(SwapRouterVersion.V2edge) ? ApprovalState.APPROVED : ApprovalState.NOT_APPROVED,
  v1V2edge: approved.includes(SwapRouterVersion.V1V2edge) ? ApprovalState.APPROVED : ApprovalState.NOT_APPROVED,
})

describe(getTxOptimizedSwapRouter, () => {
  it('always selects v1v2edge when approved', () => {
    expect(
      getTxOptimizedSwapRouter({
        onlyV1Routes: true,
        onlyV2edgeRoutes: false,
        tradeHasSplits: false,
        approvalStates: getApprovalState([SwapRouterVersion.V1V2edge]),
      })
    ).toEqual(SwapRouterVersion.V1V2edge)
    expect(
      getTxOptimizedSwapRouter({
        onlyV1Routes: false,
        onlyV2edgeRoutes: true,
        tradeHasSplits: false,
        approvalStates: getApprovalState([SwapRouterVersion.V1V2edge]),
      })
    ).toEqual(SwapRouterVersion.V1V2edge)
    expect(
      getTxOptimizedSwapRouter({
        onlyV1Routes: false,
        onlyV2edgeRoutes: true,
        tradeHasSplits: false,
        approvalStates: getApprovalState([SwapRouterVersion.V1, SwapRouterVersion.V2edge, SwapRouterVersion.V1V2edge]),
      })
    ).toEqual(SwapRouterVersion.V1V2edge)
  })

  it('selects the right router when only v1 routes', () => {
    const base = { onlyV2edgeRoutes: false }

    // selects v1
    expect(
      getTxOptimizedSwapRouter({
        ...base,
        onlyV1Routes: true,
        tradeHasSplits: false,
        approvalStates: getApprovalState([SwapRouterVersion.V1, SwapRouterVersion.V2edge]),
      })
    ).toEqual(SwapRouterVersion.V1)

    // selects v1V2edge
    expect(
      getTxOptimizedSwapRouter({
        ...base,
        onlyV1Routes: true,
        tradeHasSplits: true,
        approvalStates: getApprovalState([SwapRouterVersion.V1]),
      })
    ).toEqual(SwapRouterVersion.V1V2edge)
    expect(
      getTxOptimizedSwapRouter({
        ...base,
        onlyV1Routes: true,
        tradeHasSplits: true,
        approvalStates: getApprovalState([SwapRouterVersion.V1, SwapRouterVersion.V1V2edge]),
      })
    ).toEqual(SwapRouterVersion.V1V2edge)
  })

  it('selects the right router when only v2edge routes', () => {
    const base = { onlyV1Routes: false }

    // select v2edge
    expect(
      getTxOptimizedSwapRouter({
        ...base,
        onlyV2edgeRoutes: true,
        tradeHasSplits: false,
        approvalStates: getApprovalState([SwapRouterVersion.V1, SwapRouterVersion.V2edge]),
      })
    ).toEqual(SwapRouterVersion.V2edge)
    expect(
      getTxOptimizedSwapRouter({
        ...base,
        onlyV2edgeRoutes: true,
        tradeHasSplits: true,
        approvalStates: getApprovalState([SwapRouterVersion.V2edge]),
      })
    ).toEqual(SwapRouterVersion.V2edge)

    // selects v1V2edge
    expect(
      getTxOptimizedSwapRouter({
        ...base,
        onlyV2edgeRoutes: true,
        tradeHasSplits: true,
        approvalStates: getApprovalState([SwapRouterVersion.V1, SwapRouterVersion.V1V2edge]),
      })
    ).toEqual(SwapRouterVersion.V1V2edge)
  })
})
