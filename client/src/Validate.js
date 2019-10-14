//정규식 체크

export function checkName(obj) {
    var pattern = /^[가-힣]{1,2}[\s]?[가-힇]+$/;
    var b = pattern.test(obj.trim());
    return b;
}


export function checkTel(obj){
    var pattern = /\b(010|011)-\d{3,4}-\d{4}\b/;
    var b = pattern.test(obj.trim());
    return b;
}


export function checkPwd(obj){
    var pattern = /^[a-z]{1}[\w$.!_]{4,9}$/i;
    var b = pattern.test(obj.trim());
    return b;
}




