const express = require("express")

const app = express()

app.get('/', (req, res) => res.send("API running"))

const PORT = process.env.PORT || 5000 //Either look for an environment variable called PORT or listen on port 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))