import { DarkGreyCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
import CurrencyLogo from "../../components/CurrencyLogo";
import { TYPE } from "../../theme";
// import { RowFixed, RowBetween } from "components/Row";
import styled from "styled-components/macro"

const Label = styled.div`
  border: 1px solid #6a6d78;
  border-radius: 30px;
  padding: 0.3rem;
  font-size: 10px;
  background-color: grey;
`;

export default function TotalTokensLocked() {
  return (
    // <div className="row justify-content-md-end">
      <div className="col-md-4">
        <TYPE.main fontSize="24px" className="mb-2">Pool</TYPE.main>
        <DarkGreyCard className="mb-4">
          <AutoColumn className="d-flex" style={{margin: "0.4rem", gap: "1rem"}}>
            {/* <TYPE.main>Total Tokens Locked</TYPE.main> */}
            {/* <RowBetween> */}
              {/* <RowFixed> */}
                <CurrencyLogo size={"20px"} />
                <CurrencyLogo size={"20px"} />
                {/* <CurrencyLogo address={poolData.token0.address} size={'20px'} /> */}
                <TYPE.label fontSize="14px" ml="8px">
                  {/* {poolData.token0.symbol} */}238.66m
                </TYPE.label>
              {/* </RowFixed> */}
              {/* <TYPE.label fontSize="14px">{formatAmount(poolData.tvlToken0)}</TYPE.label> */}
              {/* <TYPE.label fontSize="14px">238.66m</TYPE.label> */}
              <Label>255.93m</Label>
            {/* </RowBetween> */}
          </AutoColumn>
          <div className="d-flex justify-content-around mt-3">
            <AutoColumn className="col-md-4 col-4" gap="4px">
              <TYPE.main fontWeight={400} fontSize="12px">TVL</TYPE.main>
              {/* <TYPE.label fontSize="24px">{formatDollarAmount(poolData.tvlUSD)}</TYPE.label> */}
              <TYPE.label >$494.60m</TYPE.label>
              {/* <Percent value={poolData.tvlUSDChange} /> */}
              {/* <Percent value={poolData.tvlUSDChange} /> */}
            </AutoColumn>
            <AutoColumn className="col-md-4 col-4" gap="4px">
              <TYPE.main fontWeight={400} fontSize="12px">Volume 24h</TYPE.main>
              {/* <TYPE.label fontSize="24px">{formatDollarAmount(poolData.volumeUSD)}</TYPE.label> */}
              <TYPE.label>$151.40m</TYPE.label>
              {/* <Percent value={poolData.volumeUSDChange} /> */}
            </AutoColumn>
            <AutoColumn className="col-md-4 col-4" gap="4px">
              <TYPE.main fontWeight={400} fontSize="12px">24h Fees</TYPE.main>
              <TYPE.label>
                {/* {formatDollarAmount(poolData.volumeUSD * (poolData.feeTier / 1000000))} */}
                $15.14k
              </TYPE.label>
            </AutoColumn>
          </div>
        </DarkGreyCard>
        {/* <TYPE.main fontSize="24px" className="mb-2">Locked Pool</TYPE.main>
        <DarkGreyCard>
          <AutoColumn className="d-flex" style={{margin: "0.4rem", gap: "1rem"}}> */}
            {/* <TYPE.main>Total Tokens Locked</TYPE.main> */}
            {/* <RowBetween> */}
              {/* <RowFixed> */}
                {/* <CurrencyLogo size={"20px"} />
                <CurrencyLogo size={"20px"} /> */}
                {/* <CurrencyLogo address={poolData.token0.address} size={'20px'} /> */}
                {/* <TYPE.label fontSize="14px" ml="8px"> */}
                  {/* {poolData.token0.symbol}255.93m */}
                {/* </TYPE.label> */}
              {/* </RowFixed> */}
              {/* <TYPE.label fontSize="14px">{formatAmount(poolData.tvlToken0)}</TYPE.label> */}
              {/* <TYPE.label fontSize="14px">255.93m</TYPE.label> */}
              {/* <Label>255.93m</Label> */}
            {/* </RowBetween> */}
          {/* </AutoColumn>
          <div className="d-flex justify-content-around mt-3">
            <AutoColumn className="col-md-4 col-4" gap="4px">
              <TYPE.main fontWeight={400} fontSize="12px">TVL</TYPE.main> */}
              {/* <TYPE.label fontSize="24px">{formatDollarAmount(poolData.tvlUSD)}</TYPE.label> */}
              {/* <TYPE.label >$494.60m</TYPE.label> */}
              {/* <Percent value={poolData.tvlUSDChange} /> */}
              {/* <Percent value={poolData.tvlUSDChange} /> */}
            {/* </AutoColumn>
            <AutoColumn className="col-md-4 col-4" gap="4px">
              <TYPE.main fontWeight={400} fontSize="12px">Volume 24h</TYPE.main> */}
              {/* <TYPE.label fontSize="24px">{formatDollarAmount(poolData.volumeUSD)}</TYPE.label> */}
              {/* <TYPE.label>$151.40m</TYPE.label> */}
              {/* <Percent value={poolData.volumeUSDChange} /> */}
            {/* </AutoColumn>
            <AutoColumn className="col-md-4 col-4" gap="4px">
              <TYPE.main fontWeight={400} fontSize="12px">24h Fees</TYPE.main>
              <TYPE.label> */}
                {/* {formatDollarAmount(poolData.volumeUSD * (poolData.feeTier / 1000000))} */}
                {/* $15.14k */}
              {/* </TYPE.label>
            </AutoColumn>
          </div>
        </DarkGreyCard> */}
      </div>
    // {/* </div> */}
  );
}
