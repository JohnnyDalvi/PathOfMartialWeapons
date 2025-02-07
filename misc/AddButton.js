searchBar = document.querySelector("#trade > div.top > div");

CreateButton(() => console.log("Test"),"Sort by max divDPS");
CreateButton(() => console.log("Test"),"Sort by lowest rolls");
CreateButton(() => console.log("Test"),"Hide 6 affixes items");
CreateButton(() => console.log("Test"),"Unhide All items");
CreateButton(() => console.log("Test"),"Reevaluate All items");

logText = document.createElement('text');
logText.textContent = "Debugging....";
logText.style.color = '#e2e2e2';
logText.style.fontSize = '20px';
logText.style.fontFamily = "FontinSmallcaps, San-Serif";
logText.style.marginLeft = "20px";

searchBar.appendChild(logText);

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
    // newButton.addEventListener("keydown", console.log("IHUUU"));    
    // newButton.addEventListener("mouseup", console.log("IHUUU2"));    

    searchBar.appendChild(newButton);
}

function changeColor(button,code)
{
    if (code == 0)
    {
        button.style.background = '#31a174';
    }
    else if (code == 1)
    {
        button.style.background = '#156947';
    }
}