const express = require('express');
const db = require('../../model/db');
const query = require('../../model/query');
const oracledb = require('oracledb');
const router = express.Router();

/* 결제 관련 페이지 */

//세션에 있는 유저데이터 가져오기
const getUserInfo = (req)=>{
    let user = {};
    //유저 데이터 저장
    if(req.session.loginUser) {
        user.idx  = req.session.loginUser.idx;
        user.name = req.session.loginUser.name;
        user.tel  = req.session.loginUser.tel;
        user.mlg  = req.session.loginUser.mileage;
    } 
    return user;
}

//장바구니 페이지
router.get('/cart', async (req,res)=>{
    let uid = 0;
    if(req.session.loginUser) {
        uid = req.session.loginUser.idx;
    } else {
        res.render('fail');
    }
    let sql = query.getCartList; 
    let result = await db.getResult(sql, [uid]);

    let data = { row: result.rows };

    res.render('order/cart', data);
})

//장바구니 목록 수정
router.patch('/cart/edit', async(req,res)=>{
    let data = {
        cid : req.body.cid,
        qty : req.body.qty
    }
    if(!data.cid || !data.qty){
        res.render('fail');
    }
    let sql = "update cart set product_cnt = :qty where cart_id = :cid";
    let result = await db.getResult(sql,data);

    if(!result) {
        res.json({ result: 'fail'});
        return;
    } else {
        res.json({ result: 'success', rows: result.rowsAffected});
    }
    
})
//장바구니 목록 삭제
router.delete('/cart/delete', async(req,res)=>{
    let { cid } = req.body;
    if(!cid){
        res.render('fail');
    }
    let sql = "delete from cart where cart_id = :0";
    let result = await db.getResult(sql,[cid]);

    if(!result || result.rowsAffected < 1) {
        res.json({ result: 'fail'});
        return;
    } else {
        //카트 업뎃되면 세션에 적용
        req.session.cartNum--; //삭제 하나씩 가능
        res.json({ result: 'success'});
    }
    
})



//결제목록 페이지
router.get('/', async(req,res)=>{
    let buy = {}, sumAll = 0;
    
    let user = getUserInfo(req); // 유저 정보
    if(!user) res.render('fail');

    //1. 카트 페이지를 거쳐 오는 루트
    if(req.query.itemImg) {
        if(req.session.buy) req.session.buy = '';
        let { itemImg, prodName, cartId, qtyCart, optId, price, subName } = req.query;
        sumAll = parseInt(req.query.sumAll);
        console.log(sumAll);
        console.log(itemImg, prodName, cartId, qtyCart, sumAll, optId, price, subName );
        //유저 데이터 저장
      
        if(optId instanceof Array){ 
            let idxarr = [];
            optId.forEach((opt,i)=> {
                if(opt == '0') idxarr.push(i); 
            })
        
            if(idxarr.length > 0) {
                //선택 안된 상품 0 으로 표시
                for(let i=0; i<idxarr.length; i++){
                    itemImg[idxarr[i]]  = '0';
                    prodName[idxarr[i]] = '0';
                    optId[idxarr[i]]    = '0';
                    cartId[idxarr[i]]   = '0';
                    qtyCart[idxarr[i]]  = '0';
                    price[idxarr[i]]    = '0';
                    subName[idxarr[i]]  = '0';
                }
                spliceArr(itemImg);
                spliceArr(prodName);
                spliceArr(optId); 
                spliceArr(cartId); 
                spliceArr(qtyCart); 
                spliceArr(price); 
                spliceArr(subName); 
            }
        }
        req.session.cart = {
            itemImg, prodName, cartId, qtyCart,
            sumAll,  optId,    price,  subName
        };

    } else {
        //2. 상품 상세페이지에서 거쳐 오는 루트
        let { pid, uid, qty, oid } = req.query;
       
        let sql3 = await query.getOrderInfo(oid);
        let result3 = await db.getResult2(sql3);

        let arr1 = [], arr2 = [], arr3 = [],arr4=[], sum = 0;

        if(result3.rows.length > 1) {
            for(let i=0; i<result3.rows.length; i++){
                arr1.push(result3.rows[i][0]); //img
                arr2.push(result3.rows[i][1]); //name
                sum = sum+(result3.rows[i][2]+result3.rows[i][4])*qty[i];
                arr3.push(result3.rows[i][2]+result3.rows[i][4]);
                arr4.push(result3.rows[i][5]);
            }
          
            buy = {
                itemImg  : arr1,  prodName : arr2, 
                cartId   : '',    qtyCart  : qty, 
                sumAll   : sum,   optId    : oid,
                price    : arr3,  subName  : arr4
            }
          
        } else if(result3.rows.length === 1) {
            buy = { 
                itemImg  : result3.rows[0][0],
                prodName : result3.rows[0][1],
                cartId   : '', 
                qtyCart  : qty, 
                optId    : oid,
                sumAll   : (result3.rows[0][2] + result3.rows[0][4]) * qty,
                price    : result3.rows[0][2] + result3.rows[0][4], 
                subName  : result3.rows[0][5]
            }
        } else {
            res.render('fail');
        }
        req.session.buy = buy;
    }
    //회원 주소록 조회하기
    let add_sql = 'select * from saveAddr where mem_idx_fk= :0';
    let add_result;
    try {
        add_result = await db.getResult(add_sql, [user.idx]);
    } catch(err){
        console.log('회원주소록 조회오류 '+err);
        res.render('fail');
    }

    //sumAll이 true일 경우는 무조건 카트를 거쳐오는 경우
    //sumAll이 false 경우 무조건 상세페이지에서 바로 오는 경우
    res.locals.sum = sumAll || buy.sumAll;
    res.locals.item = (sumAll)? req.session.cart : buy;
    res.locals.saveAddr = add_result.rows.length>0? add_result.rows[0]: '';
    res.render('order/order', user);

})

// 배열 요소가 '0'이라면 제거하는 메소드 
const spliceArr = (arr)=>{
    while(true){
        let isZero = arr.indexOf('0');
        if(isZero!==-1) {
            arr.splice(isZero,1);
        } else {
            break;
        }
    }
}


const methObj = {
    card     : '신용직불카드', deposit : '무통장입금',
    transfer : '계좌이체',    phone   : '핸드폰결제'
}

//결제완료 페이지
router.post('/success', async(req,res)=>{
    let user = await getUserInfo(req);
    if(!user) res.render('fail');
    let orderId = 0; 
    let cart, buy;
    //1. 카트 페이지를 거쳐 오는 루트 : cart
    //2. 바로구매에서 오는 루트 : buy
   
    if(!req.session.buy){
       cart = req.session.cart;
       orderId = await getResultBySession(req, res, cart, user); 
    } else {
       buy = req.session.buy;
       orderId = await getResultBySession(req, res, buy, user); 
    }
    //저장된 결과 select
    let sql2 = query.getOrderResult;
    let result = await db.getResult(sql2, [orderId]);
    let rinfo = {
        rname : req.body.rcpntName,
        tel   : req.body.rcpntTel,
        zcode : req.body.zipcode,
        addr1 : req.body.address,
        addr2 : req.body.detailAddress
    }
    let uinfo = {
        uname : req.body.nameOrder,
        utel  : req.body.telOrder
    }
    if(!result) {
        res.render('fail');
        return;
    } else {
        res.locals.rinfo = rinfo;
        res.locals.uinfo = uinfo;
        if(!buy) {
            res.locals.cnt = (cart.price instanceof Array)? cart.price.length : 1;
        } else{
            res.locals.cnt = (buy.price instanceof Array)? buy.price.length : 1;
        }
        res.render('order/order_success', { row: result.rows });
    }

})

const getResultBySession = async(req,res,sess,user) =>{
    if(sess) {
        orderData = {
            uidx    : user.idx,
            sumAll  : sess.sumAll,
            usedMlg : req.body.mlgOrder,
            deli    : (parseInt(sess.sumAll)-parseInt(req.body.mlgOrder)) >= 50000? 0 : 3000,
            method  : req.body.pmethod,
            comm    : req.body.comment,
            onum    : { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };
    };

    let meth = Object.keys(methObj).filter((key)=>{
        if(key === orderData.method) return key;
    });
    orderData.method = methObj[meth]; // 결제수단 한글명 전환

    
    // 결제 트랜잭션
    // (실행 오류=> false반환, 성공=> 결제키 반환)
    let orderId = await db.orderTransaction(req, orderData, sess);
    if(!orderId) 
        res.render('fail');
        
    
    return orderId;
}





module.exports = router;