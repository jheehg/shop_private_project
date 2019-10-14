// 후기글 
// 일정 글자수 넘어가면 컷해서 보여주기
$(()=>{
    cutLines();
  })
  
  const cutLines = ()=>{
    $('.reviewArea').each((i, rv) => {
      if(rv.innerText.length <= 50) {
        $('.moreReviewTxt').eq(i).hide(); // 50 이하의 후기글은 버튼 없애기
      } else {
        rv.innerText = rv.innerText.slice(0,51)+"..."; 
      }
    });
  }
  
  // 후기 내용 자세히보기 버튼 요청 처리
  $(document).on('click','.moreReviewTxt',(e)=>{
    let idx = $('.moreReviewTxt').index($(e.target)); // 어느 글에서 요청했는지 인덱스 얻기
    let $rv = $('.moreReviewTxt').eq(idx);
    let $area = $('.reviewArea').eq(idx);
  
    if($rv.text() === "자세히 보기"){
        let rvid = $('input[name="reviewId"]').eq(idx).val(); //후기아이디 찾기
  
        $.ajax({
          url:'/product/moreReviewTxt?rvid='+rvid,
          type:'get',
          cache:false,
          dataType:'json',
          success:(data)=>{
            if(data !== 0) {
              $('.reviewArea').eq(idx).html(data.result);
              $rv.html('<i class="fas fa-chevron-up fa-sm mr-1" ></i>후기 접기');
            } else {
              alert('처리에 실패했습니다. 다시 시도해주세요');
            }
          },
          error:(req,status,err)=>{
            alert('처리에 실패했습니다. 다시 시도해주세요');
            console.error(err);
          }
        });
    
    } else {
      // 후기 내용 접기
      $area.text($area.text().slice(0,51)+"...");
      $rv.html('<i class="fas fa-chevron-down fa-sm mr-1" ></i>자세히 보기');
    } 
  });
  
  // 후기목록 더 불러오기
  $('#getMoreReviewBtn').click(()=>{
    let end = $('[name="reviewId"]').length;
    let pid = $('[name="pid"]').val();
    
    $.ajax({
      url:'/product/moreReviewList?start='+(end+1)+"&pid="+pid,
      type:'get',
      cache:false,
      dataType:'html',
      success:(data)=>{
        if(data) {
          $(data).appendTo($('.reviewDiv'));
          cutLines(); // 초과 글 내용 자르기
        } else {
          alert('처리에 실패했습니다. 다시 시도해주세요');
        }
      },
      error:(req,status,err)=>{
        alert('처리에 실패했습니다. 다시 시도해주세요');
        console.error(err);
      }
    })
  });
  
  