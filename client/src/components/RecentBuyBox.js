import React, { useState }  from 'react';
import OrderList from '../components/OrderList';
import ReviewSelect from '../components/ReviewSelect';
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; 
import PropTypes from 'prop-types';

const defaultProps = { 
    recentOrder: [], 
    orderListCnt: [[]],
};
const propTypes = { 
    recentOrder: PropTypes.array,
    orderListCnt: PropTypes.array
}; 

const RecentBuyBox = ({ recentOrder, orderListCnt })=>{
  
    const [ modalOrder, setModalOrder ] = useState(false);
    const [ modalReview, setModalReview ] = useState(false);
    const [ itemArr, setItemArr ] = useState([[]]);
    const [ item, setItem ] = useState([[]]);
    const [ rcpt, setRcpt ] = useState([]);
    const [ orderDt, setOrderDt ] = useState([]);


    const getItemList = (oid)=>{
        axios.post('/users/review/list', {oid})
        .then(response => {
            //console.log(response.data);
            setItemArr(response.data.result);
        })
        .catch(err=>{
            console.log('후기작성 아이템목록 오류 '+err);
        });
    }
    const getOrderDetail = (oid)=>{
        axios.post('/users/purchase/detail', {oid})
        .then(response => {
            //console.log(response.data);
            setItem(response.data.result.itemList);
            setRcpt(response.data.result.rcptInfo);
            setOrderDt(response.data.result.orderDetail);

        })
        .catch(err=>{
            console.log('결제상세내역 오류 '+err);
        });
    }

    const toggleOrder = ()=> {
        setModalOrder(!modalOrder);
        if(!modalOrder) getOrderDetail(oid);
        
    }
    const toggleReview = ()=> {
        setModalReview(!modalReview);
        if(!modalReview) getItemList(oid);
        
    }

    let totalPrice, odate, oyear, omon, oday, ostatus, oid;
    if(recentOrder.length > 0) {
        totalPrice = recentOrder[2]+recentOrder[4]-recentOrder[3];
        totalPrice = totalPrice.toLocaleString();
        odate = new Date(recentOrder[6]);
        oyear = odate.getFullYear();
        omon = odate.getMonth()+1;
        oday = odate.getDate();
        ostatus = recentOrder[5];
        oid = recentOrder[1];
    }
    let pid, pimg, pname, top_opt, sub_opt, prodCnt, listId, p_seller_name;
    if(orderListCnt[0].length > 0){
        pid     = orderListCnt[0][0];       //상품키
        pimg    = orderListCnt[0][1];       //상품이미지
        pname   = orderListCnt[0][2];       //상품이름
        p_seller_name = orderListCnt[0][4]; //판매자
        top_opt = orderListCnt[0][9];       //상품 상위옵션
        sub_opt = orderListCnt[0][8];       //상품 하위옵션
        prodCnt = orderListCnt.length;      //주문아이템수
        listId  = orderListCnt[0][7];       //구입아이템목록 키 
    }

return(
    <div>
    <table className="table my-2">
    <thead>
        <tr className="table-info">
            <th className="pl-3" colSpan="3">{oyear}-{omon}-{oday}</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td className="p-3 border">
                <p className="m-0 p-0" style={{fontSize:'0.9rem'}}>{p_seller_name}</p>
                <p>{pname}&nbsp;
                    <span className="badge badge-pill" style={{background:'#bce3d2'}}>
                        {ostatus}</span>
                </p>
                <p style={{fontSize:'0.8rem'}}>
                    {top_opt} {sub_opt} {prodCnt>1?' 외 '+(prodCnt-1)+'건' : null }
                </p>
                <button type="button" className="btn btn-sm btn-outline-secondary mr-1"
                         onClick={toggleReview}>후기작성하기</button>
                <button type="button" className="btn btn-sm btn-outline-secondary mr-1"
                        onClick={toggleOrder}>내역확인하기</button> 
              
            </td>
            <td className="p-2 text-center border" width="15%">
                <p className="mt-3 mb-1">합계</p>
                <p className="m-0 p-0"><b>{totalPrice}</b>원</p>
            </td>
            <td width="15%" className="py-3 border">
                <a href={"http://localhost:3333/product/detail/"+pid}>
                    <img src={pimg} alt="recent_buy" width="100" height="100" 
                         className="img-thumbnail" />
                </a>
            </td>
        </tr>
    </tbody>
    </table>
      {/*  Modal  */}
      <Modal isOpen={modalOrder} toggle={toggleOrder} size="lg">
        <ModalHeader toggle={toggleOrder}>
            <h5>주문 상세 내역</h5> 
            <button type="button" className="close" onClick={toggleOrder}></button>
        </ModalHeader>
        <ModalBody>
            <OrderList item={item}
                       rcpt={rcpt}
                       orderDt={orderDt}
                       page="purchase"/>
        </ModalBody>
        <ModalFooter>
            <button type="button" className="btn btn-outline-secondary w-25 mx-auto mb-2"
                                  onClick={()=>{
                                      alert('주문내역 페이지에서 취소해주세요');
                                  }}>결제취소</button>
            <button type="button" className="btn btn-outline-secondary w-25 mx-auto mb-2"
                                  onClick={toggleOrder}>확인</button>
        </ModalFooter>
    </Modal>
     {/*  Review Select Modal  */}
     <Modal isOpen={modalReview} toggle={toggleReview} size="md">
        <ModalBody>
            <ReviewSelect itemArr={itemArr}/>
        </ModalBody>
        <ModalFooter>
            <button type="button" className="btn btn-outline-secondary w-25 mx-auto mb-2"
                                  onClick={toggleReview}>확인</button>
        </ModalFooter>
    </Modal>
  </div>
    
);
}

RecentBuyBox.defaultProps = defaultProps;
RecentBuyBox.propTypes = propTypes;
 
export default RecentBuyBox;