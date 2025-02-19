import dotenv from "dotenv";
dotenv.config();

export default async function getWeather(req, res) {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3`
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const currentWeather = {
            city: data.location.name,
            country: data.location.country,
            time: data.location.localtime,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
            icon: data.current.condition.icon,
            wind: data.current.wind_kph,
            humidity: data.current.humidity
        }

        const hourlyWeatherToday = data.forecast.forecastday[0].hour.map(hour => ({
            time: hour.time,
            temperature: hour.temp_c,
            condition: hour.condition.text,
            icon: hour.condition.icon,
            wind: hour.wind_kph
        }))

        const forecastWeather = data.forecast.forecastday.map(day => ({
            date: day.date,
            max_temp: day.day.maxtemp_c,
            min_temp: day.day.mintemp_c,
            condition: day.day.condition.text,
            icon: day.day.condition.icon
        }))

        const hourlyWeather = data.forecast.forecastday.map(day => ({
            date: day.date,
            hours: day.hour.map(hour => ({
                time: hour.time,
                temperature: hour.temp_c,
                wind: hour.wind_kph,
                condition: hour.condition.text,
                icon: hour.condition.icon
            }))
        }))
        return res.status(200).json({
            currentWeather,
            hourlyWeatherToday,
            forecastWeather,
            hourlyWeather
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}
