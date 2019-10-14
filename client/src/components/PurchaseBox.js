import React, { useState }  from 'react';
import OrderList from '../components/OrderList';
import ReviewSelect from '../components/ReviewSelect';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import PropTypes from 'prop-types';

const defaultProps = { 
    orderInfo: [], 
    itemList: [],
};
const propTypes = { 
    orderInfo: PropTypes.array,
    itemList: PropTypes.array
};    

const PurchaseBox = ({ orderInfo, itemList })=>{
  
    const [ modalOrder, setModalOrder ] = useState(false);
    const [ modalReview, setModalReview ] = useState(false);
    const [ itemArr, setItemArr ] = useState([[]]); //후기 작성 모달
    // 주문상세내역 모달
    const [ item, setItem ] = useState([[]]);
    const [ rcpt, setRcpt ] = useState([]);
    const [ orderDt, setOrderDt ] = useState([]);

    const getItemList = (oid)=>{
        axios.post('/users/review/list', {oid})
        .then(response => {
            //console.log(response.data);
            let result = response.data.result;
            if(result === 0) throw new Error();
            else 
            setItemArr(result);
        })
        .catch(err=>{
            console.log('후기작성 아이템목록 오류 '+err);
        });
    }

    const getOrderDetail = (oid)=>{
        axios.post('/users/purchase/detail', {oid})
        .then(response => {
            //console.log(response.data);
            let result = response.data.result;
            if(result === 0) throw new Error();
            
            setItem(result.itemList);
            setRcpt(result.rcptInfo);
            setOrderDt(result.orderDetail);
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
    //결제 취소하는 메소드
    const cancelOrder = (oid)=>{
        const ans = window.confirm('정말 결제를 취소하시겠습니까?');
        if(!ans) return;
        axios.post('/users/purchase/cancel', {oid})
        .then(response => {
            console.log(response.data);
            if(response.data.result === 0) throw new Error();
            alert('결제 취소가 완료되었습니다. 취소/환불 내역에서 화인해주세요');
            setModalOrder(!modalOrder);
            
        })
        .catch(err=>{
            console.log('후기작성 아이템목록 오류 '+err);
            alert('처리를 실패했습니다. 다시 시도해주세요');
            setModalOrder(!modalOrder);
        });
    }
    
    let pimg, pname, top_opt, sub_opt, prodCnt,p_seller_name;  
    if(itemList.length > 0){
        pimg    = itemList[3];           //상품이미지
        pname   = itemList[1];           //상품이름
        p_seller_name = itemList[0];     //판매자
        top_opt = itemList[4];           //상품 상위옵션
        sub_opt = itemList[6];           //상품 하위옵션
        prodCnt = parseInt(itemList[9]); //주문아이템수
    }
    let totalPrice, odate, oyear, omon, oday, ostatus, oid;
    if(orderInfo.length > 0) {
        totalPrice = orderInfo[2]+orderInfo[4]-orderInfo[3];
        totalPrice = totalPrice.toLocaleString();
        odate = new Date(orderInfo[6]);
        oyear = odate.getFullYear();
        omon = odate.getMonth()+1;
        oday = odate.getDate();
        ostatus = orderInfo[5];
        oid = orderInfo[1];
    }
    
return(
    <div>
        <table className="table my-3">
            <thead>
                <tr className="table-info">
                    <th className="pl-3" colSpan="4">{oyear}-{omon}-{oday}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="p-2 text-center border" width="15%">
                        <p className="my-4">주문번호<br/><b>{oid}</b></p>
                    </td>
                    <td className="p-3 border">
                        <p className="m-0 p-0" style={{fontSize:'0.9rem'}}>{p_seller_name}</p>
                        <p>
                            <span className="mr-1">{pname}</span>
                            <span className="badge badge-pill" style={{background:'#bce3d2'}}>
                                {ostatus}
                            </span>
                        </p>
                        <p style={{fontSize:'0.8rem'}}>
                            {top_opt} {sub_opt} {prodCnt>1? '외 '+(prodCnt-1)+'건' : null }
                        </p>
                        <button type="button" className="btn btn-outline-danger btn-sm mr-1"
                                onClick={toggleOrder}>주문내역보기</button>
                        <button type="button" className="btn btn-outline-danger btn-sm mr-1"
                                onClick={toggleReview}>후기작성하기</button>
                    </td>
                    <td className="p-2 text-center border" width="15%">
                        <p className="my-4">합계<br/><b>{totalPrice}</b>원</p>
                    </td>
                    <td width="15%" className="py-3 border">
                        <img src={pimg} alt="recent_buy" width="100" height="100" 
                             className="img-thumbnail" />
                    </td>
                </tr>
            </tbody>
        </table>
        {/*  Order Modal  */}
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
                        onClick={()=>cancelOrder(oid)}>결제취소</button>
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

PurchaseBox.defaultProps = defaultProps;
PurchaseBox.propTypes = propTypes;

export default PurchaseBox;