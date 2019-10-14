import React from 'react';
import PropTypes from 'prop-types';

const defaultProps = { 
    data : {}
};
const propTypes = { 
    data: PropTypes.object,
};

const MlgBox = ({data})=> {
    let date = new Date(data[10]);

    return (
        <div className="list-group mt-3">
            <div className="list-group-item list-group-item-action d-flex flex-row justify-content-between">
                <div>
                    <p className="mb-1" style={{fontSize:'0.9rem'}}>
                        {date.getFullYear()}-{date.getMonth()+1}-{date.getDate()}
                    </p> 
                    <p className="mt-1 mb-2"><b>{data[1]}</b>
                        <span style={{fontSize:'0.8rem'}} className="ml-1">
                            {data[2]} {data[5]} {data[15]>1? '외 '+data[15]-1+'건': ''}
                        </span>
                    </p> 
                    <small>총 구매 금액 {data[8].toLocaleString()}원</small>
                </div>
                <div>
                    <small style={{color:'#28a745'}}><b>예정 적립금 + {data[13]}p</b></small><br/>
                    <small style={{color:'#808080'}}><b>사용 적립금 - {data[9]}p</b></small>
                </div>
            </div>
        </div>
    );
}

MlgBox.defaultProps = defaultProps;
MlgBox.propTypes = propTypes;

export default MlgBox;