import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const defaultProps = { 
    itemArr: [[]], 
};
const propTypes = { 
    itemArr: PropTypes.array,
}; 

const ReviewSelect = ({ itemArr })=>{

    return (
        <div>
            <h6>구입한 목록</h6>
            <ul className="list-group" style={{fontSize:'0.9rem'}}>
                {itemArr.map((item,i)=>{
                    return (
                        <li class="list-group-item d-flex justify-content-between">
                            <span>{item[1]}&nbsp;({item[6]} : {item[8]})</span>
                            <Link to={{ pathname:"/users/rvwrite/"+item[4],
                                        state   : { seller : item[0], pimg:item[2],
                                                    top_opt: item[6], sub_opt: item[8],
                                                    pname: item[1],   pid: item[7] }
                                      }}
                                   className="btn btn-outline-primary btn-sm">후기작성</Link>
                        </li>);
                })}
            </ul>
        </div> 
    );
}

ReviewSelect.defaultProps = defaultProps;
ReviewSelect.propTypes = propTypes;

export default ReviewSelect;