import React, { Component } from 'react';
import Header from '../components/Header';
import Aside from '../components/Aside';
import Footer from '../components/Footer';
import ReviewForm from '../components/ReviewForm';


class ReviewWrite extends Component {
    state = {
        uidx : 0, uname :'', uimg :'', 
        originImg : '', loginSession :false
    }
    componentDidMount(){
        let user = JSON.parse(localStorage.getItem('user'));
        this.setState({
            uidx: user.useridx, uname: user.username, 
            uimg:user.userimg, originImg : user.originImg, 
            loginSession: user.loginSession });
    }
    render() {
        let info = this.props.location.state;
        let idx = this.props.location.pathname.lastIndexOf('/');
        let listId = this.props.location.pathname.slice(idx+1);

        return (
            <div>
                <Header loginSession={this.state.loginSession}/>
                <Aside username={this.state.uname} userimg={this.state.uimg}/>
                <ReviewForm listId={listId}
                            pimg={info.pimg}
                            seller={info.seller}
                            sub_opt={info.sub_opt}
                            top_opt={info.top_opt}
                            pname={info.pname}
                            pid={info.pid}
                            mode={info.mode}   
                />
                <Footer/>
            </div>
        );
    }
}

export default ReviewWrite;