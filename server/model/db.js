const DB = {};
const db = require('oracledb');
const dbconfig = require('./dbconfig');
const query = require('./query');

db.autoCommit=false; 


DB.getResult = async (sql,data)=>{
    let connection;
    try {
        connection = await db.getConnection(dbconfig);
       ;
    } catch (err) {
        console.error(err);
    } try {
        let result = await connection.execute(sql, data);
        await connection.commit();
        console.log('getResult() : '+JSON.stringify(result));
        return result;
    } catch (err) {
        console.error(err);
        connection.rollback((err)=>{
            console.error('if rollback fails, err is NULL '+err);
        });
   
    }finally {
        if(connection) {
             try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};

// bind할 데이터 없는 경우
DB.getResult2 = async (sql)=>{
    let connection;
    try {
        connection = await db.getConnection(dbconfig);
    } catch (err) {
        console.error(err);
    } try {
        let result = await connection.execute(sql);
        await connection.commit();
        console.log('getResult2() '+JSON.stringify(result));
        return result;
    } catch (err) {
        console.error(err);
        connection.rollback((err)=>{
            console.error('if rollback fails, err is NULL '+err);
        });
    
    }finally {
        if(connection) {
             try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};

const getAddMlg = (sess, usedMlg)=>{
    let sum = 0;
    if(sess.price instanceof Array) {
        sess.price.forEach( p => sum+=p ) // 배송료제외 상품가격만
        sum-=usedMlg; // 사용마일리지 제외
    } else {
        sum = sess.price-usedMlg; 
    }
    return Math.round(sum*0.005);
}

//결제 최종처리
DB.orderTransaction = async (req,orderData,sess)=>{
    let connection, orderId, addMlg;
    let rcpnt = null;
    try {
        connection = await db.getConnection(dbconfig);
    } catch (err) {
        console.error('getConnection() '+err);
    //1. 결제테이블 insert 
    } try {
        let sql = query.insertOrder; 
        let result = await connection.execute(sql, orderData, {autoCommit:false});
       
        orderId = result.outBinds.onum[0]; //결제목록 키(order_id)
        if(result.rowsAffected < 1) throw new Error('결제테이블 insert error');
  
    //2. 결제하는 각 목록 테이블 insert
        let sql1 = '';
        if(sess === req.session.cart){
            sql1 = await query.addEachOrder(req.session.cart);
        } else {
            sql1 = await query.addEachOrder(req.session.buy);
        }

        let result1 = await connection.execute(sql1, [orderId], {autoCommit:false});
        
        if(result1.rowsAffected < 1) throw new Error('결제된 각 아이템 insert error');
 
    //3. 수령인 리스트에 insert
        rcpnt = {
            rname : req.body.rcpntName,
            tel   : req.body.rcpntTel,
            zcode : req.body.zipcode,
            addr1 : req.body.address,
            addr2 : req.body.detailAddress
        }
         
        let sql2  =`insert into recipient_list values(
                    ${orderId}, :rname, :tel, :zcode, :addr1, :addr2)`; 
        let result2 = await connection.execute(sql2, rcpnt, {autoCommit:false});
     
        if(result2.rowsAffected < 1) {
            throw new Error('수령자데이터 insert error');
        }
        //4. 상품테이블에 구입수 +1
        let sql3= '', result3 = '';
        if(sess === req.session.cart){
            let uidx = req.session.loginUser.idx;
            sql3 =  await query.updateSales1(sess.cartId);
            result3 = await connection.execute(sql3, [uidx], {autoCommit:false});
        } else {
            sql3 = await query.updateSales2(sess.optId);
            result3 = await connection.execute(sql3, [], {autoCommit:false});
        }

        if(result3.rowsAffected < 1) throw new Error('상품 구입수+1 update error');
        
         //5. 카트에서 목록 제거
        if(sess === req.session.cart) {
            let cid = sess.cartId;
            let sql4 = ``;
            if(cid instanceof Array) {
                sql4 = `delete from cart where cart_id in (`;
                for(let i=0; i<cid.length; i++){ 
                    if(i === cid.length-1){
                        sql4+=`${cid[i]})`;
                    } else {
                        sql4+=`${cid[i]}, `;
                    }    
                }
            } else {
                cid = parseInt(cid);
                sql4 = `delete from cart where cart_id = ${cid}`;
            }
       
            let result4 = await connection.execute(sql4, [], {autoCommit:false});
            if(result4.rowsAffected < 1) {
                throw new Error('카트목록 delete error');
            
            } else {
                //카트 업뎃됐다면 세션에 적용
                let _sql = 'select count(cart_id) from cart where mem_idx_fk = :0';
                let idx = req.session.loginUser.idx;
                let _result = await connection.execute(_sql, [idx], {autoCommit:false});
                req.session.cartNum = _result.rows[0][0];
            }
        } 

        //6. 최종적으로 회원정보 변경사항 업데이트 + 회원세션 수정
        addMlg = await getAddMlg(sess,parseInt(orderData.usedMlg)); // 예정 적립금
        addMlg = addMlg + req.session.loginUser.pln_mlg;
        let data = {
            uidx    : parseInt(orderData.uidx),
            mlg     :  parseInt(req.session.loginUser.mileage) - parseInt(orderData.usedMlg),
            pln_mlg : addMlg,
            tel     : req.body.telOrder
        } 

       let sql5 = `update shop_member set mem_mileage = :mlg, mem_tel = :tel, pln_mileage = :pln_mlg
                   where mem_idx = :uidx`;
       let result5 = await connection.execute(sql5, data, {autoCommit:false});
       let sql6, result6;
       // 주소록 저장 여부 확인 후 실행
        if(req.body.setDefaultAddr=="on"){ 
            sql6 = `insert into saveAddr values(
                   ${data.uidx}, :rname, :tel, :zcode, :addr1, :addr2)`;
            result6 = await connection.execute(sql6, rcpnt, {autoCommit:false});
            if(result6.rowsAffected < 1) throw new Error('회원주소록 insert error');
        }
       
        if(result5.rowsAffected < 1) {
            throw new Error('회원정보 update error');
        } else {
            await connection.commit();
            // 회원세션 수정
            req.session.loginUser.mileage = data.mlg;
            req.session.loginUser.pln_mlg = addMlg;
            req.session.loginUser.tel = data.tel;
     
            return orderId;
        }
        
    } catch(err) {  
        console.error('오류 발생한 부분 '+err); 
        await connection.rollback((err)=>{
            console.error('if rollback succeeds, err is null '+err);
            return false;
        });
    } finally {
        if(connection) {
             try {
               connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};

// 페이징처리 
const paging = (cpage, total, display, pagingBlock)=>{
    let pageCount = Math.ceil(total/display); //총 페이지 수 
    
    if(cpage<1) cpage=1; // 1보다 작을경우 
    if(cpage>pageCount) cpage = pageCount; //실제 페이지보다 클경우 
    
    let end = cpage*display;
    let start = end-(display-1);

    let prev = Math.floor((cpage-1)/pagingBlock)*pagingBlock;
	let next= prev+pagingBlock+1;

    return {page:[start, end], prvnxt:[prev, next], pageCount};
}

// 마이페이지 ( 마이페이지 메인 / 주문내역 / 취소내역 ) 
DB.getPurchaseInfo = async (uidx, cpage = null, page = null)=>{
    let connection;
    let result1,result2,result3,result4,result5;
    let data, pdata;
    try {
        connection = await db.getConnection(dbconfig);
    } catch (err) {
        console.error('getConnection() '+err);
    } try {
        let sql1, sql2, sql3;
       
        if(page==='purchase' || !cpage) { //취소안한 전체 주문내역 수
            sql1 = `select count(order_id) from order_detail where mem_idx_fk = :0
            and cancel_stat = 'no'`;
        } 
        if(page==='cancel' || !cpage) { //취소한 주문내역 수
            sql2 = `select count(order_id) from order_detail where mem_idx_fk = :0 
                    and cancel_stat = 'yes'`;
        }
        //가장 최근에 구매한 내역 or 구매내역 or 취소내역 
        sql3 = 
        `select * from
        (select rownum, a.*, row_number() over (order by rownum desc)as rn from
        (select order_id, total, total_by_mileage, delivery_fee, delivery_status, 
        odate, cancel_stat, payment_status, cancel_date from order_detail where mem_idx_fk = :idx) a
        where a.cancel_stat = `;
        if(cpage) sql3 += (page==='purchase')? 
                        `'no' order by a.odate desc) where rn between :st and :ed` : 
                        `'yes' order by a.odate desc) where rn between :st and :ed`;
        else sql3 +=`'no' order by a.odate desc) where rn = 1`;
       
        try {
            if(page!=='cancel') {
                result1 = await connection.execute(sql1, [uidx]);
                if(cpage && result1.rows[0][0] > 0) { 
                    pdata = await paging(cpage, result1.rows[0][0], 5, 5);
                }
            }
            if(page!=='purchase') {
                result2 = await connection.execute(sql2, [uidx]);
                if(cpage && result2.rows[0][0] > 0) { 
                    pdata = await paging(cpage, result2.rows[0][0], 5, 5);
                }
            }
            
            if(cpage && pdata) {
                result3 
                = await connection.execute(sql3, {idx: uidx, st:pdata.page[0], ed:pdata.page[1]});
            } else if(!cpage && result1.rows[0][0]> 0) { //메인 - 결제건 있어야 sql3 실행
                result3 = await connection.execute(sql3, {idx: uidx});
            }

        } catch (err){
            console.log('회원 주문관련 조회 오류 1~3 '+err);
        }
        let oid, sql4;
        // result3 에서 오더키 구하기
        if(result3){
            // 최근 구매내역 상세 아이템 정보
            if(!cpage) {
                sql4 = `
                select * from
                (select * from recentOrderInfo) 
                where mem_idx_fk = :uidx and order_id = :oid`;
     
                oid = result3.rows[0][1]; //가장 최근 1건
                try {
                    result4 = await connection.execute(sql4, {oid:oid, uidx:uidx});
                } catch(err) {
                    console.log('sql4(!cpage) error '+err);
                }
            } else { // 페이징에 따라 받은 오더키
            sql4 =`select * from
                (select * from purchaseList) where order_id in (`;
                for(let i=0; i< result3.rows.length; i++){
                   if(i<result3.rows.length-1) sql4 += result3.rows[i][1]+', ';
                   else sql4 += result3.rows[i][1]+')';
                }
                try {
                    result4 = await connection.execute(sql4); 
                } catch(err){
                    console.log('sql4(cpage) error '+err);
                }
                data = [result1,result2,result3,result4, pdata];
                // console.log(JSON.stringify(result1)); //취소안한 결제수
                // console.log(JSON.stringify(result2)); //취소한 결제수
                // console.log(JSON.stringify(result3)); //결제내역 / 취소내역
                // console.log(JSON.stringify(result4)); //결제아이템 / 취소아이템
                return data;
            }
        } else {
            // /users => 결제,취소 건이 아예 없을때 값 받고 밑으로 넘기기
            // /users/return => 취소건 없을때 바로 리턴
            // /users/purchage => 결제건 없을때 바로 리턴
           if(cpage){
                return [ result1, result2 ];
           }
        }
        // 최근에 추가한 즐겨찾기 (/users 일때만 실행)
        let sql5 = 
        `select * from
        (select rownum rn,b.* from
        (select * from wishes w, 
        (select p.product_id, p.product_name, p.main_img, s.seller_name from product p, 
        seller s where p.seller_id_fk = s.seller_id) a
        where w.product_id_fk = a.product_id and w.mem_idx_fk = :0 order by w.fdate desc) b)
        where rn between 1 and 4`;

        try {
            result5 = await connection.execute(sql5, [uidx]);
            data = [result1, result2, result3, result4, result5];
        } catch(err){
            console.log('회원 주문관련 조회 오류 '+err);
        }
       
        return data;
    } catch(err) {  
        console.error(err); 
        return false;
      
    } finally {
        if(connection) {
             try {
               connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};



// 주문상세내역/취소상세내역 조회
DB.getPurchaseDetail = async (oid)=>{
    let connection;
    let result1,result2,result3;
    let data;
    try {
        connection = await db.getConnection(dbconfig);
    } catch (err) {
        console.error('getConnection() '+err);
    } try {
        //구입한 총 아이템 목록 구하기
        let sql1 = `select * from
                    (select * from ALLITEMINORDER) where order_id_fk = :0`;
        let sql2 = `select * from
                    (select rp.*, od.require_msg
                    from order_detail od, recipient_list rp
                    where od.order_id = rp.order_id_fk) where order_id_fk = :0`;
        let sql3 = `select * from order_detail where order_id = :0`;
        
        result1 = await connection.execute(sql1, [oid]);
        result2 = await connection.execute(sql2, [oid]);
        result3 = await connection.execute(sql3, [oid]);
        
        data = [result1, result2, result3];
       
        return data;
    
    } catch(err) {  
        console.error('주문상세내역 조회 오류 '+err); 
        return false;
    } finally {
        if(connection) {
             try {
               connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }

}

// 후기 작성 처리
DB.reviewUpdate = async(obj, listId, mode)=>{
    let connection;
    let result1,result2,result3;
    try {
        connection = await db.getConnection(dbconfig);
    } catch (err) {
        console.error('getConnection() '+err);
    } try {
        console.log(mode);
        let sql1, sql2;
        if(mode === 'write'){
          //1) 리뷰 테이블 인서트
            sql1 = `insert into review values(review_id_seq.nextval, :pid, :uidx, 
                   :text, sysdate, :fname, :point, :origin) returning review_id into :rvid`;
             //2) 구매아이템 테이블에 리뷰키 넣기
            sql2 = `update order_item set review_id_fk = :rvid where order_item_list = :listId`;
            obj.rvid = { type: db.NUMBER, dir: db.BIND_OUT };
        } else {
           sql1 = (obj.fname!==undefined)? //파일명 존재하거나 ''
            // 리뷰 테이블 수정
            `update review set review_content = :text, wdate = sysdate, review_point = :point,
             review_img = :fname, origin_img = :origin where product_id_fk = :pid and review_id = (
             select review_id_fk from order_item where order_item_list = ${listId})` :
            // 기존 파일을 건드리지 않고 수정 시
            `update review set review_content = :text, wdate = sysdate, review_point = :point
            where product_id_fk = :pid and review_id = (
            select review_id_fk from order_item where order_item_list = ${listId})`;
        }
       
        //3) 상품테이블 평점 업데이트
        let sql3 = `update product set review_point =                
                    (select round(avg(review_point)) from review where product_id_fk = :pid)
                    where product_id = :pid`;
       
        try {
            result1 = await connection.execute(sql1, obj, {autoCommit:false});
        } catch(err) { 
            console.log('result1 실행 오류 '+err);
        }
        if(!result1.rowsAffected) throw new Error('result1 실행 오류');
        
        if(mode === 'write'){
            try {
                let rvid = result1.outBinds.rvid[0];
                result2 = await connection.execute(sql2,
                                                  {rvid: rvid, listId: listId},
                                                  {autoCommit:false});
            } catch(err) {
                console.log('result2 실행 오류 '+err);
            }
        
            if(!result2.rowsAffected) throw new Error('result2 실행 오류');
        }
        try {
            result3 = await connection.execute(sql3, 
                                              {pid:obj.pid},
                                              {autoCommit:false});
        } catch(err) { 
            console.log('result3 실행 오류 '+err);
        }

        if(!result3.rowsAffected) throw new Error('result3 실행 오류');
       
        await connection.commit();
        return true;

    } catch(err) {  
        console.error('리뷰작성 업데이트 오류 '+err); 
        await connection.rollback(err=> console.log('rollback중 오류'+err));
        return false;
    } finally {
        if(connection) {
             try {
               connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }

}

 
module.exports = DB;


