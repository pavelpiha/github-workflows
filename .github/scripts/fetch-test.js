const axios = require("axios");

async function fetchData() {
  try {
    const response = await axios.get("https://dummyjson.com/products/1");
    console.log("Data:", response.data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

fetchData();
