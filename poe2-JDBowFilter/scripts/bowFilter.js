async function loadAllItems() 
{
    buttonList.forEach(button => {
        button.disabled = true;
        button.style.background = '#383e3c';
    });
    while (true) 
        {
           
        const loadMoreButton = document.querySelector('.btn.load-more-btn');
        if (!loadMoreButton) break;
        logText.textContent = "Evaluating items, Please Wait "
        loadMoreButton.click();
        for (let index = 0; index < 3; index++) {
            logText.textContent += ". ";
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }
    buttonList.forEach(button => {
        button.disabled = false;
        button.style.background = '#156947';
    });
    buttonList[3].disabled = true;
    buttonList[3].style.background = '#383e3c';
}

async function getData(url) {
    const response = await fetch(url);

    return response.json();
}

class POE2RuneMod{
    runeModType = ''; //Added Elemental Damage, Increased Physical Damage, Attack Speed
    runeModValue1 = 0;
    runeModValue2 = 0;

    DebugRune(){
        console.log("Rune type: " + this.runeModType + ", Value: " + this.runeModValue1 + (this.runeModValue2!=''?", " + this.runeModValue2:''));
    }
}

class POE2Affix {
    affixFamily = '';
    affixType = '';
    affixName = '';
    affixTier = 0;
    affixPosition = '';
    affixMin1 = 0;
    affixMax1 = 0;
    affixMin2 = null;
    affixMax2 = null;

    InitializeAffix(family,type, name, tier, position, min1, max1, min2, max2){
        this.affixFamily = family;
        this.affixType = type;
        this.affixName = name;
        this.affixTier = tier;
        this.affixPosition = position;
        this.affixMin1 = min1;
        this.affixMax1 = max1;
        this.affixMin2 = min2;
        this.affixMax2 = max2;        
    }
    DebugAffix()
    {
        var debugValuesString = '';
        if (this.affixMax2!=null)
        {
            debugValuesString = "Min1 = " + this.affixMin1 + ", Max1 = " + this.affixMax1 + ", Min2 = " + this.affixMin2 + ", Max2 = " + this.affixMax2;
        }
        else
        {
            debugValuesString = "Min = " + this.affixMin1 + ", Max = " + this.affixMax1;
        }
        console.log(this.affixPosition + " T" + this.affixTier + ": " + this.affixFamily + " (" + this.affixName + ") ----- Values: " + debugValuesString);
    }
}

class POE2Item {
    totalPhysIncreased = 0;
    itemElement;
    isCorrupted = false;

    minPhys = 0;
    maxPhys = 0;
    minPhysAdded = 0;
    maxPhysAdded = 0;

    quality = 0;

    attacksPerSecond = 0.0;
    attackSpeedAdded = 0;

    baseAttacksPerSecond = 0.0;
    minBasePhys = 0;
    maxBasePhys = 0;

    itemType = '';
    itemName = '';
    itemDPS = 0;
    itemEleDps = 0;
    itemPhysDps = 0;
    runeMods = [];

    _itemMaxDPS = 0;
    __itemMinDPS = 0;
    _itemMaxEleDps = 0;
    __itemMinEleDps = 0;
    _itemMaxPhysDps = 0;
    __itemMinPhysDps = 0;
   
    ___dpsWithIronRune = 0;
    ___currentDivRollStrength = 0.0;

    prefixes = [];
    suffixes = [];

    CalculateValues()
    {
        var tempPhysDpsWithoutRunes = physDps;
        var tempIncreasedWithRunes = this.totalPhysIncreased;
        var tempEleDpsWithoutRunes = eleDps;
        var tempAttackSpeedWithRunes = this.attackSpeedAdded;


        this.runeMods.forEach(rune => {
            if (rune.runeModType == "Increased Physical Damage")
            {
                tempIncreasedWithRunes += rune.runeModValue1;
                tempPhysDpsWithoutRunes = tempPhysDpsWithoutRunes / ((100.0 + this.totalPhysIncreased + rune.runeModValue1)/(100.0 + this.totalPhysIncreased));
            }
        });
        this.runeMods.forEach(rune => {
            if (rune.runeModType == "Added Elemental Damage")
            {
                tempEleDpsWithoutRunes -= ((rune.runeModValue1 + rune.runeModValue2)/2) * this.attacksPerSecond;
            }
        });
        this.runeMods.forEach(rune => {
            if (rune.runeModType == "Attack Speed")
            {
                //console.log("Before: " + tempPhysDpsWithoutRunes + " Temp DPS, " + this.attackSpeedAdded + " AS ADDED, " + rune.runeModValue1 + "Rune Mod Value");
                tempPhysDpsWithoutRunes = tempPhysDpsWithoutRunes * ((100.0 + this.attackSpeedAdded) / (100.0 + rune.runeModValue1 + this.attackSpeedAdded ));
                tempEleDpsWithoutRunes = tempEleDpsWithoutRunes * ((100.0 + this.attackSpeedAdded) / (100.0 + rune.runeModValue1 + this.attackSpeedAdded ));
                tempAttackSpeedWithRunes += rune.runeModValue1;
                //console.log("After: " +tempPhysDpsWithoutRunes + " Temp DPS, " + this.attackSpeedAdded + " AS ADDED, " + rune.runeModValue1 + "Rune Mod Value");
            }
        });


        var zeroQualMin = Math.round(this.minPhys / ((100.0+this.quality)/100.0));
        var zeroQualMax = Math.round(this.maxPhys / ((100.0+this.quality)/100.0));
        var zeroIncMin = Math.round(zeroQualMin/(1+(tempIncreasedWithRunes/100.0)));
        var zeroIncMax = Math.round(zeroQualMax/(1+(tempIncreasedWithRunes/100.0)));
        this.minBasePhys = zeroIncMin - this.minPhysAdded;
        this.maxBasePhys = zeroIncMax - this.maxPhysAdded;            
        this.___dpsWithIronRune = tempPhysDpsWithoutRunes * ((100 + this.totalPhysIncreased + 40)/(100 + this.totalPhysIncreased)) + tempEleDpsWithoutRunes;        
        this.baseAttacksPerSecond = (Math.round((this.attacksPerSecond / ((100.00 + tempAttackSpeedWithRunes)/100.00))*100.00)/100.0);


        var totalMinMinElemental = 0;
        var totalMinMaxElemental = 0;

        var totalMaxMinElemental = 0;
        var totalMaxMaxElemental = 0;

        var totalMinMinPhysical = 0;
        var totalMinMaxPhysical = 0;

        var totalMaxMinPhysical = 0;
        var totalMaxMaxPhysical = 0;

        var totalMinIncreasedPhysical = 0;
        var totalMaxIncreasedPhysical = 0;

        var totalMinAttackSpeedMod = 0;
        var totalMaxAttackSpeedMod = 0;

        this.prefixes.forEach(prefix => {
            if (prefix.affixFamily == "Added Fire Damage"||prefix.affixFamily == "Added Cold Damage"||prefix.affixFamily == "Added Lightning Damage")
            {
                totalMinMinElemental += prefix.affixMin1;
                totalMaxMinElemental += prefix.affixMax1;
                totalMinMaxElemental += prefix.affixMin2;
                totalMaxMaxElemental += prefix.affixMax2;
            }
            else if (prefix.affixFamily == "Added Physical Damage")
            {
                totalMinMinPhysical += prefix.affixMin1;
                totalMaxMinPhysical += prefix.affixMax1;
                totalMinMaxPhysical += prefix.affixMin2;
                totalMaxMaxPhysical += prefix.affixMax2;
            }
            else if (prefix.affixFamily == "Increased Physical and Accuracy"|| prefix.affixFamily == "Increased Physical Damage")
            {
                totalMinIncreasedPhysical += prefix.affixMin1;
                totalMaxIncreasedPhysical += prefix.affixMax1;
            }
        });

        this.suffixes.forEach(suffix =>{
            if (suffix.affixFamily == "Attack Speed")
            {
                totalMinAttackSpeedMod = suffix.affixMin1;
                totalMaxAttackSpeedMod = suffix.affixMax1;
            }
        })
        //console.log("Min phys: " + totalMaxMinPhysical + ", Max Phys: " +totalMaxMaxPhysical);

        var minDivMinPhys = ((this.minBasePhys + totalMinMinPhysical)*((100.0 + totalMinIncreasedPhysical+40.0)/100.0))*1.2;
        var minDivMaxPhys = ((this.maxBasePhys + totalMinMaxPhysical)*((100.0 + totalMinIncreasedPhysical+40.0)/100.0))*1.2;
        var minDivMinEle = totalMinMinElemental;
        var minDivMaxEle = totalMinMaxElemental;
        var minDivAttackSpeed = this.baseAttacksPerSecond * ((100 + totalMinAttackSpeedMod)/100.0);

        this.__itemMinEleDps = ((minDivMinEle+minDivMaxEle)/2.0)*minDivAttackSpeed;
        this.__itemMinPhysDps = ((minDivMinPhys+minDivMaxPhys)/2.0)*minDivAttackSpeed;
        this.__itemMinDPS = this.__itemMinEleDps + this.__itemMinPhysDps;


        var maxDivMinPhys = ((this.minBasePhys + totalMaxMinPhysical)*((100.0 + totalMaxIncreasedPhysical + 40.0)/100.0))*1.2;
        var maxDivMaxPhys = ((this.maxBasePhys + totalMaxMaxPhysical)*((100.0 + totalMaxIncreasedPhysical + 40.0)/100.0))*1.2;
        var maxDivMinEle = totalMaxMinElemental;
        var maxDivMaxEle = totalMaxMaxElemental;
        var maxDivAttackSpeed = this.baseAttacksPerSecond * ((100 + totalMaxAttackSpeedMod)/100.0);

 
        this._itemMaxEleDps = ((maxDivMinEle+maxDivMaxEle)/2.0)*maxDivAttackSpeed;
        this._itemMaxPhysDps = ((maxDivMinPhys+maxDivMaxPhys)/2.0)*maxDivAttackSpeed;
        this._itemMaxDPS = this._itemMaxEleDps + this._itemMaxPhysDps;    
        this.___currentDivRollStrength = ((this.___dpsWithIronRune - this.__itemMinDPS)/(this._itemMaxDPS - this.__itemMinDPS));

        if (this.isCorrupted)
        {
            this._itemMaxDPS = this.___dpsWithIronRune;    
            this.__itemMinDPS = this.___dpsWithIronRune;
            this.___currentDivRollStrength = 1;
        }
    }

    AddAffix (affix)
    {
        var skip = false;
        this.prefixes.forEach(af => {
            if (af.affixName == affix.affixName)
                skip = true;
        })

        this.suffixes.forEach(af => {
            if (af.affixName == affix.affixName)
                skip = true;
        })

        if (affix.affixPosition == "Prefix" && !skip)
            this.prefixes.push(affix);
        else if (affix.affixPosition == "Suffix"&& !skip)
            this.suffixes.push(affix);            
    }

    DebugItem()
    {
        console.log("n" + this.sortNumber + ": " + this.itemName + ":            Prefixes: " + this.prefixes.length + "           Suffixes: " + this.suffixes.length);
        console.log("DPS: " + this.itemDPS.toFixed(1) + "       w/ Iron Runes: " + this.___dpsWithIronRune.toFixed(1) + "       Roll: " + (this.___currentDivRollStrength*100).toFixed(1) + "%       MinDivDps: " + this.__itemMinDPS.toFixed(1) +"     MaxDivDps: " + this._itemMaxDPS.toFixed(1));
//             console.log('\n');
//             this.prefixes.forEach(p => {p.DebugAffix();});
        //console.log(this);
        //this.suffixes.forEach(s => {s.DebugAffix();});
        //this.runeMods.forEach(mod => {            mod.DebugRune();        })
        console.log('\n\n\n');
    }   

    InfoString()
    {
        if (this.isCorrupted)
        {
            return "w/ Iron R: " + this.___dpsWithIronRune.toFixed(1) + " ------ Corrupted ------ MinDiv: " + this.__itemMinDPS.toFixed(1) +" ------ MaxDiv: " + this._itemMaxDPS.toFixed(1);
        }
        else
            return "w/ Iron R: " + this.___dpsWithIronRune.toFixed(1) + " ------ Roll: " + (this.___currentDivRollStrength*100).toFixed(1) + "% ------ MinDiv: " + this.__itemMinDPS.toFixed(1) +" ------ MaxDiv: " + this._itemMaxDPS.toFixed(1);
    }
}

async function main()
{
    console.log("Tool made by Johnny Dalvi --- Test Version 0.1");
    urlData = 'https://gist.githubusercontent.com/JohnnyDalvi/430591fccc79d0451791f954b8f4dc56/raw/6491ab06a3830e7b58b55c7f66e44e6eeaad91b4/affixJson.json';
    data = await getData(urlData);
    await new Promise(r => setTimeout(r, 2000)); //otherwise bricks itself in slow and fast browsers
    GenerateButtons();
    document.querySelector("#trade > div.top > div > div.controls > div.controls-center > button").addEventListener("click",NewSearch);
    MainProgram();
    //console.log('Martial Weapon Evaluator started....');
}
function NewSearch(){
    logText.textContent = "New Search, requires reevaluation."
    hiddenItems = false;
    buttonList.forEach(button => {
        button.disabled = true;
        button.style.background = '#383e3c';
    });
    buttonList[4].disabled = false;
    buttonList[4].style.background = '#156947';

}

main();

function GenerateButtons()
{
    searchBar = document.querySelector("#trade > div.top > div");
    if (searchBar.childNodes.length<=5)
    {
        buttonList = [];
        CreateButton(() => SortByMaxDiv(),"Sort by max divDPS");
        CreateButton(() => SortByDivRoll(),"Sort by lowest rolls");
        CreateButton(() => HidePerNumberOfPrefixesAndSuffixes(2, 2),"Hide 6 affixes items");
        CreateButton(() => UnhideAll(),"Unhide All items");
        CreateButton(() => MainProgram(),"Reevaluate All items");
        CreateLogText();    
    }

    function CreateLogText(){        
        logText = document.createElement('text');
        logText.textContent = "Initializing...";
        logText.style.color = '#e2e2e2';
        logText.style.fontSize = '16px';
        logText.style.fontFamily = "FontinSmallcaps, San-Serif";
        logText.style.marginLeft = "20px";

        searchBar.appendChild(logText);
    }

    function CreateButton(buttonFunction, buttonName)
    {
        newButton = document.createElement('button');
        newButton.textContent = buttonName;
        newButton.style.fontFamily = "FontinSmallcaps, San-Serif";

        newButton.style.color = '#e2e2e2';
        newButton.style.paddingTop = "5px";
        newButton.style.paddingBottom = "5px";
        newButton.style.paddingLeft = "25px";
        newButton.style.paddingRight = "25px";
        //newButton.style.background = '#0f304d';
        newButton.style.background = '#156947';
        newButton.style.borderColor = '#4c4c7d';
        newButton.style.height = '35px';
        newButton.style.fontSize = '13px';
        newButton.style.marginRight = "10px";
        newButton.style.marginLeft = "10px";
        newButton.style.marginBottom = "10px";
        newButton.style.marginTop = "10px";

        newButton.addEventListener("click", buttonFunction);    
        buttonList.push(newButton);
        searchBar.appendChild(newButton);
    }
}

async function MainProgram(){
    itemList = [];
    hiddenItems = false;
    logText.textContent = "Processing Affixes..."
    await loadAllItems();
    resultSetContainer = document.querySelector("#trade > div.results > div.resultset");
    document.querySelectorAll('div.resultset > div.row').forEach((r, // THIS loops through each item
        ) => {
            newItem = new POE2Item();
            newItem.itemType = "Bow";
            bowName = '';

            dps = 0;
            physDps = 0;
            eleDps = 0;
            quality = 0;
            minPhys = 0;
            maxPhys = 0;
            attacksSecond = 0;

            r.querySelectorAll('.middle > div.itemPopupContainer.newItemPopup.poe2Popup.rarePopup > div > div.itemHeader.doubleLine > div:nth-child(2)').forEach(t => {bowName += t.childNodes[1].innerText + ' ';});
            r.querySelectorAll('.middle > div.itemPopupContainer.newItemPopup.poe2Popup.rarePopup > div > div.itemHeader.doubleLine > div.itemName.typeLine').forEach(t => {bowName += t.childNodes[1].innerText;});
            r.querySelectorAll('.middle > div.itemPopupContainer.newItemPopup.poe2Popup.magicPopup > div > div.itemHeader > div').forEach(t => {bowName += t.childNodes[1].innerText;});
            newItem.itemName = bowName;  
            

            //getting bow properties

            r.querySelectorAll(".property").forEach(prop => {

                innerText = prop.innerText;
                if (innerText.includes("Quality: +"))
                {
                    quality = Number(innerText.replace("Quality: +",'').replace("%",""));
                    // console.log(quality);
                }
                else if (innerText.includes("Physical Damage: "))
                {
                    physDmgText = innerText.replace("Physical Damage: ",'').split('-');
                    minPhys = Number(physDmgText[0]);
                    maxPhys = Number(physDmgText[1]);
                    // console.log('minphys: ' + minPhys + ",  maxphys: " + maxPhys);                    
                }
                else if (innerText.includes("Attacks per Second: "))
                {
                    attacksSecond =  Number(innerText.replace("Attacks per Second: ",''));
                    // console.log(attacksSecond);
                }                
            });

            r.querySelectorAll(".unmet").forEach(element => {
                if (element.innerHTML.includes("Corrupted"))
                    newItem.isCorrupted = true;
            });


            newItem.minPhys = minPhys;
            newItem.maxPhys = maxPhys;
            newItem.quality = quality;
            newItem.attacksPerSecond = attacksSecond;
        
            //getting runes
        
            r.querySelectorAll(".runeMod").forEach(rune =>{
                if (rune.innerText.includes("Adds"))
                {
                    text = rune.innerText;
                    runeText = text.replace("Adds ",'');                
                    runeText = runeText.replace(" Cold Damage",'');                
                    runeText = runeText.replace(" Lightning Damage",'');                
                    runeText = runeText.replace(" Fire Damage",''); 
                    runeText = runeText.split(" to ");
                                            
                    newRune = new POE2RuneMod();
                    newRune.runeModType = "Added Elemental Damage";
                    newRune.runeModValue1 = Number(runeText[0]);
                    newRune.runeModValue2 = Number(runeText[1]);
                    newItem.runeMods.push(newRune);
                }
                else if (rune.innerText.includes("Attack Speed"))
                {
                    text = rune.innerText;
                    runeText = text.replace("% increased Attack Speed",'');
                    newRune = new POE2RuneMod();
                    newRune.runeModType = "Attack Speed";
                    newRune.runeModValue1 = Number(runeText);
                    newItem.runeMods.push(newRune);
                }
                if (rune.innerText.includes("Physical Damage"))
                {
                    text = rune.innerText;
                    runeText = text.replace("% increased Physical Damage",'');
                    newRune = new POE2RuneMod();
                    newRune.runeModType = "Increased Physical Damage";
                    newRune.runeModValue1 = Number(runeText);
                    newItem.runeMods.push(newRune);
                }
            });
    
            //getting bow dps numbers

            r.querySelectorAll(".middle > div.itemPopupAdditional > span:nth-child(1) > span").forEach(element => {dps = Number(element.innerHTML);});
            r.querySelectorAll(".middle > div.itemPopupAdditional > span:nth-child(2) > span").forEach(element => {physDps = Number(element.innerHTML);});
            r.querySelectorAll(".middle > div.itemPopupAdditional > span:nth-child(3) > span").forEach(element => {eleDps = Number(element.innerHTML);});

            newItem.itemDPS = dps;
            newItem.itemEleDps = eleDps;
            newItem.itemPhysDps = physDps;

            //console.log("dps: " + dps + ", physDps: " + physDps + ", eleDps: " + eleDps);


            //this runs through all affixes within the bow

            r.querySelectorAll('.explicitMod').forEach((mod) => {
                            
            
                var rollText = mod.childNodes[1].innerText;
                if (rollText.includes("% increased Physical Damage"))
                {
                    newItem.totalPhysIncreased = Number(rollText.replace("% increased Physical Damage",''));
                }
                else if (rollText.toLowerCase().includes("adds") && rollText.toLowerCase().includes("physical damage"))
                {
                    physAddsText = rollText.replace("Adds ",'').replace(" Physical Damage",'').split('to');
                    newItem.minPhysAdded = Number(physAddsText[0].trim());
                    newItem.maxPhysAdded = Number(physAddsText[1].trim());                    
                }
                else if (rollText.includes("% increased Attack Speed"))
                {
                    attackSpeedAdded = rollText.replace("% increased Attack Speed",'');
                    newItem.attackSpeedAdded = Number(attackSpeedAdded.trim());                
                }
                //this gets the affix name
                affixNameText = mod.childNodes[2].innerHTML.toString();
                affixNameText = affixNameText.split('<span class="d">')[1];
                affixNameText = affixNameText.split('</span>')[0];
                twoAffixes = affixNameText.includes('+');
                modName1 = affixNameText.split('(')[0].slice(0,-1).trim();
                if (twoAffixes){
                    modName2 = affixNameText.split('(')[1].split('+')[1].trim();
                    newAffix2 = new POE2Affix();
                    AddAffix(modName2,newItem, newAffix2);
                }
                newAffix1 = new POE2Affix();
                AddAffix(modName1,newItem,newAffix1);

            });            
            newItem.CalculateValues();
            //newItem.DebugItem();
            skip = false;
            r.querySelectorAll(".content").forEach(note =>{
                note.querySelectorAll('span').forEach(node =>{
                if (node.getAttribute('id')=="Color")
                {
                    skip = true;
                    //console.log("Color");
                }
                })
                    if (!skip){

                        var addedData = newItem.InfoString().toString();
                        var newElement = document.createElement("span");
                        newElement.setAttribute('id',"Color");
                        if (newItem.___currentDivRollStrength>0.70)
                        {
                            newElement.style.color = "#c9b7bc";                
                        }
                        else if (newItem.___currentDivRollStrength>0.40)
                        {
                            newElement.style.color = "#d8de95";
                        }
                        else if(newItem.___currentDivRollStrength<=0.40)
                        {
                            newElement.style.color = "#2eff89";
                        }
                        if (newItem.isCorrupted)
                            newElement.style.color = "red";
                        newElement.innerText = addedData;
                        note.appendChild(newElement);
                        // newTxt = document.createTextNode(addedData);
                        // note.appendChild(newTxt);
                    }
            })
            UnhideAll();
            newItem.itemElement = r;
            itemList.push(newItem);
            logText.textContent = "All " + itemList.length + " items evaluated.";
        }
    );
}

function UnhideAll(){
    itemList.forEach(item => {
        item.itemElement.style.display = 'flex';
    });
    buttonList[3].disabled = true;
    buttonList[3].style.background = '#383e3c';
    buttonList[2].disabled = false;
    buttonList[2].style.background = '#156947';
    hiddenItems = false;
    logText.textContent = "Displaying all " + itemList.length + " items.";
}

function HidePerNumberOfPrefixesAndSuffixes(numAffix, numSuffix){
    hideenItemsNumber = 0;
    itemList.forEach(item => {
        if (item.prefixes.length>numAffix&&item.suffixes.length>numSuffix)
        {
            item.itemElement.style.display = 'none';
        }
        else{
            hideenItemsNumber++;
        }
    });
    buttonList[2].disabled = true;
    buttonList[2].style.background = '#383e3c';
    buttonList[3].disabled = false;
    buttonList[3].style.background = '#156947';
    hiddenItems = true;
    logText.textContent = "Displaying  " + hideenItemsNumber + " items that still has affix to roll.";
}

function SortByDivRoll(){
    itemList.sort((a,b) => a.___currentDivRollStrength - b.___currentDivRollStrength);
    SortByitemListOrder();
    logText.textContent = "Sorted by worst rolls within their damage affixes tiers.";
};

function SortByMaxDiv(){
    itemList.sort((a,b) => b._itemMaxDPS - a._itemMaxDPS);
    SortByitemListOrder();
    logText.textContent = "Sorted by max possible dps after divine.";
};

function SortByitemListOrder(){
    for (let index = 0; index < itemList.length; index++) {
        const element = itemList[index];
        resultSetContainer.appendChild(element.itemElement);
    }
}

function processAffixValues(type, v)
{
    var values = [];
    if (type == "Increased Damage")
    {
        values1 = returnValuesFromString(v[0]);
        values.push(values1[0],values1[1]);
        //console.log(values[0] + ', ' + values[1]);
        return values;
    }
    else if (type == "Added Damage")
    {
        values1 = returnValuesFromString(v[0]);
        values2 = returnValuesFromString(v[1]);        
        values.push(values1[0],values1[1],values2[0],values2[1]);
        //console.log(values[0] + ', ' + values[1]);
        return values;
    }
    else{
        values.push(null,null);
        return values;
    }
}

function returnValuesFromString(myString)
{
    values = [];
    dmgString = myString.replace('(','').replace(')','');
    dmgArray = dmgString.split('–');
    //console.log("Debug: " + myString)
    values.push(Number(dmgArray[0].trim()));
    if (dmgArray.length>1)
    {
        values.push(Number(dmgArray[1].trim()));                
    }
    else
    {
        values.push(Number(dmgArray[0].trim()));
    }            
    return values;
}

function AddAffix(name, item, affix)
{
    data.mods.forEach(m => {
        m.mods.forEach(a => {
            if (a.name == name)
            {
                                    var v = processAffixValues(m.affixType,a.values);
                //console.log(v[0] + ', ' + v[1]);                                      
                var min1 = v[0];
                var max1 = v[1];
                var min2 = null;
                var max2 = null;

                if (v.length>2){
                    min2 = v[2];
                    max2 = v[3];
                    //console.log(v[2] + ', ' + v[3]);
                }

                affix.InitializeAffix(m.affixFamily, m.affixType, a.name ,a.tier ,m.affixPosition,min1,max1,min2,max2);
                item.AddAffix(affix);
            }
        })
    })
}
