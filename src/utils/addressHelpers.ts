import addresses from 'config/constants/contracts'
import { chain } from 'lodash'

const chainId = process.env.REACT_APP_CHAIN_ID

export const getCakeAddress = () => {
  return addresses.cake[chainId]
}
export const getMasterChefAddress = () => {
  return addresses.masterChef[chainId]
}
export const getMulticallAddress = () => {
  return addresses.mulltiCall[chainId]
}
export const getWbnbAddress = () => {
  return addresses.wbnb[chainId]
}
export const getLotteryAddress = () => {
  return addresses.lottery[chainId]
}
export const getLotteryTicketAddress = () => {
  return addresses.lotteryNFT[chainId]
}
export const getMilkAddress = () => {
  return addresses.milk[97]
}
export const getMarketAddress = () => {
  return addresses.market[97]
}
export const getHappyCowAddress = () => {
  return addresses.happycow[97]
}