import * as chains from 'constants/chains'
import * as useV2edgePositions from 'hooks/useV2edgePositions'
import { BrowserRouter as Router } from 'react-router-dom'
import { render, screen } from 'test-utils'

import Pool from '.'

jest.mock('@web3-react/core', () => {
  const web3React = jest.requireActual('@web3-react/core')
  return {
    ...web3React,
    useWeb3React: () => ({
      chainId: 1,
    }),
  }
})

describe('networks', () => {
  it('renders error card when unsupported chain is selected', () => {
    jest.spyOn(chains, 'isSupportedChain').mockReturnValue(false)
    jest.spyOn(useV2edgePositions, 'useV2edgePositions').mockImplementation(() => {
      return { loading: false, positions: undefined }
    })

    render(
      <Router>
        <Pool />
      </Router>
    )
    expect(screen.getByText('Your connected network is unsupported.')).toBeInTheDocument()
  })

  it('renders empty positions card when on supported chain with no positions', () => {
    jest.spyOn(chains, 'isSupportedChain').mockReturnValue(true)
    jest.spyOn(useV2edgePositions, 'useV2edgePositions').mockImplementation(() => {
      return { loading: false, positions: undefined }
    })

    render(
      <Router>
        <Pool />
      </Router>
    )
    expect(screen.getByText('Your active V2edge liquidity positions will appear here.')).toBeInTheDocument()
  })
})
