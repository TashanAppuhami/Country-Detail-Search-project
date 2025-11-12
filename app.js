console.log("Hiii");

let countryName = document.getElementById("txtInput").value;

function searchCountry() {

    fetch("https://restcountries.com/v3.1/name/" + countryName)
        .then(res => res.json())
        .then(data => {

            document.getElementById("country").innerHTML = `
    <h1>Country Name: ${data[0].name.common}</h1>
    <h2>Capital: ${data[0].capital[0]}</h2>
    <h3>Region: ${data[0].region}</h3>
    <h3>Population: ${data[0].population}</h3>
    <img src="${data[0].flags.png}" alt="Flag">
    <img src="${data[0].coatOfArms.png}"  alt="Coat of Arms">
    <h3>Timezones: ${data[0].timezones}</h3>
    <h3>Languages: ${Object.values(data[0].languages).join(", ")}</h3>
    <h4>Currency: ${Object.values(data[0].currencies).map(curr => curr.name).join(", ")}</h4>
    <h1>Currency Symbol: ${Object.values(data[0].currencies).map(curr => curr.symbol).join(", ")}</h1>
    <h3>Border Countries: ${data[0].borders ? data[0].borders.join(", ") : 'N/A'}</h3>
    <h3>Region : ${data[0].region}</h3>
    <h3>Start of Week : ${data[0].startOfWeek}</h3>
    `
        })
        data=null;
}
