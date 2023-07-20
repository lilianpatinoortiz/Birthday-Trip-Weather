//display-search.js

var resultTextEl = document.querySelector("#result-text");
var resultContentEl = document.querySelector("#result-content");
var searchFormEl = document.querySelector("#search-form");
var cityName = document.querySelector("#city-name");
var cityTemp = document.querySelector("#city-temp");
var cityWind = document.querySelector("#city-wind");
var cityHumidity = document.querySelector("#city-humidity");
var cityDetails = document.querySelector("#city-details");
var todaysResults = document.querySelector("#todays-results");
var futureResults = document.querySelector("#future-results");
var cacheDiv = document.querySelector("#cache-data");
var cityHistory = [];
var today = dayjs();
var cacheDataArray = [];

function printResults(resultObj) {
  console.log(resultObj);
}

function showResultsUI() {
  todaysResults.classList.remove("hidden");
  futureResults.classList.remove("hidden");
}

function searchApi(query) {
  var locQueryUrl = "https://www.loc.gov/search/?fo=json";
  locQueryUrl = locQueryUrl + "&q=" + query;

  fetch(locQueryUrl)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      if (!data.results.length) {
        console.log("No results found!");
      } else {
        for (var i = 0; i < data.results.length; i++) {
          printResults(data.results[i]);
        }
      }
      // show the data in the ui
      showResultsUI();
    })
    .catch(function (error) {
      console.error(error);
    });
}

// update the local storage
function saveCity(city) {
  // check if the city exists in local storage array
  function isKeyInArray(key, array) {
    return array.findIndex((obj) => key == obj.name);
  }

  var cityWeather = { name: city, today: [], future: [] };
  // check if key exists
  var cityIndexInArray = isKeyInArray(city, cacheDataArray);
  if (cityIndexInArray >= 0) {
    // city needs to updated
    cacheDataArray[cityIndexInArray].today = "Updated data";
  } else {
    // city needs to be created
    cacheDataArray.push(cityWeather);
  }
  localStorage.setItem("data", JSON.stringify(cacheDataArray)); // convert the json to string to save it in local storage
}

function searchClicked(event) {
  event.preventDefault();

  var searchInputVal = document.querySelector("#search-input").value;

  if (!searchInputVal) {
    alert("You need a search input value!");
    return;
  }
  // if city is not in chache, add it
  saveCity(searchInputVal);
  searchApi(searchInputVal);

  cityName.textContent =
    searchInputVal + " ( " + today.format("dddd  MMMM D, YYYY") + " ) ";
}

searchFormEl.addEventListener("submit", searchClicked);

function displayCacheDataCities(data) {
  data.forEach((city) => {
    var buttonElement = document.createElement("button");
    buttonElement.textContent = city.name;
    buttonElement.setAttribute("id", city.name);
    buttonElement.className = "btn btn-secondary btn-block";
    // assign id as city name
    cacheDiv.append(buttonElement);
  });
}

function getCacheData() {
  var data = JSON.parse(localStorage.getItem("data")); // convert the string to json to use it
  if (data) {
    displayCacheDataCities(data);
    cacheDataArray = data; // Update our array to be equals as the local storage one!
  } else {
    localStorage.setItem("data", JSON.stringify(cacheDataArray));
  }
}

getCacheData();
