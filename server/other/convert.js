const crypto = require('crypto');

exports.convert = (inputpwd)=>{
        let salt = Math.round((new Date().valueOf() * Math.random())) + "";
        let hashpwd = crypto.createHash("sha512").update(inputpwd + salt).digest("hex");
        let data = { salt, hashpwd }
       
        return data;     
}

exports.match = (salt, inputpwd)=>{
        let hashpwd 
        = crypto.createHash("sha512").update(inputpwd + salt).digest("hex");
       
        return hashpwd;
}
