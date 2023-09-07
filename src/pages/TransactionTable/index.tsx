import HoverInlineText from "components/HoverInlineText";
import Loader from "components/Loader";
import { RowFixed } from "components/Row";
import React, { Context, useCallback, useContext, useEffect,useState } from "react";
import { Card } from "rebass";
import styled, { DefaultTheme,ThemeContext } from "styled-components/macro";

import { DarkGreyCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
// import { TransactionType } from "../../state/transactions/types";
import { ExternalLink,TYPE } from "../../theme";
// import { useGlobalData, useGlobalTransactions } from '../../contexts/GlobalData'
// import { updateNameData } from '../../utils/data'
import { formattedNum, formatTime, urls } from '../../utils/formatter'
import { Trans } from "@lingui/macro";


const WrapperTransaction = styled(DarkGreyCard)`
  width: 100%;
`;

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 1.5fr repeat(5, 1fr);

  @media screen and (max-width: 940px) {
    grid-template-columns: 1.5fr repeat(4, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1.5fr repeat(2, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1.5fr repeat(1, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }
`;

const SortText = styled.button<{ active: boolean }>`
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  margin-right: 0.75rem !important;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  padding: 0px;
  color: ${({ active, theme }) =>
    active ? theme.deprecated_text1 : theme.deprecated_text3};
  outline: none;
  @media screen and (max-width: 600px) {
    font-size: 14px;
  }
`;
export const Label = styled(TYPE.label) <{ end?: number }>`
  display: flex;
  font-size: 16px;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? "flex-end" : "flex-start")};
  align-items: center;
  font-variant-numeric: tabular-nums;
  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`;

const ClickableText = styled(Label)`
  text-align: end;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  @media screen and (max-width: 640px) {
    font-size: 12px;
  }
`;
const SORT_FIELD = {
  amountUSD: "amountUSD",
  timestamp: "timestamp",
  sender: "sender",
  amountToken0: "amountToken0",
  amountToken1: "amountToken1"
};

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.2em;
  margin-bottom: 0.5em;
`;

const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.deprecated_primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`;

const TXN_TYPE = {
  ALL: 'All',
  SWAP: 'Swaps',
  ADD: 'Adds',
  REMOVE: 'Removes',
}

interface TransactionDetail {
  amount0: string,
  amount0In: string,
  amount0Out: string,
  amount1: string,
  amount1In: string,
  amount1Out: string,
  amountUSD: string,
  to: string,
  sender: string,
  pair: BasicData,
  transaction: Transaction
}

interface BasicData {
  token0?: {
    id: string
    name: string
    symbol: string
  }
  token1?: {
    id: string
    name: string
    symbol: string
  }
}

interface Pair {
  id: string
  name: string
  symbol: string
}

interface Transaction {
  id: string
  timestamp: string
}

interface TransactionData {
  hash: string,
  timestamp: string,
  type: string,
  token0Amount: string,
  token1Amount: string,
  account: string,
  token0Symbol: string,
  token1Symbol: string,
  amountUSD: string
}

function getTransactionType(event: any, symbol0: string, symbol1: string) {
  const formattedS0 = symbol0?.length > 8 ? symbol0.slice(0, 7) + '...' : symbol0
  const formattedS1 = symbol1?.length > 8 ? symbol1.slice(0, 7) + '...' : symbol1
  switch (event) {
    case TXN_TYPE.ADD:
      return 'Add ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.REMOVE:
      return 'Remove ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.SWAP:
      return 'Swap ' + formattedS0 + ' for ' + formattedS1
    default:
      return ''
  }
}


const DataRow = (item: any) => {
  const transactionData = item.item;

  return (
    <ResponsiveGrid className="my-3">
      <ExternalLink href={urls.showTransaction(transactionData.hash)}>
        <Label fontWeight={400}>
          {getTransactionType(transactionData.type, transactionData.token0Symbol, transactionData.token1Symbol)}
          {/* {item.account} */}
        </Label>
      </ExternalLink>
      <Label end={1} fontWeight={400}>
        {formattedNum(transactionData.amountUSD, true)}
      </Label>
      <Label end={2} fontWeight={400}>
        {formattedNum(transactionData.token0Amount) + ' '}{'  '}
        <HoverInlineText text={transactionData.token0Symbol} maxCharacters={5} />
      </Label>
      <Label end={1} fontWeight={400}>
        {formattedNum(transactionData.token1Amount) + ' '}{'  '}
        <HoverInlineText text={transactionData.token1Symbol} maxCharacters={5} />
      </Label>
      <Label end={1} fontWeight={400}>
        <ExternalLink href={urls.showAddress(transactionData.account)}>{transactionData.account && transactionData.account.slice(0, 6) + '...' + transactionData.account.slice(38, 42)}</ExternalLink>
      </Label>
      <Label end={1} fontWeight={400}>
        {formatTime(transactionData.timestamp)}
      </Label>
    </ResponsiveGrid>
  )
};

const ITEMS_PER_PAGE = 10

export default function TransactionTable({ transactions }: any) {

  // console.log("00000****** data", transactions)

  const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL);
  const theme = useContext(ThemeContext as Context<DefaultTheme>);

  const [sortField, setSortField] = useState(SORT_FIELD.timestamp);
  const [sortDirection, setSortDirection] = useState<boolean>(true);

  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState<any>([])
  // const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.timestamp)


  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [transactions])

  // parse the txns and format for UI
  useEffect(() => {
    if (transactions && transactions.mints && transactions.burns && transactions.swaps) {
      const newTxns: TransactionData[] = []
      if (transactions.mints.length > 0) {
        transactions.mints.map((mint: TransactionDetail) => {
          // console.log("****** transactions?.transactions mint", mint);

          const newTxn: TransactionData = {
            hash: mint.transaction.id,
            timestamp: mint.transaction.timestamp,
            type: TXN_TYPE.ADD,
            token0Amount: mint.amount0,
            token1Amount: mint.amount1,
            account: mint.to,
            amountUSD: mint.amountUSD,
            //  token0Symbol : '',
            //  token1Symbol : '',
            token0Symbol: mint.pair?.token0 ? mint.pair?.token0.symbol : '',
            token1Symbol: mint.pair?.token1 ? mint.pair?.token1.symbol : ''
          }

          // mints.map((mint) => {
          // let newTxn = {}
          // newTxn.hash = mint.transaction.id
          // newTxn.timestamp = mint.transaction.timestamp
          // newTxn.type = TXN_TYPE.ADD
          // newTxn.token0Amount = mint.amount0
          // newTxn.token1Amount = mint.amount1
          // newTxn.account = mint.to
          // newTxn.token0Symbol = updateNameData(mint.pair).token0.symbol
          // newTxn.token1Symbol = updateNameData(mint.pair).token1.symbol
          // newTxn.amountUSD = mint.amountUSD
          return newTxns.push(newTxn)
        })
      }
      if (transactions.burns.length > 0) {
        transactions.burns.map((burn: TransactionDetail) => {
          const newTxn: TransactionData = {
            hash: burn.transaction.id,
            timestamp: burn.transaction.timestamp,
            type: TXN_TYPE.REMOVE,
            token0Amount: burn.amount0,
            token1Amount: burn.amount1,
            account: burn.sender,
            token0Symbol: burn.pair?.token0 ? burn.pair?.token0.symbol : '',
            token1Symbol: burn.pair?.token1 ? burn.pair?.token1?.symbol : '',
            amountUSD: burn.amountUSD
          }
          // burns.map((burn) => {
          //   let newTxn = {}
          //   newTxn.hash = burn.transaction.id
          //   newTxn.timestamp = burn.transaction.timestamp
          //   newTxn.type = TXN_TYPE.REMOVE
          //   newTxn.token0Amount = burn.amount0
          //   newTxn.token1Amount = burn.amount1
          //   newTxn.account = burn.sender
          //   newTxn.token0Symbol = updateNameData(burn.pair).token0.symbol
          //   newTxn.token1Symbol = updateNameData(burn.pair).token1.symbol
          //   newTxn.amountUSD = burn.amountUSD
          return newTxns.push(newTxn)
        })
      }
      if (transactions.swaps.length > 0) {
        transactions.swaps.map((swap: TransactionDetail) => {
          const netToken0 = parseFloat(swap.amount0In) - parseFloat(swap.amount0Out)
          const netToken1 = parseFloat(swap.amount1In) - parseFloat(swap.amount1Out)

          let token0Amount = "";
          let token1Amount = "";

          if (netToken0 < 0) {
            // newTxn.token0Symbol = updateNameData(swap.pair).token0.symbol
            // newTxn.token1Symbol = updateNameData(swap.pair).token1.symbol
            token0Amount = Math.abs(netToken0).toString()
            token1Amount = Math.abs(netToken1).toString()
          } else if (netToken1 < 0) {
            // newTxn.token0Symbol = updateNameData(swap.pair).token1.symbol
            // newTxn.token1Symbol = updateNameData(swap.pair).token0.symbol
            token0Amount = Math.abs(netToken1).toString()
            token1Amount = Math.abs(netToken0).toString()
          }

          const newTxn: TransactionData = {
            hash: swap.transaction.id,
            timestamp: swap.transaction.timestamp,
            type: TXN_TYPE.SWAP,
            token0Amount,
            token1Amount,
            token0Symbol: swap.pair?.token0 ? swap.pair?.token0?.symbol : '',
            token1Symbol: swap.pair?.token1 ? swap.pair?.token1?.symbol : '',
            amountUSD: swap.amountUSD,
            account: swap.to
          }

          // swaps.length > 0) {
          // transactions.swaps.map((swap) => {
          //   const netToken0 = swap.amount0In - swap.amount0Out
          //   const netToken1 = swap.amount1In - swap.amount1Out

          //   let newTxn = {}

          //   if (netToken0 < 0) {
          //     newTxn.token0Symbol = updateNameData(swap.pair).token0.symbol
          //     newTxn.token1Symbol = updateNameData(swap.pair).token1.symbol
          //     newTxn.token0Amount = Math.abs(netToken0)
          //     newTxn.token1Amount = Math.abs(netToken1)
          //   } else if (netToken1 < 0) {
          //     newTxn.token0Symbol = updateNameData(swap.pair).token1.symbol
          //     newTxn.token1Symbol = updateNameData(swap.pair).token0.symbol
          //     newTxn.token0Amount = Math.abs(netToken1)
          //     newTxn.token1Amount = Math.abs(netToken0)
          //   }

          //   newTxn.hash = swap.transaction.id
          //   newTxn.timestamp = swap.transaction.timestamp
          //   newTxn.type = TXN_TYPE.SWAP

          //   newTxn.amountUSD = swap.amountUSD
          //   newTxn.account = swap.to
          return newTxns.push(newTxn)
        })
      }

      const filtered = newTxns.filter((item) => {
        if (txFilter !== TXN_TYPE.ALL) {
          return item.type === txFilter
        }
        return true
      })
      setFilteredItems(filtered)
      let extraPages = 1
      if (filtered.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      if (filtered.length === 0) {
        setMaxPage(1)
      } else {
        setMaxPage(Math.floor(filtered.length / ITEMS_PER_PAGE) + extraPages)
      }
    }
  }, [transactions, txFilter])

  useEffect(() => {
    setPage(1)
  }, [txFilter])

  const filteredList = filteredItems ?
    filteredItems &&
    filteredItems
      .sort((a: any, b: any) => {
        return parseFloat(a[sortField]) > parseFloat(b[sortField])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE) : []

  const handleSort = useCallback(

    (newField: string) => {
      setSortField(newField);
      setSortDirection(sortField !== newField ? true : !sortDirection);
    },
    [sortDirection, sortField]
  );

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? "↑" : "↓") : "";
    },
    [sortDirection, sortField]
  );


  return (
    <div className="">
      <TYPE.main fontSize="24px"><Trans>Transactions</Trans></TYPE.main>
      <RowFixed className="mt-4">
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.ALL);
          }}
          active={txFilter === TXN_TYPE.ALL}>
          All
        </SortText>
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.SWAP);
          }}
          active={txFilter === TXN_TYPE.SWAP}>
          Swaps
        </SortText>
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.ADD);
          }}
          active={txFilter === TXN_TYPE.ADD}>
          Adds
        </SortText>
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.REMOVE);
          }}
          active={txFilter === TXN_TYPE.REMOVE}>
          Removes
        </SortText>
      </RowFixed>
      <WrapperTransaction>
        <AutoColumn>
          <ResponsiveGrid>
            <RowFixed>
              <TYPE.label>Pair</TYPE.label>

            </RowFixed>
            <ClickableText
              color={theme.deprecated_text2}
              onClick={() => handleSort(SORT_FIELD.amountUSD)}
              end={1}>
              Total Value {arrow(SORT_FIELD.amountUSD)}
            </ClickableText>
            <ClickableText
              color={theme.deprecated_text2}
              end={1}
              onClick={() => handleSort(SORT_FIELD.amountToken0)}>
              Token Amount {arrow(SORT_FIELD.amountToken0)}
            </ClickableText>
            <ClickableText
              color={theme.deprecated_text2}
              end={1}
              onClick={() => handleSort(SORT_FIELD.amountToken1)}>
              Token Amount {arrow(SORT_FIELD.amountToken1)}
            </ClickableText>
            <ClickableText
              color={theme.deprecated_text2}
              end={1}
              onClick={() => handleSort(SORT_FIELD.sender)}>
              Account {arrow(SORT_FIELD.sender)}
            </ClickableText>
            <ClickableText
              color={theme.deprecated_text2}
              end={1}
              onClick={() => handleSort(SORT_FIELD.timestamp)}>
              Time {arrow(SORT_FIELD.timestamp)}
            </ClickableText>
          </ResponsiveGrid>
          <React.Fragment>
            {
              !filteredList ? (
                <Loader />
              ) : filteredList.length === 0 ? (
                <Card>No recent transactions found.</Card>
              ) : (
                filteredList.map((item: any, index: any) => {
                  return (
                    <DataRow item={item} key={index} />
                  )
                })
              )
            }
            {/* <DataRow dataItem={transactions} /> */}

            {/* <List p={0}>
             
                transactions?.map((item, index) => {
                  return (
                    <div key={index}>
                      <ListItem key={index} index={index + 1} item={item} />
                      <Divider />
                    </div>
                  )
                })
              )}
            </List> */}
          </React.Fragment>
          <PageButtons>
            <div
              onClick={() => {
                setPage(page === 1 ? page : page - 1);
              }}>
              <Arrow faded={page === 1 ? true : false}>←</Arrow>
            </div>
            <TYPE.body>{"Page " + page + " of " + maxPage}</TYPE.body>
            <div
              onClick={() => {
                setPage(page === maxPage ? page : page + 1);
              }}>
              <Arrow faded={page === maxPage ? true : false}>→</Arrow>
            </div>
          </PageButtons>
        </AutoColumn>
      </WrapperTransaction>
    </div>
  );
}
