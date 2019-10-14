import React from 'react';
import PropTypes from 'prop-types';

const defaultProps = { 
    loginSession: false, 
};
const propTypes = { 
    loginSession: PropTypes.bool,
}; 

const TopNav =({ loginSession })=> {
    let user = localStorage.getItem('user');
    loginSession = user? true : false;
   
        return (
            <div className="collapse navbar-collapse topNav">
                <ul className="navbar-nav ml-auto">
                    {loginSession ||
                    <>
                        <li className="nav-item mx-1 "> 
                            <a className="nav-link topNavBar" 
                               href="http://localhost:3333/login"><b>로그인</b></a> 
                        </li>
                        <li className="nav-item mx-1"> 
                            <a className="nav-link topNavBar" 
                               href="http://localhost:3333/join"><b>회원가입</b></a> 
                        </li>
                        <li className="nav-item mx-1"> 
                            <a className="nav-link topNavBar" 
                               href="http://localhost:3333/notice"><b>고객센터</b></a> 
                        </li>
                    </>
                    }
                    {loginSession &&
                    <>
                        <li className="nav-item mx-1"> 
                            <a className="nav-link topNavBar" 
                               href="http://localhost:3333/users/msg"><b>즐겨찾기</b></a> 
                        </li>
                        <li className="nav-item mx-1"> 
                            <a className="nav-link topNavBar" 
                               href="http://localhost:3333/logout"><b>로그아웃</b></a> 
                        </li>
                        <li className="nav-item mx-1">
                            <a className="nav-link topNavBar" 
                               href="http://localhost:3333/notice"><b>고객센터</b></a>
                        </li>
                    </>
                    }
                </ul>
            </div>
        );
}

TopNav.defaultProps = defaultProps;
TopNav.propTypes = propTypes;

export default TopNav;