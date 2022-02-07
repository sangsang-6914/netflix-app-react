import styled from "styled-components"

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Test2 = styled.div`
    width: 235px;
    height: 40px;
    background-color: white;
    display:flex;
    align-items: center;
`

const Text = styled.div`
    margin-top: 4px;
    font-size: 16px;
    color: black;
    margin-left: 10px;
`

function Test () {
    return (
        <div>
            <Wrapper>
                <Test2>
                    <Text>학생회원</Text>
                </Test2>
            </Wrapper>
        </div>
    )
}

export default Test