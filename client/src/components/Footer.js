import React from 'react';

const Footer = ()=> {

    return (
        <div>
            <footer style={{clear:'both'}}>
                <div className="py-3">
                    <div className="container">
                            <div className="row">
                                <div className="col-lg-4 col-6 p-5">
                                    <a href="/"><img src="/images/logo.jpeg" 
                                    alt="logo" width="250" /></a> 
                            </div>
                            <div className="col-lg-4 col-6 p-3">
                                <p> <a href="https://goo.gl/maps/AUq7b9W7yYJ2">(주)셀프엘프 <br/>
                                    대표이사 : 윤혜수,홍주희</a> <br/> 서울특별시 영등포구 선유동2로 70, 이화빌딩 2층</p>
                                    <p>사업자 등록번호: 100-22-33384 </p>
                                    <small>셀프엘프는 통신판매중개자이며 통신판매의 당사자가 아닙니다. 따라서 셀프엘프는 상품 거래정보 
                                    및 거래에 대하여 책임을 지지 않습니다.</small>
                            </div>
                            <div className="col-md-4 p-3">
                                <p className="mb-0">고객센터 (주 7일, 오전 10시 ~ 저녁 10시까지)</p>
                                <p>대표번호 <a href="/">1222-3333</a></p>
                                <p className="mb-0"> 
                                    <a href="mailto:info@pingendo.com">info@tististis.com</a> 
                                </p>
                                <p className="mb-0 mt-2">© 2014-2018 Pingendo. All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


export default Footer;