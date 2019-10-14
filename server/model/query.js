
 // 카테고리 이름 
 const data = {
    food    : '식품',        bag    : '가방,파우치',
    acc     : '악세사리',     case   : '휴대폰케이스',
    kitchen : '주방,생활용품', candle : '캔들,디퓨저',
    etc     : '기타'
}
// 한글 카테고리명 구하기
const getCategory = (item) =>{
    let key = Object.keys(data).filter(el => {
        if(el === item) return el;
    })
    return data[key];
}

 // 키워드 검색 총 결과 갯수
 exports.cntByKeyword = (keyword) => {
    let sql = `select count(product_id) from 
               (select p.product_name, s.seller_name, p.product_id
               from product p, seller s where p.seller_id_fk = s.seller_id)
               where product_name like '%${keyword}%' or seller_name like '%${keyword}%'`;
    return sql;
 }
 // 카데고리 별 총 결과 갯수
 exports.cntByCategory = (item) => {
    let key = getCategory(item);
    let sql = `select count(product_id) from 
              (select p.product_id, p.p_category
              from product p, seller s where p.seller_id_fk = s.seller_id)
              where p_category = :0`;
    let obj = { sql, category : key }
    return obj;
 }

// 키워드 검색
 exports.sqlByKeyword = (keyword)=>{
    let sql = `select * from (select A.*, rownum rn from (select * from
              (select * from productByKey)
              where product_name like '%${keyword}%' or seller_name like '%${keyword}%') 
              A) where rn between :0 and :1`;
    return sql;
}
// 키워드 + 정렬 순서 검색
exports.sqlByKey_Sort = (keyword, order)=>{
    let sql =`select * from (select A.*, rownum rn from (select * from
             (select * from productByKey)
             where product_name like '%${keyword}%' or seller_name like '%${keyword}%' `;
    switch(order){
        case 'clicks': {   // 인기순 정렬 (판매순)
            sql+=`order by sales desc)`;
            break;
        }
        case 'recents': {  // 최신순 정렬
            sql+=`order by pdate desc)`;
            break;
        }
        case 'reviews':{   // 후기많은 순 정렬
            sql+=`order by reviews desc)`;
            break;
        }
        case 'rating':{    // 별점 순 정렬
            sql+=`order by review_point desc)`;
            break;
        }
        case 'p_high':{    // 가격 높은 순 정렬
            sql+=`order by price desc)`;
            break;
        }
        case 'p_low':{     // 가격 낮은 순 정렬
            sql+=`order by price)`;
            break;
        }
        default :
            sql+=`order by sales desc)`;
    }
    sql+=` A) where rn between :0 and :1`;
    return sql;
}

//카테고리 별 조회
exports.sqlByCategory = (item)=>{
    let key = getCategory(item);
    let sql = `select * from (select A.*, rownum rn from (select * from 
               (select * from productByCategory) where p_category = '${key}') A) 
               where rn between :0 and :1`;
    return sql;
}

// 카테고리 + 정렬 순서 검색
exports.sqlByCate_Sort = (item, order)=>{
    let key = getCategory(item);
    let sql =`select * from (select A.*, rownum rn from (select * from 
             (select * from productByCategory) where p_category = '${key}' `;
   
    switch(order){
        case 'clicks': {    // 인기순 정렬
            sql+=`order by sales desc)`;
            break;
        }
        case 'recents': {   // 최신순 정렬
            sql+=` order by pdate desc)`;
            break;
        }
        case 'reviews':{    // 후기많은 순 정렬     
            sql+=` order by reviews desc)`;
            break;   
        }
        case 'rating':{     //  별점 순 정렬          
            sql+=` order by review_point desc)`;
            break;
        }
        case 'p_high':{     // 가격 높은 순 정렬
            sql+=` order by price desc)`;
            break;
        }
        case 'p_low':{      // 가격 낮은 순 정렬
            sql+=` order by price)`;
            break;
        }
        default:  
            sql+=`order by sales desc)`;    
    }
    sql+=` A) where rn between :0 and :1`;
    return sql;
} 


//상세정보 페이지 상품정보 가져오기
exports.getProductInfo = `select * from 
                         (select p.*, s.seller_name from product p, seller s 
                         where p.seller_id_fk = s.seller_id) where product_id = :0`;   

//장바구니 추가
exports.addIntoCart = (cartData)=>{
    let sql ="insert into cart select cart_id_seq.nextval, mem_idx_fk, product_id_fk, product_cnt, ";
        sql+="cdate, sub_opt_id_fk from ("; 
        for(let i=0; i<cartData.qtyarr.length; i++){
            sql+="select :midx mem_idx_fk, :pid product_id_fk, ";
            sql+=cartData.qtyarr[i]+" product_cnt, sysdate cdate, "+cartData.oidarr[i]+" sub_opt_id_fk from dual";
            if(i<cartData.qtyarr.length-1){ //마지막 인덱스보다 작을때
                sql+=" union all ";
            } else { //마지막 인덱스시
                sql+=")";
            }
        }
    return sql;
}

//후기 게시판 데이터 가져오기
exports.getReviewData =(start)=>{
    //default 2개씩 보여주기
    let sql = `select * from
              (select rownum rn, c.* from
              (select * from reviewList where product_id_fk = :0 order by wdate desc) c) 
              where rn between ${start} and ${(start+1)}`;
    return sql;
}



//장바구니화면 출력
exports.getCartList 
            = `select * from (select * from getCartList) where mem_idx_fk = :0`;



//상세페이지 -> 결제화면 바로 전환 시에 정보 조회
exports.getOrderInfo = (oid)=>{
    let sql =`select * from
             (select * from getOrderInfo) where sub_opt_id`;  
    if(oid instanceof Array) {
        sql += ` in (`;
        for(let i=0; i<oid.length; i++){
            if(i === oid.length-1){
                sql+= `${oid[i]})`;
            } else {
                sql+=`${oid[i]}, `;
            }
        }
    } else {
        sql+=` = ${oid}`;
    }
    return sql;
}
        

//결제테이블에 담고 생성된 order_id 가져오기
exports.insertOrder = `insert into order_detail
                       values (order_detail_id_seq.nextval, :uidx, :sumAll, :usedMlg, :deli, '배송준비중', 
                       :method ,'결제확인중', sysdate, :comm, 'no', 'no', null)
                       returning order_id into :onum`;


//각 결제항목 담는 쿼리
exports.addEachOrder = (sess)=>{
    // { cartId, qtyCart, sumAll, optId, price }
    let sql = '';
    if(sess.price instanceof Array) {
        sql=`insert into order_item
             select order_item_list_seq.nextval, order_id_fk, price, mileage, 
             item_cnt, sub_opt_id_fk, review_id_fk from (`;
        for(let i=0; i<sess.price.length; i++){
            sql+=`select :0 order_id_fk, ${sess.price[i]} price, ${Math.round(sess.price[i]*0.005)} mileage, 
                ${sess.qtyCart[i]} item_cnt, ${sess.optId[i]} sub_opt_id_fk, null review_id_fk from dual`;
                if(i === sess.price.length-1){ 
                    sql+=`)`;
                } else {
                    sql+=` union all `;
                }
        }
    } else {
        sql = `insert into order_item values(order_item_list_seq.nextval, :0,
              ${sess.price}, ${Math.round(sess.price*0.005)}, 
              ${sess.qtyCart}, ${sess.optId}, null)`;
    } 
      console.log(sql);
    return sql;
}

// 결제 상품들 구입수 +1 
// 카트 상품 구입시
exports.updateSales1 = (cartId)=>{
    let sql ='';
    if(cartId instanceof Array) {
        sql+= `update product set sales = sales+1
               where product_id in (
               (select product_id from
               (select * from cartList_sales) 
               where mem_idx_fk = :0 and cart_id in (`;
             for(let i=0; i<cartId.length; i++){
                if(i === cartId.length-1){
                    sql+= `${cartId[i]})))`;
                } else {
                    sql+=`${cartId[i]}, `;
                }  
            } 
    } else {
        sql+= `update product set sales = sales+1
               where product_id in (
               (select product_id from
               (select * from cartList_sales) 
               where mem_idx_fk = :0 and cart_id = ${cartId}))`;
    }
        //선택 해제된건 제외하고 나머지 카트에 남아있는 상품 구입수 +1
    return sql;
}

// 바로 결제 구입시
exports.updateSales2 = (optId)=>{
    let sql ='';
   
    if(optId instanceof Array) {
        sql=`update product set sales = sales+1
            where product_id in
            (select product_id from
            (select * from product_options)
            where sub_opt_id in(`;
             for(let i=0; i<optId.length; i++){
                if(i === optId.length-1){
                    sql+= `${optId[i]}))`;
                } else {
                    sql+=`${optId[i]}, `;
                }  
            }   
    } else {
        sql= `update product set sales = sales+1
              where product_id in
              (select product_id from
              (select * from product_options)
              where sub_opt_id = ${optId})`;
    }   
    return sql;
}

     
// 결제결과 조회
exports.getOrderResult =`select * from
                        (select * from getOrderResult) where order_id = :0`;
  
// 위시리스트 조회
exports.getWishList = `select * from getWishList where mem_idx_fk = :0 
                       order by fdate desc`;

// 후기가능 상품 수 조회
exports.reviewCount = `select count(order_item_list) from        
                      (select od.order_id, od.mem_idx_fk, oi.order_item_list
                      from order_detail od join order_item oi
                      on od.order_id = oi.order_id_fk) where mem_idx_fk = :0`;

// 후기 가능한 상품 정보
exports.getListForReview = `select * from 
                            (select * from availableReview) 
                            where mem_idx_fk = :uidx and rn between :st and :ed`; 

//마이페이지 - 주문내역
exports.getPurchaseList = `select * from
                           (select rownum rn, e.* from (select * from getPurchaseList) e
                           where e.mem_idx_fk = :idx and e.cancel_stat = 'no')
                           where rn between :st and :ed`;


// 적립금 내역 총 갯수
exports.countMlgList = 
    `select count(*) from
     (select od.order_id, od.mem_idx_fk, od.cancel_stat, sum(oi.mileage)
     from order_detail od, order_item oi 
     where od.order_id = oi.order_id_fk and od.cancel_stat = 'no' and od.mem_idx_fk= :0
     group by (od.order_id, od.mem_idx_fk, od.cancel_stat))`;
   
// 적립금 조회   
exports.getMlgList = (opt, page)=>{
    let optQuery = '';
    switch(opt){
        case 'week':{
            optQuery =`select to_char(sysdate-7, 'YYYY/MM/DD') from dual`
            break;
        }
        case 'month':{
            optQuery =`select to_char(add_months(sysdate,-1), 'YYYY/MM/DD') from dual`;
            break;
        }
        case 'half':{
            optQuery =`select to_char(add_months(sysdate,-6), 'YYYY/MM/DD') from dual`;
            break;
        }
        case 'year':{
            optQuery =`select to_char(add_months(sysdate,-12), 'YYYY/MM/DD') from dual`;
            break; 
        }
        default: 
        optQuery =`select to_char(sysdate-7, 'YYYY/MM/DD') from dual`
    }

    let sql= `select rownum rn, D.* from
             (select * from
             (select product_name, t.top_opt_name, t.top_opt_id from product p, top_option t 
             where p.product_id = t.product_id_fk) B, (select * from mlgList) C
             where B.top_opt_id = C.top_opt_id_fk and to_char(C.odate,'YYYY/MM/DD') > (
             ${optQuery}) and C.mem_idx_fk = :0 order by C.odate desc) D 
             where rownum between ${page[0]} and ${page[1]}`;
    return sql;
}