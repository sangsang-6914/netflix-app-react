import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { useQuery } from "react-query"
import { useHistory, useLocation, useRouteMatch } from "react-router-dom"
import styled from "styled-components"
import { ISearchMoviesResult, ISearchTvsResult, searchMovies, searchTvs } from "../Apis/searchApi"
import MovieDetail from "../Components/MovieDetail"
import TvDetail from "../Components/TvDetail"
import { makeImagePath } from "../utils"

const Wrapper = styled.div`
    background-color: #141414;
    padding: 0px 60px;
    display: flex;
    flex-direction: column;
`

const MovieHeader = styled.div`
    margin-top: 130px;
    font-size: 30px;
    color: ${props => props.theme.white.lighter};
`

const MovieList = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 5px;
    margin-top: 30px;
`

const Movie = styled(motion.div)<{bgphoto: string}>`
    height: 150px;
    margin-bottom: 70px;
    background-color: white;
    border-radius: 5px;
    background-image: url(${props => props.bgphoto});
    background-size: cover;
    cursor: pointer;
`

const TvHeader = styled.div`
    margin-top: 10px;
    font-size: 30px;
    color: ${props => props.theme.white.lighter};
`

const TvList = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 5px;
    margin-top: 30px;
`

const Tv = styled(motion.div)<{bgphoto: string}>`
    height: 150px;
    margin-bottom: 70px;
    background-color: white;
    border-radius: 5px;
    background-image: url(${props => props.bgphoto});
    background-size: cover;
    cursor: pointer;
`

const Loader = styled.div`
    height: 20vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18pt;
`

const Info = styled(motion.div)`
    padding: 10px;
    margin-top: 150px;
    width: 100%;
    background-color: ${props => props.theme.black.lighter};
    h4 {
        text-align: center;
        font-size: 18px;
    }
    opacity: 0;
`

const Overlay = styled(motion.div)`
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    opacity: 0;
`

const contentVariants = {
    normal: {
        scale: 1
    },
    hover: {
        y: -50,
        scale: 1.3,
        zIndex: 99,
        borderRadius: 0,
        transition: {
            delay: 0.3,
            type: 'tween'
        }
    }
}

const infoVariants = {
    hover: {
        opacity: 1,
        transition: {
            delay: 0.3,
            type: 'tween'
        }
    }
}

const overlayVariants = {
    normal: {
        opacity: 0
    },
    start: {
        opacity: 1
    },
    exit: {
        opacity: 0
    }
}

enum ContentType {
    "M" = "M",
    "T" = "T"
}

function Search() {
    const location = useLocation()
    let keyword = new URLSearchParams(location.search).get("keyword")

    const {data: moviesData, isLoading: moviesLoading} = useQuery<ISearchMoviesResult>("searchMovies", () => searchMovies(keyword || "all"))
    const {data: tvsData, isLoading: tvsLoading} = useQuery<ISearchTvsResult>("searchTvs", () => searchTvs(keyword || "all"))
    const bigContentMatch = useRouteMatch<{contentId: string}>("/search/:contentId")
    const history = useHistory()

    const [contentType, setContentType] = useState<ContentType | null>(null)

    const onContentClick = (contentId: number, contentType: ContentType) => {
        if (contentType === ContentType.M) {
            setContentType(ContentType.M)
        } else {
            setContentType(ContentType.T)
        }
        history.push(`/search/${contentId}?keyword=${keyword}`)
    }

    const onOverlayClick = () => {
        history.push(`/search?keyword=${keyword}`)
    }

    const clickedMovie = ContentType.M === contentType && bigContentMatch && bigContentMatch.params.contentId &&
    moviesData?.results.find(movie => String(movie.id) === bigContentMatch.params.contentId)

    const clickedTv = ContentType.T === contentType && bigContentMatch && bigContentMatch.params.contentId &&
    tvsData?.results.find(tv => String(tv.id) === bigContentMatch.params.contentId)

    const isLoading = moviesLoading || tvsLoading
    return (
        <>
        <Wrapper>
            {
                isLoading ? <Loader>Loading...</Loader> :
                (
                    <>
                    <MovieHeader>{keyword} 관련 영화 콘텐츠</MovieHeader>
                    <MovieList>
                        {
                            moviesData?.results
                                .map(movie => (
                                    <Movie 
                                        variants={contentVariants}
                                        key={movie.id}
                                        whileHover="hover"
                                        animate="normal"
                                        transition={{type: "tween"}}
                                        onClick={() => onContentClick(movie.id, ContentType.M)}
                                        bgphoto={makeImagePath(movie.backdrop_path || "/AmLpWYm9R3Ur2FLPgj5CH3wR8wp.jpg", 'w500')}
                                        layoutId={movie.id + ""}
                                    >
                                        <Info
                                            variants={infoVariants}
                                        >
                                            <h4>{movie.title}</h4>
                                        </Info>
                                    </Movie>
                                ))
                        }
                    </MovieList>
                    <TvHeader>{keyword} 관련 TV 콘텐츠</TvHeader>
                    <TvList>
                        {
                            tvsData?.results
                                .map(tv => (
                                    <Tv 
                                        variants={contentVariants}
                                        whileHover="hover"
                                        key={tv.id}
                                        animate="normal"
                                        transition={{type: "tween"}}
                                        onClick={() => onContentClick(tv.id, ContentType.T)}
                                        bgphoto={makeImagePath(tv.backdrop_path || "/8Xs20y8gFR0W9u8Yy9NKdpZtSu7.jpg", 'w500')} 
                                        layoutId={tv.id + ""}
                                    >
                                        <Info
                                            variants={infoVariants}
                                        >
                                            <h4>{tv.name}</h4>
                                        </Info>
                                    </Tv>
                                ))
                        }
                    </TvList>
                    </>
                )
            }
        </Wrapper>
        <AnimatePresence>
        {
            bigContentMatch? (
                <>
                <Overlay variants={overlayVariants} initial="normal" animate="start" exit="exit" onClick={onOverlayClick} />
                { contentType === ContentType.M && clickedMovie && (
                    <>
                        <MovieDetail clickedMovie={clickedMovie} type="search" keyword={keyword || ""} />
                    </>
                )}
                { contentType === ContentType.T && clickedTv &&(
                    <>
                        <TvDetail clickedTv={clickedTv} type="search" keyword={keyword || ""} />
                    </>
                )}
                </>
            ): null
        }
        </AnimatePresence>
        </>
    )
}

export default Search