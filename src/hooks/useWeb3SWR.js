import useSWR from "swr"
import { Contract } from "ethers"

import useActiveWeb3React from "./useActiveWeb3React"
import { getProviderOrSigner } from "utils/index"

import { getERC20Abi } from "helpers/AbiHelper"
import { bscContracts } from "configurations/Constants/Contracts"

const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)

const balanceFetcher =
  (library, abi) =>
  async (...args) => {
    const [address, method, account, ...params] = args

    const contract = new Contract(
      address,
      abi,
      getProviderOrSigner(library, account)
    )

    return contract[method](account, ...params)
  }

export const useWeb3SwrBalance = (address) => {
  const { library, account } = useActiveWeb3React()
  const abi = getERC20Abi()

  const { data: balance, mutate } = useSWR([address, "balanceOf", account], {
    fetcher: balanceFetcher(library, abi),
  })

  return { balance, mutate }
}

const metadataFetcher =
  (library, abi) =>
  async (...args) => {
    const [address, method, ...params] = args

    const contract = new Contract(address, abi, getProviderOrSigner(library))

    return contract[method](...params)
  }

export const useWeb3SwrMetadata = (address) => {
  const { library } = useActiveWeb3React()
  const abi = getERC20Abi()

  const { data: name, mutate: nameMutate } = useSWR([address, "name"], {
    fetcher: metadataFetcher(library, abi),
  })

  const { data: symbol, mutate: symbolMutate } = useSWR([address, "symbol"], {
    fetcher: metadataFetcher(library, abi),
  })

  const { data: decimals, mutate: decimalsMutate } = useSWR(
    [address, "decimals"],
    {
      fetcher: metadataFetcher(library, abi),
    }
  )

  return { name, nameMutate, symbol, symbolMutate, decimals, decimalsMutate }
}

const allowanceFetcher =
  (library, abi) =>
  async (...args) => {
    const [address, method, account, ...params] = args

    const contract = new Contract(address, abi, getProviderOrSigner(library))

    return contract[method](
      account,
      bscContracts.MULTISENDER[chainId].address,
      ...params
    )
  }

export const useWeb3SwrAllowance = (address) => {
  const { library, account } = useActiveWeb3React()
  const abi = getERC20Abi()

  const { data: allowance, mutate: allowanceMutate } = useSWR(
    [address, "allowance", account],
    {
      fetcher: allowanceFetcher(library, abi),
    }
  )

  return { allowance, allowanceMutate }
}
