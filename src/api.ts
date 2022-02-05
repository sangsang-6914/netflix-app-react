const API_KEY = '9a5651422bd236785b93b1767b7811d8'
const BASE_PATH = 'https://api.themoviedb.org/3'

interface IMovies {
    backdrop_path: string;
    poster_path: string
    title: string;
    overview: string;
    id: number;
}

export interface IGetMoviesResult {
    dates: {
        maximun: string;
        minimun: string;
    },
    page: number;
    results: [IMovies];
    total_pages: number;
    total_results: number;
}

export interface ITopRatedMoviesResult {
    page: number;
    results: [IMovies];
    total_pages: number;
    total_results: number;
}

export interface IUpComingMoviesResult {
    dates: {
        maximun: string;
        minimun: string;
    },
    page: number;
    results: [IMovies];
    total_pages: number;
    total_results: number;
}

export interface ILatestMovieResult {
    id: number;
    backdrop_path: string;
    original_title: string;
    overview: string;
    poster_path: string;
    title: string;
}

export interface IPopularMoviesResult {
    page: number;
    results: [IMovies];
    total_pages: number;
    total_results: number;
}

export function getMovies() {
    return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

export function getMovie(movieId: string) {
    return fetch(`${BASE_PATH}/movie/${movieId}?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

export function getLatestMovies() {
    return fetch(`${BASE_PATH}/movie/latest?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

export function getTopRatedMovies() {
    return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

export function getUpcomingMovies() {
    return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}&language=en-US`).then(
        response => response.json()
    )
}

export function getPopularMovies() {
    return fetch(`${BASE_PATH}/movie/popular?api_key=${API_KEY}&lanugage=en-US`).then(
        response => response.json()
    )
}