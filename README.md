# PathOfMartialWeapons
This is a tool made to help filter martial weapons on the poe2 trade website

------------------------

Version 0.1 ---- This is an early version, and will only work with rare/magic bows for now.

- Calculates DPS with iron runes (even if it has something equipped);
- Calculates what is the minimum and maximum possible DPS after using a divine orb;
- Says how good is the current item rolls within their affixes brackets in percentage;
- Allow for hide and unhide items from the trading results that have all affixes already rolled;
- Can sort the items based on maximum possible DPS after divines;
- Can sort the items based on current rolls within their brackets.

------------------------

How to install?

Option 1 (Chrome only) - unpacked chrome extension:

* Download the repository and unpack it;
* Inside google, go to Manage Extensions;
* Activate Developer Tools (top right of the manage extension screen);
* Load Unpacked (select the folder named "poe2-JDBowFilter" that you unzipped);

-> This method will add a button to access this extension inside the extension icon to the right of the search bar, just press it whenever you finished your search for a bow in the trading website and it will evaluate your results;



Option 2 (Tested with both chrome and firefox) - Copy and paste script:

* Copy the all the text from the file [scripst/bowFilter.js](https://github.com/JohnnyDalvi/PathOfMartialWeapons/blob/main/poe2-JDBowFilter/scripts/bowFilter.js);
* Open the developer tool (F12 on chrome);
* Go to Console, paste the code and press enter;
