const mongoose=require("mongoose")

const validateEmail = (e)=>{
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(e); 
}

const UserAccountSchema=new mongoose.Schema({
    name : {
        type : String,
        required: [true,"Name is rquired"]
    },
    email : {
        type : String,
        required:[true,"Email is required"],
        validate:validateEmail,
        unique: true
    },
    password : {
        type : String,
        required: [true,"password is rquired"]
    }
   
})

const UserAccountModel=mongoose.model("accounts",UserAccountSchema)
module.exports=UserAccountModel