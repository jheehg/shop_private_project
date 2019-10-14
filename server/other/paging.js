//페이징 처리 메소드
exports.getPagingdata = (cpage=1, total, display, pagingBlock)=>{
    console.log(cpage, total, display, pagingBlock);
    let pageCount = Math.ceil(total/display); //총 페이지 수 

    if(cpage<1) cpage=1; // 1보다 작을경우 
    if(cpage>pageCount) cpage = pageCount; //실제 페이지보다 클경우

    let end = cpage*display;
    let start = end-(display-1);
    let page = [start, end];
    console.log(page);
    let prev = Math.floor((cpage-1)/pagingBlock)*pagingBlock;
    let next= prev+pagingBlock+1;

    return { page: page, prvnxt: [prev, next], pageCount};
}