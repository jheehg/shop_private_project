import React, { Component } from 'react';
import Header from '../components/Header';
import Aside from '../components/Aside';
import Footer from '../components/Footer';
import axios from 'axios';
import ReviewBox from '../components/ReviewBox';
import { withRouter } from 'react-router-dom';
import Pagination from '../components/Pagination';


class Review extends Component {
    state = {
        uidx : 0, uname :'', uimg :'', loginSession : false,
        rvwItem : [{
            listId: 0, pid: 0,
            pimg: '', p_point: 0,
            p_seller_name : '', pname : '',
            odate : '', top_opt: '',
            sub_opt: '', done : false
        }]

    }
    _isMounted = false; //unmount component error 
    getListForReview = (uidx, cpage=1)=>{
        const rvwArr = [];
        axios.get('/users/review?uidx='+uidx+'&cpage='+cpage)
        .then(response =>{
            //console.log(response.data);
            let rvw = response.data.result;
            if(rvw === 'fail') {
                alert('처리에 실패했습니다. 다시 시도해주세요');
                this.props.history.push('/users');
            }
   
            if(rvw.length>0){
                for(let i=0; i<rvw.length; i++){
                    rvwArr.push({
                                listId:rvw[i][8],
                                pid:rvw[i][1],
                                pimg: rvw[i][2],
                                p_point: rvw[i][4] || 0,
                                p_seller_name : rvw[i][5],
                                pname : rvw[i][3],
                                odate : rvw[i][6],
                                top_opt: rvw[i][10],
                                sub_opt: rvw[i][9],
                                done : rvw[i][11]
                    })
                }
                if(this._isMounted){
                    this.setState({ rvwItem : rvwArr });
                }
            }
        })
        .catch(err=>{
            console.log('후기작성 아이템 불러오기 오류'+err);
        })
    }
    //done 업데이트 
    delReview = (idx)=>{
        let copyOne = {}, copyAll1 = [], copyAll2 = [];
        this.state.rvwItem.forEach((item, i)=>{
            if(i === idx) copyOne = item;
        });
        copyOne.done = !copyOne.done;
        copyAll1 = this.state.rvwItem.filter((item, i)=>{
            return i < idx;
        })
        copyAll2 = this.state.rvwItem.filter((item, i)=>{
            return i > idx;
        })
        if(this._isMounted){
            this.setState({
                rvwItem : copyAll1.concat(copyOne).concat(copyAll2)
            })
        }
    }

    componentDidMount() {
        this._isMounted = true;
        let user = JSON.parse(localStorage.getItem('user'));
        this.getListForReview(user.useridx);
        this.setState({
            uidx : user.useridx, uname :user.username,
            uimg : user.userimg, loginSession: user.loginSession
        })
    }
    componentWillUnmount(){
        this._isMounted = false;
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
                                    className="border-primary pl-2">후기 리스트<br/></h5>
                                { this.state.rvwItem[0].pid!==0? this.state.rvwItem.map((rv, i)=>{
                                    return <ReviewBox
                                                listId={rv.listId}
                                                pid={rv.pid}
                                                pimg={rv.pimg}
                                                p_point={rv.p_point}
                                                p_seller_name={rv.p_seller_name}
                                                pname={rv.pname}
                                                odate={rv.odate}
                                                done={rv.done} 
                                                top_opt={rv.top_opt}
                                                sub_opt={rv.sub_opt}
                                                key={i}
                                                list={i}
                                                delReviewCb={this.delReview}/>
                            }) : <div className="text-center"><p>후기 목록이 비어있습니다</p></div>}
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

export default withRouter(Review);