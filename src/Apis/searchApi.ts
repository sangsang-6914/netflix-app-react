import { IMovies } from "./movieApi"
import { ITvs } from "./tvApi"

const API_KEY = '9a5651422bd236785b93b1767b7811d8'
const BASE_PATH = 'https://api.themoviedb.org/3/search'

export interface ISearchMoviesResult {
    page: number;
    results: [IMovies];
    total_pages: number;
    total_results: number;
}

export interface ISearchTvsResult {
    page: number;
    results: [ITvs];
    total_pages: number;
    total_results: number;
}

export function searchMovies(keyword: string, page: string = "1") {
    return fetch(`${BASE_PATH}/movie?api_key=${API_KEY}&language=en-US&query=${keyword}&page=${page}`).then(
        response => response.json()
    )
}

export function searchTvs(keyword: string) {
    return fetch(`${BASE_PATH}/tv?api_key=${API_KEY}&language=en-US&query=${keyword}`).then(
        response => response.json()
    )
}