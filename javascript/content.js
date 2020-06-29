const url = 'https://www.omdbapi.com/';
const chromeStorageKey = 'mfcOmdbApiKey';

var allRatings = {}; 
initProcedure(); 

function initProcedure() {
    chrome.storage.sync.get(chromeStorageKey, (result) => {
        if (result && result[chromeStorageKey]) {
            let api = url + '?apikey=' + result[chromeStorageKey]; 
            fetchAllRatings(api); 
            window.addEventListener('scroll', injectionCycle)
        }
    }); 
}

async function fetchAllRatings(api) {
    let movieLinks = document.querySelectorAll('div > div > article > div > a'); // used every time 
    let loadedMovieLinks = document.querySelectorAll('article > div > div > div > a'); // sometimes used

    for(let movieLink of movieLinks) {
        let movieName = cutMovieLink(movieLink); 
        console.log(movieName);
        let ratings = await fetchRatings(movieName, api); 
        allRatings[movieName] = ratings; 
        injectionCycle(); 
    }

    for (let movieLink of loadedMovieLinks) {
        let movieName = cutMovieLink(movieLink); 
        console.log(movieName);
        let ratings = await fetchRatings(movieName, api); 
        allRatings[movieName] = ratings; 
        injectionCycle(); 
    }
}

function cutMovieLink(movieLink) {
    let movieName = movieLink.href.substr(movieLink.href.lastIndexOf('/') + 1); 
    return movieName.replace(/-/g, ' ');
}
async function fetchRatings(movieName, api) {
    api += '&t=' + movieName;
    let response = await fetch(api, {method: 'post'}); 
    let movieData = await response.json(); 
    return movieData['Ratings'];
}

function injectionCycle() {
    let movieLinks = document.querySelectorAll('article > div > div > div > a');

    for (let movieLink of movieLinks) {
        let movieName = cutMovieLink(movieLink); 
        console.log(movieName);
        console.log(allRatings);
        if (!document.getElementById("mubiChromeExtension-" +  movieName)) {
            let notFound = document.getElementById("mubiChromeExtension-" +  movieName + "-notFound");
            if (notFound) notFound.remove(); 
            if (movieName in allRatings) {
                let ratings = allRatings[movieName]; 
                console.log(movieName + "---" + ratings);
                let ratingsElement = createMovieRatingsElement(movieName, ratings);
        
                let placeToInjectRatings = movieLink.parentElement.parentElement.parentElement.parentElement.firstChild.firstChild;
        
                placeToInjectRatings.insertBefore(ratingsElement, null);
            } else {
                let loadingElement = createMovieRatingsElement(movieName, "loading");
                let placeToInjectRatings = movieLink.parentElement.parentElement.parentElement.parentElement.firstChild.firstChild;
                placeToInjectRatings.insertBefore(loadingElement, null);
            }

        }
    }
}

function createMovieRatingsElement(movieName, ratings) {
    let movieRatingsElement = document.createElement('div');
    movieRatingsElement.id = "mubiChromeExtension-" +  movieName + (ratings && ratings != "loading" ? "" : "-notFound"); 
    let movieRatingsElementStyle = "display: flex; align-items: flex-end; justify-content: flex-end; flex-direction: column;background-color: transparent; height: 250px; width: 300px; position: absolute; bottom: 2px; right: 2px; font-family: DMSans,Helvetica,Arial,Lucida Grande,sans-serif; padding: 0 4px 0 4px;";
    movieRatingsElement.setAttribute("style", movieRatingsElementStyle);

    let ratingElementStyle = "font-size: 18px; font-family: DMSans,Helvetica,Arial,Lucida Grande,sans-serif; color: white";

    if (ratings && ratings != "loading") {
        for(let rating of ratings) {
            let ratingElement = document.createElement('span');  
            ratingElement.setAttribute("style", ratingElementStyle);
            ratingElement.innerHTML = (rating["Source"] === "Internet Movie Database" ? "IMDB" : rating["Source"]) + " : " + rating["Value"] + " "; 
            movieRatingsElement.appendChild(ratingElement);
        }
    } else if (ratings === "loading") {
        let ratingElement = document.createElement('span');  
        ratingElement = document.createElement('span');
        ratingElement.innerHTML = "Ratings are still loading. Scroll to refresh!";
        movieRatingsElement.appendChild(ratingElement);
    } else {
        let ratingElement = document.createElement('span');  
        ratingElement = document.createElement('span');
        ratingElement.innerHTML = "No ratings found.";
        movieRatingsElement.appendChild(ratingElement);
    }

    return movieRatingsElement; 
}



