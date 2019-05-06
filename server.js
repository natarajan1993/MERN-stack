const express = require("express")
const connectDB = require("./config/db")


const app = express()
connectDB(); // Connect Database

app.get('/', (req, res) => res.send("API running"))

// Init Middleware
app.use(express.json({
    extended: false
})); // parses the body of the request sent by the User model

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));


const PORT = process.env.PORT || 5000 //Either look for an environment variable called PORT or listen on port 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))