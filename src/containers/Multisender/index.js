import { useState, useEffect } from "react"
import { BigNumber, constants } from "ethers"
import { isAddress, parseUnits } from "ethers/lib/utils"
import { useWeb3React } from "@web3-react/core"
import { useAlert } from "react-alert"

import MultiSenderComponent from "components/Multisender"

import {
  useWeb3SwrBalance,
  useWeb3SwrMetadata,
  useWeb3SwrAllowance,
} from "hooks/useWeb3SWR"
import { approveToken } from "utils/GetERC20Contract"
import { callMultiSend } from "utils/GetMultisendContract"

const MultiSender = () => {
  const alert = useAlert()

  const { account, library } = useWeb3React()

  const [multisendTokenAddress, setMultisendTokenAddress] = useState("")
  const [multsendList, setMultisendList] = useState([])
  const [multisendData, setMultisendData] = useState({})

  const [multisendDataValidated, setMultisendDataValidated] = useState(false)

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
      setFetchingTokenInfo(true)
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
    const tokenAddress = e.target.value

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
    const multisendDataList = rawText.replace(" ", "").split("\n")

    setMultisendDataValidated(false)
    setMultisendList(multisendDataList)
  }

  const reArrangeMultiSendList = () => {
    let emptyDataError = false
    let multisendDataError = false
    let emptyAddressError = errorInTokenAddress

    setErrorInMultiSendData(emptyDataError)
    setMultisendDataValidated(multisendDataError)

    const arrayLength = multsendList.length

    const addressList = []
    const amountList = []

    for (let i = 0; i < arrayLength; i++) {
      const address = multsendList[i].split(",")[0] + ""
      const amount = multsendList[i].split(",")[1]

      if (isAddress(address) === true && isNaN(Number(amount)) === false) {
        addressList.push(address)
        try {
          amountList.push(parseUnits(amount, decimals).toString())
        } catch {
          setErrorInMultiSendData(true)
          multisendDataError = true
          amountList.push("0")
        }
      } else {
        setErrorInMultiSendData(true)
        multisendDataError = true
      }
    }

    if (addressList.length > 0) {
      setErrorEmptyData(false)
    } else {
      setErrorEmptyData(true)
      emptyDataError = true
    }

    if (multisendDataError !== true && emptyDataError !== true) {
      setMultisendDataValidated(true)
      setMultisendData({ addressList, amountList })
    } else {
      setMultisendDataValidated(false)
      setMultisendData({ addressList: [], amountList: [] })
    }

    onValidateMultisendData(
      emptyAddressError,
      multisendDataError,
      emptyDataError
    )
  }

  const onValidateMultisendData = (
    emptyAddressError = false,
    multisendDataError = false,
    emptyDataError = false
  ) => {
    if (emptyAddressError || errorInTokenAddress) {
      alertError("Please put token address to send.")
    }
    if (multisendDataError) {
      alertError("Please check multi send data. There are errors in data set.")
    }
    if (emptyDataError) {
      alertError("No information for multi send.")
    }

    callMultiSend()
  }

  const onCallMultiSendTransaction = () => {
    callMultiSend(
      library,
      account,
      multisendTokenAddress,
      multisendData.addressList,
      multisendData.amountList,
      alertInfo,
      alertSuccess,
      alertError
    )
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
    multisendDataValidated,
    multisendData,
    errorInTokenAddress
  )

  return (
    <MultiSenderComponent
      txStatus={txStatus}
      account={account}
      symbol={symbol}
      decimals={decimals}
      balance={balance}
      allowance={allowance}
      multisendDataValidated={multisendDataValidated}
      fetchingTokenInfo={fetchingTokenInfo}
      reArrangeMultiSendList={reArrangeMultiSendList}
      onChangeTokenAddress={onChangeTokenAddress}
      onChangeCodeMirrorHandler={onChangeCodeMirrorHandler}
      onApproveToken={onApproveToken}
      onCallMultiSendTransaction={onCallMultiSendTransaction}
    />
  )
}

export default MultiSender
