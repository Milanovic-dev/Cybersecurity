import React, { Component } from 'react';
import pin from '../../../assets/images/map.png';

export class Map extends Component {
    constructor(props) {
        super(props);
        this.initMap = this.initMap.bind(this);
        this.trackChangeLocation = this.trackChangeLocation.bind(this);
        this.gmapCallback = this.gmapCallback.bind(this);
        window.googleMapsCallback = this.gmapCallback;
        this.state = {

        };
    }

    gmapCallback() {
        this.setState({
            _googleMapsLoaded: true
        })
    }

    trackChangeLocation() {
        this.props.onChange(this.state.googleMap.getCenter().lat() + ', ' + this.state.googleMap.getCenter().lng());
    }


    initMap() {
        this.setState({
            _mapInit: true
        });


        var latLng = this.props.value && this.props.value.indexOf(',') !== -1 ? new window.google.maps.LatLng(this.props.value.split(',')[0], this.props.value.split(',')[1]) : new window.google.maps.LatLng(44.75874, 19.21437);

        var map = new window.google.maps.Map(this.GoogleMap, {
            zoom: 16,
            center: latLng,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            gestureHandling: "greedy",
        });

        map.addListener('center_changed', this.trackChangeLocation);

        this.setState({ googleMap: map });
    }

    componentDidMount() {

        var ref = window.document.getElementsByTagName("script")[0];
        var script = window.document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyAaSt58UDZVRmMYe52a3cCPfJaoCaHUJqY&callback=googleMapsCallback&language=hr&region=BA";
        script.async = true;
        script.defer = true;

        ref.parentNode.insertBefore(script, ref);


        if (this.state._googleMapsLoaded && !this.state._mapInit) {
            this.initMap();
        }

    }

    componentDidUpdate(prevProps) {

        if (this.state._googleMapsLoaded && !this.state._mapInit) {
            this.initMap();
        }

        if (this.state._googleMapsLoaded && prevProps.value != this.props.value) {
            var latLng = new window.google.maps.LatLng(this.props.value.split(',')[0], this.props.value.split(',')[1]);
            this.state.googleMap.setCenter(latLng);
        }

    }


    render() {
        return (
            <div className="map-wrap">{
                this.state._googleMapsLoaded ?
                    <div className="map" ref={(input) => { this.GoogleMap = input; }}>

                    </div>
                    : null}
                <div className="google-map-marker">
                    <img src={pin} />
                </div>

            </div>
        )
    }
}

export default Map;