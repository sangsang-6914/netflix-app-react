import { useQuery } from "react-query"
import { useLocation } from "react-router-dom"
import { searchMovies } from "../Apis/searchApi"


function Search() {
    const location = useLocation()
    const keyword = new URLSearchParams(location.search).get("keyword")
    const {data, isLoading} = useQuery("searchMovies", () => searchMovies(keyword || ""))
    console.log(data)
    return (
        <div>
            <h1>search</h1>
        </div>
    )
}

export default Search