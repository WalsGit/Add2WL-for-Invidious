# Add to Watch Later for Invidious
A Tampermonkey userscript to add an "add to watch later" button on video thumbnails in Invidious

<p align="center"><img src="https://raw.githubusercontent.com/WalsGit/Add2WL-for-Invidious/main/a2wl.gif" alt="animated gif show how the script works when you hover over a thumbnail" /></p>

## Matching Instances
The script matchs all https type instances listed in https://api.invidious.io on May 5, 2024:

<details>
<summary>Instances list</summary>
https://yt.artemislena.eu <br>
https://yewtu.be <br>
https://invidious.fdn.fr <br>
https://vid.puffyan.us <br>
https://invidious.nerdvpn.de <br>
https://invidious.projectsegfau.lt/ <br>
https://invidious.lunar.icu <br>
https://inv.tux.pizza <br>
https://invidious.flokinet.to <br>
https://iv.ggtyler.dev <br>
https://inv.nadeko.net <br>
https://iv.nboeck.de <br>
https://invidious.protokolla.fi <br>
https://invidious.private.coffee <br>
https://inv.us.projectsegfau.lt <br>
https://invidious.perennialte.ch <br>
https://invidious.jing.rocks <br>
https://invidious.drgns.space <br>
https://invidious.einfachzocken.eu <br>
https://inv.oikei.net <br>
https://vid.lilay.dev <br>
https://iv.datura.network <br>
https://yt.drgnz.club <br>
https://yt.cdaut.de <br>
https://invidious.privacydev.net <br>
https://iv.melmac.space <br>
</details>

## How to install
In Tampermonkey, go to the **Utilities** tab and paste this URL https://github.com/WalsGit/Add2WL-for-Invidious/raw/main/Add2WL-for-Invidious.user.js in the **Import from URL** field and click on install.

## How it works
 1. Go and login to your Invidious instance
 2. Go to your Playlists Page and create a "Watch Later" playlist (you can name it whatever you want) [or skip this step if you would like to use an existing playlist] and return to your playslists page 
 3. Hover over the thumbnail of the playlist you want to set as your default "Watch Later" playlist and click on the top right corner button to set and save it.
 4. Now go to you subscriptions or trending page (or any other page with multiple video thumbnails) and hover over any thumbnail to reveal the "add to watch later" button and click on it to add that video to that playlist. If you see a green check icon when you hover over the thumbnail, that means the video is already in your watch later playlist and clicking on it will remove it from the list.

###### Notice
*This script was created with the help of Gemini as I'm not (yet) that fluent in JS.*