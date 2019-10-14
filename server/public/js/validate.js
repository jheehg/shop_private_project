
function checkName(obj) {
    var pattern = /^[가-힣]{1,2}[\s]?[가-힇]+$/;
    var b = pattern.test(obj.val().trim());
    return b;
}


function checkId(obj){
    var pattern = /^[\w_!]+$/i;
    var b = pattern.test(obj.val().trim());
    return b;
}


function checkTel(obj){
    var pattern = /\b(010|011)-\d{3,4}-\d{4}\b/;
    var b = pattern.test(obj.val());
    return b;
}

function checkBirth(obj1,obj2){
    var pattern1 = /^[0-9]{4}$/;
    var pattern2 = /^[0-9]{1,2}$/;
    var b = pattern1.test(obj1.val()) && pattern2.test(obj2.val());
    return b;
}


function checkPwd(obj){
    var pattern = /^[a-z]{1}[\w$.!_]{4,9}$/i;
    var b = pattern.test(obj.val());
    return b;
}


function checkEmail(obj){
    var pattern = /(^[\w-]{3,10}[@][a-z]{2,10}[.a-z]{4}$)|(^[\w-]{3,10}[@][a-z]{2,10}[.a-z]{3}[.][a-z]{2}$)/;
    var b = pattern.test(obj.val());
    return b; 
}