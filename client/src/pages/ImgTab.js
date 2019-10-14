import React from 'react';

const ImgTab = ()=> {
    document.title = "이미지 보기";
   
    let userimg = window.opener.document.images[1].src;
   
    return (
        <div style={{
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center'}}>
            <img id="imgtab" src={userimg} alt="imgtab" 
                 style={{maxWidth: '100%', maxHeight: '100%;'}} />
        </div>
    );

}
export default ImgTab;