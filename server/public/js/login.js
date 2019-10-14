
// 로그인 처리
// input에 값 있을 경우 아래 경고메세지 없애기
const $inputs = $('#loginForm input');
$inputs.each((i,input)=>{
  $(input).on('change', (e)=>{
    if(e.target.value) 
      $(e.target).next().html('');  
    });

});

const loginCheck = ()=>{
  let useremail = $('#uemail').val().trim();
  let userpwd = $('#upwd').val().trim();
  let msg = '필수 항목입니다.';
  if(!useremail && !userpwd) {
    $('#loginResult1').html(msg); 
    $('#loginResult2').html(msg);
    $('#useremail').focus();
    return false;
  }

  if(!useremail) { 
    $('#loginResult1').html(msg);
    $('#uemail').focus();
    return false;
  } 

  if(!userpwd) { 
    $('#loginResult2').html(msg);
    $('#upwd').focus();
    return false;
  } 

  return true;
}

const loginEnd = ()=>{
  if(loginCheck()) loginForm.submit();
}
