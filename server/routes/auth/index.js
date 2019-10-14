const express = require('express');
const router = express.Router();
const db = require('../../model/db');
const conv = require('../../other/convert');


/* 권한 체크 라우터 */

// 회원가입창 - 이메일 중복 체크
router.post('/email', async(req,res)=>{
    let { email }  =req.body;
    const sql = "select mem_idx from shop_member where mem_email = :0";
    const result = await db.getResult(sql, [email]);
    if(!result) {
        res.render('fail');
    }
    let data = {};
    if(result.rows.length==0) {
        data.available = true;
        data.useremail = email;
    } else {
        data.available = false;
        data.useremail = email;
    }
    res.json(data);
})


// 회원가입 처리
router.post('/join', async (req,res)=>{
    let inputpwd = req.body.upwd1;
    let output, result;
    try {
        output = await conv.convert(inputpwd);
    } catch(err){
        console.log('convert error'+err);
        res.render('fail');
    }
    
    let data = {
        email      : req.body.uemail,
        pwd        : output.hashpwd,
        salt       : output.salt,
        name       : req.body.uname,
        birth      : req.body.ubirth1+'-'+req.body.ubirth2+'-'+req.body.ubirth3,
        tel        : req.body.utel,
        eventagree : (req.body.eventagree)? req.body.eventagree:'no' 
    };
    let sql = `insert into shop_member values(
               mem_idx_seq.nextval, :name, :pwd, :salt, :email, :tel,
               :birth, null, 1000, :eventagree, 0, sysdate, 0)`;
    try {
        result = await db.getResult(sql, data);
    } catch(err){
        console.log('회원가입 처리 오류'+err);
        res.render('fail');
    }

    let n = parseInt(result.rowsAffected);
    if(n>0) {
        res.render('users/mypage_welcome',{name: req.body.uname});
    } else {
        res.render('fail'); 
    }
       
});

//로그인 처리
router.post('/login', async (req,res)=>{
    let data = {
        email : req.body.uemail
    };
   let result = {};
   let sql = "select * from shop_member where mem_email = :email";
   try {
        //이메일이 있는지 확인
        result = await db.getResult(sql, data); 
        if(result.rows.length < 1) res.render('fail');
       
    } catch(err) {
        console.error(err);
    }
        // 존재하는 이메일이라면 비밀번호 확인
    try {
        let output 
        = await conv.match(result.rows[0][3], req.body.upwd); // salt, input password
        if(!output) res.render('fail');    // 결과가 없을 시 다시 뒤로
        if(output === result.rows[0][2]) { // hash password
            let user = {
                idx     : result.rows[0][0],  name      : result.rows[0][1],
                email   : result.rows[0][4],  tel       : result.rows[0][5],
                birth   : result.rows[0][6],  img       : result.rows[0][7], 
                mileage : result.rows[0][8],  agreement : result.rows[0][9], 
                status  : result.rows[0][10], jdate     : result.rows[0][11], 
                pln_mlg : result.rows[0][12]
            };

            let sql ="select count(cart_id) from cart where mem_idx_fk = :0";
            let cidResult = await db.getResult(sql, [user.idx]);
            await setSession(req, user, cidResult.rows);
            res.locals.nextUrl = "";
            if(req.session.next_url) {
                res.locals.nextUrl = req.session.next_url.nextUrl;
                res.render("users/checkLoginSession");
            } else {
                res.redirect("/");
            }
        } else {
            res.render('fail'); //실패 시
        }
    } catch(err) {
        console.error(err);
    }

});
let setSession = (req, user, result)=>{
    if(!req.session.logged) {
        req.session.logged = { isLogin : true };
    }
    if(!req.session.loginUser){
        req.session.loginUser = {
            idx       : user.idx,       name    : user.name,
            email     : user.email,     tel     : user.tel,
            birth     : user.birth,     img     : user.img, 
            originImg : null,           mileage : user.mileage,
            agreement : user.agreement, status  : user.status,
            jdate     : user.jdate,     pln_mlg : user.pln_mlg, authorized: true
        }
    }
    if(!req.session.cartNum) {
        let num = 0;
        req.session.cartNum = result[0][0] || num; 
    }
    
}

// 이메일 찾기
router.post('/findemail',async (req,res)=>{
    let user = { 
        uname: req.body.email,
        utel: req.body.tel
    };
    let sql = `select mem_email, mem_jdate from shop_member 
               where mem_name = :uname and mem_tel = :utel`;
    let result = await db.getResult(sql, user);
    let data = {};
    if(result.rows.length > 0) {
        data = {
            exist : true,
            user  : result.rows[0]
        }
    } else {
        data = {
            exist : false,
            user  : ''
        }
    }
    res.json(data);
})


module.exports = router;