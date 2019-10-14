
//이메일 찾기 

$('#emailForm input').change((e)=>{
    if(e.target.id === 'emailForm_name'){
      if(!$('#emailForm_name').val()) {
        $('#emailForm_name_result').html('필수 항목입니다');
        $('#emailForm_name').focus();
      } else if(!checkName($('#emailForm_name'))) {
        $('#emailForm_name_result').html('이름은 한글만 가능합니다');
        $('#emailForm_name').focus();
      } else {
        $('#emailForm_name_result').html('');
      }
    } 
    if(e.target.id === 'emailForm_tel'){
      if(!$('#emailForm_tel').val()) {
        $('#emailForm_tel_result').html('필수 항목입니다');
        $('#emailForm_tel').focus();
      } else if(!checkTel($('#emailForm_tel'))) {
        $('#emailForm_tel_result').html('전화번호 형식에 맞지 않습니다. 예) 010-0000-0000');
        $('#emailForm_tel').focus();
      } else {
        $('#emailForm_tel_result').html('');
      }
  } 
});

const emailForm_ck = ()=>{
  if(!$('#emailForm_name').val() || !checkName($('#emailForm_name'))) {
    alert('입력하신 정보를 다시 확인해주세요');
    return;
  }
  if(!$('#emailForm_tel').val() || !checkTel($('#emailForm_tel'))) {
    alert('입력하신 정보를 다시 확인해주세요');
    return;
  }

  $.ajax({
    url:'/auth/findemail',
    type:'post',
    data: {
      email :$('#emailForm_name').val().trim(),
      tel:$('#emailForm_tel').val().trim()
      },
    dataType:'json',
    success:function(data){
      $('#findemail_show').hide();
      $('#emailForm').hide();
      $('#findemail_hidden').show();
     
      if(data.exist) { 
        $('p#findemail_result').html(
          '이메일  '+data.user[0]+'<br>'+'가입일  '+data.user[1]);  
      } else {
        $('p#findemail_result').html(
         '조회된 결과는 0건 입니다<br><a href="/findemail" style="text-decoration:underline" class="mr-2">다시시도하기</a>');  
      }
      
    }
  })
};



