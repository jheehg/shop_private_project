import React from 'react';
import PropTypes from 'prop-types';

const defaultProps = { 
    item: [],
    rcpt: [],
    orderDt: [],
    page: ''
};
const propTypes = { 
    item: PropTypes.array,
    rcpt: PropTypes.array,
    orderDt: PropTypes.array,
    page: PropTypes.string.isRequired
};

const OrderList = ({item, rcpt, orderDt, page})=> {
   let year=0, month=0, day=0;
   if(orderDt[12]) {
    let date  = new Date(orderDt[12]); 
        year  = date.getFullYear();
        month = date.getMonth()+1;
        day   = date.getDate();
   }

    return (
        <div className="col-md-12 mx-auto">
            <div className="row">
                <div className="m-4 w-100">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th width="15%" className="text-center">상품</th>
                                <th className="text-center">상품명</th>
                                <th className="text-center" width="15%">금액</th>
                                <th className="text-center" width="10%">적립금</th>
                                <th width="7%" className="text-center">수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.map((it,i)=>{
                            return(
                                <tr key={i}>
                                    <td width="15%" className="text-center"><img src={it[2]} width="70" alt=""/></td>
                                    <td className="text-center">{it[1]} <span>({it[11]}:{it[12]})</span></td>
                                    <td className="text-center" width="15%">{it[6]? it[6].toLocaleString() : it[6]}</td>
                                    <td className="text-center" width="10%"><span>{it[7]}</span>p</td>
                                    <td width="15%" className="text-center">{it[8]}</td>
                                </tr>)
                            })}
                        </tbody>
                        </table>
                        <table className="table mt-3">
                            <tbody>                        
                                <tr>
                                    <th width="30%" scope="row" className="table-info">수령자 이름</th>
                                    <td>{rcpt[1]}</td>
                                </tr>                                                                
                                <tr>
                                    <th width="30%" scope="row" className="table-info">수령자 연락처</th>
                                    <td>{rcpt[2]}</td>
                                </tr>
                                <tr>
                                    <th width="30%" scope="row" className="table-info">수령자 주소</th>
                                    <td>{rcpt[4]} {rcpt[5]}</td>
                                </tr>  
                                <tr>
                                    <th width="30%" scope="row" className="table-info">배송 메세지</th>
                                    <td><textarea rows="2" style={{width:'600px', resize: 'none'}} 
                                                  value={rcpt[6]} />
                                    </td>
                                </tr>    
                            </tbody>                                          
                    </table>
                    <table className="table table-borderless">    
                        <tbody>                               
                            <tr>
                                <th width="15%" scope="col" rowSpan="2">결제금액</th>
                                <td rowSpan="2">
                                    <p className="m-0 p-0">
                                        상품금액 {orderDt[2]? orderDt[2].toLocaleString() : orderDt[2]}원
                                    </p>
                                    <p className="m-0 p-0">
                                        배송료 {orderDt[4]? orderDt[4].toLocaleString() : orderDt[4]}원
                                    </p>
                                    <p className="m-0 p-0">
                                        사용 적립금 {orderDt[3]? orderDt[3].toLocaleString() : orderDt[3]}p
                                    </p>
                                </td>
                                <th width="15%" scope="col">결제방법</th>
                                <td width="30%">{orderDt[6]}</td>
                            </tr>     
                            <tr>
                                <th width="15%" scope="col">총금액</th>
                                <td>{orderDt[2]? (orderDt[2]+orderDt[4]-orderDt[3]).toLocaleString() :
                                                  orderDt[2]+orderDt[4]-orderDt[3]}원</td>
                            </tr>    
                        </tbody>                       
                    </table>
                {page==='cancel'? 
                <div className="p-2" style={{border: '1px solid #616060'}}>
                    <table className="table table-borderless">                                      
                        <tr>
                            <th width="15%" scope="col">취소금액</th>
                            <td style={{color:'#f25a38', fontWeight:'bold'}}>
                                <p className="m-0 p-0">
                                    주문금액 {orderDt[2]? (orderDt[2]+orderDt[4]-orderDt[3]).toLocaleString() :
                                                         orderDt[2]+orderDt[4]-orderDt[3]}원
                                </p>
                                <p className="m-0 p-0">
                                    환불금액 {orderDt[2]? (orderDt[2]+orderDt[4]-orderDt[3]).toLocaleString() : 
                                                         orderDt[2]+orderDt[4]-orderDt[3]}원
                                </p>
                            </td>
                            <th width="15%" scope="col">취소현황</th>
                            <td width="30%">{orderDt[7]}</td>
                        </tr>     
                        <tr>
                            <th width="15%" scope="col">환불수단</th>
                            <td>{orderDt[6]}</td>
                            <th width="15%" scope="col">취소일자</th>
                            <td>{year}-{month}-{day}</td>
                        </tr>                        
                    </table> 
                    </div>
                : null}
                </div>
                
            </div>
        </div>

    );
  
}

OrderList.defaultProps = defaultProps;
OrderList.propTypes = propTypes;

export default OrderList;