import React, { useState, useEffect }  from 'react';
import OrderList from '../components/OrderList';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'; 
import axios from 'axios';
import PropTypes from 'prop-types';

const defaultProps = { 
    cancelInfo: [], 
    cancelList: [],
};
const propTypes = { 
    cancelInfo: PropTypes.array,
    cancelList: PropTypes.array
}; 

const ReturnBox = ({ cancelInfo, cancelList })=>{
  
    const [ modalOrder, setModalOrder ] = useState(false);
    //주문상세내역 모달
    const [ item, setItem ] = useState([[]]);
    const [ rcpt, setRcpt ] = useState([]);
    const [ orderDt, setOrderDt ] = useState([]);
    const [ odate, setOdate ] = useState({year:0, month:0, day:0});
    const [ cdate, setCdate ] = useState({year:0, month:0, day:0});


    const getCancelDetail = (oid)=>{
        axios.post('/users/purchase/detail', {oid})
        .then(response => {
            //console.log(response.data);
            setItem(response.data.result.itemList);
            setRcpt(response.data.result.rcptInfo);
            setOrderDt(response.data.result.orderDetail);
        })
        .catch(err=>{
            console.log('취소내역 조회 오류 '+err);
        });
    }

    const toggleOrder = ()=> {
        setModalOrder(!modalOrder);
        if(!modalOrder) getCancelDetail(oid); 
    }

    const convertDate = (_date)=>{
        let date = new Date(_date);
        let obj = {
            year  : date.getFullYear(),
            month : date.getMonth()+1,
            day   : date.getDate(),
        }
        return obj;
    }
  
    let pimg, pname, top_opt, sub_opt, prodCnt,p_seller_name;  
    if(cancelList.length > 0){
        pimg    = cancelList[3];            //상품이미지
        pname   = cancelList[1];            //상품이름
        p_seller_name = cancelList[0];      //판매자
        top_opt = cancelList[4];            //상품 상위옵션
        sub_opt = cancelList[6];            //상품 하위옵션
        prodCnt = parseInt(cancelList[9]);  //주문아이템수
    }
    let totalPrice, pstatus, dstatus, oid;
    if(cancelInfo.length > 0) {
        totalPrice = cancelInfo[2]+cancelInfo[4]-cancelInfo[3];
        totalPrice = totalPrice.toLocaleString();
        dstatus    = cancelInfo[5]; //배송 현황
        pstatus    = cancelInfo[8]; //결제 취소현황
        oid        = cancelInfo[1];
    }
    useEffect(()=>{ 
        setOdate(convertDate(cancelInfo[6]));
        setCdate(convertDate(cancelInfo[9]));
    }, [cancelInfo]);
  

return(
    <div>
        <table className="table my-3">
            <thead>
                <tr className="table-info">
                    <th className="pl-3" 
                        colSpan="5">{odate.year}-{odate.month}-{odate.day}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="p-2 text-center border" width="10%">
                        <p className="my-4">주문번호<br/><b>{oid}</b></p>
                    </td>
                    <td className="p-3 border">
                        <p className="m-0 p-0" style={{fontSize:'0.9rem'}}>{p_seller_name}</p>
                        <p className="p-0">
                            <span className="mr-1">{pname}</span>
                            <span className="badge badge-pill" 
                                  style={{background:'#bce3d2'}}>{pstatus}</span>
                        </p>
                        <p style={{fontSize:'0.8rem'}}>
                            {top_opt}-{sub_opt} {prodCnt>1? '외 '+(prodCnt-1)+'건' : null }</p>
                        <button type="button" className="btn btn-outline-danger btn-sm mr-1"
                                onClick={toggleOrder}>취소상세내역</button>
                    </td>
                    <td className="p-2 text-center border" width="10%">
                        <p className="my-4">합계<br/><b>{totalPrice}</b>원</p>
                    </td>
                    <td className="p-2 text-center border" width="18%">
                        <p className="my-4">취소현황<br/>
                            <b style={{fontSize:'0.9rem'}}>
                                {cdate.year}-{cdate.month}-{cdate.day}
                            </b><br/>
                            <span style={{fontSize:'0.8rem', textDecoration:'underline'}}>
                                {pstatus}
                            </span
                        ></p>
                    </td>
                    <td width="15%" className="py-3 border">
                        <img src={pimg} alt="recent_buy" width="100" height="100" 
                             className="img-thumbnail" />
                    </td>
                </tr>
            </tbody>
        </table>
        {/*  Order Modal (cancel)  */}
        <Modal isOpen={modalOrder} toggle={toggleOrder} size="lg">
            <ModalHeader toggle={toggleOrder}>
                <h5>취소 상세 내역</h5> 
                <button type="button" className="close" onClick={toggleOrder}></button>
            </ModalHeader>
            <ModalBody>
                <OrderList item={item} rcpt={rcpt}
                           orderDt={orderDt} page="cancel"/>
            </ModalBody>
            <ModalFooter>
                <button type="button" 
                        className="btn btn-outline-secondary w-25 mx-auto mb-2"
                        onClick={toggleOrder}>확인</button>
            </ModalFooter>
        </Modal>
    </div>
    );
}

ReturnBox.defaultProps = defaultProps;
ReturnBox.propTypes = propTypes;

export default ReturnBox;