import utils from "../helpers/utils"
import Block from "../types/Block"
import mapTransaction, { txExt } from "./transactionMapper"

interface blockExt {
    hash: string,
    size: number,
    time: number,
    block_index: number,
    tx: Array<txExt>
}

const mapBlock = (data: blockExt): Block => {
    const block: Block = {
        hash: data.hash,
        size: data.size,
        time: data.time,
        block_index: data.block_index,
        energyInKwH: utils.calculateEnergyFromSize(data.size),
        tx: data.tx.map((tx: txExt) => mapTransaction(tx))
    }
    return block
}

export default mapBlock
