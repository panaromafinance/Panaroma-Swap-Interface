import { Protocol } from '@panaromafinance/panaromaswap_routersdk'
import { Currency, Percent } from '@panaromafinance/panaromaswap_sdkcore'
import { FeeAmount } from '@panaromafinance/panaromaswap_v2edgesdk'
import { RoutingDiagramEntry } from 'components/swap/SwapRoute'
import { DAI, USDC_MAINNET, WBTC } from 'constants/tokens'
import { render } from 'test-utils'

import RoutingDiagram from './RoutingDiagram'

const percent = (strings: TemplateStringsArray) => new Percent(parseInt(strings[0]), 100)

const singleRoute: RoutingDiagramEntry = {
  percent: percent`100`,
  path: [[USDC_MAINNET, DAI, FeeAmount.LOW]],
  protocol: Protocol.V2edge,
}

const multiRoute: RoutingDiagramEntry[] = [
  { percent: percent`75`, path: [[USDC_MAINNET, DAI, FeeAmount.LOWEST]], protocol: Protocol.V1 },
  {
    percent: percent`25`,
    path: [
      [USDC_MAINNET, WBTC, FeeAmount.MEDIUM],
      [WBTC, DAI, FeeAmount.HIGH],
    ],
    protocol: Protocol.V2edge,
  },
]

jest.mock(
  'components/CurrencyLogo',
  () =>
    ({ currency }: { currency: Currency }) =>
      `CurrencyLogo currency=${currency.symbol}`
)

jest.mock(
  'components/DoubleLogo',
  () =>
    ({ currency0, currency1 }: { currency0: Currency; currency1: Currency }) =>
      `DoubleCurrencyLogo currency0=${currency0.symbol} currency1=${currency1.symbol}`
)

jest.mock('../Popover', () => () => 'Popover')

jest.mock('hooks/useTokenInfoFromActiveList', () => ({
  useTokenInfoFromActiveList: (currency: Currency) => currency,
}))

it('renders when no routes are provided', () => {
  const { asFragment } = render(<RoutingDiagram currencyIn={DAI} currencyOut={USDC_MAINNET} routes={[]} />)
  expect(asFragment()).toMatchSnapshot()
})

it('renders single route', () => {
  const { asFragment } = render(<RoutingDiagram currencyIn={USDC_MAINNET} currencyOut={DAI} routes={[singleRoute]} />)
  expect(asFragment()).toMatchSnapshot()
})

it('renders multi route', () => {
  const { asFragment } = render(<RoutingDiagram currencyIn={USDC_MAINNET} currencyOut={DAI} routes={multiRoute} />)
  expect(asFragment()).toMatchSnapshot()
})
