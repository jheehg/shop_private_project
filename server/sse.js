const SSE = require('sse');
const db = require('./model/db');


 module.exports = (server) =>{
     const sse = new SSE(server);

     const getKeyword = async()=> {
         let result;
         let sql ='select * from keyword_view';
         try {
            result = await db.getResult2(sql);
         } catch(err){
             console.log('검색어 조회 오류 '+err);
         }
         if(result.rows.length<1) return false;

         return { list: result.rows };
     };


     sse.on('connection', async(client)=>{
         let list = await getKeyword();
         client.send(JSON.stringify(list)); // 최초로 전송
         setInterval(async()=>{
            // 이후로 일정 간격마다 인터벌로 전송
            list = await getKeyword();
             console.log(list);
             client.send(JSON.stringify(list));
         }, 500000);

        
    
     })

 }