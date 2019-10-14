import React, { Component } from 'react';
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarO, faTrashAlt, faFileImage } from "@fortawesome/free-regular-svg-icons";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';


let imgList = [];
class ReviewForm extends Component {
    state = {
        starChked : [ 0,0,0,0,0 ],
        data : "<p>후기 내용을 입력해주세요!</p>",
        uploadImg : [], //수정 시 기본에 업로드 되있는 이미지
        savedImgName : '' //수정 시 서버에 저장된 이미지명
    }
    //별점 주기
    ratePoint = (e)=>{
        let arr = [];
        let idx = e.target.dataset.star;
        
        for(let i=0; i<5; i++){
            if(i<=idx) {
                arr.push(1);
            } else {
                arr.push(0);
            }
        }
        this.setState({ starChked : arr });
    }
    //텍스트내용 전송
    submitText = ()=>{
       let rvContent = new FormData();
        rvContent.append('text', this.state.data);
        rvContent.append('rate', this.state.starChked); 
        rvContent.append('pid', this.props.pid);
        rvContent.append('uidx', JSON.parse(localStorage.getItem('user')).useridx);  
        rvContent.append('listId', this.props.listId);
        rvContent.append('upImgList', this.state.uploadImg);
        rvContent.append('savedImgName', this.state.savedImgName);
        rvContent.append('mode', this.props.mode);
        for(let i=0; i<3; i++){
            rvContent.append(`upImg${i}`,document.forms[1].upImg[i].files[0]);
        }

        axios.post('/users/review/text', rvContent)
            .then(response =>{
                //console.log(response.data);
                if(response.data.result === 1) {
                    alert('후기 작성을 완료했습니다');
                    this.props.history.push('/users/review');
                } else {
                    alert('처리에 실패했습니다. 다시 시도해주세요');
                }
            })
            .catch(err=>{
                console.log(err);
            })
      
    }
    //수정 시 DB에서 리뷰 내용 불러오기
    getContents = (listId)=>{
        axios.post('/users/review/edit', {listId})
        .then(response => {
            //console.log(response.data);
            if(response.data.result < 1) throw new Error();
            let arr = [];
            let rate = response.data.result[0][2] || 0; //null값 방지
            this.state.starChked.forEach((st,i)=>{
                if(i<rate) arr.push(1);
                else arr.push(0);   
            });

            let img;
            if(response.data.result[0][5]){ //이미지 있을때
                if(response.data.result[0][5].includes('*')) { //이미지가 여러개일때
                    img = response.data.result[0][5].split('*');
                } else {
                    img = [response.data.result[0][5]];
                }
            } else {
                img = [];
            }
            this.setState({
                 data: response.data.result[0][0],
                 starChked: arr,
                 uploadImg : img,//이미지 원본명
                 savedImgName : response.data.result[0][1] || ''
            });
        })
        .catch(err=>{
            console.log('리뷰내용 불러오기 오류'+err);
            alert('처리에 실패했습니다. 다시 시도해주세요');
        })
    }
    //파일 추가
    getImgList = (e)=>{
        let labelVal = e.target.nextSibling.textContent; //기존에 파일명 있는지 체크
        let fname = e.target.value.replace('C:\\fakepath\\', '');
        if(!fname) return; //파일을 선택하지 않을 시 종료
        if(imgList.length>2) {
            alert('업로드파일은 3개를 초과할 수 없습니다');
            return;
        }
        //삭제없이 다른 파일 넣으려 하면 막기
        if(labelVal!=='파일을 선택하세요' && labelVal.indexOf('.')>=0) {
            alert('파일을 삭제한 후 다시 선택해주세요');
            //파일객체 지우기 
            if(window.navigator.userAgent.toLowerCase().indexOf('msie')!==-1) { // ie 
                e.target.replaceWith(e.target.cloneNode(true)); 
            } else {
                e.target.value=''; 
            }
            return;
        }
        e.target.nextSibling.innerHTML = fname;
       
        imgList.push(fname);
        this.setState({uploadImg: imgList });
    }

    //업로드 이미지 삭제
    deleteImg = ()=>{
        imgList = []; //초기화
        this.setState({ uploadImg: [] });
        document.forms[1].upImg.forEach(item =>{
            item.nextSibling.innerHTML = '파일을 선택하세요';
            //파일객체 지우기 
            if(window.navigator.userAgent.toLowerCase().indexOf('msie')!==-1) { // ie 
                item.replaceWith(item.cloneNode(true)); 
            } else {
                item.value=''; 
            }
        })
    }

    componentDidMount(){
        if(this.props.mode==="edit"){ //수정 모드시
            this.getContents(this.props.listId);
        } 
    }
    render() {
        let starArr = [];
        for(let i=0; i<5; i++){
            starArr.push(<FontAwesomeIcon icon={this.state.starChked[i]===1? faStar :faStarO}
                                        className="starRate" key={i} 
                                        onClick={this.ratePoint} 
                                        data-star={i}/>)
        }

        return (
            <div>
                <section>
                    <div className="col-md-12">
                        <div className="row">
                            <div className="m-4 w-75">
                             <h5 style={{borderLeft: '5px solid'}} className="border-primary pl-2">
                             {this.props.mode==='write'? '후기 쓰기' : '후기 수정'}</h5>
                               
                                <div className="d-flex flex-column justify-content-center">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row">
                                                <img src={this.props.pimg} 
                                                     alt="review_sm_img" width="90" height="70" 
                                                     className="mx-2 mb-2"/>
                                                <p className="d-flex flex-column" 
                                                   style={{fontSize: '1.0rem', fontWeight:'300'}}>
                                                    <small>{this.props.seller}</small>
                                                    <span>{this.props.pname} {this.props.top_opt}-{this.props.sub_opt}</span>
                                                </p>
                                            </div>
                                            <div className="row">
                                                <p className="text-warning ml-2 mb-0">
                                                    <span className="text-dark mr-2">별을 탭해서 평가해주세요!</span>
                                                   { starArr }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <CKEditor
                                        fileUpload = {true}
                                        style={{maxHeight:'500px'}}
                                        editor={ ClassicEditor }
                                        data="<p>후기 내용을 입력해주세요!</p>"
                                        onInit={ editor => {
                                            console.log( 'Editor is ready to use!', editor );
                                        } }
                                        onChange={(event, editor)=> {
                                            const data = editor.getData();
                                           // console.log( { event, editor, data } );
                                            this.setState({ data });
                                       }}
                                        config={{
                                            plugins: [ Essentials, Paragraph, Bold, 
                                                       Italic, Heading, Underline ],
                                            toolbar: [ 'heading', '|', 'bold', 'italic', 
                                                       'Underline', '|', 'undo', 'redo' ]        
                                    }}
                                />
                                    <div className="py-2">
                                        <form className="upImgForm" action="#" encType="multipart/form-data">
                                            <div className="card">
                                                <div className="card-body">
                                                    <p className="mb-3" style={{fontWeight:400}}>
                                                        <FontAwesomeIcon icon={faFileImage} className="mr-1"/> 
                                                        이미지 업로드는 최대 3개까지 가능합니다 (jpg, png, gif)</p>
                                                   
                                                    <div className="custom-file mb-1">
                                                        <input type="file" className="custom-file-input input-sm" name="upImg" data-file="0" onChange={this.getImgList}/>
                                                        <label className="custom-file-label" htmlFor="upImg">파일을 선택하세요</label>
                                                    </div>
                                                    <div className="custom-file mb-1">
                                                        <input type="file" className="custom-file-input input-sm" name="upImg" data-file="1" onChange={this.getImgList}/>
                                                        <label className="custom-file-label" htmlFor="upImg">파일을 선택하세요</label>
                                                    </div>
                                                    <div className="custom-file mb-1">
                                                        <input type="file" className="custom-file-input input-sm" name="upImg" data-file="2" onChange={this.getImgList}/>
                                                        <label className="custom-file-label" htmlFor="upImg">파일을 선택하세요</label>
                                                    </div> 
                                                    <p className="m-0 p-0 ml-2 mt-2" style={{fontSize:'0.9rem'}}>
                                                        <FontAwesomeIcon icon={faAngleRight} className="mr-1" size="sm"/>
                                                        <b>업로드 목록</b>&nbsp;<small>( 목록 삭제를 원할 경우 모두삭제 버튼을 눌러주세요 )</small>
                                                    </p>
                                                    {this.state.uploadImg.length>0?
                                                    <div className="card-body d-flex justify-content-between p-2">
                                                        <p style={{fontSize:'0.8rem'}}>
                                                        {this.state.uploadImg.map((img, i)=>{
                                                            return (<><span className="mr-3" key={i}>{img}</span><br/></>);
                                                        })}
                                                        </p>
                                                        <div>
                                                            <button className="btn btn-outline-dark btn-sm" 
                                                                    onClick={this.deleteImg}
                                                                    ref={(ref)=> this.delBtn = ref}>
                                                            <FontAwesomeIcon icon={faTrashAlt} /> 모두삭제</button>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="card-body d-flex justify-content-between">
                                                        <span>업로드 파일이 없습니다</span>
                                                        <button className="btn btn-outline-dark btn-sm" disabled>
                                                            <FontAwesomeIcon icon={faTrashAlt} /> 모두삭제</button>
                                                    </div>
                                                    }       
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                
                                    <div className="row mx-auto">
                                        <div className="text-center my-4">
                                            <button type="button" className="btn btn-primary" 
                                            data-toggle="modal" data-target="#reviewDone"
                                            onClick={this.submitText}>후기 등록</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

ReviewForm.defaultProps = {
    listId: '0', pimg: '',
    seller: '', sub_opt: '',
    top_opt: '', pname: '',
    pid: 0, mode: ''
}

ReviewForm.propTypes = {
    listId: PropTypes.string, pimg: PropTypes.string,
    seller: PropTypes.string, sub_opt: PropTypes.string,
    top_opt: PropTypes.string, pname: PropTypes.string,
    pid: PropTypes.number, mode: PropTypes.string
}

export default withRouter(ReviewForm);