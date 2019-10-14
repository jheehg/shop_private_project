import React, { Component } from 'react';
import Header from '../components/Header';
import Aside from '../components/Aside';
import Footer from '../components/Footer';
import MlgBox from '../components/MlgBox';
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios';
import Pagination from '../components/Pagination';


class Mileage extends Component {
    state = {
        loginSession :false, 
        uidx : 0, uname :'', uimg :'',
        mlg  : 0, pln_mlg :0,
        opt  : 'week', mlgData : [],
        page :[0,4], pageCount: 1 //페이징
    }
    currentPage = (uidx, cpage)=>{
        this.getMlgList(uidx, cpage);
    }

    getMlgList = (uidx, cpage=1)=>{
        axios.post('/users/mlg', { uidx, opt: this.state.opt, cpage})
        .then(response=>{
           // console.log(response.data);
            let data = response.data;
            if(data.result === -1) {
                window.location.href="http://localhost:3333/login";
            }
            else if(data.result === 0) throw new Error();
            else if(data.result.length > 0){
                this.setState({ 
                    mlgData : data.result,
                    page: data.page,
                    pageCount : data.pageCount
                })
            } 
            else if(!data.result.length){
                this.setState({ 
                    mlgData : [],
                    page: [0,4],
                    pageCount : 1
                })
            }
        })
        .catch(err=>{
            console.log('적립금 페이지 오류 '+err);
            alert('처리에 실패했습니다. 다시 시도해주세요');
        })
    }
    componentDidMount(){
        let user = JSON.parse(localStorage.getItem('user'));
        this.getMlgList(user.useridx);
        this.setState({
            loginSession: user.loginSession,
            uidx: user.useridx, uname: user.username, 
            uimg:user.userimg, mlg: user.usermileage, 
            pln_mlg: user.pln_mlg });
    }
    
    render() {
        return (
            <div>
                <Header loginSession={this.state.loginSession}/>
                <Aside username={this.state.uname} userimg={this.state.uimg}/>
                    <section>
                        <div className="col-md-12">
                            <div className="row">
                                <div className="m-4 w-100">
                                <h5 style={{borderLeft: '5px solid'}} className="border-primary pl-2 mb-4">적립금 내역</h5>
                                <h6 className="pl-3 mb-2">나의 적립금</h6>
                                <div style={{width:'90%'}} className="ml-4">
                                    <div className="row">
                                        <div className="mileage">
                                            <p style={{fontSize:'0.7rem'}} className="my-2">
                                                <FontAwesomeIcon icon={faChevronRight}/> <b>현재 보유한 적립금</b>
                                            </p>
                                            <h3>{this.state.mlg}<span>p</span></h3>
                                        </div>
                                        <div className="mileage">
                                            <p style={{fontSize:'0.7rem'}} className="my-2">
                                                <FontAwesomeIcon icon={faChevronRight}/> <b>예정 적립금</b>
                                            </p>
                                            <h3>{this.state.pln_mlg}<span>p</span></h3>
                                        </div>
                                    </div>
                                </div>
                                <h6 className="pl-3 mt-4 mb-0">적립 상세내역</h6>
                                <div style={{width:'85%'}}>
                                    <form>
                                        <div className="form-group d-flex flex-row justify-content-end">
                                        <label htmlFor="range"><small>기간</small></label>&nbsp;&nbsp; 
                                        <select className="form-control form-control-sm" name="range" style={{width:'10%'}} 
                                            onChange={async(e)=>{
                                                await this.setState({ opt: e.target.value });
                                                await this.getMlgList(this.state.uidx);
                                            }}>
                                            <option value="week">1주</option>
                                            <option value="month">한달</option>
                                            <option value="half">6개월</option>
                                            <option value="year">1년</option>
                                        </select>
                                        </div>
                                    </form>
                                    {this.state.mlgData.length>0?
                                    this.state.mlgData.map((md, i)=>{
                                        return <MlgBox data={md} key={i}/>}) :
                                    <div className="d-flex justify-content-center my-4">
                                        <h6><b>적립금 내역이 없습니다</b></h6></div>}
                                    
                                    <Pagination prvnxt={this.state.page}
                                                currentPage={this.currentPage}
                                                pageCount={this.state.pageCount}/>
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

export default Mileage;