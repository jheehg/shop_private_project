import React, { Component } from 'react';
import Header from '../components/Header';
import Aside from '../components/Aside';
import Footer from '../components/Footer';
import WishBox from '../components/WishBox';
import axios from 'axios';
import Pagination from '../components/Pagination';

const productList = [{
        wid:0, pid: 0, pimg: '',
        p_seller_name : '',
        p_origin_price: 0,
        p_sale_price: 0,
        p_point: 0, pname : ''
}];


class Wish extends Component {
    state = {
        uidx : 0, uname :'', uimg :'', 
        loginSession : false, product : productList
    }
    
    getWishList = (uidx)=>{
        const prodArr = [];
        axios.get('/users/wish?idx='+uidx)
            .then(response =>{
                //console.log(response.data);
                let prod = response.data.result;
                if(prod === -1){
                    window.location.href="http://localhost:3333/login";
                }
                else if(prod === 0) {
                    alert('처리에 실패했습니다. 다시 시도해주세요');
                    document.history.push('/users');
                }
                else if(prod.length>0){
                    for(let i=0; i<prod.length; i++){
                        prodArr.push({
                                    wid: prod[i][0],
                                    pid: prod[i][3],
                                    pimg: prod[i][5],
                                    p_point: prod[i][8] || 0,
                                    p_seller_name : prod[i][9],
                                    pname : prod[i][4],
                                    p_origin_price: prod[i][6],
                                    p_sale_price: prod[i][7]});
                        }
                        this.setState({ product : prodArr });
                }
            })
            .catch((error)=>{
                console.log(error);
            });
        
    }
    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('user'));
        this.setState({
            uidx : user.useridx, uname :user.username,
            uimg : user.userimg, loginSession : user.loginSession
        })
       this.getWishList(user.useridx);
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
                                <h5 style={{borderLeft: '5px solid'}} 
                                    className="border-primary pl-2 mb-4">즐겨찾기 리스트</h5>
                                 {this.state.product[0].pid!==0?
                                     this.state.product.map((pduct, i)=>{
                                 return <WishBox 
                                          wid={pduct.wid}
                                          pid={pduct.pid}
                                          pimg={pduct.pimg}
                                          p_point={pduct.p_point}
                                          p_seller_name={pduct.p_seller_name}
                                          pname={pduct.pname}
                                          p_origin_price={pduct.p_origin_price}
                                          p_sale_price={pduct.p_sale_price}
                                          key={i}/>
                                 }): <WishBox pid={0}/>}
                                </div>
                            </div>
                              <Pagination/>
                            </div>
                    </section>
                <Footer/>
            </div>
        );
    }
}

export default Wish;