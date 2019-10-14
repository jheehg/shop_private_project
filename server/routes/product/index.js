const express = require('express');
const router = express.Router();
const db = require('../../model/db');
const query = require('../../model/query');
const paging = require('../../other/paging');

   
/* 상품 관련 페이지 router */
const display = 8; //한 페이지에 보여줄 상품수
const pagingBlock = 5; //페이지네이션 블락

 //키워드 검색 총 결과 갯수
 const getCount = async(keyword)=>{
    let _sql = await query.cntByKeyword(keyword);
    let cnt = await db.getResult2(_sql);
    let _cnt = cnt.rows[0][0]; //총 개수
   
    return _cnt;
}

 //*** 카데고리 검색 총 결과 갯수
 const _getCount = async(item)=>{
    let obj = await query.cntByCategory(item);
    let cnt = await db.getResult(obj.sql, [obj.category]);
    let result = { cnt : cnt.rows[0][0], category : obj.category }; //총 개수
  
    return result;
}
 // 검색어 테이블에 데이터 삽입
 const keywordUpdate = async(keyword)=>{
    let sql
    = `select keyword_name from keyword where keyword_name like '${keyword}%'`;
    let result = await db.getResult2(sql);
    if(!result) {
        console.log('select keyword error');
        return false;
    }
    let sql2, result2;
    if(result.rows.length>0){
        //이미 존재하면 카운트 +1
        sql2 = `update keyword set keyword_count = keyword_count+1, keyword_date = sysdate 
                where keyword_name = :0`;
        result2 = await db.getResult(sql2, [result.rows[0][0]]);
    } else {
        //없다면 삽입
        sql2 = 'insert into keyword values (keyword_seq.nextval, :0, 1, sysdate)';
        result2 = await db.getResult(sql2, [keyword]);
    }
     
    if(!result2 || result2.rowsAffected <1) return false;
   
    return true;
 }


//*** 상품 조회페이지 /product/search
 router.get('/search', async(req,res)=>{
    let sql = '';
    let { keyword, sort, cpage }= req.query;
    //console.log(keyword, sort, cpage);
    if(!keyword) {
        res.render('fail'); //키워드 값 없으면
        return;
    }

    // 키워드 갱신
    let kw_result = await keywordUpdate(keyword);
    if(!kw_result) {
       console.log('keyword insert error'); 
    }

    // 총 검색결과 먼저 구하기
    let _cnt = await getCount(keyword);//총 개수


    // case 1) 검색어 키워드만 존재할 경우
    if(keyword && !sort && !cpage){
        sql = await query.sqlByKeyword(keyword);
    } 
     // case 2) 검색어 + 정렬순서 
     if(keyword && sort && !cpage){
        sql = await query.sqlByKey_Sort(keyword, sort);
    } 
    // case 3) 검색어 + 현재페이지 
    if(keyword && !sort && cpage){ 
        cpage = parseInt(cpage);  
        sql = await query.sqlByKeyword(keyword);
    } 

     // case 4) 검색어 + 정렬순서 + 현재페이지
    if(keyword && sort && cpage) {
        cpage = parseInt(cpage); 
        sql = await query.sqlByKey_Sort(keyword, sort);
    }
    
    // 페이징 데이터 얻기
    let pdata = await paging.getPagingdata(cpage, _cnt, display, pagingBlock);

    let result = await db.getResult(sql, pdata.page);
    let data  = { row : result.rows };

    res.locals.keyword = keyword; //키워드
    res.locals.sort = sort? sort:''; // 정렬 순
    res.locals.pageCount = pdata.pageCount; // 페이지수
    res.locals.category =''; // 키테고리
    res.locals.cnt = _cnt; // 조회 전체 수
    res.locals.page 
    = { prev: pdata.prvnxt[0], next: pdata.prvnxt[1]}; // 페이지네이션 블락 수 
    res.render('product/product', data);
        
 })


//*** 카테고리 별 상품조회
router.get('/category/:item', async(req,res)=>{
    let { item } = req.params;
    let { sort, cpage } = req.query;
   
    let sql = '';
    if(!item) res.render('fail'); //키워드 값 없으면
    
    //총 개수, 카테고리 이름 구하기
    let obj = await _getCount(item);

    //카테고리만 있을 경우
    if(item && !cpage && !sort) {
        cpage = 1;
        sql = await query.sqlByCategory(item);
    }
    //카테고리 + 정렬순서
    if(item && sort && !cpage) {
        cpage = 1;
        sql = await query.sqlByCate_Sort(item, sort);
    } 
    //카테고리 + 현재페이지
    if(item && !sort && cpage) {
        cpage = parseInt(cpage); 
        sql = await query.sqlByCategory(item);  
    }
    //카테고리 + 정렬순서 + 현재페이지
    if(item && sort && cpage) {
        cpage = parseInt(cpage); 
        sql = await query.sqlByCate_Sort(item, sort);
    } 
   
    // 페이징 데이터 얻기
    let pdata = await paging.getPagingdata(cpage, obj.cnt, display, pagingBlock);
    //console.log(pdata);
    let result = await db.getResult(sql, pdata.page);
    let data = { row : result.rows };

    res.locals.keyword = '';
    res.locals.category = { kor: obj.category, en:item };
    res.locals.sort = sort || '';
    res.locals.pageCount = pdata.pageCount;
    res.locals.cnt = '';
    res.locals.page = {prev: pdata.prvnxt[0], next: pdata.prvnxt[1]};

    res.render('product/product', data);

})




//*** 상품 상세페이지
router.get('/detail/:id', async(req,res)=>{
    let { id } = req.params;
   
    if(id <= 0) res.render('fail');
    
    // 클릭수 추가 ( 갱신부터 먼저 실행 )
    let sql = "update product set clicks = clicks+1 where product_id = :0";
    let result;
    try {
        result = await db.getResult(sql, [id]);
    } catch(err){
        console.log('상세 페이지 click수 증가 오류 '+err);
        res.render('fail');
    }
    // 싱품 정보 조회
    let sql2 = query.getProductInfo;
   
    // 상위 옵션 먼저 조회
    let sql3 = "select * from top_option where product_id_fk = :0";

    // 후기 게시판 조회
    let sql4 = await query.getReviewData(1); // 기본 2건 이상은 요청시 조회.

    let result2, result3, result4;
    try {
        result2 = await db.getResult(sql2, [id]);
        result3 = await db.getResult(sql3, [id]);
        result4 = await db.getResult(sql4, [id]);
    } catch(err){
        console.log('후기 게시판 조회 오류 '+err);
        res.render('fail');
    }


    let data  = { row : result2.rows }; // 상품정보
    res.locals.opt = result3.rows;      // 상위 옵션정보
    res.locals.review = result4.rows;   // 후기게시판 데이터

   
    res.render('product/product_detail', data);
})


//후기 내용 자세히 보기
router.get('/moreReviewTxt', async(req,res)=>{
    let { rvid } = req.query;
    if(!rvid) 
        res.render('fail'); 

    let sql = 'select review_content from review where review_id = :0';
    let result = await db.getResult(sql, [rvid]);
    if(!result) {
        res.json({result: 0}); 
        return;
    }
    res.json({ result: result.rows[0][0]});
})

//후기 추가조회
router.get('/moreReviewList', async(req,res)=>{
    let { start, pid } = req.query;
  
    if(!start || !pid) {
        res.render('error', {msg: '처리에 실패했습니다. 다시 시도해주세요'});
        return;
    }
    let sql = await query.getReviewData(parseInt(start));
    let result;
    try {
        result = await db.getResult(sql, [pid]);
    } catch(err){
        console.log('후기 추가조회 오류'+err);
        res.render('error', {msg: '처리에 실패했습니다. 다시 시도해주세요'});
        return;
    }
    if(!result.rows.length) { // 더이상 글이 없을때 
        res.render('error', {msg: '불러올 후기 글이 없습니다.'});
        return;
    }
    res.render('product/review', {review: result.rows});
    return;
  
})

//하위옵션 조회
router.get('/opt/find', async (req,res)=>{
    if(req.query.tid === 'none') return; 
    let tid = parseInt(req.query.tid);
    let sql = "select * from sub_option where top_opt_id_fk = :0";
    let result;
    try {
        result = await db.getResult(sql, [tid]);
    } catch(err){
        console.log('하위옵션 조회 오류'+err);
        res.json({result: 0});
        return;
    }
    let oarr = result.rows;
   
    res.json(oarr);
})


// 장바구니 추가
router.post('/addCart', async(req,res)=>{
    let { pid, midx, qtyarr, oidarr } = req.body;
    console.log(pid, midx, qtyarr, oidarr);

    let cartData={pid, midx, qtyarr, oidarr};
    let qdata = { pid, midx };
    
    let sql2 = await query.addIntoCart(cartData);
    let result2 = await db.getResult(sql2,qdata);

    console.log(JSON.stringify(result2.rowsAffected));
    let data  = { row : result2.rowsAffected };

    if(data.row > 0){
        //카트 업뎃되면 세션에 적용
        let _sql = 'select count(cart_id) from cart where mem_idx_fk = :0';
        let idx = req.session.loginUser.idx;
        let _result = await db.getResult(_sql, [idx]);
        req.session.cartNum = _result.rows[0][0];
    }
    res.json(data);
})


// 즐겨찾기 추가
router.post('/addWishes', async(req,res)=>{
    let arr = { pid: req.body.pid, midx: req.body.midx}; 
    
    if(!arr.pid ||!arr.midx) {
        res.render('fail');
        return;
    }
    let result, result2, result3;
    let sql = `select count(wish_list) from wishes 
               where product_id_fk = :pid and mem_idx_fk = :midx`;
    try {
        result = await db.getResult(sql, arr);
    } catch(err){
        console.log('즐겨찾기 조회 오류 '+err);
        res.json({row: 0});
        return;
    }
    if(result.rows[0][0] > 0) {
        res.json({row: -1}); // 즐겨찾기에 이미 상품이 있는 경우 -1 전송
        return;
    }
    let sql2 = "insert into wishes values(wish_list_seq.nextval, :midx, :pid, sysdate)";
    let sql3 = "update product set wishes = wishes+1 where product_id = :0";
   
    try {
        result2 = await db.getResult(sql2, arr);
        result3 = await db.getResult(sql3, [arr.pid]);
    } catch(err){
        console.log('즐겨찾기 추가 오류 '+err);
        res.json({row: 0});
        return;
    }
    if(result2.rowsAffected <1 || result3.rowsAffected <1){
        res.json({row: 0});
        return;
    }

    let data  = { row : result2.rowsAffected };
    res.json(data);
})




module.exports = router;