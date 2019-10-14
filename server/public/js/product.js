
// 키워드로 상품 검색
const searchKeyword = ()=>{
    let keyword = $('#keyword').val();
    keyword.replace(/(^\s*)|(\s*$))/gi, "");
    if(!keyword) { // 이부분 다시 체크
      alert('검색어를 입력하세요');
      return false;
    } else {
      return true;
    }
};


// 옵션에 따라 결과 조회
$('#sort').change((e)=>{
  let order = $(e.target).val();
  if(!order) return;
  $('#sortForm').submit();
})

// 장바구니 추가
$('.addCart').click((e)=>{
  e.preventDefault();
  let pid = $(e.target).data('pid');
  let midx = $('#midx').val();
  $.ajax({
    url:'/product/addCart',
    type:'post',
    cache:false,
    data: { pid, midx },
    dataType:'json',
    success:(data)=>{
      if(data.row > 0) {
        alert('장바구니에 추가되었습니다');
      } else {
        alert('다시 시도해주세요');
      }
    }
  })  
})


// 즐겨찾기 추가
$('.addWishes').click((e)=>{
  e.preventDefault();
  let pid = $(e.target).data('pid');
  let midx = $('#midx').val();
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
      alert('처리에 실패했습니다. 다시 시도해주세요');
      console.error(err);
    }
  })
})







  











 