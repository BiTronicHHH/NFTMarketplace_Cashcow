import React from 'react'
import styled from 'styled-components'
import {useParams} from 'react-router-dom'
import Page from 'components/layout/Page'
import { Heading } from '@pancakeswap-libs/uikit'
import useTheme from 'hooks/useTheme'
import BoxContainerComponent from './components/BoxContainerComponent'
import BoxBuyDetailComponent from './components/BoxBuyDetailComponent'
import BlindBoxDetailInfo from './components/BlindBoxDetailInfo'

const StyledHero = styled.div`
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 20px;
`

type boxParam = {
  index: string;
};

const BlindboxDetail = () => {
  const { index } = useParams<boxParam>();
  const { isDark, toggleTheme } = useTheme()

  const BoxDetailContainer = styled.div`
    background: ${isDark ? '#27262c' : 'white'};
    ${isDark ? 
      "box-shadow: 0px 2px 12px -8px rgb(25 19 38 / 10%), 0px 1px 1px rgb(25 19 38 / 5%)"
      : ""
    };
    position: relative;
    border-radius: 32px;
    padding-bottom: 20px;
    display: flex;
  `

  const BoxContainerLeft = styled.div`
    width: calc(50% - 12px);
    display: flex;
    flex-wrap: wrap;
    margin: 12px;
  `
  const BoxContainerRight = styled.div`
    width: 50%;
    height: 100%;
    margin: 24px;
  `
  const ItemContainer = styled.div`
    display: flex;
    width: 100%;
  `
  const GradientBack = styled.div`
    background: linear-gradient( 45deg, rgba(255,0,0,1) 0%, rgba(255,154,0,1) 10%, rgba(208,222,33,1) 20%, rgba(79,220,74,1) 30%, rgba(63,218,216,1) 40%, rgba(47,201,226,1) 50%, rgba(28,127,238,1) 60%, rgba(95,21,242,1) 70%, rgba(186,12,248,1) 80%, rgba(251,7,217,1) 90%, rgba(255,0,0,1) 100% );
    background-size: 300% 300%;
    animation: ilqnTz 2s linear infinite;
    filter: blur(10px);
    position: absolute;
    top:-2px;
    right:-2px;
    bottom:-2px;
    left:-2px;
    z-index: -1;
  `

  const ItemEachContainer = styled.div`
    margin: 10px;
    background: #fff;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 3%), 0 4px 6px -2px rgb(0 0 0 / 1%);
    border-radius: 24px;
    padding: 16px;
    width: calc(20% - 20px);
    box-sizing: border-box;
    display: flex;
    transition: transform .3s ease,-webkit-transform .3s ease;
    padding-top: calc(20% - 50px);
    position: relative;
    background-size: cover;
    color: white;
  `
    return (
        <Page>
          <StyledHero>
            <Heading as="h1" size="lg" color="secondary" mb="20px" style={{color: isDark ? "white" : ''}}>
            Blind Box
            </Heading>
          </StyledHero>
          <Heading as="h1" size="no" color="primary" mb="20px" style={{color: isDark ? "white" : ''}}>
            HappyCow Box
          </Heading>
          <BoxDetailContainer>
            <GradientBack/>
            <BoxContainerLeft>
              <BoxContainerComponent boxTitle="HappyCow" boxImage="misterybox360cow.low.gif"/>
            </BoxContainerLeft>
            <BoxContainerRight>
              <BoxBuyDetailComponent index={index} />
              <BlindBoxDetailInfo />
            </BoxContainerRight>
          </BoxDetailContainer>
          <Heading as="h1" size="no" color="primary" mt="35px" mb="15px" style={{textAlign: "center", color : isDark ? 'white' : ''}}>
            HappyCows Breeds
          </Heading>
          <ItemContainer>
            <ItemEachContainer style={{backgroundImage: "url('https://gateway.pinata.cloud/ipfs/QmZBZiUaVsVM9SAwmAMskymBKWuiK88nCnn7Z9XmR7Vmm2/4.png')"}}>
              Hereford
            </ItemEachContainer>
            <ItemEachContainer style={{backgroundImage: "url('https://gateway.pinata.cloud/ipfs/QmZBZiUaVsVM9SAwmAMskymBKWuiK88nCnn7Z9XmR7Vmm2/13.png')"}}>
              Angus
            </ItemEachContainer>
            <ItemEachContainer style={{backgroundImage: "url('https://gateway.pinata.cloud/ipfs/QmZBZiUaVsVM9SAwmAMskymBKWuiK88nCnn7Z9XmR7Vmm2/7.png')"}}>
              Holstein
            </ItemEachContainer>
            <ItemEachContainer style={{backgroundImage: "url('https://gateway.pinata.cloud/ipfs/QmZBZiUaVsVM9SAwmAMskymBKWuiK88nCnn7Z9XmR7Vmm2/28.png')"}}>
              Brahaman
            </ItemEachContainer>
            <ItemEachContainer style={{backgroundImage: "url('https://gateway.pinata.cloud/ipfs/QmZBZiUaVsVM9SAwmAMskymBKWuiK88nCnn7Z9XmR7Vmm2/16.png')"}}>
              Highland
            </ItemEachContainer>
            
          </ItemContainer>
          
          
        </Page>
    )
}

export default BlindboxDetail
