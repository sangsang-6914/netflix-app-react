import { AnimatePresence, motion, useViewportScroll } from "framer-motion"
import { useState, useEffect } from "react"
import { FcNext, FcPrevious } from "react-icons/fc"
import { useQuery } from "react-query"
import { useRouteMatch, useHistory } from "react-router-dom"
import styled from "styled-components"
import { getLatestTv, getOnAirTvs, getPopularTvs, getTopRatedTvs, ILatestTvResult, ITvsResult } from "../Apis/tvApi"
import { makeImagePath } from "../utils"

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

const Title = styled.div`
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

const SliderTitle = styled.div`
    height: 50px;
    font-size: 1.4vw;
    color: #e5e5e5;
    font-weight: 700;
`

const Row = styled(motion.div)`
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(6, 1fr);
    position: absolute;
    width: 93%;
`

const Box = styled(motion.div)<{bgphoto?: string}>`
    height: 150px;
    background-color: white;
    border-radius: 5px;
    background-image: url(${props => props.bgphoto || ""});
    background-size: cover;
    &:first-child {
        transform-origin: center left;
    }
    &:last-child {
        transform-origin: center right;
    }
    cursor: pointer;
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

const Info = styled(motion.div)`
    padding: 10px;
    background-color: ${props => props.theme.black.lighter};
    width: 100%;
    bottom: 0;
    margin-top: 150px;
    opacity: 0;
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

const BigTv = styled(motion.div)`
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 40vw;
    height: 80vh;
    border-radius: 15px;
    background-color: ${props => props.theme.black.lighter};
    overflow: hidden;
`

const BigCover = styled.div<{bgphoto: string}>`
    background-image: linear-gradient(to top, black, transparent), url(${props => props.bgphoto});
    background-size: cover;
    background-position: center center;
    height: 400px;
    width: 100%;
`

const BigTitle = styled.div`
    top: -60px;
    position: relative;
    font-size: 36px;
    padding: 15px;
    color: ${props => props.theme.white.lighter};
`

const BigOverview = styled.div`
    padding: 20px;
    color: ${props => props.theme.white.lighter};
    position: relative;
    top: -70px;
`

const rowVariants = {
    hidden: (back: string) => {
        return {
            x: back ? -window.outerWidth - 5 : window.outerWidth + 5
        }
    },
    visible: {
        x: 0
    },
    invisible: (back: string) => {
        return {
            x: back ? window.outerWidth + 5 : -window.outerWidth - 5
        }
    }
}

const boxVariants = {
    normal: {
        scale: 1,
    },
    hover: {
        borderRadius: 0,
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

enum SliderType {
    "O" = "O",
    "T" = "T",
    "P" = "P",
    "OA" = "OA"
}

const offset = 6

function Tv() {
    const {data: onAirTvs, isLoading: onAirTvsLoading} = useQuery<ITvsResult>(["tvs", "onAir"], getOnAirTvs)
    const {data: topRatedTvs, isLoading: topRatedLoading} = useQuery<ITvsResult>(["tvs", "topRated"], getTopRatedTvs)
    const {data: latestTv, isLoading: latsetLoading} = useQuery<ILatestTvResult>(["tvs", "latest"], getLatestTv)
    const {data: popularTvs, isLoading: popularLoading} = useQuery<ITvsResult>(["tvs", "popular"], getPopularTvs)
    const {data: onAirlingTvs, isLoading: onAirLingLoading} = useQuery<ITvsResult>(["tvs", "onAiring"], getOnAirTvs)

    const [index, setIndex] = useState(0)
    const [topRatedIndex, setTopRatedIndex] = useState(0)
    const [popularIndex, setPopularIndex] = useState(0)
    const [onAiringIndex, setOnAiringIndex] = useState(0)
    const [leaving, setLeaving] = useState(false)
    const [back, setBack] = useState(false)
    const [sliderType, setSliderType] = useState<SliderType|null>(null)

    const bigTvMatch = useRouteMatch<{tvId: string}>("/tv/:tvId")
    const history = useHistory()

    const {scrollY} = useViewportScroll()

    const isLoading = onAirTvsLoading || topRatedLoading || latsetLoading || popularLoading || onAirTvsLoading

    const onOverlayClick = () => {
        history.push('/tv')
    }

    const changeSlider = (type: string) => {
        if (onAirTvs) {
            if (leaving) return
            setLeaving(true)
    
            const totalTvs = onAirTvs?.results.length - 1
            const maxIndex = Math.floor(totalTvs / offset) - 1
            if (type === 'inc') {
                setBack(false)
                setIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }

    const changeTopRatedSlider = (type: string) => {
        if (topRatedTvs) {
            if (leaving) return
            setLeaving(true)

            const totalTvs = topRatedTvs.results.length
            const maxIndex = Math.floor(totalTvs / offset)
            
            if (type === 'inc') {
                setBack(false)
                setTopRatedIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setTopRatedIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }

    const changeOnAiringSlider = (type: string) => {
        if (onAirlingTvs) {
            if (leaving) return
            setLeaving(true)

            const totalTvs = onAirlingTvs.results.length
            const maxIndex = Math.floor(totalTvs / offset)
            
            if (type === 'inc') {
                setBack(false)
                setOnAiringIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setOnAiringIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }

    const changePopularSlider = (type: string) => {
        if (popularTvs) {
            if (leaving) return
            setLeaving(true)

            const totalTvs = popularTvs.results.length
            const maxIndex = Math.floor(totalTvs / offset)
            
            if (type === 'inc') {
                setBack(false)
                setPopularIndex(prev => prev === maxIndex ? 0 : prev + 1)
            } else {
                setBack(true)
                setPopularIndex(prev => prev === 0 ? maxIndex : prev - 1)
            }
        }
    }

    const onClickTv = (tvId: number, sliderType?: SliderType) => {
        if (sliderType) {
            setSliderType(sliderType)
        } else {
            setSliderType(null)
        }

        history.push(`/tv/${tvId}`)
    }

    const clickedLatestTv = sliderType === null && bigTvMatch?.params.tvId && latestTv

    const clickedOnAirTv = sliderType === SliderType.O && bigTvMatch?.params.tvId &&
        onAirTvs?.results.find(tv => String(tv.id) === bigTvMatch.params.tvId)

    const clickedTopRatedTv = sliderType === SliderType.T && bigTvMatch?.params.tvId &&
        topRatedTvs?.results.find(tv => String(tv.id) === bigTvMatch.params.tvId)

    const clickedPopularTv = sliderType === SliderType.P && bigTvMatch?.params.tvId &&
        popularTvs?.results.find(tv => String(tv.id) === bigTvMatch.params.tvId)

    const clickedOnAiringTv = sliderType === SliderType.OA && bigTvMatch?.params.tvId &&
        onAirlingTvs?.results.find(tv => String(tv.id) === bigTvMatch.params.tvId)

    return (
        <Wrapper>
            {
                isLoading ?
                <Loader>Loading...</Loader> :
                <>
                    <Banner bgphoto={makeImagePath(onAirTvs?.results[0].backdrop_path || "")}>
                        <Title>{onAirTvs?.results[0].name}</Title>
                        <Overview>{onAirTvs?.results[0].overview}</Overview>
                    </Banner>
                    <TopSlider>
                    <SliderTitle>오늘 방영 예정 콘텐츠</SliderTitle>
                        <PrevBtn onClick={() => changeOnAiringSlider("dec")} whileHover={{opacity: 1}}>
                            <FcPrevious size="50" />    
                        </PrevBtn>
                        <AnimatePresence custom={back} initial={false} onExitComplete={() => setLeaving(false)}>
                            <Row
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                exit="invisible"
                                transition={{type: "tween", duration: 0.7}}
                                custom={back}
                                key={onAiringIndex}
                            >
                                {
                                    onAirlingTvs?.results
                                    .slice(onAiringIndex*offset, onAiringIndex*offset+offset)
                                    .map(tv => (
                                        <Box
                                            bgphoto={makeImagePath(tv.backdrop_path, 'w500')}
                                            key={tv.id}
                                            variants={boxVariants}
                                            whileHover="hover"
                                            animate="normal"
                                            transition={{type: "tween"}}
                                            layoutId={`onairing_${tv.id}`}
                                            onClick={() => onClickTv(tv.id, SliderType.OA)}
                                        >
                                            <Info
                                                variants={infoVariants}
                                            >
                                                <h4>{tv.name}</h4>
                                            </Info>
                                        </Box>    
                                    ))
                                }
                            </Row>
                        </AnimatePresence>
                        <NextBtn onClick={() => changeOnAiringSlider("inc")} whileHover={{opacity: 1}}>
                            <FcNext size="50" />
                        </NextBtn>
                    </TopSlider>
                    <OtherSlider>
                        <SliderTitle>현재 방영중 콘텐츠</SliderTitle>
                        <PrevBtn onClick={() => changeSlider("dec")} whileHover={{opacity: 1}}>
                            <FcPrevious size="50" />
                        </PrevBtn>
                        <AnimatePresence initial={false} onExitComplete={() => setLeaving(false)} custom={back}>
                            <Row
                                variants={rowVariants}
                                custom={back}
                                key={index}
                                initial="hidden"
                                animate="visible"
                                exit="invisible"
                                transition={{type:'tween', duration: 0.7}}
                            >
                                {
                                    onAirTvs?.results
                                        .slice(1)
                                        .slice(index*offset, index*offset+offset)
                                        .map(tv => (
                                            <Box
                                                bgphoto={makeImagePath(tv.backdrop_path, 'w500')}
                                                key={tv.id}
                                                variants={boxVariants}
                                                whileHover="hover"
                                                animate="normal"
                                                transition={{type: "tween"}}
                                                layoutId={"onair_"+tv.id}
                                                onClick={() => onClickTv(tv.id, SliderType.O)}
                                            >
                                                <Info
                                                    variants={infoVariants}
                                                >
                                                    <h4>{tv.name}</h4>
                                                </Info>
                                            </Box>
                                        ))
                                }
                            </Row>
                        </AnimatePresence>
                        <NextBtn onClick={() => changeSlider("inc")} whileHover={{opacity: 1}}>
                            <FcNext size="50" />
                        </NextBtn>
                    </OtherSlider>
                    <OtherSlider>
                        <SliderTitle>평점 높은 콘텐츠</SliderTitle>
                        <PrevBtn onClick={() => changeTopRatedSlider("dec")} whileHover={{opacity: 1}}>
                            <FcPrevious size="50" />        
                        </PrevBtn>
                        <AnimatePresence custom={back} initial={false} onExitComplete={() => setLeaving(false)}>
                            <Row
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                exit="invisible"
                                transition={{type: "tween", duration: 0.7}}
                                custom={back}
                                key={topRatedIndex}
                            >
                                {
                                    topRatedTvs?.results
                                    .slice(offset*topRatedIndex, offset*topRatedIndex+offset)
                                    .map(tv => (
                                        <Box
                                            bgphoto={makeImagePath(tv.backdrop_path, 'w500')}
                                            key={tv.id}
                                            variants={boxVariants}
                                            whileHover="hover"
                                            animate="normal"
                                            transition={{type: "tween"}}
                                            layoutId={`top_${tv.id}`}
                                            onClick={() => onClickTv(tv.id, SliderType.T)}
                                        >
                                            <Info
                                                variants={infoVariants}
                                            >
                                                <h4>{tv.name}</h4>
                                            </Info>
                                        </Box>
                                    ))
                                }
                            </Row>
                        </AnimatePresence>
                        <NextBtn onClick={() => changeTopRatedSlider("inc")} whileHover={{opacity: 1}}>
                            <FcNext size="50" />
                        </NextBtn>
                    </OtherSlider>
                    <OtherSlider>
                        <SliderTitle>인기 콘텐츠</SliderTitle>
                        <PrevBtn onClick={() => changePopularSlider("dec")} whileHover={{opacity: 1}}>
                            <FcPrevious size="50" />    
                        </PrevBtn>
                        <AnimatePresence custom={back} initial={false} onExitComplete={() => setLeaving(false)}>
                            <Row
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                exit="invisible"
                                transition={{type: "tween", duration: 0.7}}
                                custom={back}
                                key={popularIndex}
                            >
                               {
                                    popularTvs?.results
                                    .slice(popularIndex*offset, popularIndex*offset+offset)
                                    .map(tv => (
                                       <Box
                                         bgphoto={makeImagePath(tv.backdrop_path, 'w500')} 
                                         key={tv.id}   
                                            variants={boxVariants}
                                            whileHover="hover"
                                            animate="normal"
                                            transition={{type: "tween"}}
                                            layoutId={`popular_${tv.id}`}
                                            onClick={() => onClickTv(tv.id, SliderType.P)}
                                       >
                                           <Info
                                                variants={infoVariants}
                                            >
                                                <h4>{tv.name}</h4>
                                            </Info>
                                        </Box>
                                    )) 
                               }
                            </Row>
                        </AnimatePresence>
                        <NextBtn onClick={() => changePopularSlider("inc")} whileHover={{opacity: 1}}>
                            <FcNext size="50" />
                        </NextBtn>
                    </OtherSlider>
                    <OtherSlider>
                        <SliderTitle>추천 최신 콘텐츠</SliderTitle>
                        <Row>
                            <Box
                                variants={boxVariants}
                                whileHover="hover"
                                animate="normal"
                                transition={{type: "tween"}}
                                bgphoto={makeImagePath(latestTv?.backdrop_path || "", 'w500')}
                                onClick={() => onClickTv(latestTv?.id || 0)}
                                layoutId={latestTv?.id + ""}
                            >
                                <Info
                                    variants={infoVariants}
                                >
                                    <h4>{latestTv?.name}</h4>
                                </Info>
                            </Box>
                        </Row>
                    </OtherSlider>
                    <AnimatePresence>
                    {
                        bigTvMatch ?(
                            <>
                                <Overlay
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    onClick={onOverlayClick}
                                />
                                { sliderType === SliderType.O && clickedOnAirTv && <>
                                    <BigTv 
                                        style={{top: scrollY.get() + 100}}
                                        layoutId={"onair_" + clickedOnAirTv.id}
                                    >
                                        <BigCover 
                                            bgphoto={makeImagePath(clickedOnAirTv.backdrop_path, 'w500')}
                                        />
                                        <BigTitle>{clickedOnAirTv.name}</BigTitle>
                                        <BigOverview>{clickedOnAirTv.overview}</BigOverview>
                                    </BigTv>
                                </>
                                }
                                { sliderType === SliderType.T && clickedTopRatedTv && <>
                                    <BigTv 
                                        style={{top: scrollY.get() + 100}}
                                        layoutId={"top_" + clickedTopRatedTv.id}
                                    >
                                        <BigCover 
                                            bgphoto={makeImagePath(clickedTopRatedTv.backdrop_path, 'w500')}
                                        />
                                        <BigTitle>{clickedTopRatedTv.name}</BigTitle>
                                        <BigOverview>{clickedTopRatedTv.overview}</BigOverview>
                                    </BigTv>
                                </>
                                }
                                { sliderType === SliderType.P && clickedPopularTv && <>
                                    <BigTv 
                                        style={{top: scrollY.get() + 100}}
                                        layoutId={"popular_" + clickedPopularTv.id}
                                    >
                                        <BigCover 
                                            bgphoto={makeImagePath(clickedPopularTv.backdrop_path, 'w500')}
                                        />
                                        <BigTitle>{clickedPopularTv.name}</BigTitle>
                                        <BigOverview>{clickedPopularTv.overview}</BigOverview>
                                    </BigTv>
                                </>
                                }
                                { sliderType === SliderType.OA && clickedOnAiringTv && <>
                                    <BigTv 
                                        style={{top: scrollY.get() + 100}}
                                        layoutId={"onairing_" + clickedOnAiringTv.id}
                                    >
                                        <BigCover 
                                            bgphoto={makeImagePath(clickedOnAiringTv.backdrop_path, 'w500')}
                                        />
                                        <BigTitle>{clickedOnAiringTv.name}</BigTitle>
                                        <BigOverview>{clickedOnAiringTv.overview}</BigOverview>
                                    </BigTv>
                                </>
                                }
                                { sliderType === null && clickedLatestTv &&  <>
                                    <BigTv 
                                        style={{top: scrollY.get() + 100}}
                                        layoutId={clickedLatestTv.id + ""}
                                    >
                                        <BigCover 
                                            bgphoto={makeImagePath(clickedLatestTv.backdrop_path, 'w500')}
                                        />
                                        <BigTitle>{clickedLatestTv.name}</BigTitle>
                                        <BigOverview>{clickedLatestTv.overview}</BigOverview>
                                    </BigTv>
                                </>
                                }
                            </>
                        ): null
                    }
                    </AnimatePresence>
                </>
            }
        </Wrapper>
    )
}
export default Tv