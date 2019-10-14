import React from 'react';
import PropTypes from 'prop-types';

const defaultProps = { 
    cpname: '', pimg: '', pname: ''
};
const propTypes = { 
    cpname: PropTypes.string, 
    pimg: PropTypes.string,
    pname: PropTypes.string,
}; 

const WishBoxSub = ({cpname, pimg, pname})=>{
    
    return (
        <div className="col-md-3 d-flex flex-column align-items-center">
            <img src={pimg} alt="img3" width="100" height="80" />
            <p className="mt-2 mb-1" 
               style={{fontSize:'0.8rem', color:'#918e8e'}}>{cpname}</p>
            <p>{pname}</p>
        </div>
       
    );
   
}
WishBoxSub.defaultProps = defaultProps;
WishBoxSub.propTypes = propTypes;

export default WishBoxSub;