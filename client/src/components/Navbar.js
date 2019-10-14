import React, { Component } from 'react';
import { Tooltip } from 'reactstrap';


class Navbar extends Component {
    state = {
        accToggleOpen : false,
        kitchenToggleOpen : false,
        candleToggleOpen : false,
        bestToggleOpen: false
    }

    accToggle = ()=>{
        this.setState({ accToggleOpen: !this.state.accToggleOpen });
    };
    kitchenToggle = ()=>{
        this.setState({ kitchenToggleOpen: !this.state.kitchenToggleOpen });
    };
    candleToggle = ()=>{
        this.setState({ candleToggleOpen: !this.state.candleToggleOpen });
    };
    bestToggle = ()=>{
        this.setState({ bestToggleOpen: !this.state.bestToggleOpen });
    };

    render() {
      
        return (
            <nav className="navbar navbar-expand-md navbar-light w-100 mb-5">
                <div className="container justify-content-center"> 
                    <button className="navbar-toggler navbar-toggler-right border-0" 
                            type="button" data-toggle="collapse" data-target="#navbar3">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse text-center justify-content-around">
                        <ul className="navbar-nav ml-5">
                            <li className="nav-item mx-2">
                                <a className="nav-link" href="http://localhost:3333/product/category/bag">
                                    가방,파우치
                                </a> 
                            </li>
                            <li className="nav-item mx-2">
                                <a className="nav-link" href="http://localhost:3333/product/category/food">
                                    식품
                                </a>
                            </li>
                            <li className="nav-item mx-2">
                                <button className="btn_none" id="acc">악세사리</button>
                                <Tooltip placement="top" isOpen={this.state.accToggleOpen} 
                                        autohide={false} target="acc" toggle={this.accToggle}>
                                상품 준비중입니다</Tooltip>
                            </li>
                            <li className="nav-item mx-2">
                                <button className="btn_none" id="kitchen">주방,생활용품</button>
                                <Tooltip placement="top" isOpen={this.state.kitchenToggleOpen} 
                                         autohide={false} target="kitchen" toggle={this.kitchenToggle}>
                                상품 준비중입니다</Tooltip>
                            </li>
                            <li className="nav-item mx-2">
                                <button className="btn_none" id="candle">캔들,디퓨저</button>
                                <Tooltip placement="top" isOpen={this.state.candleToggleOpen} 
                                         autohide={false} target="candle" toggle={this.candleToggle}>
                                상품 준비중입니다</Tooltip>
                            </li>
                            <li className="nav-item mx-2">
                                <button className="btn_none" id="best">인기상품</button>
                                <Tooltip placement="top" isOpen={this.state.bestToggleOpen} 
                                         autohide={false} target="best" toggle={this.bestToggle}>
                                    상품 준비중입니다</Tooltip>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item mx-2"> 
                                <a className="nav-link" href="/">1&nbsp; 상품순위</a> 
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;