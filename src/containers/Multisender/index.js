import { useState, useEffect } from "react"
import { BigNumber } from "ethers"
import { isAddress } from "ethers/lib/utils"
import { useWeb3React } from "@web3-react/core"
import { useAlert } from "react-alert"

import MultiSenderComponent from "components/Multisender"

import {
  useWeb3SwrBalance,
  useWeb3SwrMetadata,
  useWeb3SwrAllowance,
} from "hooks/useWeb3SWR"
import { approveToken } from "utils/GetERC20Contract"

const MultiSender = () => {
  const alert = useAlert()

  const { account, library } = useWeb3React()

  const [multisendTokenAddress, setMultisendTokenAddress] = useState("")
  const [multsendList, setMultisendList] = useState([])
  const [multisendData, setMultisendData] = useState({})

  const [fetchingTokenInfo, setFetchingTokenInfo] = useState(false)

  const [errorInTokenAddress, setErrorInTokenAddress] = useState(false)
  const [errorInMultiSendData, setErrorInMultiSendData] = useState(false)
  const [errorEmptyData, setErrorEmptyData] = useState(false)

  const [txStatus, setTxStatus] = useState("")

  const { balance, mutate } = useWeb3SwrBalance(multisendTokenAddress)
  const { name, nameMutate, symbol, symbolMutate, decimals, decimalsMutate } =
    useWeb3SwrMetadata(multisendTokenAddress)
  const { allowance, allowanceMutate } = useWeb3SwrAllowance(
    multisendTokenAddress
  )

  useEffect(() => {
    if (library) {
      library.on("block", () => {
        console.log("Updating balance...")
        mutate(undefined, true)
        nameMutate(undefined, true)
        symbolMutate(undefined, true)
        decimalsMutate(undefined, true)
        allowanceMutate(undefined, true)
      })
    }

    return () => library && library.removeAllListeners("block")
  }, [])

  useEffect(() => {
    if (
      name !== undefined &&
      symbol !== undefined &&
      decimals !== undefined &&
      balance !== undefined &&
      allowance !== undefined
    ) {
      setFetchingTokenInfo(false)
    } else if (
      name === undefined &&
      symbol === undefined &&
      decimals === undefined &&
      balance === undefined &&
      allowance === undefined
    ) {
      setFetchingTokenInfo(false)
    } else {
      setFetchingTokenInfo(true)
    }
  }, [name, symbol, decimals, balance, allowance])

  const onApproveToken = async () => {
    await approveToken(
      library,
      multisendTokenAddress,
      alertInfo,
      alertSuccess,
      alertError
    )
  }

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

    if (addressList.length > 0) {
      setErrorEmptyData(false)
    } else {
      setErrorEmptyData(true)
    }

    if (errorInMultiSendData !== true) {
      setMultisendData({ addressList, amountList })
    } else {
      setMultisendData({ addressList: [], amountList: [] })
    }
  }

  const onCallMultiSendTransaction = () => {
    reArrangeMultiSendList()

    if (errorInTokenAddress) {
      alertError("Please put token address to send.")
    }
    if (errorInMultiSendData) {
      alertError("Please check multi send data. There are errors in data set.")
    }
    if (errorEmptyData) {
      alertError("No information for multi send.")
    }
  }

  const alertInfo = (message) =>
    alert.info(message, {
      onOpen: () => {
        setTxStatus("Pending")
      },
    })

  const alertSuccess = (message) =>
    alert.success(message, {
      onOpen: () => {
        setTxStatus("Success")
      },
    })

  const alertError = (message) =>
    alert.error(message, {
      onOpen: () => {
        setTxStatus("Error")
      },
    })

  console.log(
    name,
    symbol,
    decimals,
    balance,
    fetchingTokenInfo,
    allowance !== undefined && BigNumber.from(allowance).toString()
  )

  return (
    <MultiSenderComponent
      txStatus={txStatus}
      account={account}
      symbol={symbol}
      decimals={decimals}
      balance={balance}
      allowance={allowance}
      fetchingTokenInfo={fetchingTokenInfo}
      onChangeTokenAddress={onChangeTokenAddress}
      onChangeCodeMirrorHandler={onChangeCodeMirrorHandler}
      onApproveToken={onApproveToken}
      onCallMultiSendTransaction={onCallMultiSendTransaction}
    />
  )
}

export default MultiSender
