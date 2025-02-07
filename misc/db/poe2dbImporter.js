affixFamily = "Additional Arrows";
affixType = "Valuable";
affixKeywords = ["Additional Arrow"];
affixPosition = "Suffix";
poe2dbElementAddress = "#collapseOnenormal2AdditionalArrows";





affixKeywordsText = '[';
counter = 0;
affixKeywords.forEach((k) => {
    if (counter > 0)
        affixKeywordsText = affixKeywordsText + ',';
    affixKeywordsText = affixKeywordsText + '"' + k + '"';
    counter = counter +1;
})
affixKeywordsText = affixKeywordsText + ']';
modStrings = '';

               
var mainNode = document.querySelector(`${poe2dbElementAddress} > div > div > div.modal-body.p-1 > table:nth-child(1)`).childNodes[3];
tierCounter = 1;
for(let i = 1; i<= mainNode.childElementCount*2; i = i+2)
{
    if (i>1)
        modStrings = modStrings + ',';
    activeNode = mainNode.childNodes[i];
    affixName = activeNode.childNodes[1].innerText;
    affixLevelReq = activeNode.childNodes[3].innerText;
    valuesText = []
    values = activeNode.childNodes[5].querySelectorAll('span.mod-value');
    values.forEach((value) => {
        valuesText.push (value.innerText);
    })
    jsonValues ='[';
    valuesCount = 0;
    valuesText.forEach((v) => {
        if (valuesCount > 0)
            jsonValues = jsonValues + ',';
        jsonValues = jsonValues + '"' + v + '"';
        valuesCount = valuesCount +1;
    })
    jsonValues = jsonValues +']';
    jsonAffixString = 
    `
        {
            "name" : "${affixName}",
            "tier" : ${tierCounter},
            "affixLevelReq" : ${affixLevelReq},
            "values" : ${jsonValues}
        }`;
    modStrings = modStrings + jsonAffixString;
    tierCounter ++;
}
jsonString =
    `
    {
        "affixFamily" : "${affixFamily}",
        "affixPosition" : "${affixPosition}",
        "affixType" : "${affixType}",
        "affixKeywords" : ${affixKeywordsText},
        "mods" : [
        ${modStrings}
        ]
    },`
console.log(jsonString);
