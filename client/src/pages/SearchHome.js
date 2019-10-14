import React, { Component } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Aside from '../components/Aside';
import WishBoxSub from '../components/WishBoxSub';
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
import axios from 'axios';
import RecentBuyBox from '../components/RecentBuyBox';

class SearchHome extends Component {

    state = {
        useridx : 0, username : '', userimg : '',
        usermileage : 0, pln_mlg : 0, originImg : '', 
        loginSession :false, orderCnt : 0, cancelCnt : 0,
        recentOrder : [], wishData : [[]], orderListCnt : [[]]
    }
   
   
    getUserInfo = ()=>{  
        axios.get("/users")
            .then(response=> {
               // console.log(response.data);
                if(response.data.loginSession){
                    let arr = response.data.userbirth.split('-');
                    if(arr[1].toString().length<2) {
                        arr[1]='0'+arr[1];
                    }
                    if(arr[2].toString().length<2) {
                        arr[2]='0'+arr[2];
                    }
                    arr = arr.join('-');
                    let user = {
                        loginSession : true,
                        useridx : response.data.useridx, username : response.data.username,
                        useremail : response.data.useremail, userimg : response.data.userimg, 
                        originImg : response.data.originImg, usermileage : response.data.usermileage, 
                        pln_mlg: response.data.pln_mlg, usertel : response.data.usertel, userbirth: arr,
                        agreement : response.data.agreement, cartNum : response.data.cartNum
                    }
                   
                    localStorage.setItem('user',JSON.stringify(user));
                    this.setState({
                        loginSession : true,
                        useridx : response.data.useridx, username : response.data.username,
                        userimg : response.data.userimg,
                        originImg : response.data.originImg, pln_mlg: response.data.pln_mlg,
                        usermileage : response.data.usermileage, 
                        orderCnt : response.data.orderCnt, cancelCnt : response.data.cancelCnt, 
                        recentOrder : response.data.recentOrder || [], 
                        wishData : response.data.wishData || [[]], 
                        orderListCnt : response.data.orderListCnt || [[]]
                    })
                } else {
                 // window.location.href="http://localhost:3333/login";
                }
            })
            .catch(function (error) {
                console.log('userdata error :'+error.message);
                window.location.href="http://localhost:3333";
            });
    }
    componentDidMount() {
        this.getUserInfo();
    }

    render() {
        return (
            <div>
                <Header loginSession={this.state.loginSession}/>
                <Aside username={this.state.username} userimg={this.state.userimg}/>
                    <section>
                        <div className="container">
                        <div className="row">
                            <div className="col-md-12 mx-3">
                                <h6 className="border-bottom border-info p-2">
                                    <FontAwesomeIcon icon={faAngleDoubleRight}/>
                                    <span id="mypage_span_username" 
                                          style={{color:'#5a89c7'}}>{this.state.username}</span> 님의 정보
                                </h6>
                                <div className="row text-center mb-4">
                                <div className="col-lg-4 p-4 col-md-6">
                                    <div className="card">
                                        <div className="card-body p-4 border-info">
                                            <h4><b>적립금</b></h4>
                                            <h2 className="text-danger my-3">{this.state.usermileage}
                                                <span style={{fontSize:'1.3rem'}}>P</span>
                                            </h2>
                                            <Link to="/users/mileage"><p className="mb-0 lead"> 확인하기</p></Link>
                                        </div>
                                    </div>
                                </div>
                                    <div className="col-lg-4 p-4 col-md-6">
                                        <div className="card">
                                            <div className="card-body p-4">
                                                <h4> <b>주문조회</b></h4>
                                                <h2 className="text-danger my-3"><span>{this.state.orderCnt}</span> 건</h2>
                                                <a href="/users/purchase"><p className="mb-0 lead"> 확인하기</p></a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 p-4">
                                        <div className="card">
                                            <div className="card-body p-4">
                                                <h4> <b>취소환불조회</b></h4>
                                                <h2 className="text-danger my-3"><span>{this.state.cancelCnt}</span> 건</h2>
                                                <a href="/users/return"><p className="mb-0 lead"> 확인하기</p></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card m-4 border-0" style={{width:'100%', maxHeight:'30%'}}>
                                <h5 style={{borderLeft: '5px solid'}} className="border-primary pl-2">최근 구매 내역</h5>
                                {this.state.recentOrder.length!==0?
                                <RecentBuyBox recentOrder={this.state.recentOrder}
                                              orderListCnt={this.state.orderListCnt}/> :
                                <p>결제하신 목록이 없습니다</p>}
                            </div>
                            <div className="col-md-12 m-3 pl-2 mb-5">
                                <h5 style={{borderLeft: '5px solid'}} className="border-primary pl-2 my-2">즐겨찾기 리스트</h5>
                                <div className="row mt-3 mb-3">
                                {this.state.wishData[0]? 
                                this.state.wishData.map((wish, i)=>{
                                         return <WishBoxSub cpname={wish[8]}
                                                            pimg={wish[7]}
                                                            pname={wish[6]}
                                                            key={i}/>}) : ''}                      
                                </div>
                                {!this.state.wishData[0] && 
                                <div className="d-flex justify-content-center my-4">
                                    <h6><b>즐겨찾기 목록이 없습니다</b></h6>
                                </div>}
                                <div className="row text-center">
                                <a href="/users/wish" 
                                   className="btn btn-outline-secondary m-auto btn-sm">더 보러가기</a>
                                </div>
                            </div>
                        </div>
                        </div>
                    </section>
                <Footer/>
            </div>
        );
    }
}

export default SearchHome;


