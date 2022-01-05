import React, {useState, useEffect, useMemo} from 'react'
import styled from 'styled-components'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import HappyCows from 'config/abi/HappyCows.json'
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { getHappyCowAddress } from 'utils/addressHelpers'
import StartTime from './StartTime'

const MainContainer = styled.div`
   right: 60px;
   left: 60px;
   top: 40px;
   bottom: 40px;
   color: white;
   position: absolute;
`
const PhaseContainer = styled.div`
    background: rgba(0,0,0,.12);
    height: 30px;
    font-size: 18px;
    width: fit-content;
    border-radius: 10px;
    padding: 0 12px;
    align-items: center;
    justify-content:center;
    display:flex;
`
const TitleContainer = styled.div`
    font-size: 32px;
    font-weight: 700;
    margin-top: 12px;
    line-height: 1.25;
    display: flex;
    align-items: center;
`

export interface ItemMainContainerInterface {
    itemId?: number;
    delayDay?: string;
    delayHour?: string;
    delayMinute?: string;
    delaySecond?: string;
    itemTitle?: string;
}

const ItemMainContainer = ({itemId, delayDay, delayHour, delayMinute, delaySecond, itemTitle}: ItemMainContainerInterface) => {

    const [mintedAmount, setMintedAmount] = useState(0);
    const { account, connect } = useWallet()
    const web3 = new Web3(Web3.givenProvider)

    const happyCowsContract = useMemo(() => {
        return new web3.eth.Contract(HappyCows.abi as AbiItem[], getHappyCowAddress())
    }, [web3.eth.Contract]) 

    useEffect( () => {
        if (!account && window.localStorage.getItem('accountStatus')) {
        connect('injected')
        }
        const getTotalSupply = async () => {
            const amount = await happyCowsContract.methods.totalSupply().call();
            setMintedAmount(parseInt(amount));
        }
        getTotalSupply()
    }, [account, connect, happyCowsContract])
    return (
        <MainContainer>
            <PhaseContainer>
                Collection #1
            </PhaseContainer>
            <TitleContainer>
                {itemTitle}
            </TitleContainer>
            <StartTime delayDay={delayDay} delayHour={delayHour} delayMinute={delayMinute} delaySecond={delaySecond}/>
            <div style={{paddingTop: "10px", fontSize: "20px", fontWeight: 700, color: (1000 - mintedAmount) === 0 ? 'red' : 'lightgreen'}}>
                {(1000 - mintedAmount) === 0 ? 'Mint is finished' : 'Live now'}
            </div>
        </MainContainer>
    )
}

export default ItemMainContainer
