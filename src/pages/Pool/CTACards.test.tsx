import * as useV2edgePositions from 'hooks/useV2edgePositions'
import { BrowserRouter as Router } from 'react-router-dom'
import { render, screen } from 'test-utils'

import CTACards from './CTACards'

jest.mock('@web3-react/core', () => {
  const web3React = jest.requireActual('@web3-react/core')
  return {
    ...web3React,
    useWeb3React: () => ({
      chainId: 99999,
    }),
  }
})

describe('CTAcard links', () => {
  it('renders mainnet link when chain is not supported', () => {
    jest.spyOn(useV2edgePositions, 'useV2edgePositions').mockImplementation(() => {
      return { loading: false, positions: undefined }
    })

    render(
      <Router>
        <CTACards />
      </Router>
    )
    expect(screen.getByTestId('cta-infolink')).toHaveAttribute('href', 'https://info.panaromaswap.org/#/pools')
  })
})
