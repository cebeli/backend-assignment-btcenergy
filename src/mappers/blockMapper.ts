import utils from "../helpers/utils"
import Block from "../types/Block"
import mapTransaction from "./transactionMapper"

const mapBlock = (data: any): Block => {
    let block: Block = {
        hash: data.hash,
        size: data.size,
        time: data.time,
        block_index: data.block_index,
        energyInKwH: utils.calculateEnergyFromSize(data.size),
        tx: data.tx.map((tx: any) => mapTransaction(tx))
    }
    return block
}

export default mapBlock
