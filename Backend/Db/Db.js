const mongoose = require('mongoose')


const DBconnect = async()=>{
  try{
		await mongoose.connect(process.env.DATABASE_URL)
    console.log("database ise connected")
	}
	catch(err){
		console.log(err.message)
	}
}

module.exports = DBconnect;