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


import certificateIcon from '../../assets/svg/certificate.svg';

import {
    Container,
    Row,
    Col,
} from 'reactstrap';



class Tree extends Component {

    constructor(props) {
        super(props);
        this.revoke = this.revoke.bind(this);
        this.restore = this.restore.bind(this);
        this.get = this.get.bind(this);
        // this.check = this.check.bind(this);

        this.state = {
            data: null
        }
    }
    revoke(id) {
        // console.log(id);
        fetch('https://localhost:4000/certificate/revoke/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }).then((res) => {
            window.location.reload();

        });

    }
    restore(id) {
        fetch('https://localhost:4000/certificate/restore/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }).then((res) => {
            window.location.reload();
        });
    }


    componentDidMount() {
        this.get();
    }
    get() {
        fetch('https://localhost:4000/certificate/getAll', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }).then((res) => res.json()).then((result) => {
            // let obj = [];

            // console.log(result);
            // for (let i = 0; i < result.length; i++) {
            //     if(this.check(result[i])){
            //         obj.push(result[i]);
            //     }
            // }

            this.setState({
                data: result
            });

        });
    }
    // check(cert) {
    //     let today = new Date();
    //     let today_ts = Math.floor(today.getTime() / 1000);
    //     let valid_to_ts = Math.floor(new Date(cert.parsedCertificate.validTo).getTime() / 1000);
    //     if(today_ts > valid_to_ts){
    //         return false;
    //     }else{
    //         return true;
    //     }
    // }


    render() {

        return (
            <div className="page-wrap">
                {
                    !localStorage.token ? <Redirect to='/login' /> : null
                }
                {/* <Container> */}
                <Row>
                    <Col lg="12">
                        <h3 className="title">Certificate hierarchy</h3>
                    </Col>
                </Row>
                <Row>
                    <Col lg='12'>

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
                                            <>
                                                {
                                                    ((Math.floor(new Date(node.parsedCertificate.validTo).getTime() / 1000) > Math.floor((new Date()).getTime() / 1000)) 
                                                    && (Math.floor(new Date(node.parsedCertificate.validFrom).getTime() / 1000) < Math.floor((new Date()).getTime() / 1000)))
                                                    // && (node.revoked == null) 
                                                    ?
                                                        < TreeNode
                                                            selected={node.state.selected}
                                                            depth={node.state.depth}
                                                            onClick={event => {
                                                                tree.selectNode(node);

                                                            }}

                                                        >
                                                            <div className={node.state.selected ? "certificate-selected" : ""}>
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


                                                                <span className="certificate-name">
                                                                    <Isvg src={certificateIcon} />   {node.parsedCertificate.subject.commonName}
                                                                    {
                                                                        node.revoked != null ?
                                                                            <span className="revoked">(nije validan)</span>
                                                                            : null
                                                                    }
                                                                </span>



                                                                {
                                                                    node.state.selected ?
                                                                        <span className="buttons">
                                                                            <Link to={`/certificate/${node.id}`}><button className="button-action preview">Preview</button></Link>
                                                                            {
                                                                                node.revoked == null ?
                                                                                    <button onClick={() => this.revoke(node.id)} className="button-action space download">Revoke</button>
                                                                                    :
                                                                                    <button onClick={() => this.restore(node.id)} className="button-action space download">Restore</button>
                                                                            }
                                                                            {node.parsedCertificate.extensions && node.parsedCertificate.extensions['2.5.29.19'] && node.parsedCertificate.extensions['2.5.29.19'].value && node.parsedCertificate.extensions['2.5.29.19'].value.isCA ?
                                                                                <Link to={`/addCertificate/${node.id}`}><button className="button-action space create-new">Create new</button></Link>
                                                                                :
                                                                                null
                                                                            }
                                                                        </span>
                                                                        : null
                                                                }

                                                            </div>

                                                        </TreeNode>
                                                        : tree.removeNode(node)
                                                }
                                            </>
                                        );
                                    }}
                                </InfiniteTree>
                                : null
                        }

                    </Col>
                </Row>
            </div >
        );
    }
}

export default Page(Tree)
