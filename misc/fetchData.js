
async function getData(url) {
  const response = await fetch(url);

  return response.json();
}
urlData = 'https://gist.githubusercontent.com/JohnnyDalvi/430591fccc79d0451791f954b8f4dc56/raw/6491ab06a3830e7b58b55c7f66e44e6eeaad91b4/affixJson.json';
data = await getData(urlData);
console.log({data})
