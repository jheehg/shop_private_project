import React, { Component } from 'react';
import Header from '../components/Header';
import Aside from '../components/Aside';
import Footer from '../components/Footer';
import ReturnBox from '../components/ReturnBox';
import axios from 'axios';
import Pagination from '../components/Pagination';

class Return extends Component {
    state = {
        uidx     : 0,     uname     :'',    uimg      :'', 
        cancelCnt: 0,     cancelInfo: [[]], cancelList: [[]],
        prvnxt   : [0,6], pageCount : 1, loginSession :false
        
    }
    getCancelOrder = (uidx, cpage=1)=>{
        axios.post('/users/return', {uidx, cpage})
        .then(response =>{
            console.log(response.data);
            let result = response.data.result;
            if(result === -1)  
                window.location.href="http://localhost:3333/login";
            
            else if(result === 0) throw new Error();
            else 
            this.setState({
                cancelCnt  : result.cancelCnt,
                cancelInfo : result.cancelInfo,
                cancelList : result.cancelList,
                prvnxt     : result.pdata? result.pdata.prvnxt : [0,6],
                pageCount  : result.pdata? result.pdata.pageCount : 1
            })

        })
        .catch(err=>{
            console.log('결제조회 오류 '+err);
            alert('처리에 실패했습니다. 다시 시도해주세요');
        })
    }

    currentPage=(uidx, cpage)=>{
        this.getCancelOrder(uidx, cpage);
    }

    componentDidMount(){
        let user = JSON.parse(localStorage.getItem('user'));
        this.setState({
            uidx: user.useridx, uname: user.username, 
            uimg:user.userimg, loginSession: user.loginSession });
        this.getCancelOrder(user.useridx);
    }
    render() {
        let cancel = this.state.cancelList;
        //아이템목록 최신순으로 정렬(오더키 높은순 정렬)
        cancel = cancel.sort((a,b) => b[8] - a[8]); 
        return (
            <div>
                <Header loginSession={this.state.loginSession}/>
                <Aside username={this.state.uname} userimg={this.state.uimg}/>
                <section>
                    <div className="col-md-12">
                        <div className="row" width="95%">
                            <div className="card m-4 border-0" style={{width: '83%'}}>
                            <h5 style={{borderLeft: '5px solid'}} 
                                className="border-primary pl-2">환불/취소 내역</h5>
                            {this.state.cancelCnt>0? 
                                this.state.cancelInfo.map((cl,i)=>{ 
                                    return <ReturnBox cancelInfo={cl} 
                                                      cancelList={cancel[i]} 
                                                      key={i}/>
                            }) : <div className="d-flex justify-content-center my-4">
                                    <h6><b>환불/취소 내역이 없습니다</b></h6></div>}
                            </div>
                            <div style={{width: '90%'}}>
                                <Pagination prvnxt={this.state.prvnxt}
                                            currentPage={this.currentPage}
                                            pageCount={this.state.pageCount}/>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer/>
            </div>
        );
    }
}

export default Return;