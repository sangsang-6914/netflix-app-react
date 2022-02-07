import { motion, useViewportScroll } from "framer-motion"
import { useQuery } from "react-query"
import styled from "styled-components"
import { getTv, ITvs } from "../Apis/tvApi"
import { makeImagePath } from "../utils"
import { AiFillCloseCircle } from 'react-icons/ai'
import { useHistory } from "react-router-dom"

const BigTv = styled(motion.div)`
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 40vw;
    height: 80vh;
    border-radius: 15px;
    background-color: #141414;
    overflow-y: scroll;
`

const BigCover = styled.div<{bgphoto: string}>`
    background-image: linear-gradient(to top, #141414, transparent), url(${props => props.bgphoto});
    background-size: cover;
    background-position: center center;
    height: 400px;
    width: 100%;
`

const CloseIcon = styled.div`
    position: absolute;
    z-index: 99;
    right: 10px;
    top: 10px;
    cursor: pointer;
`

const BigTitle = styled.div`
    color: ${props => props.theme.white.lighter};
    padding: 15px;
    font-size: 36px;
    position: relative;
    top: -80px;
`

const BigOverview = styled.div`
    padding: 20px;
    color: ${props => props.theme.white.lighter};
    position: relative;
    top: -90px;
`

const InfoBox = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    top: -70px;
    padding: 20px;
    color: #c0bcbc;
`

const SubTitle = styled.div`
    display: flex;
`

const Vote = styled.div`
    margin-right: 10px;
    font-weight: bold;
    color: #4ebd1b;
`

const Release = styled.div`
    margin-right: 10px;
`
const Running = styled.div`
    color: #0066ff;
    margin-right: 10px;
`

const Episode = styled.div`
    color: #db4444;
    margin-bottom: 10px;
`

interface IDetailProps {
    clickedTv: ITvs
    type: string
    keyword?: string
}


interface ITvResult {
    adult: boolean;
    backdrop_path: string;
    created_by: [
        {
            id: number;
            name: string;
        }
    ];
    episode_run_time: [
        {
            0: number;
        }
    ]
    first_air_date: string;
    genres: [{
        id: number;
        name: string;
    }];
    homepage: string;
    id: number;
    in_production: boolean;
    last_air_date: string;
    name: string;
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: [
        {
            name: string;
        }
    ]
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: [
        {
            id: number;
            logo_path: string;
            name: string;
            origin_country: string;
        }
    ];
    production_countries: [
        {
            iso_3166_1: string;
            name: string;
        }
    ]
    vote_average: number;
    vote_count: number;
}

function TvDetail ({clickedTv, type, keyword}: IDetailProps) {
    const {scrollY} = useViewportScroll()
    const history = useHistory()
    const typeReal = type === "onair" ? "onair_" : type === "top" ? "top_" : type === "onairing" ? "onairing_" : type === "popular" ? "popular_" : ""
    const {data, isLoading} = useQuery<ITvResult>("tvDetail", () => getTv(clickedTv.id + ""))
    const onOverlayClick = () => {
        if (keyword) {
            history.push(`/search?keyword=${keyword}`)
        } else {
            history.push('/tv')
        }
    }
    return (
        <BigTv 
            style={{top: scrollY.get() + 100}}
            layoutId={typeReal + clickedTv.id}
        >
            <BigCover 
                bgphoto={makeImagePath(clickedTv.backdrop_path || "/8Xs20y8gFR0W9u8Yy9NKdpZtSu7.jpg", 'w500')}
            />
            <CloseIcon>
                <AiFillCloseCircle onClick={onOverlayClick} size="30"/>
            </CloseIcon>
            <BigTitle>{clickedTv.name}</BigTitle>
            <InfoBox>
                    <SubTitle>
                        <Vote>{data?.vote_average}</Vote>
                        <Release>{data?.first_air_date}</Release>
                        <Running>episode당 {data?.episode_run_time[0]}분</Running>
                    </SubTitle>
                    <Episode>총 {data?.number_of_seasons}시즌 {data?.number_of_episodes}부작</Episode>
                    <div>장르 : {data?.genres[0]?.name}</div>
                    <div>제작사 : {data?.production_companies[0]?.name}</div>
                    <div>Conuntry : {data?.production_countries[0]?.name}</div>
                </InfoBox>
            <BigOverview>{clickedTv.overview}</BigOverview>
        </BigTv>
    )
}

export default TvDetail