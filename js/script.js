//display-search.js
let APIKey = "652f4dc3d5f0f3f97a539615c24f47e3";

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
var todaysDate = today.format("dddd  MMMM D, YYYY");
var cacheDataArray = [];

function showResultsUI(cityObj) {
  todaysResults.classList.remove("hidden");
  futureResults.classList.remove("hidden");
  console.log("Ready to display in the interface:");
  console.log(cityObj);
  cityName.textContent = cityObj.name + " ( " + cityObj.today.date + " ) ";
  cityTemp.textContent = " ★ Temperature: " + cityObj.today.temp + " °F";
  cityWind.textContent = " ★ Wind: " + cityObj.today.wind + " MPH";
  cityHumidity.textContent = " ★ Humidity: " + cityObj.today.humidity + "%";
}

function doesCityAlreadyExists(city) {
  // check if the city exists in local storage array
  function isKeyInArray(city, array) {
    return array.findIndex((obj) => city == obj.name);
  }
  var cityIndexInArray = isKeyInArray(city, cacheDataArray);
  return cityIndexInArray;
}

function saveCity(cityObj) {
  var cityIndexInArray = doesCityAlreadyExists(cityObj.name);
  if (cityIndexInArray >= 0) {
    // update data for the city
    cacheDataArray[cityIndexInArray] = cityObj;
  } else {
    // add the new city
    cacheDataArray.push(cityObj);
  }
  localStorage.setItem("data", JSON.stringify(cacheDataArray)); // convert the json to string to save it in local storage
}

function callApis(city) {
  // We first call todays api
  var todaysURL =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    APIKey +
    "&units=imperial";

  fetch(todaysURL)
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
          date: todaysDate,
          temp: cityInfo.main.temp,
          wind: cityInfo.wind.speed,
          humidity: cityInfo.main.humidity,
        },
        future: [],
      };
      // We secondly call the forecast api
      var forecastURL =
        "http://api.openweathermap.org/data/2.5/forecast?lat=" +
        cityInfo.coord.lat +
        "&lon=" +
        cityInfo.coord.lon +
        "&appid=" +
        APIKey +
        "&units=imperial";
      fetch(forecastURL)
        .then(function (response) {
          if (!response.ok) {
            throw response.json();
          }
          return response.json();
        })
        .then(function (data) {
          cityObj.future = [];
          futureDays = data.list;
          for (var x = 0; x < futureDays.length; x++) {
            var forecastDay = {
              date: futureDays[x].dt_txt,
              temp: futureDays[x].main.temp,
              wind: futureDays[x].wind.speed,
              humidity: futureDays[x].main.humidity,
            };
            cityObj.future.push(forecastDay);
            x += 8;
          }
          saveCity(cityObj);
          showResultsUI(cityObj);
        })
        .catch(function (error) {
          console.error(error);
        });
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

  var cityIndexInArray = doesCityAlreadyExists(city);
  if (cityIndexInArray >= 0) {
    if (cacheDataArray[cityIndexInArray].today.date === todaysDate) {
      console.log("Ready to display data from cache...");
      showResultsUI(cacheDataArray[cityIndexInArray]);
    } else {
      console.log("Ready to search new city because the date changed...");
      callApis(city);
    }
  } else {
    console.log("Ready to search new city...");
    callApis(city);
  }
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
