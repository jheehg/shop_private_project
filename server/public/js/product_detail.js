
//locale문자열 또는 문자열 다시 숫자로 변환
const localeToNum = (num)=>{
  if(num.indexOf(',') > -1){
    let arr = num.split(',');
    let str = arr.join('');
    return parseInt(str);
  } else { 
    return parseInt(num);
  } 
}


// 상세 옵션에 따른 하위 옵션 불러오기
$('#optSel1').change(e =>{
    let ifOpt = $('#optSel1 option:selected').text();
    let opt = $(e.target).val();

  $.ajax({
    url : '/product/opt/find?tid='+opt,
    type : 'get',
    cache : false,
    dataType :'json',
    success : (data)=>{
        let str = `<label for="subSel"><small>하위옵션</small></label>
                   <select class="form-control form-control-sm" name="optSel2" 
                           id="optSel2" onchange="subOptCheck()">
                   <option value="none">선택안함</option>`; 
        for(let i=0; i<data.length; i++) {
            if(ifOpt === '옵션없음' && data[i][2] === '옵션없음'){
                topOptCheck(); 
                $('input[name="oid"]').last().val(data[i][0]); // 하위옵션키 저장
                return;
            } 
            if(data[i][3] === 0) 
                str+=`<option value="${data[i][0]}">${data[i][2]}</option>`
            else 
                str+=`<option value="${data[i][0]}_${data[i][3]}">${data[i][2]}</option>`;
        }
        str+='</select>';
        $('div.opt-group:eq(1)').html(str);
    }
  })
})


// 수량 대로 가격 변동
const $totalPrice = $("#totalPrice");
const price = localeToNum($('#_price').text());
let priceArr = [];    // 상품목록 가격 담을 배열
let addPriceArr = []; // 각 추가금액 담을 배열 
let addable = 1;

const makeClone = ()=>{
  let $clone = $('div.selectList').first().clone();
  return $clone;
}

// 옵션 동적으로 선택할때 마다 추가금액 여부 구하기
let $addPrice = 0;
const getAddPrice = ($addval)=>{
    let $idx = $addval.indexOf('_');
    if($idx > -1)  // 추가금액 존재하면
        $addPrice = parseInt($addval.slice($idx+1));
    else  $addPrice = 0; // 없으면 다시 디폴트로
    
    return $addPrice;
}

// 하위옵션 선택 시 키 구하기
const getOptId = ($addval)=>{
    let $idx = $addval.indexOf('_');
    if($idx > -1) // 추가금액 존재하면
        $optId= parseInt($addval.slice(0,$idx));
    else  
        return $addval; 
  
    return $optId;
}


// 하위옵션 선택시 상품목록 추가하기
const subOptCheck = ()=>{
  let $_clone;
  if(addable === 1) {
    $('.selectList:eq(0)').show();
    addable = 2;
  } else {
    $_clone = makeClone();
    $_clone.appendTo('#optForm').show();
  }
  $('.qtyInput').last().val(1); // 초기화
 
  const cpname = $('#cpname').text();
  const pname = $('#pname').text();
  const opt = $('#optSel2 option:selected').text();
    
  $('.selectList:last-child p.selitem').html(`(${cpname}) ${pname} ${opt}`);      
 
  let $addval = $('#optSel2').val();
  $addPrice = getAddPrice($addval);
  let $oid = getOptId($addval);            // 장바구니 전송 위한 하위옵션키 구하기
  $('input[name="oid"]').last().val($oid); // 하위옵션키 저장

  $('#optSel1 option:eq(0)').prop('selected','selected');
  $('#optSel2 option:eq(0)').prop('selected','selected');
  
  let idx = $('.qtyInput').length-1; 
  let sum = price + $addPrice;
  addPriceArr[idx] = $addPrice;
  priceArr[idx] = sum;

  let sum2 = 0;
  for(let i in priceArr) {
    sum2 += priceArr[i];  
  }
 
  $totalPrice.html(sum2.toLocaleString()); // 총금액 
}


// 하위옵션 없을 시 바로 상품목록 추가하기
const topOptCheck = ()=>{
  let $_clone;
  if(addable == 1) {
    $('.selectList:eq(0)').show();
    addable = 2;
  } else {
    $_clone = makeClone();
    $_clone.appendTo('#optForm').show();
  }
  $('.qtyInput').last().val(1);
  
 
  const cpname = $('#cpname').text();
  const pname = $('#pname').text();

  $('.selectList:last-child p.selitem').html(`(${cpname}) ${pname} 옵션없음`);      
 
  $('#optSel1 option:eq(0)').prop('selected','selected');
  
  let idx = $('.qtyInput').length-1;
  priceArr[idx] = price;

  let sum2 = 0;
  for(let i in priceArr) {
    sum2 += priceArr[i];
  }
 
  $totalPrice.html(sum2.toLocaleString()); // 총금액 
}


// 수량 바뀜에 따라 실행될 부분
$(document).on("change","input.qtyInput",(e)=>{
    let idx = $('.qtyInput').index($(e.target)); 
    let curr = $(e.target).val();
    if(addPriceArr.length > 0) {
      $addPrice = addPriceArr[idx]; // 배열에 저장된 추가금액 찾기
    } 
    let sum = (price*curr)+($addPrice*curr);
    priceArr[idx] = sum;

    let sum2 = 0;
    for(let i in priceArr) {
      sum2 += priceArr[i];
    }

    $totalPrice.html(sum2.toLocaleString()); // 총금액 

})

// 선택목록 제거
$(document).on("click","a.undone",(e)=>{
    let $tg = $(e.target).parent().parent();
    //지우려는 목록이 단 한개면 숨기고 나머지는 지우기
    let $idx = $('.selectList').index($tg); 

    let $total = localeToNum($totalPrice.html());
    let $cntval= $(e.target).parent().next().val(); 
    if(addPriceArr.length > 0) {
    $addPrice = addPriceArr[$idx];
    addPriceArr.splice($idx,1);  // 추가금액 제거
    }

    $total = $total - ((price*$cntval)+($addPrice*$cntval));
    $totalPrice.html($total.toLocaleString());

    priceArr.splice($idx,1);

    if(priceArr.length < 1) {
    $tg.hide();
    addable = 1; //첫번쨰 인덱스 다시 show()하기 위한 변수
    } else {
    $tg.remove();
    }
   
})

// 장바구니추가
$("#addcartBtn").click(()=>{
  if($totalPrice.html().trim()==='0') {
    alert('상품을 먼저 선택해주세요');
    return;
  }
  let qtyarr = [], oidarr = [];
  let pid = $('input[name="pid"]').val();
  let midx = $('input[name="uid"]').val();
  let len = $('input[name="qty"]').length;
 
  for(let i=0; i<len; i++){
    qtyarr.push($('input[name="qty"]').eq(i).val());
    oidarr.push($('input[name="oid"]').eq(i).val());
  }

  $.ajax({
    url: '/product/addCart',
    type: 'post',
    dataType: 'json',
    cache: false,
    data: {pid, midx, qtyarr, oidarr},
    success: (data)=>{
      if(data.row > 0){
        $("#addCartModal").modal(); 
      }
    },
    error:(req,status,err)=>{
      alert('장바구니 추가에 실패했습니다. 다시 시도해주세요');
      console.error(err);
    }
  }) 
})

// 장바구니 화면 이동
$('#goCartBtn').click(()=>{
  $('#optForm').attr('action','/order/cart');
  $('#optForm').submit();
})

// 구매하기
$("#buyBtn").click(()=>{
  if($totalPrice.html().trim()==='0') {
    alert('상품을 먼저 선택해주세요');
    return;
  }
  $('#optForm').attr('action',"/order"); //바로 결제 페이지로 보내기
  $('#optForm').submit();
})

// 즐겨찾기추가
$("#addWishesBtn").click(()=>{
    let pid = $('[name="pid"]').val();
    let midx = $('[name="uid"]').val();
    
  $.ajax({
    url:'/product/addWishes',
    type:'post',
    cache:false,
    data: { pid, midx },
    dataType:'json',
    success:(data)=>{
      if(data.row === 1) {
        alert('즐겨찾기에 추가되었습니다');
      } else if(data.row === 0){
        alert('처리에 실패했습니다. 다시 시도해주세요');
      } else {
        alert('이미 리스트에 있는 상품입니다.'); // row = -1
      }
    },
    error:(req,status,err)=>{
        alert('즐겨찾기 추가에 실패했습니다. 다시 시도해주세요');
        console.error(err);
    }
  })

})

// 상품이미지 클릭하면 보여주기
$('.sub-img').click((e)=>{
  e.preventDefault();
  let $img = $(e.target);
  let $idx = $('.sub-img > a > img').index($img);
  $(`.carousel-item`).removeClass('active'); 
  $(`.carousel-item:eq(${$idx})`).addClass('active'); 

})

