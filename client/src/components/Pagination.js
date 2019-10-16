import React, { useState, useEffect } from 'react';
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from 'prop-types';

const defaultProps = { 
    prvnxt: [], 
    currentPage: ()=>{},
    pageCount: 1
};
const propTypes = { 
    prvnxt: PropTypes.array,
    currentPage: PropTypes.func, 
    pageCount: PropTypes.number
};    

const Pagination =({prvnxt, currentPage, pageCount})=>{
    const [ cpage, setCpage ] = useState(1);

    let pageNum = [];
   
    useEffect(()=>{
       console.log(cpage, prvnxt, currentPage, pageCount);
    });
        
    let uidx = JSON.parse(localStorage.getItem('user')).useridx;
    for(let i=1; i<=pageCount; i++){
        pageNum.push(
            <li className={i===cpage? 'pItem isActive':'pItem'}
                onClick={()=>{ 
                    currentPage(uidx,i);
                    setCpage(i);}}>{i}</li>
                    );
    }
    return (
        <div className="mt-4" style={{width:'95%'}}>
            <div className="d-flex justify-content-center">
                <ul className="_pagination">
                   <li className="pItem" onClick={()=>{
                        if(prvnxt[0]===0) return;
                        currentPage(uidx,prvnxt[0]);}}> 
                       <span><FontAwesomeIcon icon={faAngleLeft}/></span>
                    </li> 
                    {pageNum}
                    <li className="pItem" onClick={()=>{
                        if(pageCount < prvnxt[1]) return;
                        currentPage(uidx,prvnxt[1]);
                    }}> <span><FontAwesomeIcon icon={faAngleRight}
                    /></span></li>
                </ul>
            </div>  
        </div>
    );
    
}

Pagination.defaultProps = defaultProps;
Pagination.propTypes = propTypes;

export default Pagination;