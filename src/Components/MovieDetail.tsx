import { motion, useViewportScroll } from "framer-motion"
import { useQuery } from "react-query"
import styled from "styled-components"
import { getMovie, IMovies } from "../Apis/movieApi"
import { AiFillCloseCircle } from 'react-icons/ai'
import { makeImagePath } from "../utils"
import { useHistory } from "react-router-dom"

const BigMovie = styled(motion.div)`
    position: absolute;
    width: 40vw;
    height: 80vh;
    left: 0;
    right: 0;
    margin: 0 auto;
    border-radius: 15px;
    overflow: hidden;
    background-color: #141414;
`

const BigCover = styled.div`
    width: 100%;
    background-size: cover;
    background-position: center center;
    height: 400px;
`
const CloseIcon = styled.div`
    position: absolute;
    z-index: 99;
    right: 10px;
    top: 10px;
    cursor: pointer;
`

const BigTitle = styled.h3`
    color: ${props => props.theme.white.lighter};
    padding: 15px;
    font-size: 36px;
    position: relative;
    top: -80px;
`

const BigOverview = styled.p`
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
`

interface IDetailProps {
    clickedMovie: IMovies
    type: string
    keyword?: string
}

interface IMovieDetailResult {
    adult: boolean;
    backdrop_path: string;
    budget: number;
    genres: [{
        id: number;
        name: string;
    }];
    homepage: string;
    id: number;
    imdb_id: string;
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
    release_date: string;
    revenue: number;
    runtime: number;
    status: string;
    tagline: string;
    title: string;
    vote_average: number;
    vote_count: number;
}

function MovieDetail ({clickedMovie, type, keyword}:IDetailProps) {
    const typeReal = type === "now" ? "now_" : type === "top" ? "top_" : type === "upcoming" ? "upcoming_" : type === "popular" ? "popular_" : ""
    const {data, isLoading} = useQuery<IMovieDetailResult>("movieDetail", () => getMovie(clickedMovie.id + ""))
    const {scrollY} = useViewportScroll()
    const history = useHistory()
            
    const onOverlayClick = () => {
        if (keyword) {
            history.push(`/search?keyword=${keyword}`)
        } else {
            history.push('/')
        }
    }
    return (
        <>
            <BigMovie 
                layoutId={typeReal + clickedMovie.id}
                style={{top: scrollY.get() + 100}}
            >
                <BigCover style={{backgroundImage: `linear-gradient(to top, #141414, transparent), url(${makeImagePath(clickedMovie.backdrop_path || "/AmLpWYm9R3Ur2FLPgj5CH3wR8wp.jpg", "w500")})`}} />
                <CloseIcon>
                    <AiFillCloseCircle onClick={onOverlayClick} size="30"/>
                </CloseIcon>
                <BigTitle>{clickedMovie.title}</BigTitle>
                <InfoBox>
                    <SubTitle>
                        <Vote>{data?.vote_average}</Vote>
                        <Release>{data?.release_date}</Release>
                        <Running>{data?.runtime}분</Running>
                    </SubTitle>
                    <div>장르 : {data?.genres[0]?.name}</div>
                    <div>제작사 : {data?.production_companies[0]?.name}</div>
                    <div>Conuntry : {data?.production_countries[0]?.name}</div>
                </InfoBox>
                <BigOverview>{clickedMovie.overview}</BigOverview>
            </BigMovie>
        </>
    )
}

export default MovieDetail