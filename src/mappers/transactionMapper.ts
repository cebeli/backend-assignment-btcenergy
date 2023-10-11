import utils from "../helpers/utils"
import Transaction from "../types/Transaction"

export interface txExt {
  hash: string,
  size: number,
  tx_index: string
}

const mapTransaction = (data: txExt): Transaction => {
  const transaction: Transaction = {
    hash: data.hash,
    size: data.size,
    tx_index: data.tx_index,
    energyInKwH: utils.calculateEnergyFromSize(data.size)
  }
  return transaction
}

export default mapTransaction
