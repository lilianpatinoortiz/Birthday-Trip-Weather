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
var APIKey = "652f4dc3d5f0f3f97a539615c24f47e3";

function printResults(resultObj) {
  console.log(resultObj);
}

function showResultsUI() {
  todaysResults.classList.remove("hidden");
  futureResults.classList.remove("hidden");
}

// update the local storage
function saveCity(cityObj) {
  // check if the city exists in local storage array
  function isKeyInArray(key, array) {
    return array.findIndex((obj) => key == obj.name);
  }

  var cityIndexInArray = isKeyInArray(cityObj.name, cacheDataArray);
  if (cityIndexInArray >= 0) {
    // city needs to updated
    cacheDataArray[cityIndexInArray] = cityObj;
  } else {
    // city needs to be created
    cacheDataArray.push(cityObj);
  }
  localStorage.setItem("data", JSON.stringify(cacheDataArray)); // convert the json to string to save it in local storage
}

function searchApi(city) {
  var queryURL =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    APIKey;

  fetch(queryURL)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      var cityInfo = data;
      var cityObj = {
        name: city,
        today: {
          temp: cityInfo.main.temp,
          wind: cityInfo.wind.speed,
          humidity: cityInfo.main.humidity,
        },
        future: {},
      };

      // show the data in the ui
      showResultsUI();
      saveCity(cityObj);
    })
    .catch(function (error) {
      console.error(error);
    });
}

function searchClicked(event) {
  event.preventDefault();

  var city = document.querySelector("#search-input").value;

  if (!city) {
    alert("You need a search input value!");
    return;
  }
  searchApi(city);

  cityName.textContent =
    city + " ( " + today.format("dddd  MMMM D, YYYY") + " ) ";
}

searchFormEl.addEventListener("submit", searchClicked);

function displayCacheDataCities(data) {
  data.forEach((city) => {
    var buttonElement = document.createElement("button");
    buttonElement.textContent = city.name;
    buttonElement.setAttribute("id", city.name);
    buttonElement.className = "btn btn-secondary btn-block";
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
