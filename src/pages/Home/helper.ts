const DOUBLE_QUOTE = '"'
const rules = {
  duplicateQuotes: "<Encode!doubleQuotes!>",
}
const insideQuotesRules = {
  comma: "<Encode!comma!>",
  breakline: "<Encode!breakline!>"
}
const rulesDecoded = {
  duplicateQuotes: `"`,
  comma: `,`,
  breakline: `\n`
}
/**
 * The CVS created from Google Sheets comes with some rules per special characters
 * ---------------------------------------------------------------------------------------
 * - if there is a comma , in a cell, the content is wrapped in double quotes "content"   |
 * - if there is a double quote " in a cell, it duplicates in two ""                      |
 * ---------------------------------------------------------------------------------------
 * This function Encode those special characters to not hinder the process of interpreting it
 */
const csvEncoder = (rowText: string) => {
    //PHASE 1: encode duplicate quotes
    const phase1 = rowText.replaceAll(`""`, rules.duplicateQuotes)
    //PHASE 2: encode troublesome characters inside the double quotes and remove those double quotes
    let isInsideQuotes = false
    console.log(phase1)
    return phase1.split("").map(char => {
      if(char === DOUBLE_QUOTE){
        isInsideQuotes = !isInsideQuotes
        return ""
      }
      if(isInsideQuotes){
        if(char === rulesDecoded.comma) return insideQuotesRules.comma
        if(char === rulesDecoded.breakline) return insideQuotesRules.breakline
      }
      return char
    }).join("")
}

/**
 *  Decodes the previously encoded Text
 */
const decoder = (text: string) => {
  const ruleKeys = [...Object.keys(insideQuotesRules), ...Object.keys(rules)]
  let decodedText = text
  for(const key of ruleKeys){
    decodedText = decodedText.replaceAll(insideQuotesRules[key], rulesDecoded[key])
  }
  return decodedText
}

const splitEncodedCSVRow = (encodedRow: string) => {
  const values = encodedRow.split(",")
  const decodedSplitRow = values.map(val => decoder(val).trim())
  return decodedSplitRow
}

export const csvFileToArray = (fileText:string) => {
    const encodedFileText = csvEncoder(fileText)
    const csvHeaderText = encodedFileText.slice(0, encodedFileText.indexOf("\n")).replaceAll(/(\r| )/g,"")
    const csvRowsText = encodedFileText.slice(encodedFileText.indexOf("\n") + 1).replaceAll(/(\r)/g,"")
    const csvHeader = splitEncodedCSVRow(csvHeaderText)
    const csvRows = csvRowsText.split("\n")
    return csvRows.map(row => {
      const values = splitEncodedCSVRow(row)
      const obj = csvHeader.reduce((object, header, index) => {
        if(header.toLowerCase() === "doctitle"){
          object['slug'] = values[index] !== "" ? values[index] : `${new Date().toLocaleString()}`;
        }
        else{
          object.inputs[header] = values[index];
        }
        return object;
      }, {slug: "", inputs: {}});
      return obj;
    });
  };

export const getURLParams = (page: number, limit: number) => {
  return `page=${page}&limit=${limit}`
}