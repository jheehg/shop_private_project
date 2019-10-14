import React from 'react';
import { Link } from 'react-router-dom';
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from 'prop-types';

const defaultProps = { 
    username : '',
    userimg : ''
};
const propTypes = { 
    username: PropTypes.string,
    userimg: PropTypes.string,
};

const Aside = ({username, userimg})=> {
    
    const showUserImg = (e)=>{
        e.preventDefault();
        let imgtab 
        = window.open("/users/imgtab", "imgtab",
                      "width=400, height=400, left=250, top=200");
    }

    return (
        <div className="container">
            <aside className="menu" style={{float:'left', width:'20%'}}>
                <div className="menu_container" style={{width:'100%'}}>
                    <div className="card text-center" 
                         style={{width:'100%', border: '1px solid silver'}}>
                        <div className="card-header bg-secondary text-light border-info">MY PAGE</div>
                    <div className="card-body">
                        <h5 className="card-title">
                            <div className="asideImgtab">
                                {userimg? <img src={"http://localhost:3333/upload/"+userimg} 
                                            alt="user_img" width="150" height="130" 
                                            className="rounded-circle" /> :
                                        <img src="/images/undraw_male_avatar.png" alt="user_img" 
                                            width="150" height="140" className="rounded-circle" />}
                            </div>
                        </h5>
                        <p id="aside_p_username" className="card-text">{username}님</p>
                    </div>
                        <div className="card-footer text-muted">
                            <span className="text-danger" style={{cursor:'pointer'}} 
                                  onClick={showUserImg}>이미지 보기</span>
                        </div>
                    </div>
                    <div className="my-4 px-0">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <FontAwesomeIcon icon={faAngleDown} size="lg"/> 주문 배송
                            </li>
                            <Link to="/users/purchase">
                                <li className="list-group-item">주문 내역</li>
                            </Link>
                            <Link to="/users/return">
                                <li className="list-group-item">취소/환불 내역</li>
                            </Link>
                            <li className="list-group-item">
                                <FontAwesomeIcon icon={faAngleDown} size="lg"/>  구매 후기</li>
                            <Link to="/users/review">
                                <li className="list-group-item">후기 쓰기</li>
                            </Link>
                            <li className="list-group-item">
                                <FontAwesomeIcon icon={faAngleDown} size="lg"/>  관심리스트</li>
                            <Link to="/users/wish">
                                <li className="list-group-item">즐겨찾기 리스트</li></Link>
                            <li className="list-group-item">
                                <FontAwesomeIcon icon={faAngleDown} size="lg"/>  내 정보</li>
                            <Link to="/users/edit">
                                <li className="list-group-item">회원정보 수정</li>
                            </Link>
                            <Link to="/users/mlg">
                                <li className="list-group-item">적립금 확인</li>
                            </Link>
                        </ul>
                    </div>
                </div>
            </aside>
        </div>
    );
}

Aside.defaultProps = defaultProps;
Aside.propTypes = propTypes;


export default Aside;