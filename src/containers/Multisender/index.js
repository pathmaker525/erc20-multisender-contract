import { useState, useEffect } from "react"
import { BigNumber } from "ethers"
import { isAddress } from "ethers/lib/utils"
import { useWeb3React } from "@web3-react/core"

import MultiSenderComponent from "components/Multisender"

import { useWeb3SwrBalance, useWeb3SwrMetadata } from "hooks/useWeb3SWR"
import { mutate } from "swr"

const MultiSender = () => {
  const { account, library } = useWeb3React()

  const [multisendTokenAddress, setMultisendTokenAddress] = useState("")
  const [multsendList, setMultisendList] = useState([])
  const [multisendData, setMultisendData] = useState({})

  const [fetchingTokenInfo, setFetchingTokenInfo] = useState(false)

  const [errorInTokenAddress, setErrorInTokenAddress] = useState(false)
  const [errorInMultiSendData, setErrorInMultiSendData] = useState(false)

  const { balance } = useWeb3SwrBalance(multisendTokenAddress)
  const { name, nameMutate, symbol, symbolMutate, decimals, decimalsMutate } =
    useWeb3SwrMetadata(multisendTokenAddress)

  useEffect(() => {
    if (library) {
      library.on("block", () => {
        console.log("Updating balance...")
        mutate(undefined, true)
        nameMutate(undefined, true)
        symbolMutate(undefined, true)
        decimalsMutate(undefined, true)
      })
    }

    return () => library && library.removeAllListeners("block")
  }, [])

  useEffect(() => {
    if (
      name !== undefined &&
      symbol !== undefined &&
      decimals !== undefined &&
      balance !== undefined
    ) {
      setFetchingTokenInfo(false)
    } else if (
      name === undefined &&
      symbol === undefined &&
      decimals === undefined &&
      balance === undefined
    ) {
      setFetchingTokenInfo(false)
    } else {
      setFetchingTokenInfo(true)
    }
  }, [name, symbol, decimals, balance])

  const onChangeTokenAddress = (e) => {
    const tokenAddress = e.target.value + ""

    if (isAddress(tokenAddress) === true) {
      setErrorInTokenAddress(false)
      setMultisendTokenAddress(tokenAddress)
      console.log(tokenAddress)
    } else {
      setErrorInTokenAddress(true)
    }
  }

  const onChangeCodeMirrorHandler = (value) => {
    const rawText = value
    const multisendDataList = rawText.split("\n")

    setMultisendList(multisendDataList)
  }

  const reArrangeMultiSendList = () => {
    setErrorInMultiSendData(false)

    const arrayLength = multsendList.length

    const addressList = []
    const amountList = []

    for (let i = 0; i < arrayLength; i++) {
      const address = multsendList[i].split(",")[0] + ""
      const amount = multsendList[i].split(",")[1]

      if (isAddress(address) === true && isNaN(Number(amount)) === false) {
        addressList.push(address)
        amountList.push(
          BigNumber.from(parseInt(amount * 10 ** decimals)).toHexString()
        )
      } else {
        setErrorInMultiSendData(true)
      }
    }

    console.log(multisendData, errorInTokenAddress, errorInMultiSendData)
    if (errorInMultiSendData !== true) {
      setMultisendData({ addressList, amountList })
    } else {
      setMultisendData({ addressList: [], amountList: [] })
    }
  }

  console.log(name, symbol, decimals, balance, fetchingTokenInfo)

  return (
    <MultiSenderComponent
      account={account}
      symbol={symbol}
      decimals={decimals}
      balance={balance}
      fetchingTokenInfo={fetchingTokenInfo}
      reArrangeMultiSendList={reArrangeMultiSendList}
      onChangeTokenAddress={onChangeTokenAddress}
      onChangeCodeMirrorHandler={onChangeCodeMirrorHandler}
    />
  )
}

export default MultiSender
