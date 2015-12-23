
var self = require('sdk/self');
var button = require("sdk/ui/button/action").ActionButton;
var tabs = require('sdk/tabs');
var sp   = require("sdk/simple-prefs");


var imgXDebugerEnabled  = self.data.url("debug_enabled.png");
var imgXDebugerDisabled = self.data.url("debug_disabled.png");
var imgProfilerEnabled  = self.data.url("profiler_enabled.png");
var imgProfilerDisabled = self.data.url("profiler_disabled.png");

//console.log("test");

// listener to 
tabs.on('activate', function(tab) {

    recheckCookieValue(tab);    

});



// listener to 
tabs.on('ready', function(tab) {

    recheckCookieValue(tab);    

});


function recheckCookieValue(tab) {
    
    tab.attach({
        contentScript: 'self.postMessage(document.cookie);',
        onMessage: function (cookieStr) {

            cookieValue = getCookie(sp.prefs.DebugCookieName,cookieStr);
            
            var enabled = (cookieValue == undefined) ? true : false;
            
            if (enabled!=true) {
                xdebug_xdebuger.icon = imgXDebugerEnabled;                     
            } else {
                xdebug_xdebuger.icon = imgXDebugerDisabled;                    
            }                   
            
            
            cookieValue = getCookie(sp.prefs.ProfilerCookieName,cookieStr);
            
            enabled = (cookieValue == undefined) ? true : false;
            
            if (enabled!=true) {
                xdebug_profiler.icon = imgProfilerEnabled;                    
            } else {
                xdebug_profiler.icon = imgProfilerDisabled;                    
            }  
             
    
            
        }
    });
    
}


// set a cookie in the tab (should be the active tab)
function setCookie(tab,cookieName,cookieValue='',minutes=null) {
    
    var m = parseInt(minutes);   
    var expStr = '';
    if (isNaN(m)) { m = -1; }
    if (m>0 || minutes==null){
        var exp=new Date();
        exp.setTime(exp.getTime()+(m*60*1000));
        expStr = '; expires='+exp.toGMTString();
    }

    var cookieStr = escape(cookieName) +'='+escape(cookieValue)+expStr+'; path=/;';
    
    var worker = tabs.activeTab.attach({
        contentScriptFile: self.data.url("my-outsourced.js")
    });   
    
    worker.port.emit("setCookie", cookieStr);
    
}

// find cookie value in the cookie string (document.cookie)
function getCookie(c_name,cookieStr='')
{
    
    //check if empty
    if (cookieStr==null || !(cookieStr.length>0))
        return ;
    
    //console.log('cookieStr:'+cookieStr);
    var i,x,y,ARRcookies=cookieStr.split(";");
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








exports.main = function() {





    // Widget documentation: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/packages/addon-kit/widget.html

    xdebug_xdebuger = new button({
        // Mandatory string used to identify your widget in order to
        // save its location when the user moves it in the browser.
        // This string has to be unique and must not be changed over time.
        id: "Debug",

        // A required string description of the widget used for
        // accessibility, title bars, and error reporting.
        label: "Toggle xdebug cookie (red->active)",
		
		// needed to make the button visible in the customisation dialog >= ff 29
		icon: imgXDebugerDisabled,


        // Add a function to trigger when the Widget is clicked.
        onClick: function(event) {
        
            // set cookie in active tab
            tabs.activeTab.attach({
                contentScript: 'self.postMessage(document.cookie);',
                onMessage: function (cookieStr) {
                    
                    // get cookie values from simple prefs
                    var minutes=sp.prefs.DebugCookieTimeout; //120;
                    var cookieName=sp.prefs.DebugCookieName; //"XDEBUG_SESSION";
                    var cookieValue=sp.prefs.DebugCookieValue; //"netbeans-xdebug";
                    
                    // check if cookie is already set
                    var cookieVal = getCookie(cookieName,cookieStr);
                    
                    var enabled = (cookieVal == undefined) ? true : false;
                    
                    // toggle the cookie
                    if (enabled==true) {
                        setCookie(tabs.activeTab,cookieName,cookieValue,minutes);
                        xdebug_xdebuger.icon = imgXDebugerEnabled;                     
                    } else {
                        setCookie(tabs.activeTab,cookieName);
                        xdebug_xdebuger.icon = imgXDebugerDisabled;                    
                    }                                       
                        
                    
                }
            });
           
            
        },





    });


    xdebug_profiler = new button({
        // Mandatory string used to identify your widget in order to
        // save its location when the user moves it in the browser.
        // This string has to be unique and must not be changed over time.
        id: "Profil",

        // A required string description of the widget used for
        // accessibility, title bars, and error reporting.
        label: "Toggle Xdebug Profiler Cookie (red->active)",


		// needed to make the button visible in the customisation dialog >= ff 29
        icon: imgProfilerDisabled,

        // Add a function to trigger when the Widget is clicked.
        onClick: function(event) {
            
            // set cookie in active tab
            tabs.activeTab.attach({
                contentScript: 'self.postMessage(document.cookie);',
                onMessage: function (cookieStr) {
                    
                    // get cookie values from simple prefs
                    var minutes=sp.prefs.ProfilerCookieTimeout; //120;
                    var cookieName=sp.prefs.ProfilerCookieName; //"XDEBUG_SESSION";
                    var cookieValue=sp.prefs.ProfilerCookieValue; //"netbeans-xdebug";
                    
                    // check if cookie is already set
                    var cookieVal = getCookie(cookieName,cookieStr);
                    
                    var enabled = (cookieVal == undefined) ? true : false;
                    
                    // toggle the cookie
                    if (enabled==true) {
                        setCookie(tabs.activeTab,cookieName,cookieValue,minutes);
                        xdebug_profiler.icon = imgProfilerEnabled;                     
                    } else {
                        setCookie(tabs.activeTab,cookieName);
                        xdebug_profiler.icon = imgProfilerDisabled;                    
                    }                                       
                        
                    
                }
            });
            
        }
    });
    

    

};




