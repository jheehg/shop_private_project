// 카테고리 네비게이터

$('a.a_none').click((e)=>{
    e.preventDefault();
})
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
  });

// 검색 처리

$('#searchBtn').click(()=>{
let keyword = $('#keyword').val().trim();

if(keyword==="" || !keyword) return;
location.href="product/"+keyword;

})