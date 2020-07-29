//executes when document is ready

var monitorCount;
var serverList = [];
var statusList = [];
var timer ;

function parseServerData(status, target){
    if (!status.online) {
        //console.log("Here!");
        let ret;
        switch (target) {
            case "online":
                ret = false;
                break;
                
            default:
                ret = "-";
                break;
        }

        return ret;
    }

    let ret;

    switch (target) {
        case "online":
            ret = true;
            break;

        case "ip":
            ret = status.ip;
            break;
        
        case "port":
            ret = status.port;
            break;
       
        case "motd":
            ret = status.motd.html;
            break;

        case "procotol":
            ret = status.procotol;
            break;

        case "currentPlayers":
            ret = status.players.online;
            break;

        case "maxPlayers":
            ret = status.players.max;
            break;

        case "playerList":
            ret = status.players.list == undefined ? [] : status.players.list;
            break;
            
        case "version":
            ret = status.version;
            break;

        default:
            break;
    }

    return ret;
}

function renderListOrNot(status) {
    if (!status.online || _.isEqual(parseServerData(status, "playerList"), [])) {
        return "Too much or no players on the server.";
    } else {
        let playerList = "";
        status.players.list.forEach(player => {
            playerList = playerList + `<li class="collection-item">${player}</li>`;
        });
        return `<ul class="collection">${playerList}</ul>`;
    }

}

function deteleList(i) {
    
}

function renderList(serverList, statusList) {
    //Clear The Whole List
    $("#monitoring-group").html("");
    let eachColoum = "";
    for (let i = 0; i < serverList.length; i++) {
        console.log(parseServerData(statusList[i], "playerList"));
        eachColoum = eachColoum + `
            <div class="col s12 l6">
                <div class="card">
                    <a class="dropdown-trigger btn-flat rightup" data-target="server-card-${i}"><i class="material-icons">more_horiz</i></a>
                    <div class="card-content">
                        <span class="card-title"><div class="align-box"><img src="${statusList[i].icon}" alt="" srcset="" width="32px" height="32px"></div><div class="align-box"><b>${serverList[i]}</b></div><div class="align-box">${statusList[i].online ? "<i class=\"material-icons\">check</i>" : "<i class=\"material-icons\">clear</i>"}</div></span>
                        <ul class="collapsible collection">
                            <li class="collection-item"><span class="badge">${parseServerData(statusList[i],"ip") + ":" + parseServerData(statusList[i],"port")}</span>Real IP address</li>
                            <li class="collection-item"><span class="badge ">${statusList[i].version ? statusList[i].version : "none"}</span>Server Version</li>
                            <li>
                                <div class="collapsible-header">Motd<span class="badge">Click to show</span></div>
                                <div class="collapsible-body"><span>${parseServerData(statusList[i],"motd")}</span></div>
                            </li>
                            <li>
                                <div class="collapsible-header">Players<span class="badge">${parseServerData(statusList[i],"currentPlayers") + "/" + parseServerData(statusList[i],"maxPlayers")}</span></div>
                                <div class="collapsible-body"><span>${renderListOrNot(statusList[i])}</span></div>
                            </li>
                            
                        </ul>
                    </div>
                </div>
                <ul id="server-card-${i}" class='dropdown-content black-text server-box-menu'>
                    <li><a class="server-box-edit" href="javascript:void(0)">Edit</a></li>
                    <li><a class="server-box-delete" href="javascript:void(0)">Delete</a></li>
                    <li class="hide server-index">${i}</li>
                </ul>
            </div>
        `;

    }
    let totalReturn = `<div class="row">${eachColoum}</div>`;

    $("#monitoring-group").html(totalReturn);

    M.AutoInit();
}

async function fetchServerData(serverList) {
    $("#monitoring-group").html("");
    $("#preloader").removeClass("hide");
    let statusList = [];
    for (let i = 0; i < serverList.length; i++) {
        console.log(serverList[i]);
        await $.getJSON("https://api.mcsrvstat.us/2/" + serverList[i], function (data, textStatus, jqXHR) {
            console.log(data);
            statusList.push(data);
        });
        console.log("done");
    }
    console.log("All done.");
    console.log(statusList)
    renderList(serverList, statusList);
    $("#preloader").addClass("hide");
}

function getListFromCookies() {
    let obj = JSON.parse(Cookies.get("serverList"));
    return obj.list;
}

function saveListToCookies(serverList) {
    let saveJSON = {
        list: serverList
    };
    console.log(JSON.stringify(saveJSON));
    Cookies.set("serverList", JSON.stringify(saveJSON), {expires: 60});
}

//function printList(serverList, statusList){
//    for ()
//}
$().ready(() => {
    console.log("cookies: " + Cookies.get('serverList')) ;
    serverList = Cookies.get('serverList') ? getListFromCookies() : [] ;
    $("#temp-edit").click(function (e) { 
        e.preventDefault();
        bootbox.alert("Your message <b>here…</b>");
    });
    var currentTitle = $("#maintitle").html();
    $("#maintitle").html(serverList.length > 0 ? currentTitle + "(" + serverList.length.toString() + ")" : currentTitle);
    //$("#add-server-card").hide();
    monitorCount = serverList.length;
    if (monitorCount == 0) {
        $("#serverbox").removeClass("hide");
    }
    $("#add-cancel").click(() => {
        $("#add-server-card").addClass("hide");
    });
    $("#add-confirm").click(() => {
        $("#add-server-card").addClass("hide");
        //$("#monitoring-group").append("<b>" + $("#add-server-target").val() + "</b>");
        serverList.push($("#add-server-target").val());
        console.log(serverList);
        $("#maintitle").html(serverList.length > 0 ? currentTitle + "(" + serverList.length.toString() + ")" : currentTitle);
        saveListToCookies(serverList);
        $("#add-server-target").val("");
        //renderList(serverList);

        fetchServerData(serverList);
        console.log("Hello?")

        monitorCount++;
        if (monitorCount == 0) {
            $("#serverbox").removeClass("hide");
        } else {
            $("#serverbox").addClass("hide");
        }
    });
    $("#add-server-handle").click(() => {
        $("#add-server-card").removeClass("hide");
    });
    $("#add-server-handle2").click(() => {
        $("#add-server-card").removeClass("hide");
    });
    $(document).on("click", "a.server-box-edit", function () {
        let k = $(this).parent().siblings(".server-index").html();
        $(window).scrollTop(0);
        $("#edit-server-card").removeClass("hide");
        $("#edit-server-target").val(serverList[parseInt(k)]);
        $("#current-edit-index").html(k);
    });
    $(document).on("click", "a.server-box-delete", function () {
        let k = $(this).parent().siblings(".server-index").html();
        serverList.splice(k, 1);
        saveListToCookies(serverList);
        monitorCount --;
        $("#maintitle").html(serverList.length > 0 ? currentTitle + "(" + serverList.length.toString() + ")" : currentTitle);
        if (monitorCount == 0) {
            $("#serverbox").removeClass("hide");
        } else {
            $("#serverbox").addClass("hide");
        }
        fetchServerData(serverList);
    });
    $("#edit-cancel").click(()=> {
        $("#edit-server-card").addClass("hide");
    });
    $("#edit-confirm").click(()=> {
        $("#edit-server-card").addClass("hide");
        serverList[parseInt($("#current-edit-index").html())] = $("#edit-server-target").val();
        console.log($("#current-edit-index").html())
        console.log(serverList);
        saveListToCookies(serverList);
        fetchServerData(serverList);
    });

    fetchServerData(serverList);
    
    timer = setInterval(() => {
        console.log("30 seconds!")
        fetchServerData(serverList);
    }, 30000);
});