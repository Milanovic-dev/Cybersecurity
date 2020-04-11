import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom';
import Isvg from 'react-inlinesvg';
import Page from '../../containers/admin/page';
import classNames from 'classnames';
import InfiniteTree from 'react-infinite-tree';
import 'react-infinite-tree/dist/react-infinite-tree.css';
import ReactDOM from "react-dom";
import TreeNode from "./TreeNode";
import Toggler from "./Toggler";

import {
    Container,
    Row,
    Col,
} from 'reactstrap';



class Tree extends Component {

    constructor(props) {
        super(props);
        this.revoke = this.revoke.bind(this);
        this.get = this.get.bind(this);

        this.state = {
            data: null
        }
    }
    revoke(id){
        // console.log(id);
        fetch('http://127.0.0.1:4000/certificate/revoke/'+ id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }).then((res) => this.get());

    }
   

    componentDidMount() {
        this.get();
    }
    get(){
        fetch('http://127.0.0.1:4000/certificate/getAll', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }).then((res) => res.json()).then((result) => {
            this.setState({
                data: result
            });
            console.log(result);
        });
    }

    render() {

        return (
            <div className="page-wrap">
                {
                    !localStorage.token ? <Redirect to='/login' /> : null
                }
                {/* <Container> */}
                    <Row>
                        <Col lg="12">
                            <h3 className="title">Hijerarhija sertifikata</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='12'>
                            {/* <div style={{height: "100%"}} ref={(node) => { if(!this.treeHeight) {this.treeHeight = node; this.forceUpdate()} }}>
                            {
                                this.treeHeight ? */}
                            {
                                this.state.data ?
                                    <InfiniteTree className='tree' width="100%" height={1000} rowHeight={50} data={this.state.data}>
                                        {({ node, tree }) => {
                                            // Determine the toggle state
                                            let toggleState = "";
                                            const hasChildren = node.hasChildren();

                                            if (
                                                (!hasChildren && node.loadOnDemand) ||
                                                (hasChildren && !node.state.open)
                                            ) {
                                                toggleState = "closed";
                                            }
                                            if (hasChildren && node.state.open) {
                                                toggleState = "opened";
                                            }

                                            console.log(node.state);

                                            return (
                                                <TreeNode
                                                    selected={node.state.selected}
                                                    depth={node.state.depth}
                                                    onClick={event => {
                                                        tree.selectNode(node);

                                                    }}

                                                >
                                                    <Toggler
                                                        state={toggleState}
                                                        onClick={() => {
                                                            if (toggleState === "closed") {
                                                                tree.openNode(node);
                                                            } else if (toggleState === "opened") {
                                                                tree.closeNode(node);
                                                            }
                                                        }}
                                                    />


                                                    <span>
                                                        {node.parsedCertificate.subject.commonName}
                                                    </span>

                                                    {
                                                        node.state.selected ?
                                                            <span className="buttons">
                                                                <Link to={`/certificate/${node.id}`}><button className="button-action preview">Pogledaj</button></Link>
                                                                <button onClick={() => this.revoke(node.id)} className="button-action space download">Povuci</button>
                                                                <Link to={`/addCertificate/${node.id}`}><button className="button-action space create-new">Kreiraj</button></Link>
                                                            </span>
                                                            : null
                                                    }

                                                </TreeNode>
                                            );
                                        }}
                                    </InfiniteTree>
                                    : null
                            }
                            {/* : null
                            } */}
                            {/* </div> */}
                        </Col>
                    </Row>
                {/* </Container> */}
            </div>
        );
    }
}

export default Page(Tree)
