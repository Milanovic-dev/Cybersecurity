import React, { Component } from 'react';
import Isvg from 'react-inlinesvg';
import image from '../../../assets/svg/image.svg';

class Image extends Component {
    constructor(props) {
        super(props);
        this.selectFile = this.selectFile.bind(this);
        this.state = {
        };
    }

    selectFile(e) {
        let input = e.target;
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = async (e) => {
                this.setState({
                    _loading: true
                })
                fetch('http://127.0.0.1:4000/upload', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`

                    },
                    body: JSON.stringify({file: e.target.result})
                }).then((res) => res.text()).then((img) => {
                    this.props.onChange(img);
                    this.setState({
                        _loading: null
                    })
                });
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    render() {
        return (
                        <div className="image-picker single-image-picker">
                            <input type="file" onChange={this.selectFile} />
                            {this.props.value ?
                                <img src={this.props.value} />
                                :
                                <div className="no-image">
                                    <Isvg src={image} />
                                    <span className="text">Izaberite sliku</span>
                                    {
                                        this.state._loading ?
                                        <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                                        :
                                        null
                                    }
                                </div>
                            }
                        </div>
        );
    }
  }

export default Image;