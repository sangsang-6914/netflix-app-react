const API_KEY = '9a5651422bd236785b93b1767b7811d8'
const BASE_PATH = 'https://api.themoviedb.org/3/tv'

export interface ITvs {
    backdrop_path: string;
    first_air_date: string;
    id: number;
    name: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
}

export interface ITvsResult {
    page: number;
    results: [ITvs];
    total_pages: number;
    total_results: number;
}

export interface ILatestTvResult {
    adult: string;
    backdrop_path: string;
    first_air_date: string;
    id: number;
    name: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
}

// 현재 방송중인 프로그램
export function getOnAirTvs() {
    return fetch("https://api.themoviedb.org/3/tv/on_the_air?api_key=9a5651422bd236785b93b1767b7811d8&language=en-US").then(
        response => response.json()
    )
}

// 추천 최신 프로그램
export function getLatestTv() {
    return fetch(`${BASE_PATH}/latest?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

// 평점 높은 콘텐츠
export function getTopRatedTvs() {
    return fetch(`${BASE_PATH}/top_rated?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

// 인기 프로그램
export function getPopularTvs() {
    return fetch(`${BASE_PATH}/popular?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

// 오늘 방영 예정 프로그램
export function getTodayTvs() {
    return fetch(`${BASE_PATH}/airing_today?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

export function getTv(tvId: string) {
    return fetch(`${BASE_PATH}/${tvId}?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}