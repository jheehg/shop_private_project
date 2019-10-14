import React, { useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const defaultProps = { 
    toggle: ()=>{},
    check: ()=>{}, 
    inputTel: '',
};
const propTypes = { 
    toggle: PropTypes.func,
    check:  PropTypes.func,
    inputTel: PropTypes.string
}; 


const ValiModal = ({toggle, check, inputTel})=> {
    const timerRef = useRef();
    const inputRef = useRef();

    let totalTime = (1000 * 60 * 3); // default : 3min

    const timeDecreament = ()=>{
        let min = Math.floor((totalTime % (1000 * 60 * 60)) / (1000*60));
        let sec = Math.floor((totalTime % (1000 * 60)) / 1000);
        if(sec.toString().length === 1) {
            sec = '0'+sec; 
        }
        let txt =  min + ":" + sec; 
        if(timerRef.current)
            timerRef.current.innerHTML = txt; 
        
        if(totalTime <= 0) {  // 시간이 종료 되었으면
            clearInterval(timerOut); 
        } else {
            totalTime = totalTime - 1000; // 남은시간 -1초
        }
    }
    let timerOut = window.setInterval(timeDecreament, 1000);
  
    const sendVeliNum = ()=>{
        let num = inputRef.current.value;
        axios.post('/users/auth/cfVeliNum', {inputNum:num, inputTel})
        .then(response=>{
            //console.log(response.data);
            if(response.data.result === 1){
                alert('인증이 완료되었습니다');
                check();
                toggle();
            } else if(response.data.result === 'wrong'){
                alert('입력하신 인증번호가 맞지 않습니다. 다시 시도해주세요');
                toggle();
            } else {
                throw new Error();
            }
        })
        .catch(err=>{
            alert('처리에 실패했습니다. 다시 시도해 주세요');
            console.log('인증번호 서버로 전송 오류'+err);
        })
    }
 
    return (
      <>
            <div className="form-group mb-2">
                <input type="text" className="form-control" 
                       name="editTel" placeholder="인증번호를 입력하세요" ref={inputRef} />
                <div className="timer" ref={timerRef}></div>
            </div>
            <div style={{fontSize:'0.9rem'}}>
                <p className="m-1">* 3분 이내로 발송받으신 6자리 번호를 입력해주세요</p>
                <p className="m-1 mb-3">* 재전송을 원하시면 취소 버튼을 누른 후 다시 요청해 주세요</p>
            </div>
            <div className="text-center" style={{display:'block'}}>
                <button className="valiBtnOK" type="button" 
                            onClick={()=>{
                                clearInterval(timerOut);
                                sendVeliNum();
                            }}>확 인</button> 
                <button className="valiBtnOK" type="button" 
                            onClick={()=>{
                                clearInterval(timerOut);
                                toggle();
                            }}>취 소</button> 
            </div>
        </>
        
    );  
}

ValiModal.defaultProps = defaultProps;
ValiModal.propTypes = propTypes;

export default ValiModal;