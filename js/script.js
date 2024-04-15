
let songs = []
let currFolder;
let currentsong = new Audio;
function secondsToMinutesSeconds(seconds) {
  seconds = Math.round(seconds);

  if (isNaN(seconds) || seconds < 0)
    return '00:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedRemainingSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedRemainingSeconds}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/Spotify-Clone/songs/${currFolder}`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let as = div.getElementsByTagName('a')
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/Spotify-Clone/songs/${currFolder}/`)[1])

    }
  }
  let songList = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songList.innerHTML = "";
  for (const song of songs) {
    let songName = song.replaceAll("_", " ").replaceAll(".mp3", "").replaceAll("%20", " ").split("-")[0];
    let artist = song.replaceAll("_", " ").replaceAll(".mp3", "").replaceAll("%20", " ").split("-")[1];

    // Create list item for each song
    let listItem = document.createElement('li');
    listItem.innerHTML = `<img class="invert" src="assets/music.svg" alt="">
    <div class="info">
    <div>${songName}</div>
    <div>${artist}</div>
    </div>
    <div class="space "></div>
    <div class="playnow">
    <div>Play Now</div>
    <img class="invert" src="assets/play.svg" alt="">
    </div>`;

    // Attach event listener to play the song
    listItem.addEventListener('click', (event) => {
      let music = song.trim();
      playMusic(music);
    });

    // Append the list item to the song list
    songList.appendChild(listItem);
  }
  return songs
}
//playing Music

const playMusic = (track, pause = false) => {
  currentsong.src = `/Spotify_clone/songs/${currFolder}/` + track
  if (!pause) {
    currentsong.play()
    playBtn.src = "/Spotify_clone/assets/pause.svg"
  }
  document.querySelector(".songInfo").innerHTML = track.replaceAll("_", " ").replaceAll(".mp3", "").replaceAll("%20", " ").split("-")[0]
  document.querySelector(".songTime").innerHTML = "00:00/00:00"

}
async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector('.card-container')
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];


    if (e.href.includes("/songs")) {
      let folder = (e.href.split("/").slice(-2)[0]);
      //get metadata of the folder
      let a = await fetch(`/Spotify_clone/songs/${folder}/info.json`)
      let response = await a.json();
      cardcontainer.innerHTML = cardcontainer.innerHTML + `<div class="card" data-folder="${folder}">
      <img src="songs/${folder}/cover.jpg" alt="" />
      <div class="play">
        <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
          class="Svg-sc-ytk21e-0 bneLcE">
          <path
            d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
          </path>
        </svg>
      </div>
      <h3>${response.title}</h3>
      <p>${response.description}</p>
    </div>`
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener('click', async items => {
      songs = await getSongs(items.currentTarget.dataset.folder);
      playMusic(songs[0])
    })
  })
  
}
async function main() {
  await getSongs("1");

  playMusic(songs[0], true);

  displayAlbums()

  //Attch An Event Listner to Play, Pause, Previous And next
  playBtn.addEventListener('click', () => {
    if (currentsong.paused) {
      currentsong.play();
      playBtn.src = "/Spotify_clone/assets/pause.svg"
    }
    else {
      currentsong.pause();
      playBtn.src = "/Spotify_clone/assets/play.svg"
    }
  })
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
  })
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    currentsong.currentTime = percent * currentsong.duration / 100
  })
  let isDragging = false;
  document.querySelector(".seekbar").addEventListener("mousedown", e => {
    isDragging = true;
    updateSeek(e);
  });
  document.addEventListener("mousemove", e => {
    if (isDragging) {
      updateSeek(e);
    }
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
  function updateSeek(e) {
    const seekBar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    let percent = (e.offsetX / seekBar.getBoundingClientRect().width) * 100;
    circle.style.left = percent + "%";
    currentsong.currentTime = percent * currentsong.duration / 100;
  }
  //Next Song Functionlity
  let songindex = 0
  nextBtn.addEventListener('click', () => {
    songindex++;
    if (songindex >= songs.length) {
      songindex = 0;
    };
    playMusic(songs[songindex]);
  })
  prevBtn.addEventListener('click', () => {
    if (songindex > 0) {
      // If there is a previous song, play it
      songindex--;
      playMusic(songs[songindex]);
    } else {
      // If there is no previous song, start playing the last song from the list
      songindex = songs.length - 1;
      playMusic(songs[songindex]);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (currentsong.paused) {
        currentsong.play();
        playBtn.src = "/Spotify_clone/assets/pause.svg"
      }
      else {
        currentsong.pause();
        playBtn.src = "/Spotify_clone/assets/play.svg"
      }
    }
    else if (e.code == "ArrowLeft") {
      currentsong.currentTime -= 5;
    }
    else if (e.code == "ArrowRight") {
      currentsong.currentTime += 5;
    }
    else if (e.code === "KeyN") {
      nextBtn.click();
    }
    else if (e.code == "KeyP") {
      prevBtn.click();
    }

  })

  // document.addEventListener("visibilitychange", (e) => {
  //   currentsong.pause();
  //   playBtn.src = "/Spotify_clone/assets/play.svg"
  // })
  // Display All the Albums on the Page
 

  document.querySelector(".menu").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-150%"
  })
  document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100

  })
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (currentsong.volume === 0) { 
      e.target.src= "/Spotify_clone/assets/volume.svg";
      currentsong.volume = 1;
      document.querySelector(".volume").getElementsByTagName("input")[0] .value = '100'
    } else if (currentsong.volume > 0) { 
      e.target.src="/Spotify_clone/assets/mute.svg";
      currentsong.volume = 0;
      document.querySelector(".volume").getElementsByTagName("input")[0].value = '0';
    }
  });


}

main();


