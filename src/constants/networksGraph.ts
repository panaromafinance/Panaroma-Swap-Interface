import OPTIMISM_LOGO_URL from '../assets/svg/logo.svg'
import ARBITRUM_LOGO_URL from '../assets/svg/logo.svg'
import ETHEREUM_LOGO_URL from '../assets/svg/logo.svg'
import POLYGON_LOGO_URL from '../assets/svg/logo.svg'

export const SupportedNetwork = {
  ETHEREUM: 'Ethereum',
  ARBITRUM: 'Arbitrum',
  OPTIMISM: 'Optimism',
  POLYGON: 'Optimism'
}

export type NetworkInfo = {
  route: string
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
  blurb?: string
}

export const EthereumNetworkInfo: NetworkInfo = {
  route: '',
  name: 'Ethereum',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
}

export const ArbitrumNetworkInfo: NetworkInfo = {
  route: 'arbitrum',
  name: 'Arbitrum',
  imageURL: ARBITRUM_LOGO_URL,
  bgColor: '#0A294B',
  primaryColor: '#0490ED',
  secondaryColor: '#96BEDC',
}

export const OptimismNetworkInfo: NetworkInfo = {
  route: 'optimism',
  name: 'Optimism',
  bgColor: '#F01B36',
  primaryColor: '#F01B36',
  secondaryColor: '#FB7876',
  imageURL: OPTIMISM_LOGO_URL,
}

export const PolygonNetworkInfo: NetworkInfo = {
  route: 'polygon',
  name: 'Polygon',
  bgColor: '#8247e5',
  primaryColor: '#8247e5',
  secondaryColor: '#FB7876',
  imageURL: POLYGON_LOGO_URL,
  blurb: '',
}

export const SUPPORTED_NETWORK_VERSIONS: NetworkInfo[] = [
  EthereumNetworkInfo,
  PolygonNetworkInfo,
  OptimismNetworkInfo,
  ArbitrumNetworkInfo
]
