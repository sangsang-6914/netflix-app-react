const API_KEY = '9a5651422bd236785b93b1767b7811d8'
const BASE_PATH = 'https://api.themoviedb.org/3/search'

export function searchMovies(keyword: string) {
    return fetch(`${BASE_PATH}/movie?api_key=${API_KEY}&language-en-US&query=${keyword}`).then(
        response => response.json()
    )
}