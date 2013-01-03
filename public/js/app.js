 // Extends default Objects
String.prototype.ucfirst     = function(){ return this.substr(0,1).toUpperCase() + this.substr(1,this.length); }
Array.prototype.pad         = function(s,v){ var l = s - this.length; for (var i = 0; i<l; i++){ this.push(v); } return this; };
Array.prototype.inArray     = function(val){ var l = this.length, ret = false; for (var i = 0; i < l; i++){ ret = this[i] == val; if ( ret ) { break; } } return ret; }

//$('.body > .main').prepend($('<div />', {id:'#consoleLogs'}));
window.log = function()
{
    //TODO: only activate logs in DEV env?
    
    if ( this.console ){ console.log(arguments); }
    
    $('#consoleLogs').prepend('<p class="log">' + arguments[0] + '</p>');
    
};

var app = 
{
    conf:
    {
    },
    support:
    {
        init: function() { },
    },
    
    init: function()
    {        
        this.sniff();
        this.handleOrientation();
        this.ui.init();
        this.support.init();
        
        return this;
    },
    
    sniff: function()
    {
        var that         = this,
            ua             = navigator.userAgent || 'unknown',
            classes     = '',
            checks         = ['platform','browser','engine','os','browserVersion'],
            platforms     = ['iPhone','iPad','iPod','android','Android','Windows Phone','Windows','BlackBerry','Bada','webOS'],
            engines     = {'AppleWebKit':'Webkit','Gecko':'Gecko','Trident':'Trident','MSIE':'Trident','Presto':'Presto','BlackBerry':'Mango','wOSBrowser':'Webkit'},
            browsers     = {'Chrome':'Chrome','CriOS':'Chrome','Firefox':'Firefox','Safari':'Safari','Opera':'Opera','IEMobile':'IE Mobile','MSIE':'IE','Dolfin':'Dolfin'}, 
            version     = {'full': '?', 'major': '?', 'minor': '?', 'build': '?', 'revision': '?'},
            vRegExp     = {
                'default': '.*(default)\\/([0-9\\.]*)\\s?.*',
                'ie': '.*(MSIE)\\s([0-9\\.]*)\\;.*',
                'opera': '.*(Version)\\/([0-9\.]*)\\s?.*',
                'safari': '.*(Version)\\/([0-9\.]*)\\s?.*',
                'blackberry': '.*(BlackBerry[a-zA-Z0-9]*)\\/([0-9\\.]*)\\s.*'
            };

        // Set Default values
        for (var i=0, l=checks.length; i<l; i++)    { var k = checks[i]; app[k] = 'unknown' + k.ucfirst(); }
            
        // Look for platform, browser & engines
        for (var i=0, l=platforms.length; i<l; i++) { if ( ua.indexOf(platforms[i]) !== -1 ){ app.platform = platforms[i].toLowerCase(); break; } }
        for (var name in browsers)                    { if ( ua.indexOf(name) !== -1 ){ app.browser     = browsers[name].toLowerCase().replace(/\s/,''); break; } }
        for (var name in engines)                    { if ( ua.indexOf(name) !== -1 ){ app.engine     = engines[name].toLowerCase(); break; } }

        // Try to get the browser version data
        if ( app.browser !== 'unknownBrowser' )
        {
            var pattern     = vRegExp[app.browser] || vRegExp['default'].replace('default', app.browser.ucfirst()),     // Get regex pattern to use 
                p             = ua.replace(new RegExp(pattern, 'gi'), '$2').split('.');                     // Split on '.'

                p.unshift(p.join('.') || '?')     // Insert the full version as the 1st element
                p.pad(5, '?')                     // Force the parts & default version arrays to have same length
            
            // Assoc default version array keys to found values
            app.browserVersion = {'full': p[0], 'major':p[1], 'minor':p[2], 'build':p[3], 'revision':p[4]};
        }
        else { app.browserVersion = version; }
        
        // Look for os
        if         ( ['iphone','ipad','ipod'].inArray(app.platform) )    { app.os = 'ios'; }
        else if ( app.platform === 'windows phone' )                { app.os = 'wpos'; }
        else if ( app.plafform !== 'unknownPlatform' )                 { app.os = app.platform.toLowerCase(); }
        
        // Get or test some usefull properties 
        app.device             = { 'screen':{w:window.screen.width, h:window.screen.height} };
        app.isSimulator     = ua.indexOf('XDeviceEmulator') > -1;
        app.isStandalone     = typeof navigator.standalone !== 'undefined' && navigator.standalone;
        app.isRetina         = (window.devicePixelRatio && window.devicePixelRatio > 1) || false;
        app.isMobile         = ua.indexOf('Mobile') !== -1;
        
        // And add retrieven data to classname on the html tag
        classes = 
            app.platform + ' ' + app.os + ' ' + app.engine + ' ' + app.browser 
            + (app.isStandalone ? ' ' : ' no-') + 'standalone' 
            + (app.isRetina     ? ' ' : ' no-') + 'retina' 
            + (app.isMobile     ? ' ' : ' no-') + 'mobile';
        
        $('html').addClass(classes).attr(
        {
            'data-platform': app.platform,
            'data-os': app.os,
            'data-browser': app.browser,
            'data-engine': app.engine,
            'data-browserVersion': JSON.stringify(app.browserVersion) || app.browserVersion,
            'data-bvMajor': app.browserVersion.major,
            'data-bvMinor': app.browserVersion.minor,
            'data-bvBuild': app.browserVersion.build,
            'data-bvRevision': app.browserVersion.revision
        })
        .removeClass('no-js');

        return this;
    },
    
    handleOrientation: function()
    {
        window.onorientationchange = function()
        {
            if ( typeof window.orientation == 'undefined' && typeof window.onmozorientation == 'undefined' ){ return this; }
            
            var or     = window.orientation || window.onmozorientation;
            
            app.orientation = Math.abs(or) === 90 ? 'landscape' : 'portrait';
            
            $('html').removeClass('landscape portrait').addClass(app.orientation);
            
            //window.scrollTo(0,0);
            app.ui.init();
        };
        
        $(window).trigger('orientationchange');
        
        return this;
    },
    
    ui:
    {
        init: function()
        {
            // On iOS devices
            if ( app.platform && !!app.platform.match(/ip(?:ad|hone|od)/) && !location.hash )
            {                
                //var h = app.device.screen[app.orientation === 'landscape' ? 'w' : 'h'];
                var h = window.screen['avail' + (app.orientation === 'landscape' ? 'Width' : 'Height')];
                
                // On iOS, when not in a standalone web app
                //if ( app.os === 'ios' ){ h = h - ( app.isStandalone ? 0 : 20 ); }
                
//alert('h: ' + h);
//alert('availw:' + window.screen.availWidth + ', w:' + window.screen.availHeight); 

                // Force the viewport height to the available height (device according to orientation)
                $('html').css({'height':h});
                
                // And hide the address bar
                setTimeout(function() { window.scrollTo(0, 1) }, 100);
            }
            
            return this;
        }
    },
    
    notifier:
    {
        init: function()
        {
            return this;
        },
        
        add: function()
        {
            var args     = arguments,
                o         = $.extend(
                {
                    type: 'info',     // error, warning, info, success
                    actions:{},     // params: url, label, title, id, target
                    modal: false,    // 
                    msg: null
                },args[0] || {})
            
            if ( !o.msg ){ return this; }
            
            alert(o.msg);
            
            return this;    
        }
    }
};