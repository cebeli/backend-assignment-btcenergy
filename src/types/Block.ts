import Transaction from "./Transaction";

type Block = {
    hash: string,
    size: number,
    time: number,
    block_index: number,
    energyInKwH: number,
    tx: Array<Transaction>
}

export default Block
