const express = require('express');
const router = express.Router();
const db = require('../../model/db');
const query = require('../../model/query');
const paging = require('../../other/paging');
const multer = require('multer');
const maxFileSize = 20*1024*1024;

// 저장될 파일경로, 파일명 지정
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


// 마이페이지 홈 : /users
router.get('/',async(req,res)=>{ 
    let sessData;
     if(!req.session.loginUser || req.session.cartNum === undefined){
        sessData = { loginSession : false };
        res.json(sessData);
        return;
     } else {
        let uidx = req.session.loginUser.idx;
        let user = req.session.loginUser;
        let userData = {
            loginSession : true,
            useridx      : user.idx,           username : user.name,
            useremail    : user.email,         userimg : user.img,
            originImg    : user.originImg,     usermileage : user.mileage,
            pln_mlg      : user.pln_mlg,       usertel : user.tel,
            userbirth    : user.birth,         agreement : user.agreement,
            cartNum      : req.session.cartNum
           
        };
        let result;
        try {
           result = await db.getPurchaseInfo(uidx);
           if(!result) throw new Error('리턴 결과 없음');
        } catch(err){
            console.log('회원 주문관련 조회 오류 '+err);
            res.json(sessData); //session false로 데이터 전송
        }
        userData.orderCnt     = result[0].rows[0][0];
        userData.cancelCnt    = result[1].rows[0][0];
        userData.recentOrder  = result[2]? result[2].rows[0] : null;
        userData.orderListCnt = result[3]? result[3].rows : null;
        userData.wishData     = result[4]? result[4].rows : null;

        res.json(userData);
    }
})


// 마이페이지 - 적립금 페이지 : /users/mileage
router.post('/mlg', async(req,res)=>{
    if(!req.session.loginUser){
        res.json({ result : -1 });
        return;
    }
    let { uidx, opt, cpage } = req.body;
  
    if(!uidx, !opt) {
        res.json({result: 0});
        return;
    }
   
    // 마일리지 정보
    let sql1 = query.countMlgList;
    let result1 = await db.getResult(sql1, [uidx]);
    if(!result1) {
        res.json({result: 0});
        return;
    }
    if(result1.rows[0][0]===0) {
        //결제내역이 없다면 (취소 제외)
        res.json({result: [] });
        return;
    }
    let pdata = await paging.getPagingdata(cpage, result1.rows[0][0], 3, 3);
    
    let sql2 = await query.getMlgList(opt, pdata.page);
    let result2 = await db.getResult(sql2, [uidx]);
    if(!result2) { 
        res.json({ result: 0 });
        return;
    }
    if(!result2.rows.length){ //기간 내 결과가 없을때
        res.json({result: [] });
        return;
    }
    res.json({result: result2.rows, 
              page : pdata.prvnxt, 
              pageCount: pdata.pageCount});
   
})


// 마이페이지 - 구입내역 : /users/purchase
// (결제내역이 있는 회원만)
router.post('/purchase',  async(req,res)=>{
    if(!req.session.loginUser){
        res.json({ result : -1 });
        return;
    }
    let { uidx, cpage } = req.body;

    if(!uidx) {
        res.json({ result : 0 });
        return;
    }
    if(!cpage) cpage = 1; //default

    let result = await db.getPurchaseInfo(uidx, cpage, 'purchase');
    if(!result) {
        res.json({ result : 0 });
        return;
    }
   
    //1) 취소안한전체내역 수, 2) 결제내역, 3) 아이템목록, 4)페이징
    let data = { 
        orderCnt  : result[0].rows[0][0], 
        orderInfo : result[2]? result[2].rows : [[]], 
        itemList  : result[3]? result[3].rows : [[]], 
        pdata     : result[4] || null 
    };
    
    res.json({ result: data });
  
})

// 후기목록 작성 아이템 목록 가져오기 (modal)
router.post('/review/list', async(req,res)=>{
    let { oid } = req.body;

    if(!oid) {
        res.json({ result : 0 });
        return;
    }
    let sql = `select * from
               (select * from getOrderItemList) where order_id_fk = :0`;
    let result = await db.getResult(sql, [oid]);
    if(!result) {
        res.json({ result : 0 });
        return;
    }
    res.json({ result: result.rows });

})

// 주문/취소내역 조회
router.post('/purchase/detail', async(req,res)=>{
    let { oid } = req.body;

    if(!oid) {
        res.json({ result : 0 });
        return;
    }
    let result = await db.getPurchaseDetail(oid);
    if(!result) {
        res.json({ result : 0 });
        return;
    }
    res.json({ 
        result: {
            itemList    : result[0].rows,
            rcptInfo    : result[1].rows[0],
            orderDetail : result[2].rows[0]
            } 
        });

})

//주문 취소하기
router.post('/purchase/cancel', async(req,res)=>{
    let { oid } = req.body;
    
    if(!oid) {
        res.json({ result : 0 });
        return;
    }
    let sql1 = `select sum(mileage), mileage_done from order_item, order_detail 
                where order_id_fk = order_id and order_id_fk = :0
                group by mileage_done`;
    let result1 = await db.getResult(sql1, [oid]);
    if(!result1) {
        res.json({ result : 0 });
        return;
    }
    let sql2 = `update order_detail set payment_status = '취소대기중', delivery_status = '배송취소',
               cancel_stat = 'yes', cancel_date = sysdate 
               where order_id = :0`;
    let result2 = await db.getResult(sql2, [oid]);
   
    if(!result2 || result2.rowsAffected < 1) {
        res.json({ result : 0 });
        return;
    }
    let udata = req.session.loginUser;
    if(udata){
        //(result1.rows[0][1] === 'no')? //처리 안된 적립금
    }
    res.json({ result : 1 });

})



//마이페이지 -  취소,환불내역 : /users/return
router.post('/return', async(req,res)=>{
    if(!req.session.loginUser){
        res.json({ result: -1 });
        return;
    }
    let { uidx, cpage } = req.body;

    let data;
    if(!uidx) {
        res.json({ result : 0 });
        return;
    }
    if(!cpage) cpage = 1; //default

    let result = await db.getPurchaseInfo(uidx, cpage, 'cancel' );
    if(!result) {
        res.json({ result : 0 });
        return;
    } 
     
    // 1) 취소전체내역 수, 2) 취소내역, 3) 아이템목록, 4)페이징
    data = { 
        cancelCnt  : result[1].rows[0][0], 
        cancelInfo : result[2]? result[2].rows : [[]], 
        cancelList : result[3]? result[3].rows : [[]],
        pdata      : result[4]? result[4].pdata : null
    };

    res.json({ result: data });
})


// 마이페이지 - 후기작성할 리스트 : /users/review
router.get('/review', async(req,res)=>{
    if(!req.session.loginUser){
        res.json({result: -1});
        return;
    }
   const pagingBlock= 5, display = 8;
   let data;
   let { uidx, cpage } = req.query;
  
   if(!cpage) cpage = 1;

   let sql1 = query.reviewCount;
   let result1 = await db.getResult(sql1, [uidx]);
   if(!result1 || !result1.rows.length) {
       res.json({result: 0});
       return;
   }

   let pdata 
   = await paging.getPagingdata(cpage, result1.rows[0][0], display, pagingBlock);
  
   let sql2 = query.getListForReview;

   let result2 
   = await db.getResult(sql2, {uidx:uidx, st:pdata.page[0], ed:pdata.page[1]});

    if(!result2) {
        data = { result : 0};
    } else {
        data = { result : result2.rows, page: pdata.prvnxt };
    }
   
    res.json(data);
})


const removeFile = (img)=>{
    const fs = require('fs');
    const path = __dirname + '/../../public/upload/';
    let imgarr;
    if(img.indexOf('*')!== -1) imgarr = img.split('*');
    else imgarr = [ img ];
    for(let i=0; i<imgarr.length; i++){
        if(!fs.existsSync(path+imgarr[i])){
            console.log('file not exists');
            return false;
        } 
    }
    for(let i=0; i<imgarr.length; i++){
        try {
            fs.unlinkSync(path+imgarr[i]);
        } catch(err){
            console.log('파일 삭제 오류'+err);
            return false;
        }
        if(i===imgarr.length-1) {
            console.log('모든 파일 삭제 성공');
            return true;
        }           
    }   
}

const upArr = [{name:'upImg0'},{name:'upImg1'},{name:'upImg2'}];

 // 마이페이지 - 후기작성 업로드
 router.post('/review/text', upmulter.fields(upArr), async(req,res)=>{
    const success = { result : 1 };
    const fail = { result : 0 }; 
    let result;
    console.log(req.body);
    if(req.body.text === undefined || !req.body.rate || !req.body.pid ||
      !req.body.uidx || !req.body.listId || req.body.upImgList === undefined ||
      !req.body.mode) {
            res.json(fail);
            return;
        }
      
        let { text, rate, pid, uidx, listId, upImgList, savedImgName, mode } = req.body;
        console.log(text, rate, pid, uidx, listId, upImgList, savedImgName, mode);
        console.log(req.files);
        //사용자가 submit누르면 내용과 함께 처리
 
        rate = rate.split(',').filter((star)=>{
            return star === 1;
        })
        //image 포함 되었는지 체크
        let fname='', origin='';
        let _data;
        let obj = JSON.stringify(req.files, null, 2);

        //넘어온 파일명이 있다면 저장하기
        if(upImgList.length>0) {
            if(JSON.parse(obj)['upImg0'] || JSON.parse(obj)['upImg1'] || JSON.parse(obj)['upImg2']) {
                //업로드 이미지에 목록이 있어야 디비에 저장
                    //이미지 첨부했을 경우 파일명 지정
                    obj = Object.entries(JSON.parse(obj));
                    for(let i=0; i<obj.length; i++){
                        fname += obj[i][1][0]['filename'];
                        origin += obj[i][1][0]['originalname'];
                        if(i !== obj.length-1) {
                            fname+='*';
                            origin+='*';
                        }       
                    }
                    console.log(fname, origin);
                
                } else {
                     //업로드파일 없으나 기존데이터 삭제 원하지 않는 경우
                    _data = { pid: pid, text:text, point: rate.length };
                    result = await db.reviewUpdate(_data, listId, mode);
                    if(result) {
                        res.json(success); 
                        return;
                    } else { 
                        res.json(fail);
                        return;
                    }
                   
                }
        } 
       
        if(mode === 'write'){
            _data = { //신규작성
                pid:pid, uidx:uidx, text:text, fname: fname, 
                point: rate.length, origin: origin 
            };
            result = await db.reviewUpdate(_data, listId, mode);
            if(!result)  {
                res.json(fail);
                return;
            } 
            res.json(success);
            return;

        } else { //수정
            if(savedImgName.length>0){
                let _result = await removeFile(savedImgName);
                if(!_result) {
                    res.json(fail);
                    return;
                }
                _data = {
                    pid: pid, text:text, fname: fname, 
                    point: rate.length, origin: origin 
                }
                
                result = await db.reviewUpdate(_data, listId, mode);
                if(!result) {
                    res.json(fail);
                    return;
                }

            } else {
                _data = {
                    pid: pid, text:text, fname: fname, 
                    point: rate.length, origin: origin 
                }
                
                result = await db.reviewUpdate(_data, listId, mode);
                if(!result) {
                    res.json(fail);
                    return;
                }
        
            }
        }

        res.json(success);

})


//후기 수정 시 정보 불러오기
router.post('/review/edit', async(req,res)=>{
    let { listId } = req.body;
    
    if(!listId) {
        res.json({result: 0});
        return;
    }
    let sql = `select * from
              (select r.review_content, r.review_img, r.review_point, r.review_id, 
              oi.order_item_list, r.origin_img from review r, order_item oi
              where r.review_id = oi.review_id_fk ) where order_item_list = :0`;
    let result = await db.getResult(sql, [listId]);
    if(!result || !result.rows.length) {
        res.json({result: 0});
        return;
    }
    res.json({ result: result.rows });
})

//후기목록 삭제
router.delete('/review/del/:listId', async(req,res)=>{
    let { listId } = req.params;
    let data;
    // 삭제하는 글의 업로드이미지도 제거
    let _sql = `select origin_img from review where review_id = (select review_id_fk
                from order_item where order_item_list = :0)`;
    let _result = await db.getResult(_sql, [listId]);
    if(!_result) {
        res.json({result:0});
        return;
    }
    if(_result.rows.length>0){
        let isRemoved = await removeFile(_result.rows[0]);
        if(!isRemoved) {
            res.json(fail);
            return;
        }
    }
    let sql = `delete from review where review_id = 
              (select review_id_fk from order_item where order_item_list = :0)`;
    let result = await db.getResult(sql, [listId]);

    if(!result.rowsAffected || !result) {
        data = { result : 0 };
    } else {
        data = { result: 1 };
    }
    res.json(data);
    
})

// 마이페이지 - 즐겨찾기 리스트 : /users/wish
router.get('/wish', async(req,res)=>{
    if(!req.session.loginUser){
        res.json({result: -1});
        return;
    }
    let uidx = req.query.idx;
    let sql = query.getWishList;
    let result;
 
    try {
        result = await db.getResult(sql, [uidx]);
    } catch(err) {
        console.log('즐겨찾기리스트 조회오류 '+err);
    }
  
    let data;
    if(!result) {
        data = { result : 0 }
        res.json(data);
    } else {
        data = { result : result.rows }
        res.json(data);
    }
    
})

// 즐겨찾기 목록삭제
router.delete('/wish/delete', async(req,res)=>{
    let jsonData;
   
    let { uidx, wid } = req.query;
    if(!uidx || !wid) {
        jsonData = { result : 0 };
    } else {
        let sql = 'delete from wishes where mem_idx_fk = :uidx and wish_list = :wid';
        let result = await db.getResult(sql, {uidx: parseInt(uidx), wid:parseInt(wid)});
        if(result.rowsAffected < 1 || !result) {
            jsonData = { result : 0 };
        } 
        jsonData = { result : result.rowsAffected };
        
    }
    res.json(jsonData);
})


//마이페이지 - 회원탈퇴
router.get('/leave', (req,res)=>{
    res.render('users/mypage_leave');
})





module.exports = router;

   