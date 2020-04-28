import React from "react";
import styled from "styled-components";
import Isvg from 'react-inlinesvg';


import opened from '../../assets/svg/opened.svg';
import closed from '../../assets/svg/closed.svg';


const Toggler = styled(({ state, ...props }) => (
    <a {...props}>
        {state === "closed" && <i><Isvg src={closed}/></i>}
        {state === "opened" && <i><Isvg src={opened}/></i>}
    </a>
))`
  color: #333;
  display: inline-block;
  text-align: center;
  margin-right: 30px;
`;

export default Toggler;





