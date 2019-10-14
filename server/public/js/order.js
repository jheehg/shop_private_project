
// 결제완료 처리 시 유효성 체크
$('#orderEnd').click((e)=>{
    e.preventDefault();
  
    if(!ordererInfo()){
      alert('주문자 정보를 다시 확인해주세요');
      return;
    };
    if(!rcpntInfo()){
      alert('수령자 정보를 다시 확인해주세요');
      return;
    } 
    // 결제수단
    if(!ckMethod()){
      alert('결제 수단을 체크해주세요');
      return;
    }
    $('#orderForm').submit();
  })
  
  // 결제수단 체크 여부
  const ckMethod = ()=>{
    const method = $("[name='pmethod']");
    for(let i=0; method.length; i++){
       if(method[i].checked) { 
         return true;
       }
    }
    return false;
  }
  
  // 주문자 정보 체크
  const ordererInfo = ()=>{
    let rcode = $("#zipcode").val().trim(); // 수령인우편번호
    //주문자정보
    let tel = $("#telOrder").val().trim();  // 전화번호
    if(!tel || !rcode){
       return false;
    }
    return true;
  }
  
  
  // 수령자 정보 체크
  const rcpntInfo = ()=>{
     // 수령인정보
     let rname = $("#rcpntName").val().trim();      //수령인이름
     let rtel = $("#rcpntTel").val().trim();        //수령인연락처
     let raddr1 = $("#address").val().trim();       //수령인우편번호
     let raddr2 = $("#detailAddress").val().trim(); //수령인우편번호
     if( !rname || !rtel || !raddr1 || !raddr2 ){
       return false;
     }
     return true;
  }
  
      
  // 포인트사용
  $("#mlgOrder").change((e)=>{
    let defaultPrice = localeToNum($("#priceOrder").text()); // 기본금액
    let delifee = localeToNum($("#deliOrder").text()); // 배송료
    let price = defaultPrice + delifee;
    let mlg = parseInt($('#userMlg').text()); // 회원이 보유한 적립금
    let payMlg = parseInt($(e.target).val()); // 사용할 적립금
  
    // 적립금 체크
    if(payMlg > mlg) {
      alert('보유하신 적립금이 부족합니다');
      $(e.target).val(0);
      return;
    }
    if(payMlg < 1000 && payMlg !== 0){
      alert('적립금 사용은 1000포인트부터 사용가능합니다');
      $(e.target).val(0);
      return;
    }
    
    // 최종 합계 ( 적립금, 총액 )
    $("#usedMlg").text(payMlg);
    let total = price - payMlg;
    $("#totalPriceOrder").text(total.toLocaleString());
    
  });
  
  