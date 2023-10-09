import HistoryPart from "./HistoryPart";

type History = {
    periodInDays: number,
    energyInKwH: number,
    days: Array<HistoryPart>,
}

export default History
