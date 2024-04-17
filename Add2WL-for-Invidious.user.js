// ==UserScript==
// @name           Add to Watch Later for Invidious
// @namespace      https://github.com/WalsGit
// @version        Alpha-v1
// @description    Adds an "Add to Watch Later" button on video thumbnails for Invidious
// @author         Wa!id
// @match          https://yt.artemislena.eu/*
// @match          https://yewtu.be/*
// ==/UserScript==

(function () {
    "use strict";

    // Styles
    const head = document.querySelector("head");
    const styleElement = document.createElement("style");
    styleElement.textContent = `
        div.thumbnail > .top-right-overlay {
            z-index: 100;
            position: absolute;
            padding: 0;
            margin: 0;
            font-size: 16px;
        }
        .top-right-overlay {
            display: none;
            top: 0.6em;
            right: 0.6em;
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        .thumbnail:hover .top-right-overlay {
            display: block;
            opacity: 1;
        }

        .top-right-overlay > .icon, .top-right-overlay > form > .icon {
            width: 2em;
            height: 2em;
        }

        .WLButton, form > .WLButton {
            border: none;
            background-color: rgba(35, 35, 35, 0.85);
            border-radius: 3px;
        }
        `;
    styleElement.type = "text/css";
    styleElement.id = "AddWLStyles";
    head.appendChild(styleElement);

    // Default values
    let WLPLID = localStorage.getItem("WLPLID");
    console.log("WLPLID:", WLPLID);
    let WLPLTitle = localStorage.getItem("WLPLTitle");
    console.log("WLPLTitle:", WLPLTitle);

    const IVinstance = "https://" + window.location.hostname;
    console.log("My instance", IVinstance);
    const currentPageURL = window.location.href;
    console.log("My current URL", currentPageURL);
    const playlistsPageURL = IVinstance + "/feed/playlists";

    const alertWLmissingTxt =
        '⚠️ No default Watch Later playlist defined: please go to your <a href="' +
        playlistsPageURL +
        '">playlist page</a> and select one (or create one if necessary).';
    const alertWLmissingTxtOnPLPage =
        '⚠️ No default Watch Later playlist defined: please select (or create) your default "Watch Later" playlist. To do so, hover over your prefered playlist and click on the clock icon that will appear on the top right corner of the thumbnail.';
    const defaultWLMessage =
        "✅ [" + WLPLTitle + "] is set as your default Watch Later playlist";

    // Icons
    const WLicon = `<svg fill="#fff" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>`;
    const savedIcon = `<svg fill="#fff" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/></svg>`;

    // Functions
    function checkIfLoggedIn() {
        const userName = document.getElementById("user_name");
        return !!userName;
    }

    async function getValue(videoURL) {
        const response = await fetch(videoURL);
        if (!response.ok) {
            throw new Error("Failed to fetch page: " + videoURL);
        }
        const htmlContent = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        const form = doc.querySelector('form[action="/playlist_ajax"]');
        if (!form) {
            throw new Error('No form found with action "/playlist_ajax" on page: ' + videoURL);
        }

        const csrfTokenInput = form.querySelector('input[name="csrf_token"]');
        if (!csrfTokenInput) {
            throw new Error("No csrf_token input found in form");
        }
        const csrfTokenValue = csrfTokenInput.value;

        return csrfTokenValue;
    }

    function addSetDefaultPLButton(thumbnail) {
        const button = document.createElement("div");
        const currentPLID = thumbnail
            .querySelector("a")
            .href.match(/list=(.+)$/)[1];
        const currentPLTitle = thumbnail.parentElement.querySelector(".video-card-row a p").textContent;
        button.classList.add("top-right-overlay");
        button.innerHTML =
            '<button class="WLButton icon" title="Set *' +
            currentPLTitle +
            '* as default WL playlist">' +
            WLicon +
            "</button>";
        button.addEventListener("click", () => {
            localStorage.setItem("WLPLID", currentPLID);
            WLPLID = localStorage.getItem("WLPLID");
            localStorage.setItem("WLPLTitle", currentPLTitle);
            WLPLTitle = localStorage.getItem("WLPLTitle");
            console.log(
                "The playlist",
                WLPLTitle,
                "(",
                WLPLID,
                ") was set as the default WL playlist."
            );
            location.reload();
        });

        thumbnail.appendChild(button);
    }

    function addToWLButton(thumbnail) {
        const videoURL = thumbnail.querySelector("a").href;
        const videoID = videoURL.match(/v=(.+)$/)[1];

        const form = document.createElement("form");
        form.setAttribute("data-onsubmit", "return false");
        form.setAttribute("action", "/playlist_ajax");
        form.setAttribute("method", "post");
        form.setAttribute("target", "_blank");

        const playlistIDInput = document.createElement("input");
        playlistIDInput.setAttribute("type", "hidden");
        playlistIDInput.setAttribute("name", "playlist_id");
        playlistIDInput.setAttribute("value", WLPLID);
        form.appendChild(playlistIDInput);

        const videoIDInput = document.createElement("input");
        videoIDInput.setAttribute("type", "hidden");
        videoIDInput.setAttribute("name", "video_id");
        videoIDInput.setAttribute("value", videoID);
        form.appendChild(videoIDInput);

        const csrfTokenInput = document.createElement("input");
        csrfTokenInput.setAttribute("type", "hidden");
        csrfTokenInput.setAttribute("name", "csrf_token");
        csrfTokenInput.setAttribute("value", "");
        form.appendChild(csrfTokenInput);

        const submitButton = document.createElement("button");
        submitButton.setAttribute("data-onclick", "add_playlist_video");
        submitButton.setAttribute("data-id", videoID);
        submitButton.setAttribute("type", "submit");
        submitButton.classList.add("WLButton", "icon");
        submitButton.setAttribute("title", `Add to ${WLPLTitle}`);
        submitButton.innerHTML = WLicon;
        form.appendChild(submitButton);

        const formContainer = document.createElement("div");
        formContainer.classList.add("top-right-overlay");
        formContainer.appendChild(form);

        const playlistDataScript = document.createElement("script");
        playlistDataScript.setAttribute("id", "playlist_data_" + videoID);
        playlistDataScript.setAttribute("type", "application/json");
        formContainer.appendChild(playlistDataScript);

        const playlistWidjetScript = document.createElement("script");
        /*
        const timestamp = new Date().getTime();
        playlistWidjetScript.setAttribute('src', '/js/playlist_widget.js?v='+timestamp);
        */
        const playlistWidjet = `'use strict';
                var playlist_data = JSON.parse(document.getElementById('playlist_data_${videoID}').textContent);
                var payload = 'csrf_token=' + playlist_data.csrf_token;

                function add_playlist_video(target) {
                    var select = target.parentNode.children[0].children[1];
                    var option = select.children[select.selectedIndex];

                    var url = '/playlist_ajax?action_add_video=1&redirect=false' +
                        '&video_id=' + target.getAttribute('data-id') +
                        '&playlist_id=' + option.getAttribute('data-plid');

                    helpers.xhr('POST', url, {payload: payload}, {
                        on200: function (response) {
                            option.textContent = '✓' + option.textContent;
                        }
                    });
                }
        `;
        playlistWidjetScript.innerHTML = playlistWidjet;
        formContainer.appendChild(playlistWidjetScript);

        thumbnail.appendChild(formContainer);

        submitButton.addEventListener("click", async () => {
            try {
                const encodedToken = await getValue(videoURL);
                const csrfToken = decodeURIComponent(encodedToken);

                csrfTokenInput.setAttribute("value", csrfToken);
                playlistDataScript.innerHTML = `{"csrf_token": "${csrfToken}"}`;

                submitButton.disabled = true;
                form.submit();
            } catch (error) {
                console.error("Error retrieving CSRF token:", error);
            } finally {
                submitButton.disabled = false;
            }
            });
        }

    function addAlertMessage(currentPageURL) {
        const navbar = document.querySelector(".pure-g.navbar.h-box");
        const alertMessage = document.createElement("div");
        alertMessage.classList.add("h-box");
        let message = null;
        console.log("Valeur de WLPLID :", WLPLID);
        if (typeof WLPLID === null) {
        if (currentPageURL == playlistsPageURL) {
            message = alertWLmissingTxtOnPLPage;
        } else {
            message = alertWLmissingTxt;
        }
        } else if (currentPageURL == playlistsPageURL) {
        message = defaultWLMessage;
        }
        if (message !== null) {
        alertMessage.innerHTML = "<h3>" + message + "</h3>";
        navbar.parentNode.insertBefore(alertMessage, navbar.nextSibling);
        }
    }

    // Processes
    const isLoggedIn = checkIfLoggedIn();
    const thumbnails = document.querySelectorAll("div.thumbnail");

    if (isLoggedIn) {
        if (currentPageURL != IVinstance) {
        addAlertMessage(currentPageURL);
        if (currentPageURL == playlistsPageURL) {
            thumbnails.forEach(addSetDefaultPLButton);
        } else {
            thumbnails.forEach(addToWLButton);
        }
        }
    }
})();
