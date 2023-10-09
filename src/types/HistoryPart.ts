import Block from "./Block"

type HistoryPart = {
    day: number,
    energyInKwH: number,
    blocks: Array<Block>,
}

export default HistoryPart
