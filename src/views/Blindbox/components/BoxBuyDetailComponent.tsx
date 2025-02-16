import React, {useEffect, useState, useMemo} from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'
import { Button, useWalletModal } from '@pancakeswap-libs/uikit'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import MilkToken from 'config/abi/MilkToken.json'
import HappyCows from 'config/abi/HappyCows.json'
import Market from 'config/abi/Market.json'
import { toWei, AbiItem, toBN } from "web3-utils";
import axios from 'axios';
import { getHappyCowAddress, getMilkAddress, getMarketAddress } from 'utils/addressHelpers'
import Web3 from "web3";
import { usePriceCakeBusd } from 'state/hooks'
import useTheme from 'hooks/useTheme'

const BoxTitle = styled.div`
    font-size: 28px;
    font-weight: 600;
    color: #431216;
    word-break: break-word;
`
const RemainingAmount = styled.div`
    font-size: 16px;
    color: #694f4e;
    margin-top: 24px;
    word-break: break-word;
`

const BoxPrice = styled.div`
  margin-top: 32px;
  border-radius: 16px;
  box-shadow: 0 6px 12px 0 rgb(0 0 0 / 6%), 0 -1px 2px 0 rgb(0 0 0 / 2%);
  display: flex;
`

const BoxPriceContainer = styled.div`
  padding: 16px;
  flex: 1;
`

const PriceDetailContainer = styled.div`
  font-size: 28px;
  color: #431216;
  font-weight: 700;
  margin-top: 6px;
  display: flex;
  align-items: center;
`

const BuyNowBtnContainer = styled.div`
  margin-top: 40px;
`

export interface BoxBuyDetailComponentInterface {
    index?: string
}

const BoxBuyDetailComponent = ({index}:BoxBuyDetailComponentInterface, props) => {

    const { isDark, toggleTheme } = useTheme()
    const { account, connect } = useWallet()
    const [mintingState, setMintingState] = useState(true);
    const [mintedAmount, setMintedAmount] = useState(0)
    const [price, setPrice] = useState("0");
    const [milkPrice, setMilkPrice] = useState(0);

    /** Styles Div */



    /** Calling Smart Contract Function */
    const web3 = new Web3(Web3.givenProvider)
    const cakePriceUsd = usePriceCakeBusd()
    const milkTokenContract = new web3.eth.Contract(MilkToken.abi as AbiItem[], getMilkAddress())
    const happyCowsContract = useMemo(() => {
        return new web3.eth.Contract(HappyCows.abi as AbiItem[], getHappyCowAddress())
    }, [web3.eth.Contract]) 

    useEffect( () => {
        if (!account && window.localStorage.getItem('accountStatus')) {
        connect('injected')
        }
        const getTotalSupply = async () => {
            const amount = await happyCowsContract.methods.totalSupply().call();
            const tmpPrice = await happyCowsContract.methods.price().call();
            setPrice(tmpPrice);
            setMintedAmount(parseInt(amount));
        }
        setMilkPrice(cakePriceUsd.toNumber());
        getTotalSupply()
    }, [account, connect, happyCowsContract, cakePriceUsd])

    const getJSONFile = () => {

        const imageNames = [
            'QmP65x6iWEe1j1uuwDu1zz9ATbeZsL1XhXUKAFHDhQP4GE/batman-superheroe.png',
            'QmP65x6iWEe1j1uuwDu1zz9ATbeZsL1XhXUKAFHDhQP4GE/capitanamerica-superheroes.png',
            'QmP65x6iWEe1j1uuwDu1zz9ATbeZsL1XhXUKAFHDhQP4GE/flash-superheroes.png',
            'QmP65x6iWEe1j1uuwDu1zz9ATbeZsL1XhXUKAFHDhQP4GE/linternaverde-superheroes.png',
        ]

        const phaseNames = [
            'Hereford', 'Angus', 'Holstein', 'Brahaman', 'Highland'
        ]
        
        console.log(imageNames[1])
        const randomNum = Math.floor(Math.random() * 10)
        return {
            pinataMetadata: {
                name: 'Happy Cashcow',
                keyvalues: {
                }
            },
            pinataContent: {
                image: imageNames[randomNum % 4],
                phase: phaseNames[randomNum % 5],
            }
        }
    }

    
    const buyButtonHandler = async () => {
        // try {
        //     const priceWei = toWei(toBN(10000), 'ether');
        //     const json = getJSONFile();
        //     const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        //     await axios.post(url, json, {
        //             headers: {
        //                 pinata_api_key: "1b1f7b061096b2fac570",
        //                 pinata_secret_api_key: "789184e23409d8b0979b6f3b758c80bab8df4de0e27914081ca2c4275746a99f"
        //             }
        //         })
        //         .then(async function (response) {
        //             const ipfsHash = response.data.IpfsHash;
        //             await milkTokenContract.methods.approve(getHappyCowAddress(), priceWei).send({ from: account });

        //             await happyCowsContract.methods.buyBlindBox(ipfsHash, getMarketAddress()).send({from: account});

        //             const happyCowsBalance = await milkTokenContract.methods.balanceOf(getHappyCowAddress()).call();

        //             console.log("Balance of Milk token of BlindBox",happyCowsBalance);
        //             const amount = mintedAmount + 1;
        //             setMintedAmount(amount); 
        //         })
        //         .catch(function (error) {
        //             console.log("Error Occurs: ", error);
        //         });
            
                       

        // } catch (e) {
        //     console.log(e);
        // }

        setMintingState(false);
        const priceWei = toWei(toBN("10000000000000000000000000000000000000000"), 'ether');

        const allowance = await milkTokenContract.methods.allowance(account, getHappyCowAddress()).call();
        if(parseInt(allowance.toString()) < parseInt(price))
            await milkTokenContract.methods.approve(getHappyCowAddress(), priceWei).send({ from: account });

        console.log("Allowance: ", allowance);
        try {
            await happyCowsContract.methods
                .buyBlindBox(`https://gateway.pinata.cloud/ipfs/QmWeDKtTkVC3qje4eHxtyrB6Y4ZKx9vLhvEjBLob2q75JD/${mintedAmount + 1}.json`, getMarketAddress())
                .send({from: account})
                .on('transactionHash', function(hash) {
                    console.log("transaction Hash");
                })
                .on('receipt', function(receipt) {
                    console.log("Receipt");
                    const amount = mintedAmount + 1;
                    setMintedAmount(amount); 
                    setMintingState(true);
                })
        } catch (error) {
            console.log("ERROR: ", error);
            setMintingState(true);
        }
        
        // setMintingState(true);
    }

    return (
        <div>
            <BoxTitle style={{color: isDark ? "white" : ""}}>
                HappyCow Box
            </BoxTitle>
            <RemainingAmount style={{color: isDark ? "white" : ""}}>
                Remaining Amount: <span style={{fontSize: '18px', color: isDark ? "white" : '#431216', fontWeight: 700}}>{1000 - mintedAmount}</span>
            </RemainingAmount>
            <BoxPrice style={{background: isDark ? '#16151a' : '', boxShadow: isDark ? "0 6px 12px 0 rgb(255 255 255 / 6%), 0 -1px 2px 0 rgb(255 255 255 / 2%)" : ''}}>
                <BoxPriceContainer style={{color: isDark ? "white" : ""}}>
                    Price
                    <PriceDetailContainer style={{color: isDark ? "white" : ""}}>
                        <img src="/images/farms/milk.png" alt="" style={{width: "24px",  height: "24px", marginRight: '8px'}}/>
                        {price}
                        <span style={{fontSize: "14px", color: isDark ? 'white' : '#694f4e', fontWeight:400, marginLeft: "4px"}}>{` ≈ $${Math.round(milkPrice * parseInt(price) * 100) / 100}`}</span>
                    </PriceDetailContainer>
                </BoxPriceContainer>
            </BoxPrice>
            <BuyNowBtnContainer>
                {
                    account && mintingState === true ? 
                    <div>
                        <Button onClick={buyButtonHandler} style={{width:"calc(100% - 10px)" , marginRight: "10px"}}>
                            Mint
                        </Button>
                    </div>
                    : 
                    <Button style={{width: "100%"}} disabled>
                        Mint
                    </Button>
                }
            </BuyNowBtnContainer>
        </div>

    )
}

export default BoxBuyDetailComponent
