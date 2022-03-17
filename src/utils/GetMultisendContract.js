import { Contract } from "ethers"
import { getProviderOrSigner } from "utils"

import { getMultiSenderAbi } from "helpers/AbiHelper"
import { bscContracts } from "configurations/Constants/Contracts"

const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)

export const callMultiSend = async (
  library,
  account,
  tokenAddress,
  addressList,
  amountList,
  alertInfo,
  alertSuccess,
  alertError
) => {
  const abi = getMultiSenderAbi()

  const contract = new Contract(
    bscContracts.MULTISENDER[chainId].address,
    abi,
    getProviderOrSigner(library, account)
  )

  let fee = await contract.serviceFee()

  try {
    let txHash = await contract.multiSendTokensFromWalletAt(
      tokenAddress,
      addressList,
      amountList,
      {
        value: fee,
        from: account,
      }
    )

    alertInfo("Tx Submitted")

    let res = await txHash.wait()

    if (res.transactionHash) {
      alertSuccess("Tx Succeed")
    } else {
      alertError("Tx Failed")
    }
  } catch (error) {
    if (error.data) {
      alertError(error.data.message)
    } else {
      alertError(error.message)
    }
  }
}
