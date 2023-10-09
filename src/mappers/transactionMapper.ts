import utils from "../helpers/utils"
import Transaction from "../types/Transaction"

const mapTransaction = (data: any): Transaction => {
  const transaction: Transaction = {
    hash: data.hash,
    size: data.size,
    tx_index: data.tx_index,
    energyInKwH: utils.calculateEnergyFromSize(data.size)
  }
  return transaction
}

export default mapTransaction
