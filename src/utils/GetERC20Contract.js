import { Contract, constants } from "ethers"
import { getProviderOrSigner } from "utils/index"

import { getERC20Abi } from "helpers/AbiHelper"
import { bscContracts } from "configurations/Constants/Contracts"

const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)

export const approveToken = async (
  library,
  address,
  alertInfo,
  alertSuccess,
  alertError
) => {
  const abi = getERC20Abi()

  const contract = new Contract(address, abi, getProviderOrSigner(library))

  try {
    let txHash = await contract.approve(
      bscContracts.MULTISENDER[chainId].address,
      constants.MaxUint256
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
