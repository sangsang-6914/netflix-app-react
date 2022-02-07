import { useQuery } from "react-query"
import styled from "styled-components"
import {motion, AnimatePresence, useViewportScroll} from 'framer-motion'
import { getLatestMovies, getMovies, getPopularMovies, getTopRatedMovies, getUpcomingMovies, IGetMoviesResult, ILatestMovieResult, IPopularMoviesResult, ITopRatedMoviesResult, IUpComingMoviesResult } from "../Apis/movieApi"
import { makeImagePath } from "../utils"
import { useState } from "react"
import { useHistory, useRouteMatch } from "react-router-dom"
import { FcPrevious, FcNext } from "react-icons/fc"

const Wrapper = styled.div`
    background-color: #141414;
    
`

const Loader = styled.div`
    height: 20vh;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Banner = styled.div<{bgphoto: string}>`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0px 60px;
    background-image: linear-gradient(rgb(20, 20, 20, 0), rgba(20,20,20,1)),url(${props => props.bgphoto});
    background-size: cover;
`

const Title = styled.h2`
    font-size: 60px;
    margin-bottom: 10px;
`

const Overview = styled.div`
    font-size: 20px;
    width: 50vw;
`

const TopSlider = styled(motion.div)`
    position: relative;
    top: -100px;
    margin-bottom: 200px;
    padding: 0px 60px;
`

const OtherSlider = styled(motion.div)`
    position: relative;
    top: -100px;
    margin-bottom: 200px;
    padding: 0px 60px;
`
 
const Row = styled(motion.div)`
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(6, 1fr);
    position: absolute;
    width: 93%;
`

const PrevBtn = styled(motion.div)`
    position: absolute;
    left: 5px;
    top: 100px;
    opacity: 0;
    cursor: pointer;
`

const NextBtn = styled(motion.div)`
    position: absolute;
    right: 5px;
    top: 100px;
    opacity: 0;
    cursor: pointer;
`

const Box = styled(motion.div)<{bgphoto: string}>`
    background-color: white;
    height:150px;
    font-size: 13pt;
    border-radius: 5px;
    background-image: url(${props => props.bgphoto});
    background-position: center;
    background-size: cover;
    &:first-child {
        transform-origin: center left;
    }
    &:last-child {
        transform-origin: center right;
    }
    cursor: pointer;
`

const Info = styled(motion.div)`
    padding: 10px;
    background-color: ${props => props.theme.black.lighter};
    opacity: 0;
    width: 100%;
    margin-top: 150px;
    bottom: 0;
    h4 {
        text-align: center;
        font-size: 18px;
    }
`

const Overlay = styled(motion.div)`
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    opacity: 0;
`

const BigMovie = styled(motion.div)`
    position: absolute;
    width: 40vw;
    height: 80vh;
    left: 0;
    right: 0;
    margin: 0 auto;
    border-radius: 15px;
    overflow: hidden;
    background-color: ${props => props.theme.black.lighter};
`

const BigCover = styled.div`
    width: 100%;
    background-size: cover;
    background-position: center center;
    height: 400px;
`

const BigTitle = styled.h3`
    color: ${props => props.theme.white.lighter};
    padding: 15px;
    font-size: 36px;
    position: relative;
    top: -60px;
`

const BigOverview = styled.p`
    padding: 20px;
    color: ${props => props.theme.white.lighter};
    position: relative;
    top: -70px;
`

const SliderTitle = styled.div`
    height: 50px;
    font-size: 1.4vw;
    color: #e5e5e5;
    font-weight: 700;
`

const rowVariants = {
    hidden: (back: boolean) => {
        return {
            x: back ? -window.outerWidth-5 : window.outerWidth+5
        }
    },
    visible: {
        x: 0
    },
    exit: (back: boolean) => {
        return {
            x: back ? window.outerWidth + 5 : -window.outerWidth-5
        }
    }
}

const boxVariants = {
    normal: {
        scale: 1,
    },
    hover: {
        zIndex: 99,
        scale: 1.3,
        y: -50,
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

const offset = 6

enum SliderType {
    "N" = "N",
    "T" = "T",
    "U" = "U",
    "P" = "P"
}

function Home () {
    const history = useHistory()
    const bigMovieMatch = useRouteMatch<{movieId: string}>("/movies/:movieId")
    const {scrollY} = useViewportScroll()
    const {data: nowMovies, isLoading: nowMoviesLoading} = useQuery<IGetMoviesResult>(["movies", "nowPlaying"], getMovies)
    const {data: latestMovie, isLoading: latestMovieLoading} = useQuery<ILatestMovieResult>(["movies", "lates"], getLatestMovies)
    const {data: topRatedMovies, isLoading: topRatedMoviesLoading} = useQuery<ITopRatedMoviesResult>(["movies", "topRated"], getTopRatedMovies)
    const {data: upComingMovies, isLoading: upComingMoviesLoading} = useQuery<IUpComingMoviesResult>(["movies", "upComing"], getUpcomingMovies)
    const {data: popularMovies, isLoading: popularMoviesLoading} = useQuery<IPopularMoviesResult>(["movies", "popular"], getPopularMovies)
    
    const [index, setIndex] = useState(0)
    const [back, setBack] = useState(false)
    const [topRatedIndex, setTopRatedIndex] = useState(0)
    const [upComingIndex, setUpComingIndex] = useState(0)
    const [popularIndex, setPopularIndex] = useState(0)
    const [leaving, setLeaving] = useState(false)
    const [sliderType, setSliderType] = useState<SliderType|null>(null)
    const increaseIndex = (type: string) => {
        if (nowMovies) {
            if (leaving) return
            setLeaving(true)
            const totalMovies = nowMovies?.results.length - 1
            const maxIndex = Math.floor(totalMovies / offset) - 1

            if (type === "inc") {
                setBack(false)
                setIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }
    
    const increaseTopRatedIndex = (type: string) => {
        if (topRatedMovies) {
            if (leaving) return
            setLeaving(true)
            const totalMovies = topRatedMovies?.results.length
            const maxIndex = Math.floor(totalMovies / offset)
            if (type === "inc") {
                setBack(false)
                setTopRatedIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setTopRatedIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }

    const increaseUpComingIndex = (type: string) => {
        if (upComingMovies) {
            if (leaving) return
            setLeaving(true)
            const totalMovies = upComingMovies?.results.length
            const maxIndex = Math.floor(totalMovies / offset)
            if (type === "inc") {
                setBack(false)
                setUpComingIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setUpComingIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }

    const increasePopularIndex = (type: string) => {
        if (popularMovies) {
            if (leaving) return
            setLeaving(true)
            const totalMovies = popularMovies?.results.length
            const maxIndex = Math.floor(totalMovies / offset)
            if (type === "inc") {
                setBack(false)
                setPopularIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setPopularIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }

    const onBoxClicked = (movieId: number, sliderType?: SliderType) => {
        if (sliderType) {
            setSliderType(sliderType)
        } else {
            setSliderType(null)
        }
        history.push(`/movies/${movieId}`)
    }
    const onOverlayClick = () => {
        history.push('/')
    }

    const clickedMovie = sliderType === null && bigMovieMatch?.params.movieId && 
        latestMovie

    const nowClickedMovie = sliderType === SliderType.N && bigMovieMatch?.params.movieId &&
        nowMovies?.results.find(movie => String(movie.id) === bigMovieMatch.params.movieId)

    const topRatedClickedMovie = sliderType === SliderType.T && bigMovieMatch?.params.movieId &&
        topRatedMovies?.results.find(movie => String(movie.id) === bigMovieMatch.params.movieId)

    const upComingClickedMovie = sliderType === SliderType.U && bigMovieMatch?.params.movieId &&
        upComingMovies?.results.find(movie => String(movie.id) === bigMovieMatch.params.movieId)

    const popularClickedMovied = sliderType === SliderType.P && bigMovieMatch?.params.movieId &&
        popularMovies?.results.find(movie => String(movie.id) === bigMovieMatch.params.movieId)

    const isLoading = nowMoviesLoading || latestMovieLoading || topRatedMoviesLoading || upComingMoviesLoading || popularMoviesLoading

    return (
        <Wrapper>{isLoading ? 
            <Loader>Loading...</Loader> : 
            <>
                <Banner bgphoto={makeImagePath(nowMovies?.results[0].backdrop_path || "")}>
                    <Title>{nowMovies?.results[0].title}</Title>
                    <Overview>{nowMovies?.results[0 ].overview}</Overview>
                </Banner>
                {/* 최신작(Latest) */}
                <TopSlider>
                <SliderTitle>인기 영화 Top 20</SliderTitle>
                    <PrevBtn onClick={() => increasePopularIndex("dec")} whileHover={{opacity: 1}}>
                        <FcPrevious size="50" />
                    </PrevBtn>
                    <AnimatePresence initial={false} onExitComplete={() => setLeaving(false)} custom={back}>
                        <Row 
                            variants={rowVariants} 
                            custom={back}
                            initial="hidden" 
                            animate="visible" 
                            exit="exit" 
                            key={popularIndex}
                            transition={{type: "tween", duration: 0.7}}
                        >
                            {popularMovies?.results
                                .slice(offset*popularIndex, offset*popularIndex+offset)
                                .map(movie => (
                                    <Box 
                                        layoutId={"popular_" + movie.id + ""}
                                        bgphoto={makeImagePath(movie.backdrop_path, 'w500')} 
                                        key={movie.id + 4}
                                        variants={boxVariants}
                                        whileHover="hover"
                                        transition={{type: "tween"}}
                                        initial="normal"
                                        onClick={() => onBoxClicked(movie.id, SliderType.P)}
                                    >
                                        <Info 
                                            variants={infoVariants}
                                        >
                                            <h4>{movie.title}</h4>
                                        </Info>
                                    </Box>
                                ))}
                        </Row>
                    </AnimatePresence>
                    <NextBtn whileHover={{opacity: 1}}>
                        <FcNext onClick={() => increasePopularIndex("inc")} style={{color: 'white'}} size="50" />
                    </NextBtn>
                </TopSlider>
                {/* NowPlaying Movie */}
                <OtherSlider>
                    <SliderTitle>현재 상영 영화</SliderTitle>
                    <PrevBtn onClick={() => increaseIndex("dec")} whileHover={{opacity: 1}}>
                        <FcPrevious size="50" />
                    </PrevBtn>
                    <AnimatePresence initial={false} onExitComplete={() => setLeaving(false)} custom={back}>
                        <Row 
                            variants={rowVariants} 
                            custom={back}
                            initial="hidden" 
                            animate="visible" 
                            exit="exit" 
                            key={index}
                            transition={{type: "tween", duration: 0.7}}
                        >
                            {nowMovies?.results
                                .slice(1)
                                .slice(offset*index, offset*index+offset)
                                .map(movie => (
                                    <Box 
                                        layoutId={"now_" + movie.id + ""}
                                        bgphoto={makeImagePath(movie.backdrop_path, 'w500')} 
                                        key={movie.id + 1}
                                        variants={boxVariants}
                                        whileHover="hover"
                                        transition={{type: "tween"}}
                                        initial="normal"
                                        onClick={() => onBoxClicked(movie.id, SliderType.N)}
                                    >
                                        <Info 
                                            variants={infoVariants}
                                        >
                                            <h4>{movie.title}</h4>
                                        </Info>
                                    </Box>
                                ))}
                        </Row>
                    </AnimatePresence>
                    <NextBtn whileHover={{opacity: 1}}>
                        <FcNext onClick={() => increaseIndex("inc")} style={{color: 'white'}} size="50" />
                    </NextBtn>
                </OtherSlider>
                {/* Top Rated Movies */}
                <OtherSlider>
                    <SliderTitle>최고평점 Top 20</SliderTitle>
                    <PrevBtn onClick={() => increaseTopRatedIndex("dec")} whileHover={{opacity: 1}}>
                        <FcPrevious size="50" />
                    </PrevBtn>
                    <AnimatePresence initial={false} onExitComplete={() => setLeaving(false)} custom={back}>
                        <Row 
                            variants={rowVariants} 
                            custom={back}
                            initial="hidden" 
                            animate="visible" 
                            exit="exit" 
                            key={topRatedIndex}
                            transition={{type: "tween", duration: 0.7}}
                        >
                            {topRatedMovies?.results
                                .slice(offset*topRatedIndex, offset*topRatedIndex+offset)
                                .map(movie => (
                                    <Box 
                                        layoutId={"top_" + movie.id + ""}
                                        bgphoto={makeImagePath(movie.backdrop_path, 'w500')} 
                                        key={movie.id + 2}
                                        variants={boxVariants}
                                        whileHover="hover"
                                        transition={{type: "tween"}}
                                        initial="normal"
                                        onClick={() => onBoxClicked(movie.id, SliderType.T)}
                                    >
                                        <Info 
                                            variants={infoVariants}
                                        >
                                            <h4>{movie.title}</h4>
                                        </Info>
                                    </Box>
                                ))}
                        </Row>
                    </AnimatePresence>
                    <NextBtn whileHover={{opacity: 1}}>
                        <FcNext onClick={() => increaseTopRatedIndex("inc")} size="50" />
                    </NextBtn>
                </OtherSlider>
                {/* Upcominmg Movies */}
                <OtherSlider>
                    <SliderTitle>개봉 예정 영화</SliderTitle>
                    <PrevBtn onClick={() => increaseUpComingIndex("dec")} whileHover={{opacity: 1}}>
                        <FcPrevious size="50" />
                    </PrevBtn>
                    <AnimatePresence initial={false} onExitComplete={() => setLeaving(false)} custom={back}>
                        <Row 
                            variants={rowVariants} 
                            custom={back}
                            initial="hidden" 
                            animate="visible" 
                            exit="exit" 
                            key={upComingIndex}
                            transition={{type: "tween", duration: 0.7}}
                        >
                            {upComingMovies?.results
                                .slice(offset*upComingIndex, offset*upComingIndex+offset)
                                .map(movie => (
                                    <Box 
                                        layoutId={"upcoming_" + movie.id + ""}
                                        bgphoto={makeImagePath(movie.backdrop_path, 'w500')} 
                                        key={movie.id + 3}
                                        variants={boxVariants}
                                        whileHover="hover"
                                        transition={{type: "tween"}}
                                        initial="normal"
                                        onClick={() => onBoxClicked(movie.id, SliderType.U)}
                                    >
                                        <Info 
                                            variants={infoVariants}
                                        >
                                            <h4>{movie.title}</h4>
                                        </Info>
                                    </Box>
                                ))}
                        </Row>
                    </AnimatePresence>
                    <NextBtn whileHover={{opacity: 1}}>
                        <FcNext onClick={() => increaseUpComingIndex("inc")} style={{color: 'white'}} size="50" />
                    </NextBtn>
                </OtherSlider>
                {/* Popular Movies */}
                <OtherSlider>
                <SliderTitle>추천 최신작</SliderTitle>
                    <AnimatePresence initial={false} onExitComplete={() => setLeaving(false)}>
                        <Row 
                            variants={rowVariants} 
                            initial="hidden" 
                            animate="visible" 
                            transition={{type: "tween", duration: 0.5}}
                        >
                            <Box 
                                layoutId={latestMovie?.id + ""}
                                bgphoto={makeImagePath(latestMovie?.poster_path || "", 'w500')} 
                                variants={boxVariants}
                                whileHover="hover"
                                transition={{type: "tween"}}
                                initial="normal"
                                onClick={() => onBoxClicked(latestMovie?.id || 0)}
                            >
                                <Info 
                                    variants={infoVariants}
                                >
                                    <h4>{latestMovie?.title}</h4>
                                </Info>
                            </Box>
                        </Row>
                    </AnimatePresence>
                </OtherSlider>
                <AnimatePresence>
                    {bigMovieMatch ? (
                        <>
                            <Overlay onClick={onOverlayClick} exit={{opacity: 0}} animate={{opacity: 1}} />
                            { sliderType === null && 
                                <BigMovie 
                                    layoutId={bigMovieMatch.params.movieId}
                                    style={{top: scrollY.get() + 100}}
                                >
                                    {clickedMovie && <>
                                        <BigCover style={{backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(clickedMovie.backdrop_path, "w500")})`}} />
                                        <BigTitle>{clickedMovie.title}</BigTitle>
                                        <BigOverview>{clickedMovie.overview}</BigOverview>
                                    </>}
                                </BigMovie>
                            } 
                            { sliderType === SliderType.N && 
                                <BigMovie 
                                    layoutId={"now_" + bigMovieMatch.params.movieId}
                                    style={{top: scrollY.get() + 100}}
                                >
                                    {nowClickedMovie && <>
                                        <BigCover style={{backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(nowClickedMovie.backdrop_path, "w500")})`}} />
                                        <BigTitle>{nowClickedMovie.title}</BigTitle>
                                        <BigOverview>{nowClickedMovie.overview}</BigOverview>
                                    </>}
                                </BigMovie>
                            }
                            { sliderType === SliderType.T &&
                                <BigMovie 
                                    layoutId={"top_" + bigMovieMatch.params.movieId}
                                    style={{top: scrollY.get() + 100}}
                                >
                                    {topRatedClickedMovie && <>
                                        <BigCover style={{backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(topRatedClickedMovie.backdrop_path, "w500")})`}} />
                                        <BigTitle>{topRatedClickedMovie.title}</BigTitle>
                                        <BigOverview>{topRatedClickedMovie.overview}</BigOverview>
                                    </>}
                                </BigMovie>
                            }
                            { sliderType === SliderType.U &&
                                <BigMovie 
                                    layoutId={"upcoming_" + bigMovieMatch.params.movieId}
                                    style={{top: scrollY.get() + 100}}
                                >
                                    {upComingClickedMovie && <>
                                        <BigCover style={{backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(upComingClickedMovie.backdrop_path, "w500")})`}} />
                                        <BigTitle>{upComingClickedMovie.title}</BigTitle>
                                        <BigOverview>{upComingClickedMovie.overview}</BigOverview>
                                    </>}
                                </BigMovie>
                            }
                            { sliderType === SliderType.P &&
                                <BigMovie 
                                    layoutId={"popular_" + bigMovieMatch.params.movieId}
                                    style={{top: scrollY.get() + 100}}
                                >
                                    {popularClickedMovied && <>
                                        <BigCover style={{backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(popularClickedMovied.backdrop_path, "w500")})`}} />
                                        <BigTitle>{popularClickedMovied.title}</BigTitle>
                                        <BigOverview>{popularClickedMovied.overview}</BigOverview>
                                    </>}
                                </BigMovie>
                            }
                    </>
                    ) : null}
                </AnimatePresence>
            </>
        }
        </Wrapper>
    )
}

export default Home