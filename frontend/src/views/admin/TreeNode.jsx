import React from 'react';
import styled from 'styled-components';
 
const defaultRowHeight = 30;
 
const TreeNode = styled.div`
    cursor: default;
    position: relative;
    line-height: ${({ rowHeight = defaultRowHeight }) => rowHeight - 2}px;
    background: ${props => props.selected ? '#transparent' : 'transparent'};
    border: ${props => props.selected ? '1px solid transparent' : '1px solid transparent'};
    font-weight: ${props => props.selected ? '700' : '300'};
    font-size: ${props => props.selected ? '20px' : '17px'};
    padding-left: ${props => props.depth * 18}px;
    .dropdown {
        visibility: hidden;
    }
    &:hover {
        background: #FFFFFF;
        .dropdown {
            visibility: inherit;
        }
    }
`;
 
export default TreeNode;