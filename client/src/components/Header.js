import React, { Component } from 'react';
import { faSearch, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import TopNav from './TopNav';


const defaultProps = { 
    loginSession : false
};
const propTypes = { 
    loginSession: PropTypes.bool,
};


class Header extends Component {
    state = {
        cartNum : 0
    }
    
    searchProduct = ()=>{
        let keyword = window.searchForm.searchInput.value.trim();   
        if(!keyword) return;
       
        let url = "/product/search?keyword="+encodeURIComponent(keyword);
        window.location.href="http://localhost:3333"+url;
    };

    componentDidMount(){
        let user = JSON.parse(localStorage.getItem('user'));
        this.setState({ cartNum : user.cartNum });
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-md bg-primary navbar-dark py-1">
                    <div className="container"> 
                        <a className="navbar-brand text-primary" href="http://localhost:3333/">
                            <b className="text-white"></b>
                        </a> 
                        <button className="navbar-toggler navbar-toggler-right border-0" 
                                type="button" data-toggle="collapse" data-target="#navbar4">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                       <TopNav loginSession={this.props.loginSession}/>
                    </div>
                </nav>
                <div className="container">
                    <div className="row">
                        <div className="col-md-3">
                        {/* <!--홈으로 가기--> */}
                            <a href="http://localhost:3333/">
                                <img src="/images/logo.jpeg" alt="logo" width="250"/></a>
                        </div>
                        {/* <!-- search --> */}
                        <div className="col-md-6 d-flex flex-row justify-content-center">
                            <form name="searchForm" className="form-inline" action="/product/search" 
                            method="GET" >
                                <div className="form-group mx-auto">
                                    <input type="text" className="form-control form-control-sm keyword"
                                        name="keyword" placeholder="검색어를 입력하세요"/>
                                </div>
                                <div className="form-group mx-auto">
                                    <button type="button" className="btn btn-sm" onClick={this.searchProduct}>
                                        <FontAwesomeIcon icon={faSearch} size="lg"/>
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="d-flex align-items-center flex-column col-md-3">
                            <div className="main_icon py-4 w-20" style={{display :'inline'}}>
                            {/* <!-- 로그인 여부에 따라 처리 --> */}
                                <a href="/users">
                                    <FontAwesomeIcon icon={faUser} size="2x" className="mx-2" /></a>
                                <a href="http://localhost:3333/order/cart">
                                    <FontAwesomeIcon icon={faShoppingCart} size="2x" className="mx-2" /></a>
                                <a href="http://localhost:3333/order/cart" className="circleBadge">
                                    <span className="circleBadge_num">{this.state.cartNum}</span></a>
                            </div>
                        </div>
                     </div>
                    <Navbar/>
                </div>
            </div>
            );
        }
    }

Header.defaultProps = defaultProps;
Header.propTypes = propTypes;

export default Header;