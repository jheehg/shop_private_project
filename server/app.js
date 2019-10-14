const express = require('express');
const path = require('path');
const logger = require('morgan');
const app = express();
const http = require('http').createServer(app);
const static = require('serve-static');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const sse = require('./sse'); 



// routes
const routes = require('./routes');
const auth_routes = require('./routes/auth');
const users_routes = require('./routes/users');
const users_auth_routes = require('./routes/auth/users');
const product_routes = require('./routes/product');
const order_routes = require('./routes/order');



// setting
app.set('port',3333);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// 미들웨어
app.use(logger('dev'));
app.use('/', static(path.join(__dirname, 'public'))); 
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser('thisispasswordforcookies'));
app.use(session({
    resave:false, 
    saveUninitialized:false, 
    secret:'thisispasswordforcookies',
    store: new FileStore(),
    cookie: {
        httpOnly: true, 
        secure: false 
    }
    
    
}));


// 전체 페이지 로그인 상태 체크
app.use('*',(req,res,next)=>{
    res.locals.loginUser =req.session.loginUser || null;
    res.locals.isLogin = (req.session.loginUser)? true : false;
    res.locals.cartNum = req.session.cartNum || null;
    next(); 
})


// 마이페이지 관련 접근 권한확인
app.use('/users',(req,res,next)=>{
    if(!req.session.logged) {
        req.session.next_url = { nextUrl :'http://localhost:3000'+req.originalUrl };    
    }
    next();   
    
})

// 결제 관련 페이지 권한확인
app.use('/order',(req,res,next)=>{
    if(!req.session.logged) {
        req.session.next_url = { nextUrl :req.originalUrl };
        res.redirect("/login");          
    } else {
       next();   
    }
})



// routes
app.use('/', routes);
app.use('/auth', auth_routes);
app.use('/users', users_routes);
app.use('/users/auth', users_auth_routes);
app.use('/product', product_routes);
app.use('/order', order_routes);



// 500 error 
app.use((err, req, res, next)=>{
    console.log(err.message);
    res.render('500error');
})

// 404 error
app.get('*', (req,res)=>{
    res.status(404).render('404error');
})


const server = http.listen(app.get('port'), ()=>{
    console.log('server started at '+app.get('port'));
})


//서버센트 이벤트와 연결
sse(server); 





