const express = require('express');
const router = express.Router();
const db = require('../model/db');


//index 
router.get('/', (req,res)=>{
    res.render('index');
})


//회원 약관동의 페이지
router.get('/agreement', (req,res)=>{
    res.render('agreement');
})

//회원가입 페이지
router.get('/join', (req,res)=>{
    res.render('join');
})


//로그인 페이지
router.get('/login', (req,res)=>{
   res.render('login'); 
  
})

//로그아웃 페이지
 router.get('/logout', (req,res)=>{
     if(req.session.loginUser) {
         req.session.destroy((err)=>{
             if(err) {
                 console.log(err);
             } 
             res.redirect('/');
         }); 
     } else {
         res.redirect('/');
     }
 }) 

 
//공지 페이지
router.get('/notice', async(req,res)=>{
    let sql  = "select * from notice order by notice_list desc";
    let result = await db.getResult2(sql);
    
    let data = { row : result.rows };
   
    res.render('notice', data);
})

//이메일 찾기
router.get('/findemail',(req,res)=>{
    res.render('findemail');
})

//비밀번호 찾기
router.get('/findpwd',(req,res)=>{
    res.render('findpwd');
})



module.exports = router;