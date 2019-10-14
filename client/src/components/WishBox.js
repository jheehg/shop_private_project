import React, { useState }  from 'react';
import { faStar, faHeart } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarO, faHeart as faHeartO } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Axios from 'axios';
import PropTypes from 'prop-types';

const defaultProps = { 
    wid:0, pid:0, 
    pimg: '', p_point:0, 
    p_seller_name: '', pname: '',
    p_origin_price: 0, p_sale_price: 0
};
const propTypes = { 
    wid: PropTypes.number, pid: PropTypes.number, 
    pimg: PropTypes.string, p_point: PropTypes.number, 
    p_seller_name: PropTypes.string, pname: PropTypes.string,
    p_origin_price: PropTypes.number, p_sale_price: PropTypes.number
}; 

const WishBox = ({ wid, pid, pimg, p_point, 
                   p_seller_name, pname,
                   p_origin_price, p_sale_price})=>{

let [ isHearted, setHearted ] = useState(true);
let uidx = JSON.parse(localStorage.getItem('user')).useridx;
const unHeartItem = ()=>{
   if(isHearted){
       Axios.delete('/users/wish/delete?wid='+wid+'&uidx='+uidx)
            .then(response =>{
                //console.log(response.data);
                let result = response.data.result;
                if(result > 0) {
                    alert('선택된 상품이 삭제되었습니다');
                } else if(result === 0){
                    alert('처리에 실패했습니다. 다시 시도해주세요');
                }
            }).catch((err)=>{
              console.log('즐겨찾기 상품 삭제 update 오류');  
            })
            setHearted(false);
        }
    }
    //rating
    let star = [], starO = [];
    for(let i=0; i<p_point; i++){
        star.push(<FontAwesomeIcon icon={faStar} key={i}/>);
    }
    for(let i=0; i<5-(p_point); i++){
        starO.push(<FontAwesomeIcon icon={faStarO} key={i}/>);
    }
    return (
        <>
        {pid===0? 
            <div className="text-center"><h5>즐겨찾기 리스트가 비어있습니다</h5></div> : 
            <ul className="wish_list p-3">
            
                <li className="wish_list_item img">
                <img src={pimg} alt="review" width="130" height="100"/>
                <FontAwesomeIcon icon={isHearted? faHeart : faHeartO} 
                                size="lg" className="wishCheck" 
                                onClick={unHeartItem} style={{color: '#e35454'}}/>
            
                </li>
                <li className="wish_list_item">
                <a href={"http://localhost:3333/product/detail/"+pid}>
                    <p className="m-2" 
                    style={{fontSize:'0.9rem', color:'#918e8e'}}>{p_seller_name}</p>
                </a>
                </li>
                <li className="wish_list_item">
                    <p className="wishRating mb-0">{star}{starO}</p>
                </li>
                <li className="wish_list_item wishProdName">
                    <p>{pname}</p>
                </li>
                <li className="wish_list_item">
                    <p className="originPrice">
                        <b>{p_sale_price? 
                            p_sale_price.toLocaleString() :
                            p_origin_price.toLocaleString()}</b>원
                        <span className="salePrice">
                            {p_sale_price? p_origin_price.toLocaleString()+'원' :
                            null}
                        </span>
                    </p>
                </li>
            </ul>  
        }
    </>   
    );
}

WishBox.defaultProps = defaultProps;
WishBox.propTypes = propTypes;

export default WishBox;