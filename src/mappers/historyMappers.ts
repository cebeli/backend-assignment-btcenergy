import Block from "../types/Block"
import BlockMeta from "../types/BlockMeta"
import History from "../types/History"
import HistoryPart from "../types/HistoryPart"

const energyperbyteinkwh = parseFloat(process.env.energyperbyteinkwh || '4.56')

const mapHistory = (historyParts: Array<HistoryPart>, days: number) => {
    const sumHistoryPartEnergy = (arr: Array<HistoryPart>): number => {
        const rawSum: number = arr.reduce((acc, curr) => acc + (curr.energyInKwH * 1000), 0) // energyInKwH is already calculated
        return rawSum / 1000
    }
    const history: History = {
        periodInDays: days,
        energyInKwH: sumHistoryPartEnergy(historyParts),
        days: historyParts
    }
    return history
}

const mapHistoryPart = (blockDataForCalendarDay: Array<Block>, dayNo: number): HistoryPart => {
    const sumBlocksEnergy = (arr: Array<Block>): number => {
        const rawSum: number = arr.reduce((acc, curr) => acc + (curr.size * (energyperbyteinkwh * 1000)), 0)
        return rawSum / 1000
    }
    
    const historyPart: HistoryPart = {
        day: dayNo,
        energyInKwH: sumBlocksEnergy(blockDataForCalendarDay),
        blocks: blockDataForCalendarDay
    }
    return historyPart
}

const mapBlockMeta = (data: any): BlockMeta => {
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
