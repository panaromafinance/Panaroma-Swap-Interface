import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
// import { SupportedNetwork } from '../constants/networks'

let clientUrl = 'https://api.thegraph.com/subgraphs/name/panaromafinance/panaroma-swap'

export const client = new ApolloClient({
  link: new HttpLink({
    // uri: 'https://api.thegraph.com/subgraphs/name/karthikrameshpanaroma/bangknew',
    uri: clientUrl,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/index-node/graphql',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const v1Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/panaromafinance/panaroma-swap',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const stakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/way2rach/talisman',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/polygon-blocks',
  }),
  cache: new InMemoryCache(),
})

export const polygonClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/karthikrameshpanaroma/bangknew0',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export function updateClient(networkSelected) {
  switch (networkSelected) {
    // case SupportedNetwork.ETHEREUM:
    //   clientUrl = 'https://api.thegraph.com/subgraphs/name/karthikrameshpanaroma/bangknew'
    //   // setAppoloClientUrl(client)
    //   return
    // case SupportedNetwork.ARBITRUM:
    //   clientUrl = 'https://api.thegraph.com/subgraphs/name/karthikrameshpanaroma/bangknew'
    //   return
    // case SupportedNetwork.OPTIMISM:
    //   clientUrl = 'https://api.thegraph.com/subgraphs/name/karthikrameshpanaroma/bangknew'
    //   return
    // case SupportedNetwork.POLYGON:
    //   clientUrl = 'https://api.thegraph.com/subgraphs/name/karthikrameshpanaroma/bangknew'
    //   return
    default:
      clientUrl = 'https://api.thegraph.com/subgraphs/name/panaromafinance/panaroma-swap'
      return
  }
}
