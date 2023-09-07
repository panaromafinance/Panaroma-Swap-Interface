import { contractAbi } from './PanaromaswapV2edgeFactory.json'
import { Token } from '@panaromafinance/panaromaswap_sdkcore'
import { FeeAmount } from '@panaromafinance/panaromaswap_v2edgesdk'
import { useCallback } from 'react'

const Web3EthContract = require('web3-eth-contract')
const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

// export class facAddress{

//    // ADDRESS : string

//   getAddress(
//     factoryAddress: string, tokenA: Token, tokenB: Token, fee: FeeAmount
//   ): string {
//     // console.log(tokenA, tokenB)
//     const { address: addressA } = tokenA
//     const { address: addressB } = tokenB
//     const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`

//     Web3EthContract.setProvider(`https://ropsten.infura.io/v3/${INFURA_KEY}`)
//     const contract = new Web3EthContract(contractAbi, '0x89538C05630E6a6128f36A902b8a6217C17181EA')
//     contract.options.address = '0x89538C05630E6a6128f36A902b8a6217C17181EA'
//     let promise = new Promise( (resolve, reject) => {
//       resolve(contract.methods.getPool(tokenA.address, tokenB.address, fee).call())
//     })
//     // const _address = contract.methods.getPool(tokenA.address, tokenB.address, fee).call()
//     // if (!_address) {
//     // var _t = ''
//     return promise.then( (results) => { 
//       // console.log(result)
//       return results
      
//     })
    
    
    

//   }

//   // getAddress() {
//   //   console.log(this.ADDRESS)
//   //   return this.ADDRESS
//   // }
// }

// export function facAddress(factoryAddress, tokenA, tokenB, fee): (factoryAddress: any, tokenA: any, tokenB: any, fee: any) => Promise<Array<any>> {
//   console.log(factoryAddress, tokenA, tokenB, fee)
//   const { address: addressA } = tokenA
//   const { address: addressB } = tokenB
//   const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`

//   Web3EthContract.setProvider(`https://ropsten.infura.io/v3/${INFURA_KEY}`)
//   const contract = new Web3EthContract(contractAbi, '0x89538C05630E6a6128f36A902b8a6217C17181EA')
//   contract.options.address = '0x89538C05630E6a6128f36A902b8a6217C17181EA'
//   let ADDRESS = ''
//   // async ()=>{
//   let promise = new Promise( (resolve, reject) => {
//       resolve(contract.methods.getPool(tokenA.address, tokenB.address, fee).call())
//     })
//   return promise.then( (results) => { 
//       console.log(results)
//       return results
      
//     })
  // return 
  // return ADDRESS
    
// } 
  

  // note: prevent dispatch if using for list search or unsupported list
  // return useCallback(
  //   async (ADDRESS: string) => {
  //     return contract.methods.getPool(tokenA.address, tokenB.address, fee).call()
  //       .then((result) => {
  //         console.log(result)
  //         // sendDispatch && dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }))
  //         return result
  //       })
  //       .catch((error) => {
  //         console.debug(`Failed to get factoryAddress`, error)
  //         throw error
  //       })
  //   },
  //   ADDRESS
  // )
// }
