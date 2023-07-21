let APIKey = "652f4dc3d5f0f3f97a539615c24f47e3";
let todaysURL = "https://api.openweathermap.org/data/2.5/weather?q=";
let forecastURL = "https://api.openweathermap.org/data/2.5/forecast?lat=";

var resultTextEl = document.querySelector("#result-text");
var resultContentEl = document.querySelector("#result-content");
var searchFormEl = document.querySelector("#search-form");
var cityName = document.querySelector("#city-name");
var cityTemp = document.querySelector("#city-temp");
var cityWind = document.querySelector("#city-wind");
var cityHumidity = document.querySelector("#city-humidity");
var cityDetails = document.querySelector("#city-details");
var todaysResults = document.querySelector("#todays-results-container");
var futureResults = document.querySelector("#future-results");
var cacheDiv = document.querySelector("#cache-data");
var cityHistory = [];
var today = dayjs();
var todaysDate = today.format("dddd  MMMM D, YYYY");
var cacheDataArray = [];

// assign the background image based on the weather
function weatherBgImage(weather, id) {
  var element = id == "today" ? todaysResults : document.querySelector(id);
  element.classList.remove("sunny");
  element.classList.remove("cloudy");
  element.classList.remove("rainy");
  switch (weather) {
    case "Clear":
      element.classList.add("sunny");
      break;
    case "Clouds":
      element.classList.add("cloudy");
      break;
    case "Rain":
      element.classList.add("rainy");
      break;
  }
}

// display the data in the ui
function showResultsUI(cityObj) {
  todaysResults.classList.remove("hidden");
  futureResults.classList.remove("hidden");
  cityName.textContent = cityObj.name + " ( " + cityObj.today.date + " ) ";
  cityTemp.textContent = " ★ Temperature: " + cityObj.today.temp + " °F";
  cityWind.textContent = " ★ Wind: " + cityObj.today.wind + " MPH";
  cityHumidity.textContent = " ★ Humidity: " + cityObj.today.humidity + "%";
  weatherBgImage(cityObj.today.weather, "today");
  cityObj.future.forEach((element, i) => {
    var boxElement = document.querySelector("#f-" + i);
    boxElement.querySelector(".city-date").textContent =
      element.date.split(" ")[0];
    boxElement.querySelector(".city-temp").textContent =
      "Temperature: " + element.temp + " °F";
    boxElement.querySelector(".city-wind").textContent =
      "Wind: " + element.wind + " MPH";
    boxElement.querySelector(".city-humidity").textContent =
      "Humidity: " + element.humidity + " %";
    weatherBgImage(element.weather, "#f-" + i + "-c");
  });

  getCacheData();
}

// check if the city exists in local storage array
function doesCityAlreadyExists(city) {
  function isKeyInArray(city, array) {
    return array.findIndex((obj) => city == obj.name);
  }
  var cityIndexInArray = isKeyInArray(city, cacheDataArray);
  return cityIndexInArray;
}

// save the city in local storage
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

// make the api calls to retrieve the data
function callApis(city) {
  // We first call todays api
  todaysURL += city + "&appid=" + APIKey + "&units=imperial";

  fetch(todaysURL)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then(function (data) {
      var cityInfo = data;
      var cityObj = {
        name: city,
        today: {
          date: todaysDate,
          temp: cityInfo.main.temp,
          wind: cityInfo.wind.speed,
          humidity: cityInfo.main.humidity,
          weather: cityInfo.weather[0].main,
        },
        future: [],
      };
      // We secondly call the forecast api
      forecastURL +=
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
              weather: futureDays[x].weather[0].main,
            };
            cityObj.future.push(forecastDay);
            x += 8; // fix this
          }
          saveCity(cityObj);
          showResultsUI(cityObj);
        })
        .catch(function (error) {
          ack("❌ Unable to get ypur city");
        });
    })
    .catch(function (error) {
      ack("❌ Unable to get ypur city");
    });
}

// the search button was clicked
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
      ack("✅  Data preloaded");
      showResultsUI(cacheDataArray[cityIndexInArray]);
    } else {
      ack("🔎 Searching for your city in this new date");
      callApis(city);
    }
  } else {
    ack("🔎 Searching for your city...");
    callApis(city);
  }
}

// the cache city was clicked
function searchCacheClicked(event) {
  event.preventDefault();
  var city = event.target.innerText;
  var cityIndexInArray = doesCityAlreadyExists(city);
  if (cityIndexInArray >= 0) {
    if (cacheDataArray[cityIndexInArray].today.date === todaysDate) {
      ack("✅  Data preloaded");
      showResultsUI(cacheDataArray[cityIndexInArray]);
    } else {
      ack("🔎 Searching for your city in this new date");
      callApis(city);
    }
  } else {
    ack("🔎 Searching for your city...");
    callApis(city);
  }
}

// enable the submit action to the search button
searchFormEl.addEventListener("submit", searchClicked);

function displayCacheDataCities(data) {
  cacheDiv.innerHTML = ""; // clear cache buttons first to recreate
  data.forEach((city) => {
    var buttonElement = document.createElement("button");
    buttonElement.textContent = city.name;
    buttonElement.setAttribute("id", city.name);
    buttonElement.className = "btn btn-secondary btn-block";
    buttonElement.addEventListener("click", searchCacheClicked);
    cacheDiv.append(buttonElement);
  });
}

// get cache data from local storage
function getCacheData() {
  var data = JSON.parse(localStorage.getItem("data")); // convert the string to json to use it
  if (data) {
    displayCacheDataCities(data);
    cacheDataArray = data; // Update our array to be equals as the local storage one!
  } else {
    localStorage.setItem("data", JSON.stringify(cacheDataArray));
  }
}

// show notification
function ack(text) {
  var notification = document.getElementById("ack");
  var notificationText = document.getElementById("ack-text");
  notificationText.textContent = text;
  notification.style.display = "block"; // display notification
  setTimeout(function () {
    notification.style.display = "none"; // hide notiification
  }, 1000);
}

getCacheData();
