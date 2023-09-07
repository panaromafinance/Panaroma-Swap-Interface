// import HoverInlineText from "components/HoverInlineText";
import Loader from "components/Loader";
// import { RowFixed } from "components/Row";
import React, { Context, useCallback, useContext, useEffect, useState } from "react";
import { Card } from "rebass";
import styled, { DefaultTheme, ThemeContext } from "styled-components/macro";

import { DarkGreyCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
// import { TransactionType } from "../../state/transactions/types";
import { ExternalLink, TYPE } from "../../theme";
// import { useGlobalData, useGlobalTransactions } from '../../contexts/GlobalData'
// import { updateNameData } from '../../utils/data'
import { shortenAddress, urls } from '../../utils/formatter'
import { Text } from "rebass";
import {
    ButtonPrimary
} from "../../components/Button";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { Badge } from "react-bootstrap";
import moment from "moment";

const WrapperTransaction = styled(DarkGreyCard)`
  width: 100%;
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr repeat(0, 1fr)
`;

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: repeat(2, 1fr) 2fr 1fr;

  @media screen and (max-width: 940px) {
    grid-template-columns: repeat(2, 1fr) 2fr 1fr;
    & > *:nth-child(3) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
    // & > *:nth-child(4) {
    //    display: none;
    // }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
    & > *:nth-child(5) {
    //   display: none;
    }
    & > *:nth-child(3) {
    //   display: none;
    }
    & > *:nth-child(4) {
    //   display: none;
    }
    & > *:nth-child(2) {
    //   display: none;
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
    address: "address",
    totalAmount: "totalAmount",
    level1Amount: "level1Amount",
    level2Amount: "level2Amount",
    level3Amount: "level3Amount"
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

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  border-radius: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`;

const TXN_TYPE = {
    ALL: 'All',
    SWAP: 'Swaps',
    ADD: 'Adds',
    REMOVE: 'Removes',
}

interface ReferralDetail {
    address: string,
    totalAmount: string,
    level1Amount: number,
    level2Amount: number,
    level3Amount: number,
    createdOn: string
}

interface ReferralData {
    address: string,
    totalAmount: string,
    level1Amount: number,
    level2Amount: number,
    level3Amount: number,
    createdOn: string
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
   // console.log("1212121245 transactionData.address", transactionData);

    return (
        <ResponsiveGrid className="my-3">
            <ExternalLink href={urls.showAddress(transactionData.address.userid)}>
                <Label fontWeight={400}>

                    {/* {item.account} */}
                    {shortenAddress(transactionData.address.userid)}
                </Label>
            </ExternalLink>
            <Label>{transactionData.address.created ? moment.unix(transactionData.address.created / 1000).format('dddd, MMMM D,  h:mm:ss A') : ""}</Label>
            <Label className="gap-2">
                <Badge bg={transactionData.address.isEtheremRegistered ? "success" : "primary"}>Ethereum</Badge>
                <Badge bg={transactionData.address.isPolygonRegistered ? "success" : "primary"}>Polygon</Badge>
                <Badge bg={transactionData.address.isArbitriumRegistered ? "success" : "primary"}>Arbitrum</Badge>
                <Badge bg={transactionData.address.isOptimismRegistered ? "success" : "primary"}>Optimism</Badge>
            </Label>

            <ResponsiveButtonPrimary
                id="find-pool-button"
                as={Link}
                to={`/referrallevel/` + transactionData.address.userid}
                padding="6px 8px">
                <Text fontWeight={500} fontSize={16}>
                    <Trans>View Referrals</Trans>
                </Text>
            </ResponsiveButtonPrimary>
            {/* <ExternalLink href={`${process.env['REACT_APP_BASE_URL']}#/referrallevel/` + transactionData.address}>
                <Label fontWeight={400}>View
                </Label>
            </ExternalLink> */}
            {/* <Label end={2} fontWeight={400}>
                {formattedNum(transactionData.level1Amount)}
            </Label> */}
            {/* <Label end={1} fontWeight={400}>
                {formattedNum(transactionData.level2Amount)}
            </Label>
            <Label end={1} fontWeight={400}>
                {formattedNum(transactionData.level3Amount)}
            </Label> */}

        </ResponsiveGrid>
    )
};

const ITEMS_PER_PAGE = 10

export default function ReferralTable({ referralDataList }: any) {

    //console.log("00000****** data", referralDataList)

    const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL);
    const theme = useContext(ThemeContext as Context<DefaultTheme>);

    const [sortField, setSortField] = useState(SORT_FIELD.totalAmount);
    const [sortDirection, setSortDirection] = useState<boolean>(true);

    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [filteredItems, setFilteredItems] = useState<any>([])
    // const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.timestamp)


    // useEffect(() => {
    //     setMaxPage(1) // edit this to do modular
    //     setPage(1)
    // }, [referralDataList])

    // parse the txns and format for UI
    useEffect(() => {
        if (referralDataList) {
            const newTxns: ReferralData[] = []
            referralDataList.map((data: ReferralDetail) => {
                const newTxn: ReferralData = {
                    address: data.address,
                    totalAmount: data.totalAmount,
                    level1Amount: data.level1Amount,
                    level2Amount: data.level2Amount,
                    level3Amount: data.level3Amount,
                    createdOn: data.createdOn
                }
                newTxns.push(newTxn)
            })

            const filtered = newTxns;

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
    }, [referralDataList, txFilter])

    // useEffect(() => {
    //     setPage(1)
    // }, [txFilter])

    //console.log("00000 **8", filteredItems);

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
            {/* <TYPE.main fontSize="24px">Referral List</TYPE.main> */}
            <WrapperTransaction>
                <Wrapper>
                    <AutoColumn>
                        <ResponsiveGrid>
                            <ClickableText
                                color={theme.deprecated_text2}
                                end={0}
                                onClick={() => handleSort(SORT_FIELD.level2Amount)}>
                                Level 1 {arrow(SORT_FIELD.level2Amount)}
                            </ClickableText>
                        </ResponsiveGrid>
                        <ResponsiveGrid>
                            <ClickableText
                                color={theme.deprecated_text2}
                                end={0}>
                                <Trans>Address</Trans>
                            </ClickableText>
                            <ClickableText
                                color={theme.deprecated_text2}
                                end={0}>
                                <Trans>Created On</Trans>
                            </ClickableText>
                            <ClickableText
                                color={theme.deprecated_text2}
                                end={0}>
                                <Trans>Network</Trans>
                            </ClickableText>
                            <ClickableText
                                color={theme.deprecated_text2}
                                end={0}>
                                <Trans>Action</Trans>
                            </ClickableText>
                        </ResponsiveGrid>
                        {/* <ResponsiveGrid>
                            <ClickableText
                                color={theme.deprecated_text2}
                                onClick={() => handleSort(SORT_FIELD.address)}
                                end={1}>
                                Address {arrow(SORT_FIELD.address)}
                            </ClickableText>
                        </ResponsiveGrid> */}
                        <React.Fragment>
                            {
                                !filteredList ? (
                                    <Loader />
                                ) : filteredList.length === 0 ? (
                                    <Card>No Referral found.</Card>
                                ) : (
                                    filteredList.map((item: any, index: any) => {
                                     //   console.log("23232345 item", item);

                                        return (
                                            <DataRow item={item} key={index} />
                                        )
                                    })
                                )
                            }
                        </React.Fragment>
                    </AutoColumn>
                    {/* <AutoColumn>
                        <ResponsiveGrid>
                            <ClickableText
                                color={theme.deprecated_text2}
                                end={0}
                                onClick={() => handleSort(SORT_FIELD.level2Amount)}>
                                Level 2 {arrow(SORT_FIELD.level2Amount)}
                            </ClickableText>
                        </ResponsiveGrid>
                        <React.Fragment>
                            {
                                !filteredList ? (
                                    <Loader />
                                ) : filteredList.length === 0 ? (
                                    <Card>No Referral found.</Card>
                                ) : (
                                    filteredList.map((item: any, index: any) => {
                                        return (
                                            <DataRow item={item} key={index} />
                                        )
                                    })
                                )
                            }
                        </React.Fragment>
                    </AutoColumn>
                    <AutoColumn>
                        <ResponsiveGrid>
                            <ClickableText
                                color={theme.deprecated_text2}
                                end={0}
                                onClick={() => handleSort(SORT_FIELD.level2Amount)}>
                                Level 3 {arrow(SORT_FIELD.level2Amount)}
                            </ClickableText>
                        </ResponsiveGrid>
                        <React.Fragment>
                            {
                                !filteredList ? (
                                    <Loader />
                                ) : filteredList.length === 0 ? (
                                    <Card>No Referral found.</Card>
                                ) : (
                                    filteredList.map((item: any, index: any) => {
                                        return (
                                            <DataRow item={item} key={index} />
                                        )
                                    })
                                )
                            }
                        </React.Fragment>
                    </AutoColumn> */}
                </Wrapper>
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

                {/* <AutoColumn>     */}
                {/* <ResponsiveGrid> */}
                {/* <ClickableText
                            color={theme.deprecated_text2}
                            onClick={() => handleSort(SORT_FIELD.address)}
                            end={1}>
                            Address {arrow(SORT_FIELD.address)}
                        </ClickableText> */}
                {/* <ClickableText
                            color={theme.deprecated_text2}
                            end={1}
                            onClick={() => handleSort(SORT_FIELD.totalAmount)}>
                            Token Amount {arrow(SORT_FIELD.totalAmount)}
                        </ClickableText> */}
                {/* <ClickableText
                            color={theme.deprecated_text2}
                            end={1}
                            onClick={() => handleSort(SORT_FIELD.level1Amount)}>
                            Action {arrow(SORT_FIELD.level1Amount)}
                        </ClickableText> */}
                {/* <ClickableText
                            color={theme.deprecated_text2}
                            end={0}
                            onClick={() => handleSort(SORT_FIELD.level2Amount)}>
                            Address {arrow(SORT_FIELD.level2Amount)}
                        </ClickableText>
                    </ResponsiveGrid> */}
                {/* <React.Fragment>
                        {
                            !filteredList ? (
                                <Loader />
                            ) : filteredList.length === 0 ? (
                                <Card>No Referral found.</Card>
                            ) : (
                                filteredList.map((item: any, index: any) => {
                                    return (
                                        <DataRow item={item} key={index} />
                                    )
                                })
                            )
                        }
                    </React.Fragment> */}
                {/* <PageButtons>
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
                </AutoColumn> */}
            </WrapperTransaction>
        </div>
    );
}