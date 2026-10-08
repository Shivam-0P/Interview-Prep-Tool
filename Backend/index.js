const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config();

const DBconnect = require('./Db/Db')
const routes = require('./Routes/Routes')

DBconnect();
const app = express()


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
const PORT = process.env.PORT || 4000;

app.use('/',routes)

app.listen(PORT,()=>{
	console.log(`app is running PORT ${PORT}`);
})
