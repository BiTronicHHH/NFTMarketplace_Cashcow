import React, {useState, useMemo, useCallback, useEffect} from 'react'
import { useHistory } from "react-router-dom";
import styled from 'styled-components'
import {Button} from '@pancakeswap-libs/uikit'
import Market from 'config/abi/Market.json'
import HappyCows from 'config/abi/HappyCows.json'
import MilkToken from 'config/abi/MilkToken.json'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { AbiItem, toBN, toWei } from "web3-utils"
import Web3 from "web3";
import { usePriceCakeBusd } from 'state/hooks'
import { getHappyCowAddress, getMilkAddress, getMarketAddress } from 'utils/addressHelpers'
import useTheme from 'hooks/useTheme'

const NftMetaDataContainer = styled.div`
    display: flex;
    padding: 16px 32px;
    flex: 1;
    flex-wrap: wrap;
    align-items: inherit;
`
const NftImageContainer = styled.div`
    max-width: 332px;
    max-height: 100%;
    min-width: 240px;
    min-height: 240px;
    width: 46%;
    border-radius: 16px;
    overflow: hidden;
    margin: 16px 32px 16px 0;
    position: relative;
`

const NftImage = styled.div`
    width: 100%;
    padding-bottom: 100%;
    height: 0;
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: auto 100%;
`

const NftInfo = styled.div`
    flex: 1;
    min-width: 220px;
    margin: 16px 0;
    display: flex;
    flex-direction: column;
`

const NftTitleContainer = styled.div`
    font-size: 28px;
    font-weight: 600;
    color: #431216;
    word-break: break-word;
`

const NftSalePriceContainer = styled.div`
    margin-top: 20px;
    box-shadow: 0 6px 12px 0 rgb(0 0 0 / 6%), 0 -1px 2px 0 rgb(0 0 0 / 2%);
    border-radius: 16px;
    display: flex;
`

const NftSalePrice = styled.div`
    padding: 16px;
    flex: 1;
`
const NftSalePriceTitleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #694f4e;
`

const TokenSelectContainer = styled.div`
    display: flex;
    align-items: center;
`
const NftSalePriceDetail = styled.div`
    font-size: 28px;
    color: #431216;
    font-weight: 700;
    margin-top: 6px;
    display: flex;
    align-items: center;
`
const BuyNowBtnContainer = styled.div`
    margin-top: 24px;
`
const web3 = new Web3(Web3.givenProvider)

export interface NftDataLeftComponentInterface {
    itemId?: string;
}

const NftDataLeftComponent = ({itemId} : NftDataLeftComponentInterface) => {
    const { isDark, toggleTheme } = useTheme()
    const history = useHistory();
    const { account } = useWallet()
    const [selectedToken, setSelectedToken] = useState('Milk');
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [milkPrice, setMilkPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [flgButtonState, setFlgButtonState] = useState(true);
    const [flgMyNft, setFlgMyNft] = useState(false);
    const cakePriceUsd = usePriceCakeBusd()

    const happyCowsContract = useMemo(() => {
        return new web3.eth.Contract(HappyCows.abi as AbiItem[], getHappyCowAddress())
    }, []) 

    const marketContract = useMemo(() => {
        return new web3.eth.Contract(Market.abi as AbiItem[], getMarketAddress())
    }, []);

    const milkTokenContract = new web3.eth.Contract(MilkToken.abi as AbiItem[], getMilkAddress());

    const fetchNft = useCallback(async ()=>{
        const marketItems = await marketContract.methods.fetchMarketItems().call({from:account});
        for(let i = 0;i < marketItems.length; i ++) {
            if(marketItems[i].itemId === itemId) {
                setTokenId(marketItems[i].tokenId.toString());
                setSalePrice(marketItems[i].price);
                if(marketItems[i].seller === account) {
                    setFlgMyNft(true);
                }
                break;
            }
        }

        const nftHash = await happyCowsContract.methods.tokenURI(toBN(tokenId)).call({from:account});
        const res = await fetch(nftHash);
        const json = await res.json();

        let imageUrl = json.image;
        imageUrl = imageUrl.slice(7);
        console.log("Image URL",imageUrl);
        setImage(`https://gateway.pinata.cloud/ipfs/${imageUrl}`);
        setName(json.name);
        setDescription(json.description);

        setMilkPrice(cakePriceUsd.toNumber());

        console.log(json);
    }, [account, marketContract, itemId, happyCowsContract, tokenId, cakePriceUsd])

    useEffect(() => {
        fetchNft();
    },[fetchNft])

    const buyNft = async () => {

        setFlgButtonState(false);

        try {
            const priceWei = toWei(toBN("10000000000000000000000000000000000000000"), 'ether');
            const allowance = await milkTokenContract.methods.allowance(account, getMarketAddress()).call();

            if(parseInt(allowance.toString()) < parseInt(salePrice))
                await milkTokenContract.methods.approve(getMarketAddress(), priceWei).send({from: account});

            await marketContract.methods.createMarketSale(getHappyCowAddress(), itemId).send({from: account});
            history.push("/nft-market");
        } catch (error) {
            console.log(error);
        }

        setFlgButtonState(true);
    }
    return (
        <NftMetaDataContainer>
            <NftImageContainer>
                <NftImage style={{backgroundImage: `url(${image})`}}/>
                <div style={{paddingTop: "10px", fontSize: "17px", color: isDark ? "white" : "rgb(105, 79, 78)"}}>
                    {description}
                </div>
            </NftImageContainer>
            <NftInfo>
                <NftTitleContainer style={{color: isDark ? 'white' : ''}}>
                    {name}
                </NftTitleContainer>
                <NftSalePriceContainer style={{background: isDark ? '#16151a' : '', boxShadow: isDark ? "0 6px 12px 0 rgb(255 255 255 / 6%), 0 -1px 2px 0 rgb(255 255 255 / 2%)" : ''}}>
                    <NftSalePrice>
                        <NftSalePriceTitleContainer style={{color: isDark ? 'white' : ''}}>
                            Sale Price
                            <TokenSelectContainer>
                                <div style={{color: `${selectedToken === 'Milk' ? "#fad551" : "#694f4e"}`, fontWeight: selectedToken === 'Milk' ? 700 : 400 }}>
                                    <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer', color: isDark ? 'white' : ''}} >
                                        <img style={{width: "16px", height: "16px", marginRight: '5px', transform: 'translateY(-.5px)'}} alt="Milk Token Icon" src="/images/farms/milk.png"/>
                                        Milk
                                    </div>
                                </div>
                            </TokenSelectContainer>
                        </NftSalePriceTitleContainer>
                        <NftSalePriceDetail style={{color: isDark ? 'white' : ''}}>
                            <img style={{width: '24px', height: '24px', marginRight: '8px'}} 
                            src={ selectedToken === 'Milk' ? '/images/farms/milk.png' : '/images/tokens/darkBNB.png'}
                            alt="Token Icon"
                            />
                            {salePrice}
                            <span style={{fontSize: '14px', color: isDark ? 'white' : '#694f4e', fontWeight: 400, marginLeft: '4px'}}>
                            ≈ ${Math.round(milkPrice * parseInt(salePrice) * 100) / 100}
                            </span>
                        </NftSalePriceDetail>
                    </NftSalePrice>
                </NftSalePriceContainer>
                <div style={{flex: 1}}/>
                <BuyNowBtnContainer>
                    <div>
                        {
                            account && flgButtonState && !flgMyNft ?
                                <Button style={{width: "100%"}} onClick={buyNft}>
                                    Buy NFT
                                </Button>
                                :
                                <Button style={{width: "100%"}} disabled>
                                    {flgMyNft ? 'Your Listing NFT' : 'Buy NFT'}
                                </Button>
                        }
                        
                    </div>
                </BuyNowBtnContainer>
            </NftInfo>
        </NftMetaDataContainer>
    )
}

export default NftDataLeftComponent
