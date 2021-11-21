import styled from 'styled-components';

interface Props{
    top: number;
    left: number;
}

const ContextMenu = styled.ul<Props>`
    top: ${(props) => props.top};
    left: ${(props) => props.left};
`;

export default ContextMenu;