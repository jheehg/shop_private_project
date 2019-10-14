const express = require('express');
const router = express.Router();
const conv = require('../../../other/convert');
const db = require('../../../model/db');
const multer = require('multer');
const maxFileSize = 20*1024*1024;
const cache = require('memory-cache');


const storage = multer.diskStorage({
    destination: (req,file,cb)=>{ 
        cb(null, 'public/upload');
    },
    filename: (req, file,cb)=>{
        let fname = Date.now()+'_'+file.originalname;
        cb(null,fname);
    }
})

const upmulter = multer({
    storage : storage,
    limits: {
        fileSize: maxFileSize
    }
})

// 회원 수정
router.post('/edit', upmulter.single('editImg'), async(req,res)=>{
   let cdata = {};
   
    try {
        cdata = await conv.convert(req.body.editPwd1);
  } catch(err) {
        console.error('convert error'+err);
        res.json({result: 0});
        return;
  }
    let edit = {
        uidx   : req.body.editIdx,
        uname  : req.body.editName,
        utel   : req.body.editTel,
        usalt  : cdata.salt,
        upwd   : cdata.hashpwd,
        uimg   : req.file? req.file.filename:'', 
        uagree : (req.body.editAgree)? 'yes':'no'
    }

    let sql1 = `update shop_member set mem_name = :uname, mem_tel = :utel,
                mem_salt = :usalt, mem_pwd = :upwd, mem_img = :uimg,
                mem_agreement = :uagree where mem_idx = :uidx`;
    let resultData;
   try {
        let sql2 = "select mem_img from shop_member where mem_idx = :0";
        // 기존에 저장한 이미지 유지할 경우
        if(!req.file){
            let getimg = await db.getResult(sql2,[req.body.editIdx]);
            edit.uimg = getimg.rows[0][0];
        }
        let result = await db.getResult(sql1, edit);
   
    if(!result || result.rowsAffected < 1) { 
        resultData = { result : 0 }; 
    } else {
        //session 수정하기
        let originalname = req.file? req.file.originalname : null;
    
        editSession(req, edit, originalname);
        resultData = {
            result       : 1,
            newimg       : req.session.loginUser.img,
            newOriginImg : req.session.loginUser.originImg
        };
    }
    res.json(resultData);
    return;
   } catch(err) {
       console.error('회원 수정 오류'+err);
       res.json({result: 0});
   }
      
})

// 회원 수정된 부분 세션에 반영
let editSession = (req, edit, originalname)=>{ 
   let user       = req.session.loginUser;
   user.name      = edit.uname;
   user.tel       = edit.utel;
   user.img       = edit.uimg;
   user.originImg = originalname;
   user.agreement = edit.uagree;
}

const makeRanNum = ()=>{
    let arr = [];
    for(let i=0; i<6; i++){
       let num =  Math.floor(Math.random()*10);
       arr.push(num);
    }
    return arr.join().replace(/,/g, '');
}

//핸드폰 본인인증 메세지 요청
router.post('/smsAPIrequest', async(req,res)=>{
    const request = require('request');
    let { phoneNumber } = req.body;

    let ranNum = makeRanNum();

    let serviceId = '{serverId}';
    let url = `https://api-sens.ncloud.com/v1/sms/services/${serviceId}/messages`;

    let data = {
        uri : url,
        method: 'POST',
        headers: {
            'Content-Type'         : 'application/json; charset=utf-8',
            'x-ncp-auth-key'       : '{accessKey}',
            'x-ncp-service-secret' : '{secretKey}'

        },
        body : {
            "type"       : "SMS",
            "contentType": "COMM",
            "countryCode": "82",
            "from"       : "{phone number}",
            "to"         : [ "{phone number}" ],
            "subject"    : "",
            "content"    : `[ SELFELF 인증 ] 인증번호 ${ranNum}를 눌러주세요`
     },

        json: true
    }
    request(data, (err, req, body)=>{
        if(err){
            console.log(err);
            res.json({ result: 0 });
            return;
        }
        //오류 없다면 memory-cache에 (연락처, 인증번호) 저장
        let obj = cache.put(phoneNumber, ranNum, 35000); 
        if(obj === ranNum) {
            console.log(ranNum);
            res.json({ result: 1 }); //저장 후 전송
        }
    });    
})

//사용자가 보낸 인증번호 확인하기
router.post('/cfVeliNum', async(req,res)=>{
    let { inputNum, inputTel } = req.body;
    //console.log(inputTel, inputNum);
    if(!inputNum || !inputTel){
        res.json({ result: 0 });
        return;
    }
    if(cache.get(inputTel)){ //해당 cache가 존재한다면
        if(cache.get(inputTel)==inputNum){
            cache.del(inputTel); //인증 확인 후 삭제
            res.json({ result: 1 });
            return;
        } else {
            res.json({ result: 'wrong' });
            return;
        }
    } else {
        res.json({ result: 0 });
    }

})


module.exports = router;

