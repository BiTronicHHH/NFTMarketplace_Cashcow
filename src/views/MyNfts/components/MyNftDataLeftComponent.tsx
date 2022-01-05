import React, {useState, useMemo, useCallback, useEffect} from 'react'
import { useHistory } from "react-router-dom";
import styled from 'styled-components'
import {Button, Heading} from '@pancakeswap-libs/uikit'
import Market from 'config/abi/Market.json'
import HappyCows from 'config/abi/HappyCows.json'
import MilkToken from 'config/abi/MilkToken.json'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { AbiItem, toBN, toWei } from "web3-utils"
import Modal from 'react-modal';
import { usePriceCakeBusd } from 'state/hooks'
import Web3 from "web3";
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
    height: 100%;
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

const ItemValueToken = styled.div`
    display: flex;
    align-items: center;
    font-size: 16px;
`

const InputTag = styled.input`
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    height: 44px;
    line-height: 44px;
    box-sizing: border-box;
    font-size: 16px;
    padding: 0 68px 0 16px;
    display: flex;
    outline: none;
    color: #431216;
    background: transparent;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-right: 15px;
`
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: "30%",
        borderRadius: '15px'
    },
};

const web3 = new Web3(Web3.givenProvider)

const happyCowsContract = new web3.eth.Contract(HappyCows.abi as AbiItem[], getHappyCowAddress())
const marketContract = new web3.eth.Contract(Market.abi as AbiItem[], getMarketAddress())

export interface NftDataLeftComponentInterface {
    myToken?: any;
}

const MyNftDataLeftComponent = ({myToken} : NftDataLeftComponentInterface) => {
    const { isDark } = useTheme()
    const { account } = useWallet()
    const [selectedToken, setSelectedToken] = useState('Milk');
    const [image, setImage] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [tokenName, setTokenName] = useState("");
    const [itemId, setItemId] = useState('0');
    const [description, setDescription] = useState('');
    const [priceNft, setPriceNft] = useState("");
    const [listedPrice, setListedPrice] = useState("");
    const [flgList, setFlgList] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [flgButtonState, setFlgButtonState] = useState(true);

    const cakePriceUsd = usePriceCakeBusd()


    const milkTokenContract = new web3.eth.Contract(MilkToken.abi as AbiItem[], getMilkAddress());

    const fetchNft = useCallback(async ()=>{
        console.log("fetch-------------------------", account, myToken)
        const marketItems = await marketContract.methods.fetchMarketItems().call({from:account});
        if (!myToken) return
        for(let i = 0;i < marketItems.length; i ++) {
            if(marketItems[i].itemId === myToken.itemId) {
                setSalePrice(marketItems[i].price);
                setFlgList(true);
                break;
            }
        }
        setItemId(myToken.itemId)
        const tmpTokenId = myToken.tokenId

        if (!tmpTokenId) return;
        const nftHash = await happyCowsContract.methods.tokenURI(toBN(tmpTokenId)).call({from:account});
        const res = await fetch(nftHash);
        const json = await res.json();
        console.log(json);
        setTokenName(json.name);
        setDescription(json.description);

        let imageUrl = json.image;
        imageUrl = imageUrl.slice(7);
        setImage(`https://gateway.pinata.cloud/ipfs/${imageUrl}`);

        
    }, [account, myToken])

    useEffect(() => {
        fetchNft();
    },[fetchNft])

    const listNFTHandler = async () => {
        console.log(priceNft);
        console.log("Account: ", account);
        const isApproved = await happyCowsContract.methods.isApprovedForAll(account, getMarketAddress()).call();
        setFlgButtonState(false);
        closeModal();
        if(!isApproved) {
            await happyCowsContract.methods.setApprovalForAll(getMarketAddress(), true).send({from: account});
        }
        if(!myToken) return;
        await marketContract.methods
            .createMarketItem(getHappyCowAddress(), myToken.tokenId, parseInt(priceNft))
            .send({from: account})
            .on('transactionHash', function(hash) {
                console.log("success");
            })
            .on('receipt', function(receipt) {
                console.log(receipt);
                const returnItemId = receipt.events.MarketItemCreated.returnValues.itemId;
                console.log("Returned Item Id:", returnItemId);
                setItemId(returnItemId)
                console.log("Setted Item ID", itemId)
                setSalePrice(priceNft);
                setFlgList(true);
            })
        setFlgButtonState(true);
    }

    console.log("itemId-------------------", itemId);
    const unlistNFTHandler = async() => {
        console.log("itemId", itemId);
        setFlgButtonState(false);
        await marketContract.methods
            .unlistMarketItem(getHappyCowAddress(), itemId)
            .send({from: account})
            .on('transactionHash', function(hash) {
                console.log("success: ",hash);
            })
            .on('receipt', function(receipt) {
                console.log(receipt);
                setFlgList(false);
            })
        setFlgButtonState(true);
    }

    const openModal = () => {
        setIsOpen(true);
    }

    const afterOpenModal = () =>  {
    // references are now sync'd and can be accessed.
    }

    const closeModal = () => {
    setIsOpen(false);
    }

    return (
        <NftMetaDataContainer>
            <NftImageContainer>
                <NftImage style={{backgroundImage: `url(${image})`}}/>
                <div style={{paddingTop: "10px", fontSize: "17px", color: isDark ? 'white' : "rgb(105, 79, 78)"}}>
                    {description}
                </div>
            </NftImageContainer>
            <NftInfo>
                <NftTitleContainer style={{color: isDark ? 'white' : ''}}>
                    {tokenName}
                </NftTitleContainer>
                <NftSalePriceContainer style={{background: isDark ? '#16151a' : '', boxShadow: isDark ? "0 6px 12px 0 rgb(255 255 255 / 6%), 0 -1px 2px 0 rgb(255 255 255 / 2%)" : ''}}>
                    {
                        flgList ?
                    <NftSalePrice>
                        <NftSalePriceTitleContainer style={{color: isDark ? 'white' : ''}}>
                            Sale Price
                            <TokenSelectContainer>
                                <div style={{color: isDark ? 'white' : "#fad551", fontWeight: 700 }}>
                                    <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
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
                            ≈ ${Math.round(cakePriceUsd.toNumber() * parseInt(salePrice) * 100) / 100}
                            </span>
                        </NftSalePriceDetail>
                    </NftSalePrice>
                    :
                    <div style={{fontSize: "17px", margin:"auto", padding: "22px", color: isDark ? 'white' : "rgb(105, 79, 78)"}}>
                        Not Listed Yet
                    </div>
                    }
                </NftSalePriceContainer>
                
                <BuyNowBtnContainer>
                    <div>
                        {
                            account && flgButtonState ?
                                <Button style={{width: "100%"}} onClick={flgList ? unlistNFTHandler : openModal}>
                                    {flgList ? "Unlist NFT" : "List NFT"}
                                </Button>
                                :
                                <Button style={{width: "100%"}} disabled>
                                    {flgList ? "Unlist NFT" : "List NFT"}
                                </Button>
                        }
                        
                    </div>
                </BuyNowBtnContainer>
            </NftInfo>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Heading as="h1" size="no" color="primary" mb="20px">
                        List NFT
                    </Heading>
                    <div style={{cursor: 'pointer'}} onClick={() => closeModal()} onKeyDown={closeModal} role = "button" tabIndex={0}>
                        <img src="/images/close.png" style={{width: "25px", height: "25px"}} alt="close"/>
                    </div>
                </div>

                <div style={{display: 'flex', justifyContent:'space-between'}}>
                    <div style={{display: 'flex', width: "70%"}}>
                        <InputTag placeholder="Price of NFT" value={priceNft} onChange={(e) => {setPriceNft(e.target.value)}}/>
                        <ItemValueToken>
                            <img src="/images/farms/milk.png" alt="token" style={{width: "26px", height: '26px', marginRight: '4px;' }}/>
                            MILK
                        </ItemValueToken>
                    </div>
                    <Button onClick={listNFTHandler}>List NFT</Button>
                </div>
            </Modal>
        </NftMetaDataContainer>
    )
}

export default MyNftDataLeftComponent
