
//회원가입 

let availableEmail = false;

$('#agree_window').click(()=>{
  let agreement 
  = window.open("agreement","agree","width=500, height=550, left=300, top=200");
})


$('#aside_imgtab').click((e)=>{
  e.preventDefault();
  let imgtab 
  = window.open("/users/imgtab", "imgtab", "width=400, height=400, left=250, top=200");
   
});

$('.custom-file-input').change((e)=>{
  let file = e.target.files[0].name;
  $('.custom-file-label').html(file);
  $('#imgbox').attr('src','/images/'+file);
  
});


// 회원 정보 수정
// 정규식 체크
$('#editForm input').change((e)=>{
    if(e.target.id === 'editinfo_name'){
      if(!checkName($('#editinfo_name'))) {
        $('#edit_name_result').html('이름은 한글만 가능합니다');
      } else {
        $('#edit_name_result').html(''); 
      }
    } 
     
    if(e.target.id === 'editinfo_tel'){
      if(!checkTel($('#editinfo_tel'))) {
        $('#edit_tel_result').html('전화번호 형식에 맞지 않습니다. 예) 010-0000-0000');
      } else { 
        $('#edit_tel_result').html('');
      }
    }
  if(e.target.id === 'editinfo_pwd1') {
    if(!checkPwd($('#editinfo_pwd1'))) {
      $('#edit_pwd1_result').html('비밀번호는 5자이상 10자이내, 알파벳 대소문자+특수기호 조합으로 입력해야 합니다');
    } else { 
      $('#edit_pwd1_result').html('');
    }
  }
  if(e.target.id === 'editinfo_pwd2'){
    if(!checkPwd($('#editinfo_pwd2'))){
      $('#edit_pwd2_result').html('비밀번호는 5자이상 10자이내, 알파벳 대소문자+특수기호 조합으로 입력해야 합니다');
      return;
    } else {
      $('#edit_pwd2_result').html('');
    }
  }
  });
  
  // 빈칸체크
  $('#editinfoBtn').click(()=>{
    if(!$('#editinfo_name').val().trim()){
      alert('이름을 입력해주세요');
      $('#editinfo_name').focus();
      return false;
    }
    if(!$('#editinfo_tel').val()){
      alert('연락처를 입력해주세요');
      $('#editinfo_tel').focus();
      return false;
    }
    if(!$('#editinfo_pwd1').val() || !$('#editinfo_pwd2').val()){
      alert('비밀번호를 입력해주세요');
      $('#editinfo_pwd1').focus();
      return false;
    }
    if($('#editinfo_pwd1').val() !== $('#editinfo_pwd2').val()){
      alert('비밀번호가 같은지 다시 확인해주세요');
      $('#editinfo_pwd1').focus();
      return false;
    }
    
    if(!checkName($('#editinfo_name'))) return false;
    if(!checkTel($('#editinfo_tel'))) return false;
    if(!checkPwd($('#editinfo_pwd1')) || !checkPwd($('#editinfo_pwd2'))) return false;
    
    editForm.submit();
  })//-------회원정보수정 form
  

// 이메일 중복인지 체크
const emailCheck = ()=>{
    if(!$('#uemail').val().trim()){
        alert('이메일을 입력해주세요');
        $('#uemail').focus();
        return;
    }
    if(!checkEmail($('#uemail'))) {
      $('#emailCk_result').html('이메일 형식에 맞지 않습니다');
      $('#uemail').focus();
        return;
    }
    $('#emailCk_result').html('');
    
    $.ajax({
        url:'auth/email',
        type:'post',
        data: {email :$('#uemail').val().trim()},
        dataType:'json',
        success:function(data){
          let msg ='';
          if(data.available) {
            msg = '은 사용 가능한 이메일입니다.';
            availableEmail = true;
            $('#emailCk_result').removeClass('result_txt').addClass('validateOk')
          } else {
            msg = '은 이미 사용중인 이메일입니다.';
            availableEmail = false;
            if($('#emailCk_result').hasClass('validateOk')) 
              $('#emailCk_result').removeClass('validateOk').addClass('result_txt');
          }
          
          $('#emailCk_result').html(data.useremail+' '+msg);
        
        }
    })
  
  }
  
  /* 회원가입 */
  const joinCheck = ()=>{
     // 빈칸 체크 
    if(!$('#uemail').val().trim()){
      alert('이메일을 입력해주세요');
      $('#uemail').focus();
      return;
    }
    if(!$('#upwd1').val() || !$('#upwd2').val()){
      alert('비밀번호를 입력해주세요');
      $('#upwd1').focus();
      return;
    }
    if($('#upwd1').val() !== $('#upwd2').val()){
      alert('비밀번호가 같은지 다시 확인해 주세요');
      $('#upwd2').focus();
      return;
    }
    if(!$('#uname').val()){
      alert('이름을 입력해주세요');
      $('#uname').focus();
      return;
    }
    if(!$('#ubirth1').val() || !$('#ubirth3').val()){
      alert('생년월일을 입력해주세요');
      $('#ubirth1').focus();
      return;
    }
    if(!$('#utel').val()){
      alert('연락처를 입력해주세요');
      $('#utel').focus();
      return;
    } 
    if(!$('#agree').prop('checked')){
      alert('약관에 동의해주세요');
      $('#agree').focus();
      return;
    } 
    if(!check()) return;
    if(!availableEmail) {
      alert('이메일 중복 확인을 해주세요');
       return;
    }
    joinForm.submit();
  }
  
  //정규식 체크
  $('input.chk').on('change', (e)=>{
    if(e.target.id === 'uname'){
        console.log('asd');
      if(!checkName($('#uname'))){
          $('#nameCk_result').html('이름은 한글만 가능합니다');
         e.target.focus();
      } else {
        $('#nameCk_result').html('');
      }
    }
    if(e.target.id === 'upwd1' || e.target.id === 'upwd2'){
      if(!checkPwd($('#upwd1')) || !checkPwd($('#upwd2'))){
          $('#pwdCk_result').html('비밀번호는 5자이상 10자이내, 알파벳 대소문자+특수기호 조합으로 입력해야 합니다');
          e.target.focus();
      } else {
        $('#pwdCk_result').html('');
      }
    }
    if(e.target.id === 'ubirth1' || e.target.id === 'ubirth3'){
      if(!checkBirth($('#ubirth1'), $('#ubirth3'))){
          $('#birthCk_result').html('생년월일을 정확히 입력해주세요');
          e.target.focus();
      } else {
        $('#birthCk_result').html('');
      }
    }
    if(e.target.id === 'utel'){
      if(!checkTel($('#utel'))){
          $('#telCk_result').html('전화번호 형식에 맞지 않습니다. 예) 010-0000-0000');
          e.target.focus();
      } else {
        $('#telCk_result').html('');
      }
    }
  
  });
  
  const check = ()=>{
    if(!checkEmail($('#uemail'))) return false;
    if(!checkPwd($('#upwd1')) || !checkPwd($('#upwd2'))) return false;
    if(!checkName($('#uname'))) return false;
    if(!checkTel($('#utel'))) return false;
    if(!checkBirth($('#ubirth1'),$('#ubirth3'))) return false;
    
    return true;
  }
  