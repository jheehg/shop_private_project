import React, { Component } from 'react';
import Header from '../components/Header';
import Aside from '../components/Aside';
import Footer from '../components/Footer';
import axios from 'axios';
import PurchaseBox from '../components/PurchaseBox';
import Pagination from '../components/Pagination';



class Purchase extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
            uidx:0, uname:'', uimg:'', loginSession :false,
            modal: false, 
            orderCnt: 0, orderInfo: [[]], itemList: [[]],
            prvnxt: [0,6], pageCount: 1 //default
        }
      }
   
    getPurchaseInfo = (uidx, cpage = 1)=>{
        axios.post('/users/purchase', {uidx, cpage})
        .then(response =>{
           // console.log(response.data);
           let result = response.data.result;
            if(result < 0) {
                window.location.href="http://localhost:3333/login";
            }
            else if(result === 0) throw new Error();
            else 
            this.setState({
                orderCnt : result.orderCnt,
                orderInfo: result.orderInfo,
                itemList : result.itemList,
                prvnxt   : result.pdata? result.pdata.prvnxt : [0,6],
                pageCount: result.pdata? result.pdata.pageCount : 1   
            })

        })
        .catch(err=>{
            console.log('결제조회 오류 '+err);
            alert('처리에 실패했습니다. 다시 시도해주세요');
        })
    }
    currentPage = (uidx, cpage)=>{
        this.getPurchaseInfo(uidx, cpage);
    }
    
    
    componentDidMount(){
        let user = JSON.parse(localStorage.getItem('user'));
        this.setState({
            uidx : user.useridx, uname :user.username,
            uimg : user.userimg, loginSession : user.loginSession
        })
        this.getPurchaseInfo(user.useridx);
    }
    
    toggle = ()=> {
        this.setState({
            modal: !this.state.modal
        })
    }

    render() {
        let item = this.state.itemList;
         //아이템목록 최신순으로 정렬(오더키 높은순 정렬)
        item = item.sort((a,b) => b[8] - a[8]); 
        
        return (
            <div>
                <Header loginSession={this.state.loginSession}/>
                <Aside username={this.state.uname} userimg={this.state.uimg}/>
                 <section>
                    <div className="col-md-12">
                        <div className="row" >
                            <div className="card m-4 border-0" style={{width: '85%'}}>
                                <h5 style={{borderLeft: '5px solid'}} 
                                    className="border-primary pl-2 mb-2">주문 내역</h5>
                                {this.state.orderCnt>0? 
                                    this.state.orderInfo.map((pbox,i) =>{
                                    return <PurchaseBox orderInfo={pbox}
                                                        itemList={item[i]}
                                                        key={i} />
                                }): <div className="d-flex justify-content-center my-4"><h6>
                                        <b>주문 내역이 없습니다</b></h6></div>}
                            </div>
                            <div style={{width: '95%'}}>
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

export default Purchase;