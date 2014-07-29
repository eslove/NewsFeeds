 $(function () {
     
     var list = $('#list');
     var noOfColumns = 3;
     var feeds;
     
     function initFeeds(){
         if(!feeds){
            var feedList = retriveFromDataStore();
            feeds = feedList ? feedList.split(',') : []; 
            if(feeds.length === 0){
                feeds.push("http://www.thehindu.com/business/?service=rss");
                feeds.push("http://indianexpress.com/section/india/feed/");
                updateDataStore(feeds);
            }
         }
     }
     
     function processAllFeeds(){
        initFeeds();
        initUI(); 
        for(var count = 0; count < feeds.length; count++){
            initializeFeed(feeds[count]);
        }
     }
     
     function initUI(){
         var sortable = $("<div>").addClass("sortable");
         list.append(sortable);
         for(var count = 0; count < feeds.length; count++){
             createNewFeedItem(feeds[count]);
         }
     }
     
     function createNewFeedItem(url){
        var div =  $("<div>").attr('data-url', url);
        $('.sortable').append(div); 
     }
     
     function initializeFeed(feedName) {
         var feed = new google.feeds.Feed(feedName);
         feed.setNumEntries(10);
         feed.load(function (result) {
             if (!result.error) {
                 if(feeds.indexOf(result.feed.feedUrl) === -1){
                    feeds.push(result.feed.feedUrl);
                    updateDataStore(feeds);
                    createNewFeedItem(result.feed.feedUrl);
                 }
                 var container = getPortletByAttr(result.feed.feedUrl);
                 $(container).find('.portlet-header').text(result.feed.title);
                 for (var i = 0; i < result.feed.entries.length; i++) {
                     var entry = result.feed.entries[i];
                     var link = result.feed.entries[i].link;
                     var tooltip = result.feed.entries[i].content; 
                     var div = $("<div>").addClass("newsEntry").attr('data-url', link ).attr('data-tooltip', tooltip);
                     div.text(result.feed.entries[i].title);
                     div.click(function(){
                        window.open($(this).attr('link'),'_black');
                     });
                     $(container).find('.portlet-content').append(div);
                 }
                 $(".sortable").append(container);
             }else{
                 bootbox.alert("Invalid Feed URL");
             }
            initPortlets();
            $( ".sortable" ).sortable({
                stop: function(event, ui) {
                    updatePositions();
                }
            });
         });
     }
     
     function getPortletByAttr(ittr){
         var parent = $("[data-url='"+ittr+"']").addClass("portlet");
         parent.append($('<div>').addClass('portlet-header').text(name));
         parent.append($('<div>').addClass('portlet-content'));
         return parent;
     }

     google.setOnLoadCallback(processAllFeeds());

     function initPortlets(){
         $(".column").sortable({
             connectWith: ".column",
             handle: ".portlet-header",
             cancel: ".portlet-toggle",
             placeholder: "portlet-placeholder ui-corner-all"
         });
         $(".portlet")
             .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
             .find(".portlet-header")
             .addClass("ui-widget-header ui-corner-all")
             .prepend("<span class='btn btn-info btn-xs portlet-toggle'>-</span>");

         $(".portlet-toggle").click(function () {
             var icon = $(this);
             icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
             icon.closest(".portlet").find(".portlet-content").toggle();
         });
        $('.newsEntry').each(function() {
         $(this).tooltipster ({
             theme: 'tooltipster-light' ,
             contentAsHTML : true,
             maxWidth : 500,
             maxHeight : 500,
             content: $(this).attr('data-tooltip')
         });
     });
     }
     
     function updatePositions(){
        updateDataStore($(".sortable").children().map(function(){return $(this).attr("data-url");}).get());
     }
     
     function updateDataStore(list){
        $.cookie('NewsFeedList', list);
     }
     
     function retriveFromDataStore(){
        return $.cookie('NewsFeedList');
     }
         
     $("#addFeed").click(function(){
            bootbox.prompt("Enter NEWS feed/RSS URL", function(result) {                
              if (result !== null) {          
                    initializeFeed(result);                   
              }
            });
     });
 });