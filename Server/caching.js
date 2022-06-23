const fs = require('fs')
const getColumns = (sheet,ProgressSheetGrid)=>{
    let x = 0;
    const results = {}
	while (ProgressSheetGrid.columnCount>x) {
        try{
            const cell = sheet.getCell(3, 6 + x);
            if(cell.value){
                results[cell.value] = cell._column
            }
        }catch(e){
            break;
        }
        x += 2;
	}
    return results
}
module.exports = {
    cachedProblems:  (ProgressSheet,ProgressSheetGrid,title)=>{
        const existing = require('./generated/problemsCache.json')
        if(existing[title]){
            return existing[title]
        }
        if(process.env.NODE_ENV !== 'development') return null
        ProgressSheet.loadCells("F4:4").then(()=>{
            const columns = getColumns(ProgressSheet,ProgressSheetGrid);
            fs.writeFileSync('./generated/problemsCache.json',JSON.stringify(columns))
        })
        return null
    }
}