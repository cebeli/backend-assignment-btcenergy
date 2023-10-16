import Block from "../types/Block"
import BlockMeta from "../types/BlockMeta"
import History from "../types/History"
import HistoryPart from "../types/HistoryPart"

const energyperbyteinkwh = parseFloat(process.env.energyperbyteinkwh || '4.56')

interface blockMetaExt { 
    hash: string, 
    time: number 
}

const sumHistoryPartEnergy = (arr: Array<HistoryPart>): number => {
    const rawSum: number = arr.reduce((acc, curr) => acc + (curr.energyInKwH * 1000), 0) // energyInKwH is already calculated
    return rawSum / 1000
}

const mapHistory = (historyParts: Array<HistoryPart>, days: number) => {
    const history: History = {
        periodInDays: days,
        energyInKwH: sumHistoryPartEnergy(historyParts),
        days: historyParts
    }
    return history
}


const sumBlocksEnergy = (arr: Array<Block>): number => {
    const rawSum: number = arr.reduce((acc, curr) => acc + (curr.size * (energyperbyteinkwh * 1000)), 0)
    return rawSum / 1000
}
const mapHistoryPart = (blockDataForCalendarDay: Array<Block>, dayNo: number): HistoryPart => {
    const historyPart: HistoryPart = {
        day: dayNo,
        energyInKwH: sumBlocksEnergy(blockDataForCalendarDay),
        blocks: blockDataForCalendarDay
    }
    return historyPart
}

const mapBlockMeta = (data: blockMetaExt): BlockMeta => {
    const blockMeta: BlockMeta = {
        hash: data.hash,
        time: data.time
    }
    return blockMeta
}

export default {
    mapBlockMeta,
    mapHistoryPart,
    mapHistory
}
