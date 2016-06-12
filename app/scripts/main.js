// @copyright 2012+ Daniel Nakov / Silverline CRM
// http://silverlinecrm.com

var sfnav = (function() {
    var NEW_TAB_KEYS = [
        "ctrl+enter",
        "command+enter",
        "shift+enter"
    ];
    var SERVER_INSTANCE = getServerInstance();
    var SFAPI_VERSION = 'v33.0';
    var META_DATATYPES = {
        "AUTONUMBER": {name:"AutoNumber",code:"auto", params:0},
        "CHECKBOX": {name:"Checkbox",code:"cb", params:0},
        "CURRENCY": {name:"Currency",code:"curr", params:2},
        "DATE": {name:"Date",code:"d", params:0},
        "DATETIME": {name:"DateTime",code:"dt", params:0},
        "EMAIL": {name:"Email",code:"e", params:0},
        "FORMULA": {name:"FORMULA",code:"form"},
        "GEOLOCATION": {name:"Location",code:"geo"},
        "HIERARCHICALRELATIONSHIP": {name:"Hierarchy",code:"hr" },
        "LOOKUP": {name:"Lookup",code:"look"},
        "MASTERDETAIL": {name:"MasterDetail",code:"md"},
        "NUMBER": {name:"Number",code:"n"},
        "PERCENT": {name:"Percent",code:"per"},
        "PHONE": {name:"Phone",code:"ph"},
        "PICKLIST": {name:"Picklist",code:"pl"},
        "PICKLISTMS": {name:"MultiselectPicklist",code:"plms"},
        "ROLLUPSUMMARY": {name:"Summary",code:"rup"},
        "TEXT": {name:"Text",code:"t"},
        "TEXTENCRYPTED": {name:"EcryptedText",code:"te"},
        "TEXTAREA": {name:"TextArea",code:"ta"},
        "TEXTAREALONG": {name:"LongTextArea",code:"tal"},
        "TEXTAREARICH": {name:"Html",code:"tar"},
        "URL": {name:"Url",code:"url"}
    };


    var resultsElement;
    var oldins = undefined;
    var selectedItemIndex = -1;
    var allComandsList = {};
    var hash;
    var sid;
    var forceToolingClient;
    var customObjects = {};
    var words = [];


/**
 * adds a bindGlobal method to Mousetrap that allows you to
 * bind specific keyboard shortcuts that will still work
 * inside a text input field
 *
 * usage:
 * Mousetrap.bindGlobal('ctrl+s', _saveChanges);
 */
     Mousetrap = (function(Mousetrap) {
        var _global_callbacks = {},
        _original_stop_callback = Mousetrap.stopCallback;

        Mousetrap.stopCallback = function(e, element, combo) {
            if (_global_callbacks[combo]) {
                return false;
            }

            return _original_stop_callback(e, element, combo);
        };

        Mousetrap.bindGlobal = function(keys, callback, action) {
            Mousetrap.bind(keys, callback, action);

            if (keys instanceof Array) {
                for (var i = 0; i < keys.length; i++) {
                    _global_callbacks[keys[i]] = true;
                }
                return;
            }

            _global_callbacks[keys] = true;
        };

        return Mousetrap;
    }) (Mousetrap);

    var mouseClick=
    function(){
        console.log('AAAAAAAAAAAA');
        console.log(getContent(this));

        oldins = getContent(this);
        movingTo(-1);
        hideResults();
        hideAll();

        invokeCommand(getContent(this), false, 'click');

        return true;
    };

	var mouseClickLoginAs=
    function(){
        var mouseClickLoginAsUserId = $(this).attr('id');
        loginAsPerform(mouseClickLoginAsUserId);
        return true;
    };

    function getSingleObjectMetadata()
    {
        var recordId = document.URL.split('/')[3];
        var keyPrefix = recordId.substring(0,3);
    }

    function lookAt() {
        var ins = document.getElementById("sfnav_quickSearch").value;
        if (oldins != ins) {
            if (selectedItemIndex == -1) {
                oldins = ins;
                search(ins);
            }
        }
    }

    function search(ins)
    {
        clearResults();
        console.log(ins);
        ins = ins.trim();

        if (0 === ins.length) {
            return;
        }

		if (ins.toLowerCase().substring(0,8) == 'login as') {
            addResultItem('Login As [FirstName] [LastName] OR [Username]');
            loginAsShowResults(ins);
        }

        if(ins.toLowerCase().substring(0,3) == 'cf ' && ins.split(' ').length < 4) {
            addResultItem('Usage: cf [Object API Name] [Field Name] [Data Type]');
        }

        if(ins.toLowerCase().substring(0,3) == 'cf ' && ins.split(' ').length == 4) {
            var wordArray = ins.split(' ');

            var words = getWord(wordArray[3], META_DATATYPES);
            var words2 = [];
            for(var i = 0; i<words.length; i++)
            {
                switch(words[i].toUpperCase())
                {
                    case 'AUTONUMBER':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'CHECKBOX':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'CURRENCY':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [scale] [precision]') ;
                    break;
                    case 'DATE':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'DATETIME':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'EMAIL':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'FORMULA':

                    break;
                    case 'GEOLOCATION':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [scale]');
                    break;
                    case 'HIERARCHICALRELATIONSHIP':

                    break;
                    case 'LOOKUP':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [lookup sObjectName]');
                    break;
                    case 'MASTERDETAIL':

                    break;
                    case 'NUMBER':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [scale] [precision]');
                    break;
                    case 'PERCENT':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [scale] [precision]');
                    break;
                    case 'PHONE':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'PICKLIST':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'PICKLISTMS':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'ROLLUPSUMMARY':

                    break;
                    case 'TEXT':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [length]');
                    break;
                    case 'TEXTENCRYPTED':

                    break;
                    case 'TEXTAREA':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [length]');
                    break;
                    case 'TEXTAREALONG':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [length] [visible lines]');
                    break;
                    case 'TEXTAREARICH':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' [length] [visible lines]');
                    break;
                    case 'URL':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;

                }
            }
            if (words2.length > 0){
                for (var i=0; i<words2.length; i++) {
                    addResultItem (words2[i]);
                }
            }

        }
        if(ins.toLowerCase().substring(0,3) == 'cf ' && ins.split(' ').length > 4) {

        }

        {
            var words = getWord(ins, allComandsList);
            if (words.length > 0){
                for (var i=0;i<words.length; ++i) {
                    var word_tmp = words[i];
                    word_tmp = word_tmp.replace(/ > /g, '<span class="sfnav_splitter"> &gt; </span>');

                    addResultItem(word_tmp);
                }
            }
        }

        movingTo(-1);
        showResults();
    }

    function httpGet(url, callback)
    {
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.setRequestHeader("Authorization", sid);
        req.onload = function(response) {
            callback(response);
        }
        req.send();
    }

    function hideResults(){
        document.getElementById("sfnav_results").style.visibility = 'hidden';
        movingTo(-1);
    }
    function showResults(){
        document.getElementById("sfnav_results").style.visibility = 'visible';
    }

    function hideAll() {
        document.getElementById("sfnav_quickSearch").blur();
        document.getElementById("sfnav_quickSearch").value = '';
        hideResults();
        clearResults();

        document.getElementById("sfnav_search_box").style.visibility = 'hidden';
        document.getElementById("sfnav_search_box_background").style.visibility = 'hidden';
        document.body.style.overflow = 'auto'; // Show scroll bars
    }

    function showAll() {
        document.getElementById("sfnav_search_box").style.visibility = 'visible';
        document.getElementById("sfnav_search_box_background").style.visibility = 'visible';
        showResults();

        document.getElementById("sfnav_quickSearch").focus();
        document.body.style.overflow = 'hidden'; // Hide scroll bars
    }

    function addResultItem(word){

        var d = document.createElement("div");
        var sp;
        if(allComandsList[word] != null && allComandsList[word].url != null && allComandsList[word].url != "") {
            sp = document.createElement("a");
            sp.setAttribute("href", allComandsList[word].url);

        } else {
            sp = d;
        }

        if(allComandsList[word] != null && allComandsList[word].id != null && allComandsList[word].id != "") {
            sp.id = allComandsList[word].id;
        }

        sp.className=  "sfnav_child";
        sp.innerHTML = word;
        sp.onmouseover = function(){};
        sp.onmouseout = function() {};
        sp.onclick = mouseClick;

        if(sp.id && sp.length > 0){
            sp.onclick = mouseClickLoginAs;
        }

        resultsElement.appendChild(sp);
    }

    function addSuccess(text)
    {
        clearResults();
        var err = document.createElement("div");
        err.className = 'sfnav_child sfnav-success-wrapper';
        var errorText = '';
        err.appendChild(document.createTextNode('Success! '));
        err.appendChild(document.createElement('br'));
        err.appendChild(document.createTextNode('Field ' + text.id + ' created!'));
        resultsElement.appendChild(err);

        showResults();
    }

    function addError(text)
    {
        clearResults();
        var err = document.createElement("div");
        err.className = 'sfnav_child sfnav-error-wrapper';

        var errorText = '';
        err.appendChild(document.createTextNode('Error! '));
        err.appendChild(document.createElement('br'));
        for(var i = 0;i<text.length;i++)
        {
            err.appendChild(document.createTextNode(text[i].message));
            err.appendChild(document.createElement('br'));
        }

        resultsElement.appendChild(err);

        showResults();
    }

    function clearResults(){
        if(typeof resultsElement != 'undefined')
        {
            while (resultsElement.hasChildNodes()){
                noten=resultsElement.firstChild;
                resultsElement.removeChild(noten);
            }
        }
        hideResults();
    }
    function getWord(beginning, dict){
        beginning = beginning.trim().toLowerCase();

        var words = [];
        if(typeof beginning === 'undefined') return [];

        if(beginning.length == 0)
        {
            for (var key in dict)
               words.push(key);
            return words;
        }

        var tmpSplit = beginning.split(' ');
        for(var i = 0; i < tmpSplit.length; i++){
            tmpSplit[i] = tmpSplit[i].trim();
            if(0 === tmpSplit[i].length){
                tmpSplit.splice(i,1);
                i--;
            }
        }

        var arrFound = [];
        for (var key in dict)
        {
            var key_lowercase = key.toLowerCase();
            var highlighting = [];

            var match = false;
            var num = 0;

            var indexFound = key_lowercase.indexOf(beginning);
            if(indexFound != -1)
            {
                match = true;
                num = 100;

                highlighting.push({
                    from: indexFound,
                    to: indexFound + beginning.length,
                });
            }
            else
            {
                num = 0;
                for(var i = 0; i < tmpSplit.length; i++)
                {
                    indexFound = key_lowercase.indexOf(tmpSplit[i]);
                    if (indexFound != -1) {
                        match = true;
                        num += 1;

                        highlighting.push({
                            from: indexFound,
                            to: indexFound + tmpSplit[i].length,
                        });
                    } else {
                        match = false;
                        break;
                    }
                }
            }

            if(match) {
                highlighting.sort(function (a,b) {
                    return a.from - b.from;
                });

                for (var i = 0; i < highlighting.length - 1; i++) {
                    if (highlighting[i].to >= highlighting[i+1].to) { // Next are included
                        highlighting.splice(i+1, 1);
                        i--;
                    } else {
                        if (highlighting[i].to >= highlighting[i + 1].from) { // Join
                            highlighting[i].to = highlighting[i + 1].to;

                            highlighting.splice(i + 1, 1);
                            i--;
                        }
                    }
                }

                var highlighted_key = key;
                var length_diff = 0;

                for (var i = 0; i < highlighting.length; i++) {
                    var length_before = highlighted_key.length;

                    var from = length_diff + highlighting[i].from;
                    var to   = length_diff + highlighting[i].to;

                    var begin = highlighted_key.substring(0, from);
                    var middle = highlighted_key.substring(from, to);
                    var end = highlighted_key.substring(to);

                    middle = '<span class="highlighted">' + middle + '</span>';

                    highlighted_key = begin.concat(middle, end);

                    length_diff += highlighted_key.length - length_before;
                }

                arrFound.push({
                    num: num,
                    key: highlighted_key,
                });
            }

        }
        arrFound.sort(function(a,b) {
            var diff = b.num - a.num;
            if(diff === 0){
                if(b.key > a.key) {
                    diff = b.key == a.key? 0 : -1;
                } else {
                    diff = 1;
                }
            }

            return diff;
        });
        for(var i = 0;i<arrFound.length;i++)
            words[words.length] = arrFound[i].key;

        return words;
    }

    function invokeCommand(cmd, newtab) {
        if(cmd.toLowerCase() == 'refresh metadata')
        {
            getAllObjectMetadata();
            return true;
        }
        if(cmd.toLowerCase() == 'setup')
        {
            window.location.href = SERVER_INSTANCE + '/ui/setup/Setup';
            return true;
        }
        if(cmd.toLowerCase().substring(0,3) == 'cf ')
        {
            createField(cmd);
            return true;
        }
		if(cmd.toLowerCase().substring(0,9) == 'login as ')
        {
            loginAs(cmd);
            return true;
        }

        if(typeof allComandsList[cmd] != 'undefined' && (allComandsList[cmd].url != null || allComandsList[cmd].url == ''))
        {
            if (newtab) {
                var w = window.open(allComandsList[cmd].url, '_newtab');
                w.blur();
                window.focus();
            } else {
                window.location.href = allComandsList[cmd].url;
            }

            return true;
        }


        return false;
    }

    function updateField(cmd)
    {
        var arrSplit = cmd.split(' ');
        var dataType = '';
        var fieldMetadata;

        if(arrSplit.length >= 3)
        {
            for(var key in META_DATATYPES)
            {
                if(META_DATATYPES[key].name.toLowerCase() === arrSplit[3].toLowerCase())
                {
                    dataType = META_DATATYPES[key].name;
                    break;
                }
            }

            var sObjectName = arrSplit[1];
            var fieldName = arrSplit[2];
            var helpText = null;
            var typeLength = arrSplit[4];
            var rightDecimals, leftDecimals;
            if(parseInt(arrSplit[5]) != NaN )
            {
                rightDecimals = parseInt(arrSplit[5]);
                leftDecimals = typeLength;
            }
            else
            {
                leftDecimals = 0;
                rightDecimals = 0;
            }




            forceToolingClient.queryByName('CustomField', fieldName, sObjectName, function(success) {
                addSuccess(success);
                fieldMeta = new  forceTooling.CustomFields.CustomField(arrSplit[1], arrSplit[2], dataType, null, arrSplit[4], parseInt(leftDecimals),parseInt(rightDecimals),null);

                forceToolingClient.update('CustomField', fieldMeta,
                    function(success) {
                        console.log(success);
                        addSuccess(success);
                    },
                    function(error) {
                        console.log(error);
                        addError(error.responseJSON);
                    });
            },
            function(error)
            {
                addError(error.responseJSON);
            });


        }
    }

    function createField(cmd)
    {
        var arrSplit = cmd.split(' ');
        var dataType = '';
        var fieldMetadata;

        if(arrSplit.length >= 3)
        {
            //  forceTooling.Client.create(whatever)
            /*
            for(var key in META_DATATYPES)
            {
                if(META_DATATYPES[key].name.toLowerCase() === arrSplit[3].toLowerCase())
                {
                    dataType = META_DATATYPES[key].name;
                    break;
                }
            }
            */
            dataType = META_DATATYPES[arrSplit[3].toUpperCase()].name;
            var sObjectName = arrSplit[1];
            var sObjectId = null;
            if(typeof customObjects[sObjectName.toLowerCase()] !== 'undefined')
            {
                sObjectId = customObjects[sObjectName.toLowerCase()].Id;
                sObjectName += '__c';
            }
            var fieldName = arrSplit[2];
            var helpText = null;
            var typeLength = arrSplit[4];
            var rightDecimals, leftDecimals;
            if(parseInt(arrSplit[5]) != NaN )
            {
                rightDecimals = parseInt(arrSplit[5]);
                leftDecimals = parseInt(typeLength);
            }
            else
            {
                leftDecimals = 0;
                rightDecimals = 0;
            }

            var fieldMeta;

            switch(arrSplit[3].toUpperCase())
            {
                case 'AUTONUMBER':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;
                case 'CHECKBOX':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;
                case 'CURRENCY':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
                break;
                case 'DATE':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;
                case 'DATETIME':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;
                case 'EMAIL':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;
                case 'FORMULA':

                break;
                case 'GEOLOCATION':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null, arrSplit[4],null,null,null);
                break;
                case 'HIERARCHICALRELATIONSHIP':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
                break;
                case 'LOOKUP':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
                break;
                case 'MASTERDETAIL':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
                break;
                case 'NUMBER':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
                break;
                case 'PERCENT':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
                break;
                case 'PHONE':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;
                case 'PICKLIST':
                var plVal = [];
                plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,null);
                break;
                case 'PICKLISTMS':
                var plVal = [];
                plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,null);
                break;
                case 'ROLLUPSUMMARY':

                break;
                case 'TEXT':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,null);
                break;
                case 'TEXTENCRYPTED':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;
                case 'TEXTAREA':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,null);
                break;
                case 'TEXTAREALONG':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[4]);
                break;
                case 'TEXTAREARICH':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[4]);
                break;
                case 'URL':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
                break;

            }

            forceToolingClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, SERVER_INSTANCE + '');
            showLoadingIndicator();
            forceToolingClient.create('CustomField', fieldMeta,
                function(success) {
                    console.log(success);
                   hideLoadingIndicator();
                    addSuccess(success);
                },
                function(error) {
                    console.log(error);
                  hideLoadingIndicator();
                    addError(error.responseJSON);
                });
        }

    }

    function loginAs(cmd) {
        var arrSplit = cmd.split(' ');
        var searchValue = undefined;

        // Get FirstName or Username
        if (arrSplit[2] !== undefined) {
            searchValue = arrSplit[2];
        }

        // Get Surname
        if (arrSplit[3] !== undefined) {
            searchValue += ' ' + arrSplit[3];
        }

        if(searchValue !== undefined) {
            query = encodeURI("SELECT Id, Name, Username FROM User WHERE Name LIKE '%" + searchValue + "%' OR Username LIKE '%" + searchValue + "%' ORDER BY Name");
            showLoadingIndicator();
            forceToolingClient.query(query,
                function(success) {
                    if(success.records.length < 1){
                        addError([{"message":"No user for your search exists."}]);
                    } else if(success.records.length > 1) {
                        addError([{"message":"Select stricter parameters"}]);
                    } else {
                        loginAsPerform(success.records[0].Id);
                    }
                    hideLoadingIndicator();
                },
                function(error) {
                    addError(error.responseJSON);
                    hideLoadingIndicator();
                }
            );
        }
    }

    var timeOfLoginAsShowResults;
    function loginAsShowResults(cmd) {
        timeOfLoginAsShowResults = new Date();
        var timeOfThis = timeOfLoginAsShowResults;

        var arrSplit = cmd.split(' ');
        var searchValue = undefined;

        // Get FirstName or Username
        if (arrSplit[2] !== undefined) {
            searchValue = arrSplit[2];
        }

        // Get Surname
        if (arrSplit[3] !== undefined) {
            searchValue += ' ' + arrSplit[3];
        }


        var query;
        if (undefined !== searchValue) {
            query = encodeURI("SELECT Id, Name, Username FROM User WHERE Name LIKE '%" + searchValue + "%' OR Username LIKE '%" + searchValue + "%' ORDER BY Name");
        } else {
            query = encodeURI("SELECT Id, Name, Username FROM User ORDER BY Name");
        }

        showLoadingIndicator();
        forceToolingClient.query(query,
            function(success) {
                if(timeOfThis === timeOfLoginAsShowResults) {
                    var numberOfUserRecords = success.records.length;
                    if (numberOfUserRecords > 0) {
                        loginAsShowOptions(success.records);
                    }
                    hideLoadingIndicator();
                }
            },
            function(error) {
                addError(error.responseJSON);
                hideLoadingIndicator();
            }
        );

    }

	function loginAsShowOptions(records){
		for(var i = 0; i < records.length; ++i){
			var cmd = 'Login As ' + records[i].Username;
            var hip = $('<span />').addClass('sfnav_hip').attr('title', records[i].Name);
            cmd += hip.prop('outerHTML');
			//allComandsList[cmd] = {key: cmd, id: records[i].Id};
			addResultItem(cmd);
		}
		showResults();
	}

	function loginAsPerform(userId) {
        showLoadingIndicator();
        $.ajax( userDetailPage(userId) )
            .done(function(response) {
                var linkFound = false;

                var onclick = $(response).find('input[name="login"]').first().attr('onclick');
                if (undefined !== onclick) {
                    var matсhes = onclick.match(/^navigateToUrl\('([^']*)'/);
                    if (undefined !== matсhes[1]) {
                        linkFound = true;
                        var url = matсhes[1];
                        window.location.href = url;
                    }
                }

                if(!linkFound){
                    addError([{"message":"Error: Perhaps you can not log on behalf of that user"}]);
                }
            })
            .fail(function() {
                addError([{"message":"Error during login"}]);
                hideLoadingIndicator();
            });
	}

	function userDetailPage(userId) {
		var loginLocation = window.location.protocol + '//' + window.location.host + '/' + encodeURI(userId) + '?noredirect=1';
		return loginLocation;
	}

    function getMetadata(_data) {
        if(_data.length == 0) return;
        var metadata = JSON.parse(_data);

        console.log(metadata);

        var mRecord = {};
        var act = {};


        for(var i=0;i<metadata.sobjects.length;i++)
        {
            if(metadata.sobjects[i].keyPrefix != null)
            {
                mRecord = {};
                mRecord.label = metadata.sobjects[i].label;
                mRecord.labelPlural = metadata.sobjects[i].labelPlural;
                mRecord.keyPrefix = metadata.sobjects[i].keyPrefix;
                mRecord.urls = metadata.sobjects[i].urls;

                act = {};
                act.key = metadata.sobjects[i].name;
                act.keyPrefix = metadata.sobjects[i].keyPrefix;
                act.url = SERVER_INSTANCE + '/' + metadata.sobjects[i].keyPrefix;

                allComandsList['List > ' + mRecord.labelPlural] = act;
                act = {};
                act.key = metadata.sobjects[i].name;
                act.keyPrefix = metadata.sobjects[i].keyPrefix;
                act.url = SERVER_INSTANCE + '/' + metadata.sobjects[i].keyPrefix;
                act.url += '/e';
                allComandsList['New > ' + mRecord.label] = act;


            }
        }

        console.log(allComandsList);

        store('Store Commands', allComandsList);
    }

    function store(action, payload) {

        var req = {}
        req.action = action;
        req.key = hash;
        req.payload = payload;

        chrome.extension.sendMessage(req, function(response) {

        });
    }

    function getAllObjectMetadata() {

        // session ID is different and useless in VF
        if(location.origin.indexOf("visual.force") !== -1) return;

        showLoadingIndicator();
        sid = "Bearer " + getCookie('sid');
        var theurl = getServerInstance() + '/services/data/' + SFAPI_VERSION + '/sobjects/';

        allComandsList['Refresh Metadata'] = {};
        allComandsList['Setup'] = {};

        var req = new XMLHttpRequest();
        req.open("GET", theurl, true);
        req.setRequestHeader("Authorization", sid);
        req.onload = function(response) {
            getMetadata(response.target.responseText);
            hideLoadingIndicator();
        }
        req.send();

        getSetupTree();
        // getCustomObjects();
        getCustomObjectsDef();

    }

    function parseSetupTree(html)
    {
        var textLeafSelector = '.setupLeaf > a[id*="_font"]';
        var all = html.querySelectorAll(textLeafSelector);
        var strName;
        var as;
        var strNameMain;
        var strName;
        [].map.call(all, function(item) {
            var hasTopParent = false, hasParent = false;
            var parent, topParent;
            var parentEl, topParentEl;

            if (item.parentElement != null && item.parentElement.parentElement != null && item.parentElement.parentElement.parentElement != null
                && item.parentElement.parentElement.parentElement.className.indexOf('parent') !== -1) {

                hasParent = true;
                parentEl = item.parentElement.parentElement.parentElement;
                parent = parentEl.querySelector('.setupFolder').innerText;
            }
            if(hasParent && parentEl.parentElement != null && parentEl.parentElement.parentElement != null
                && parentEl.parentElement.parentElement.className.indexOf('parent') !== -1) {
                hasTopParent = true;
                topParentEl = parentEl.parentElement.parentElement;
                topParent = topParentEl.querySelector('.setupFolder').innerText;
            }

            strNameMain = 'Setup > ' + (hasTopParent ? (topParent + ' > ') : '');
            strNameMain += (hasParent ? (parent + ' > ') : '');

            strName = strNameMain + item.innerText;

            if(allComandsList[strName] == null) allComandsList[strName] = {url: item.href, key: strName};

        });
        store('Store Commands', allComandsList);
    }

    function getSetupTree() {

        var theurl = SERVER_INSTANCE + '/ui/setup/Setup';
        var req = new XMLHttpRequest();
        req.onload = function() {
            parseSetupTree(this.response);
            hideLoadingIndicator();
        }
        req.open("GET", theurl);
        req.responseType = 'document';

        req.send();
    }

    function getCustomObjects()
    {
        var theurl = SERVER_INSTANCE + '/p/setup/custent/CustomObjectsPage';
        var req = new XMLHttpRequest();
        req.onload = function() {
            parseCustomObjectTree(this.response);
        }
        req.open("GET", theurl);
        req.responseType = 'document';

        req.send();
    }

    function parseCustomObjectTree(html)
    {

        $(html).find('th a').each(function(el) {
            allComandsList['Setup > Custom Object > ' + this.text] = {url: this.href, key: this.text};
        });

        store('Store Commands', allComandsList);
    }

    function getCookie(c_name)
    {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
                return unescape(y);
            }
        }
    }
    function getServerInstance()
    {
        var url = location.origin + "";
        var urlParseArray = url.split(".");
        var i;
        var returnUrl;

        if(url.indexOf("salesforce") != -1)
        {
            returnUrl = url.substring(0, url.indexOf("salesforce")) + "salesforce.com";
            return returnUrl;
        }

        if(url.indexOf("cloudforce") != -1)
        {
            returnUrl = url.substring(0, url.indexOf("cloudforce")) + "cloudforce.com";
            return returnUrl;
        }

        if(url.indexOf("visual.force") != -1)
        {
            returnUrl = 'https://' + urlParseArray[1] + '';
            return returnUrl;
        }
        return returnUrl;
    }

    function getContent(elem) {
        var content = undefined;

        if ("undefined" !== typeof(elem.innerHTML)) {
            content = elem.innerHTML;
        } else
        if ("undefined" !== typeof(elem.nodeValue)) {
            content = elem.nodeValue;
        } else
        if ("string" === typeof(elem)) {
            content = elem;
        }

        if (undefined !== content) {
            // Remove tags
            content = content.replace(/<(?:.|\n)*?>/gm, '');

            // HTML decode
            var txt = document.createElement("textarea");
            txt.innerHTML = content;
            return txt.value;
        }

        return content;
    }

    function initShortcuts() {
        chrome.extension.sendMessage(
            {'action':'Get Settings'},
            function(response) {
                var shortcut = response['shortcut'];
                bindShortcut(shortcut);
            }
        );
    }

    function kbdCommand(e, key) {
        var position = selectedItemIndex;
        if(position <0) position = 0;

        var newText = document.getElementById("sfnav_quickSearch").value;
        if ('undefined' !== typeof resultsElement.childNodes[position]) {
            newText = getContent(resultsElement.childNodes[position]);
        }

        var newtab = (NEW_TAB_KEYS.indexOf(key) >= 0) ? true : false;
        if (!newtab) {
            clearResults();
            hideResults();
        }

        invokeCommand(newText, newtab)
    }

    function bindShortcut(shortcut)
    {

        Mousetrap.bindGlobal(shortcut, function(e) {
            showAll();
            return false;
        });

        Mousetrap.bindGlobal('esc', function(e) {
            hideAll();
        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('enter', kbdCommand);

        for (var i = 0; i < NEW_TAB_KEYS.length; i++) {
            Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind(NEW_TAB_KEYS[i], kbdCommand);
        };

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('down', function(e) {
            movingTo(selectedItemIndex+1);
            return false;
        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('up', function(e) {
            movingTo(selectedItemIndex-1);
            return false;
        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('backspace', function(e) {
            movingTo(-1);
        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('pageup', function(e) {
            var newIndex = selectedItemIndex-10;
            newIndex = (newIndex >= 0) ? newIndex : 0;
            movingTo(newIndex);
            return false;
        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('pagedown', function(e) {
            movingTo(selectedItemIndex+10);
            return false;
        });

        document.getElementById('sfnav_quickSearch').onkeyup = function() {
            lookAt();
            return true;
        }
    }

    var textInSearchInput = '';
    function movingTo(to){
        var numberOfResults = $(resultsElement).children().length;

        var textfield = document.getElementById("sfnav_quickSearch");

        var selectedItemIndex_prev = selectedItemIndex;

        to = (to < numberOfResults) ? to : numberOfResults-1;
        to = (to >= -1)             ? to : -1;

        if (-1 === selectedItemIndex_prev && 0 === to) {
            // From input to result list
            textInSearchInput = textfield.value;
        }

        if (0 === selectedItemIndex_prev && -1 === to) {
            // From list to input
            textfield.value = textInSearchInput;
        }

        // if (0 === selectedItemIndex_prev && -1 < to) {
        //     to = -1;
        // }

        selectedItemIndex = to;

        if (-1 === selectedItemIndex) {
            $('#sfnav_search_box').find('.sfnav_input-line').removeClass('unfocused');
        } else {
            $('#sfnav_search_box').find('.sfnav_input-line').addClass('unfocused');
        }

        if (undefined !== resultsElement.childNodes[selectedItemIndex_prev]) {
            resultsElement.childNodes[selectedItemIndex_prev].classList.remove('sfnav_selected');
        }

        if (undefined !== resultsElement.childNodes[0]) {
            if (-1 === selectedItemIndex) {
                resultsElement.childNodes[0].classList.add('sfnav_selected');
                resultsElement.childNodes[0].classList.add('sfnav_preselected');
            } else {
                resultsElement.childNodes[0].classList.remove('sfnav_selected');
                resultsElement.childNodes[0].classList.remove('sfnav_preselected');
            }
        }

        if (undefined !== resultsElement.childNodes[selectedItemIndex]) {
            resultsElement.childNodes[selectedItemIndex].classList.add('sfnav_selected');
            resultsElement.childNodes[selectedItemIndex].scrollIntoViewIfNeeded(false);

            textfield.value = getContent(resultsElement.childNodes[selectedItemIndex]);

            textfield.setSelectionRange(textfield.value.length, textfield.value.length);
            if (textfield.value.indexOf('[') !== -1 && textfield.value.indexOf(']') !== -1) {
                textfield.setSelectionRange(textfield.value.indexOf('['), textfield.value.indexOf(']')+1);
            }
        }
    }

    function showLoadingIndicator()
    {
        $('#sfnav_search_box').find('.loading').css('visibility','visible');
    }
    function hideLoadingIndicator()
    {
        $('#sfnav_search_box').find('.loading').css('visibility','hidden');
    }
    function getCustomObjectsDef()
    {

        forceToolingClient.query('Select+Id,+DeveloperName,+NamespacePrefix+FROM+CustomObject',
            function(success)
            {
                for(var i=0;i<success.records.length;i++)
                {
                    customObjects[success.records[i].DeveloperName.toLowerCase()] = {Id: success.records[i].Id};
                    var apiName = (success.records[i].NamespacePrefix == null ? '' : success.records[i].NamespacePrefix + '__') + success.records[i].DeveloperName + '__c';
                    allComandsList['Setup > Custom Object > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
                }
            },
            function(error)
            {
                getCustomObjects();
            });

    }
    function init()
    {
        forceToolingClient = new forceTooling.Client();
        forceToolingClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, SERVER_INSTANCE + '');

        var div = document.createElement('div');
        div.setAttribute('id', 'sfnav_search_box');
        var loaderURL = chrome.extension.getURL("images/ajax-loader.gif");
        var logoURL = chrome.extension.getURL("images/128.png");
        div.innerHTML = '<div class="sfnav_input-line"><input type="text" id="sfnav_quickSearch" autocomplete="off" placeholder="Search..."/><img class="loading" src= "'+ loaderURL +'"/><img id="sfnav_logo" src= "'+ logoURL +'"/></div><div class="sfnav_results" id="sfnav_results"></div>';
        document.body.appendChild(div);

        var background_div = document.createElement('div');
        background_div.setAttribute('id', 'sfnav_search_box_background');
        background_div.addEventListener('click', hideAll);
        document.body.appendChild(background_div);

        resultsElement = document.getElementById("sfnav_results");
        hideLoadingIndicator();
        initShortcuts();

        var omnomnom = getCookie('sid');

        var clientId = omnomnom.split('!')[0];

        hash = clientId + '!' + omnomnom.substring(omnomnom.length - 10, omnomnom.length);


        chrome.extension.sendMessage({action:'Get Commands', 'key': hash},
        function(response) {
            allComandsList = {};

            if(response !== null && response.length !== 0) {
                allComandsList = response;
            } else {
                getAllObjectMetadata();
            }
        });

    }

    /*
     * Code taken from https://gist.github.com/hsablonniere/2581101#file-index-js
     */
    if (!Element.prototype.scrollIntoViewIfNeeded) {
        Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
            centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

            var parent = this.parentNode,
                parentComputedStyle = window.getComputedStyle(parent, null),
                parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
                parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
                overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
                overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
                overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
                overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
                alignWithTop = overTop && !overBottom;

            if ((overTop || overBottom) && centerIfNeeded) {
                parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
            }

            if ((overLeft || overRight) && centerIfNeeded) {
                parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
            }

            if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
                this.scrollIntoView(alignWithTop);
            }
        };
    }

    if(SERVER_INSTANCE == null || getCookie('sid') == null || getCookie('sid').split('!').length != 2) return;
    else init();

})();
