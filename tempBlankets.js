//########################
//# START OF GAPI SCRIPT #
//########################
/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '649462161473-g8to7qgbu9flel33kmul4vfe6orupl2i.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDEnS8pLlN4lXz-Is_tq0yGB_vD89HCXh0';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;
var temps = [];
var ranges = [];
var buttons = [];
var colors = [];
var relSheet = "";

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('authorize_button').style.visibility = 'hidden';
    document.getElementById('signout_button').style.visibility = 'hidden';
    console.log(temps);
    ranges = [[-10000, parseInt(document.getElementById("temp1high").value)], [parseInt(document.getElementById("temp2low").value), parseInt(document.getElementById("temp2high").value)],
    [parseInt(document.getElementById("temp3low").value), parseInt(document.getElementById("temp3high").value)], [parseInt(document.getElementById("temp4low").value), parseInt(document.getElementById("temp4high").value)],
    [parseInt(document.getElementById("temp5low").value), parseInt(document.getElementById("temp5high").value)], [parseInt(document.getElementById("temp6low").value), parseInt(document.getElementById("temp6high").value)],
    [parseInt(document.getElementById("temp7low").value), 10000]];
    console.log(ranges);
    btns = [document.getElementById("color1btn"), document.getElementById("color2btn"), document.getElementById("color3btn"), document.getElementById("color4btn"),
    document.getElementById("color5btn"), document.getElementById("color6btn"), document.getElementById("color7btn")];
    console.log(btns);
    colors = [btns[0].style.backgroundColor, btns[1].style.backgroundColor, btns[2].style.backgroundColor, btns[3].style.backgroundColor,
    btns[4].style.backgroundColor, btns[5].style.backgroundColor, btns[6].style.backgroundColor];
    console.log(colors);
});

//################################
//# START OF TEMPBLANKETS SCRIPT #
//################################


function genBlanket() {
    const bCanv = document.getElementById("blanket");
    const ctx = bCanv.getContext("2d");
    ctx.clearRect(0, 0, bCanv.width, bCanv.height);
    var colNum = 0;
    var day = 0;
    for (var i = 0; i < bCanv.height; i++) {
        if (i % 2 == 0) {
            if (temps.length - 1 <= day) {
                colNum = -1;
            }
            else {
                for (var k = 0; k < 7; k++) {
                    if (temps[day] > ranges[k][0] && temps[day] < ranges[k][1]) {
                        colNum = k;
                        break;
                    }
                }
            }
            day++;
        }
        for (var j = 0; j < bCanv.width; j++) {
            if (colNum == -1) {
                ctx.fillStyle = "rgb(255,255,255)"
                ctx.fillRect(j, i, 1, 1)
            }
            else {
                ctx.fillStyle = colors[colNum % 7]
                ctx.fillRect(j, i, 1, 1)
            }
        }
    }
}

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    /*
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').innerText = 'Refresh';
        await listMajors();
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
    */
    listMajors();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('content').innerText = '';
        document.getElementById('authorize_button').innerText = 'Authorize';
        document.getElementById('signout_button').style.visibility = 'hidden';
    }
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
async function listMajors() {
    let response;
    try {
        relSheet = document.getElementById("spreadsheetID").value;
        var extSid = relSheet.substring(39, relSheet.lastIndexOf('/'))
        response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: extSid,
            range: 'Sheet1!B:B',
        });
    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }
    const range = response.result;
    console.log(range);
    temps = [];
    for (var i = 0; i < range.values.length; i++) {
        temps.push(range.values[i][0]);
    }
    genBlanket();
    return;
}
//######################
//# END OF GAPI SCRIPT #
//######################
