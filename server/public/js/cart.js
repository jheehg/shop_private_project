
// 장바구니

// 수정버튼 처리
$('.editVal').click((e)=>{
    let $idx = $('.editVal').index($(e.target));
    let $qty = $('input[name="qtyCart"]').eq($idx).val();
    if(parseInt($qty) < 1) {
      alert('수량은 1개 이상이어야 합니다');
      $('input[name="qtyCart"]').eq($idx).val(1);
      return;
    }
    let cid = $('input[name="cartId"]').eq($idx).val();
   
    $.ajax({
      url:'/order/cart/edit',
      type:'patch',
      data:{ cid, qty: $qty },
      dataType:'json',
      cache:false
    }).done((data)=>{
      if(data.result === 'success'){
        if(data.rows > 0) {
          alert('수정을 완료했습니다');
          location.reload();
        } 
        else return; // 수량 변경없는데 눌렀을 경우
  
      } else {
        alert('수정에 실패했습니다. 다시 시도해주세요');
      }
  
    }).fail((req,status,err)=>{
      alert('수정에 실패했습니다. 다시 시도해주세요');
      console.error(err);
    })
  })
  
  // 장바구니 목록 제거
  $('.clrList').click((e)=>{
    let anwser = confirm('정말 삭제하시겠습니까?');
    if(!anwser) return;
    let $tg = $(e.target).parent().parent();
    let $idx =  $('#cartTable tbody tr').index($tg); 
    let cid = $('input[name="cartId"]').eq($idx).val();
    
    $.ajax({
      url: '/order/cart/delete',
      type: 'delete',
      data: { cid },
      dataType: 'json',
      cache: false
    }).done((data)=>{
      if(data.result === 'success'){
         $tg.remove();
         location.reload();
      } else {
        alert('수정에 실패했습니다. 다시 시도해주세요');
      }
  
    }).fail((req,status,err)=>{
      alert('수정에 실패했습니다. 다시 시도해주세요');
      console.error(err);
    })
    
  })
  
  // 전체 품목 결제
  $('#allOrder').click((e)=>{
    e.preventDefault();
    $('[name="ckboxCart"]').prop('checked',true);
    let sum = $('[name="sumAll"]').val();
  
    if(!sum) {
      alert('처리에 실패했습니다 다시 시도해주세요');
      return;
    } 
    $('.cartForm').submit();
    
  })
  
  // 선택된 품목만 결제
  $('#ckedOrder').click((e)=>{
    e.preventDefault();
    let $cked = $('#orderList [name="ckboxCart"]');
    let $opt = $('#orderList [name="optId"]');
    
    let isChecked =[];
    for(let i=0; i<$cked.length; i++){
      if(!$cked.eq(i).prop('checked')){ //체크 안된 인덱스만 저장
        isChecked.push(i);
      }
    }
    for(let i=0; i<isChecked.length; i++){ //값 0으로 초기화 
      $opt.eq(isChecked[i]).val(0);
    }
   $('.cartForm').submit();
   
  })
  
  // 체크 여부에 따라 총금액 변경
  $('[name="ckboxCart"]').change((e)=>{
    let idx = $('[name="ckboxCart"]').index($(e.target));
    let sum = localeToNum($('#cartSum').text()); //배송료 제외한 금액
    let deli = localeToNum($('#cartDeli').text());
    let eachPrice = localeToNum($('.priceCart').eq(idx).text());
  
    if($(e.target).prop('checked')){
      sum = sum + eachPrice;
    } else {
      sum = sum - eachPrice;
    }
    deli = (sum >= 50000)? 0 : 3000;
    $('#cartSum').text(sum.toLocaleString());
    $('#cartDeli').text(deli.toLocaleString());
    $('#cartTotal').text((sum+deli).toLocaleString());
    $('[name="sumAll"]').val(sum); // 배송료 제외 합계
    
  });
  