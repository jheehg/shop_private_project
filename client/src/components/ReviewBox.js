import React from 'react';
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarO} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const defaultProps = { 
    listId: 0, pid: 0, pimg: '', p_point: 0, 
    p_seller_name: '', pname: '', odate: '', 
    top_opt: '', sub_opt: '', done: 0, list:0, 
    delReviewCb: ()=>{}
};
const propTypes = { 
    listId: PropTypes.number, 
    pid: PropTypes.number, 
    pimg: PropTypes.string, 
    p_point: PropTypes.number, 
    p_seller_name: PropTypes.string, 
    pname: PropTypes.string, 
    odate: PropTypes.any,
    top_opt: PropTypes.string,
    sub_opt: PropTypes.string,
    done: PropTypes.any,
    list: PropTypes.number, 
    delReviewCb: PropTypes.func
}; 



const ReviewBox = ({ listId, pid, pimg, p_point, 
                     p_seller_name, pname, odate, 
                     top_opt, sub_opt, done, list, delReviewCb})=>{
                 
    //rating
    let star = [], starO = [];
    for(let i=0; i<p_point; i++){
        star.push(<FontAwesomeIcon icon={faStar} key={i}/>);
    }
    for(let i=0; i<5-(p_point); i++){
        starO.push(<FontAwesomeIcon icon={faStarO} key={i}/>);
    }
    let _odate = new Date(odate);
    let oyear = _odate.getFullYear();
    let omon = _odate.getMonth()+1;
    let oday = _odate.getDate();

    //후기 작성 여부
    let rvDone = done? true : false;

   
    //후기삭제
    const delReview = ()=>{
        const ans = window.confirm('정말 삭제하시겠습니까?');
        if(!ans) return;

        axios.delete('/users/review/del/'+listId)
        .then(response => {
            //console.log(response.data);
            if(response.data.result>0) {
                alert('삭제가 완료되었습니다');
                delReviewCb(list);  
            } else {
                throw new Error();
            }
        })
        .catch(err => {
            alert('처리에 실패했습니다. 다시 시도해주세요');
            console.log(err)
        });
    }

    return (
        <>
        {pid===0? 
            <div className="text-center"><h5>후기 리스트가 비어있습니다</h5></div> : 
            <ul className="review_list p-3">
                <li className="review_list_item">
                    <p style={{fontSize:'0.8rem', color:'#918e8e'}}>{oyear}-{omon}-{oday} 구입</p>
                </li>
                <li className="review_list_item">
                    <img src={pimg} alt="review" width="140" height="110" />
                </li>
                <li className="review_list_item">
                    <p className="m-1" style={{fontSize:'0.9rem', color:'#918e8e'}}>{p_seller_name}</p>
                </li>
                <li className="review_list_item">
                    <p className="text-warning mb-0">
                        {star}{starO}
                    </p>
                </li>
                <li className="review_list_item reviewProdName">
                    <p>{pname}</p>
                </li>
                <li className="review_list_item ">
                    {rvDone || 
                    <Link to={{pathname:"/users/rvwrite/"+listId,
                               state: {seller : p_seller_name, pimg,
                                        top_opt, sub_opt, pname, pid, 
                                        listId, mode:'write'}
                              }} 
                           className="btn btn-outline-dark btn-sm">후기작성</Link>}
                    {rvDone &&
                    <> 
                    <Link to={{pathname:"/users/rvwrite/"+listId,
                               state: {seller : p_seller_name, pimg,
                                        top_opt, sub_opt, pname, pid, 
                                        listId, mode:'edit'}
                              }} 
                          className="reviewBtn">후기수정</Link>
                    <button style={{paddingTop:'5px', paddingBottom:'5px'}} 
                            className="reviewBtn" 
                            onClick={delReview}>후기삭제</button></>}

                </li>
            </ul>
        }
        </>
    );
}

ReviewBox.defaultProps = defaultProps;
ReviewBox.propTypes = propTypes;

export default ReviewBox;