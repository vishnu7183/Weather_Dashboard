const iconMap = {
    0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
    45:'🌫️',48:'🌫️',
    51:'🌦️',53:'🌦️',55:'🌧️',
    61:'🌧️',63:'🌧️',65:'🌧️',
    71:'❄️',73:'❄️',75:'❄️',
    80:'🌦️',81:'🌧️',82:'🌧️',
    95:'⛈️'
};

const textMap = {
    0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
    45:'Fog',48:'Fog',
    51:'Drizzle',53:'Drizzle',55:'Heavy drizzle',
    61:'Rain',63:'Rain',65:'Heavy rain',
    71:'Snow',73:'Snow',75:'Heavy snow',
    80:'Rain showers',81:'Rain showers',
    95:'Thunderstorm'
};

const getIcon = c => iconMap[c] || '☁️';
const getText = c => textMap[c] || 'Unknown';

const cityInput = document.getElementById("cityInput");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const weatherContent = document.getElementById("weatherContent");

async function getCoords(city){
    const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const data = await res.json();
    if(!data.results) throw new Error("City not found");
    return data.results[0];
}

async function getWeather(lat,lon){
    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    return res.json();
}

function updateCurrent(loc,w){
    const c = w.current;
    locationName.textContent = `${loc.name}, ${loc.country}`;
    date.textContent = new Date().toDateString();
    currentIcon.textContent = getIcon(c.weather_code);
    temperature.textContent = Math.round(c.temperature_2m) + "°C";
    description.textContent = getText(c.weather_code);
    feelsLike.textContent = Math.round(c.apparent_temperature) + "°C";
    humidity.textContent = c.relative_humidity_2m + "%";
    windSpeed.textContent = Math.round(c.wind_speed_10m) + " km/h";
    pressure.textContent = Math.round(c.pressure_msl) + " hPa";
}

function updateHourly(w){
    hourlyForecast.innerHTML = "";
    for(let i=0;i<24;i++){
        hourlyForecast.innerHTML += `
            <div class="hourly-item">
                ${new Date(w.hourly.time[i]).getHours()}:00<br>
                ${getIcon(w.hourly.weather_code[i])}<br>
                ${Math.round(w.hourly.temperature_2m[i])}°C
            </div>`;
    }
}

function updateDaily(w){
    dailyForecast.innerHTML = "";
    for(let i=0;i<7;i++){
        dailyForecast.innerHTML += `
            <div class="daily-item">
                ${i===0?'Today':
                new Date(w.daily.time[i]).toLocaleDateString('en',{weekday:'short'})}<br>
                ${getIcon(w.daily.weather_code[i])}<br>
                ${Math.round(w.daily.temperature_2m_max[i])}° /
                ${Math.round(w.daily.temperature_2m_min[i])}°
            </div>`;
    }
}

async function searchWeather(){
    const city = cityInput.value.trim();
    if(!city) return;

    loading.style.display = "block";
    weatherContent.style.display = "none";
    errorMsg.style.display = "none";

    try{
        const loc = await getCoords(city);
        const w = await getWeather(loc.latitude, loc.longitude);
        updateCurrent(loc,w);
        updateHourly(w);
        updateDaily(w);
        weatherContent.style.display = "block";
    }catch(e){
        errorMsg.textContent = e.message;
        errorMsg.style.display = "block";
    }
    loading.style.display = "none";
}

cityInput.addEventListener("keypress",e=>{
    if(e.key==="Enter") searchWeather();
});

searchWeather();