import React, { Component } from 'react';
import Header from '../components/Header';
import Aside from '../components/Aside';
import Footer from '../components/Footer';
import axios from 'axios';
import * as vali from '../Validate';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import ValiModal from '../components/ValiModal';
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


class EditInfo extends Component {

    constructor(props){
        super(props);
        this.state = {
            uidx : 0, uname :'',
            uemail: '', utel:'',
            upwd1 :'', upwd2: '', uimg :'', 
            originImg: '', ubirth:'', loginSession : false,
            eventAgree : false,
            selectedFile : null, //첨부되는 파일객체
            isValidated : false, //본인인증 성공 여부
            valiModal : false //modal
        }
    }
    //modal toggle
    toggleVali = ()=>{
        this.setState({ valiModal : !this.state.valiModal });
    }
    //인증 성공 처리
    isChecking = ()=>{
        this.setState({ isValidated : true });
    }
   
    handleSubmit = ()=>{
        if(!this.state.uidx || !this.state.uname || !this.state.utel || !this.state.upwd1
          || !this.state.upwd2) {
              alert('입력란을 다시 확인해주세요');
              return;
          } 
        if(!vali.checkName(this.state.uname) || !vali.checkTel(this.state.utel
          || !vali.checkPwd(this.state.upwd1) || this.state.upwd1 !== this.state.upwd2)) {
            alert('입력란을 다시 확인해주세요');
            return;
        }
        if(!this.state.isValidated) {
            alert('본인 인증을 완료해주세요');
            return;
        }
        let editForm = new FormData();
        editForm.append('editIdx', this.state.uidx);
        editForm.append('editName', this.state.uname);
        editForm.append('editEmail', this.state.uemail);
        editForm.append('editTel', this.state.utel);
        editForm.append('editPwd1', this.state.upwd1);
        editForm.append('editPwd2', this.state.upwd2);
        editForm.append('editAgree', this.state.eventAgree);
        editForm.append('editImg', this.state.selectedFile);
        
        let user = {
            agreement: this.state.eventAgree,
            loginSession: true,
            userbirth: JSON.parse(localStorage.getItem('user')).userbirth,
            useremail: JSON.parse(localStorage.getItem('user')).useremail,
            useridx: (localStorage.getItem('user')).useridx,
            usermileage: (localStorage.getItem('user')).usermileage,
            username: this.state.uname,
            usertel: this.state.utel
        }
        
        //파일 전송
        axios.post('/users/auth/edit', editForm)
        .then(function (response) {
            //console.log(response.data);
            let data = response.data;
            if(data.result === 0) throw new Error();

            else if(data.result === 1){
                alert('수정을 완료했습니다');
                user.userimg = data.newimg;
                user.originImg = data.newOriginImg;
                localStorage.setItem('user',JSON.stringify(user));
            } 
        })
        .catch(function (error) {
            alert('처리에 실패했습니다. 다시 시도해주세요');
            console.log(error);
    });
   
    }
   
  
    smsAPIrequest = (phoneNumber)=>{
        phoneNumber = phoneNumber.replace(/-/g,'');
       
        axios.post('/users/auth/smsAPIrequest', {phoneNumber})
        .then(response =>{
            //console.log(response.data);
            if(response.data.result > 0){
                this.toggleVali();
            } else {
                throw new Error();
            }
        })
        .catch(err=>{
            alert('처리에 실패했습니다. 다시 시도해 주세요');
            console.log(err);
        });
    
       
    }   
    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('user'));
        this.setState({
            uidx : user.useridx, uname :user.username,
            uemail: user.useremail, utel:user.usertel,
            upwd1 :'', upwd2: '', uimg : user.userimg, 
            originImg: user.originImg, loginSession :user.loginSession,
            eventAgree : (user.agreement==='yes')?true:false, 
            ubirth:user.userbirth,
            selectedFile : null
        })
    }
   
    //input=file바뀌면 이미지 미리 보여주기
    showImgbox = (input)=>{
        if(input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function (e) {
            document.querySelector('.imgbox').setAttribute('src', e.target.result);  
        }
        reader.readAsDataURL(input.files[0]);
        }
    }
        
    render() {
        let warn = '형식에 맞지 않습니다.';
        let imgAvailable =this.state.uimg? true : false;
        let inputTel 
        = document.editForm? document.editForm.editTel.value.replace(/-/g,''):''; 
        //modal로 입력한 연락처 넘기기

        // sms Validation Modal  
        let checkInput = (
                <Modal isOpen={this.state.valiModal} toggle={this.toggleVali} size="md">
                    <ModalHeader toggle={this.toggleVali}>
                        <div className="w-100 d-flex just-content-between">
                            <span className="ml-2 mb-0 valiHeader">본인 인증하기</span>
                            <button type="button" className="close" onClick={this.toggleVali}></button>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                      <ValiModal toggle={this.toggleVali} check={this.isChecking} inputTel={inputTel}/> {/* modal close권한 넘기기 */}
                    </ModalBody>
                </Modal>
         );
        
        return (
            <div>
                <Header loginSession={this.state.loginSession}/>
                {/* state에 따라 바뀌지 않도록 로컬스토리지에서 가져오기 */}
                <Aside username={JSON.parse(localStorage.getItem('user')).username} 
                       userimg={JSON.parse(localStorage.getItem('user')).userimg} />
                <div className="container">
                    <section>
                        <div className="row">
                            <div className="col-md-10 mx-4">
                                <h5 style={{ borderLeft: '5px solid'}} className="border-primary pl-2">회원 정보 수정</h5>
                                <form className="mt-5" name="editForm" encType="multipart/form-data">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" name="editIdx" value={this.state.idx}/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editName">이름</label>
                                        <input type="text" 
                                               className="form-control" 
                                               name="editName" 
                                               value={this.state.uname} 
                                               onChange={(e)=>{
                                                    this.setState({ uname : e.target.value }) }}  
                                               onBlur={(e)=>{
                                                    if(!vali.checkName(e.target.value)){
                                                        e.target.nextSibling.textContent=warn+" 이름은 한글만 가능합니다"
                                                    } else {
                                                        e.target.nextSibling.textContent='';
                                                    }
                                                }}  />
                                        <small className="result_txt"></small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editEmail">이메일</label>
                                        <input type="text" 
                                               className="form-control" 
                                               name="editEmail"
                                               value={this.state.uemail} readOnly/>
                                    </div>
                                    <label htmlFor="editTel">연락처</label>
                                    <div className="input-group mb-0">
                                        <input type="text" 
                                               className="form-control" 
                                               name="editTel" 
                                               value={this.state.utel} 
                                               onChange={(e)=>{ this.setState({ utel : e.target.value }) }}/>
                                        <div className="input-group-append">
                                            <button className="btn btn-outline-secondary" 
                                                    type="button" 
                                                    onClick={(e)=> {
                                                        this.smsAPIrequest(e.target.parentElement.previousSibling.value);
                                                        this.setState({ isValidated : false });
                                                    }}>본인인증</button>  
                                        </div>
                                        {this.state.isValidated &&
                                        <FontAwesomeIcon className="faCheck" icon={faCheck} size="2x" />
                                       }
                                    </div>
                                    {this.state.isValidated && <small className="result_txt">인증을 완료했습니다</small>}
                                    {/* 인증번호 넣는 input */}
                                    {checkInput}
                                    <div className="form-group mt-3">
                                        <label htmlFor="editPwd1">비밀번호</label>
                                        <p style={{fontSize:'0.8rem'}} className="my-1">
                                            비밀번호는 5자이상 10자이내, 알파벳 대소문자+특수기호 조합으로 입력해주세요
                                        </p>
                                        <input type="password" 
                                               className="form-control mb-1" 
                                               name="editPwd1" 
                                               value={this.state.upwd1} 
                                               onChange={(e)=>{
                                                    this.setState({ upwd1 : e.target.value });
                                                    if(!vali.checkPwd(e.target.value)){
                                                        e.target.nextSibling.textContent ='비밀번호를 다시 확인해주세요';
                                                    } else {
                                                        e.target.nextSibling.textContent = '';                                           
                                                    }
                                                }}/>
                                        <small className="result_txt"></small>
                                        <input type="password" 
                                               className="form-control" 
                                               name="editPwd2" 
                                               value={this.state.upwd2} 
                                               onChange={(e)=>{
                                                    this.setState({ upwd2 : e.target.value })
                                                    if(this.state.upwd1 !== e.target.value) {
                                                        e.target.nextSibling.textContent = '비밀번호를 다시 확인해주세요';
                                                    } else {
                                                        e.target.nextSibling.textContent = '';
                                                    }
                                               }}/>
                                        <small className="result_txt"></small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editBirth">생년월일</label>
                                        <input type="text" 
                                               className="form-control" 
                                               name="editBirth" 
                                               value={this.state.ubirth} readOnly/>
                                    </div>
                                    <label htmlFor="editImg">프로필 이미지</label>
                                    <div className="custom-file mb-3">
                                        <input type="file" 
                                               className="custom-file-input"  
                                               name="editImg" 
                                               onChange={(e)=>{
                                                    this.setState({ 
                                                        selectedFile : e.target.files[0],
                                                        originImg : e.target.value.replace('C:\\fakepath\\','') });
                                                    this.showImgbox(e.target);
                                               }}/>
                                        {imgAvailable ||
                                            <label className="custom-file-label" htmlFor="editImg">이미지를 선택하세요</label>
                                        }
                                        {imgAvailable && 
                                            <label className="custom-file-label" htmlFor="editImg">{this.state.originImg}</label>
                                        }
                                        <div id="editinfo_imgbox" width="140px" height="140px" className="container m-2">
                                            {imgAvailable || <img src="/images/undraw_male_avatar.png" 
                                                                  className="img-thumbnail imgbox" alt="imgbox" 
                                                                  width="100px" height="100px" />}
                                            {imgAvailable && <img src={'http://localhost:3333/upload/'+this.state.uimg} 
                                                                  className="img-thumbnail imgbox" alt="imgbox" 
                                                                  width="100px" height="100px" />}      
                                        </div>
                                    </div>
                                    <br/><br/>
                                    <div className="custom-control custom-checkbox mt-3 mb-5 pl-3">
                                        <input type="checkbox" 
                                               className="custom-control-input" 
                                               name="editAgree" 
                                               onChange={(e)=>{ 
                                                   this.setState({ eventAgree : !this.state.eventAgree})
                                               }}/>
                                        <label className="custom-control-label mt-4" htmlFor="editAgree">
                                            SMS, 이메일을 통해 할인 및 이벤트 정보 수신 동의 여부</label>
                                    </div>
                                    <div className="button mx-auto" style={{width:'20%'}}>
                                        <button type="button" className="btn btn-outline-secondary" 
                                                style={{width:'170px'}}
                                                onClick={this.handleSubmit}>수정완료</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        </section>
                    </div>
                <Footer/>
            </div>
        );
    }
}

export default EditInfo;