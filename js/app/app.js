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
        list.append($("<div>").addClass("sortable"));
        for(var count = 0; count < feeds.length; count++){
            createNewFeedItem(feeds[count]);
            initializeFeed(feeds[count]);   
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
                 $(container).find('.headerText').text(result.feed.title);
                 for (var i = 0; i < result.feed.entries.length; i++) {
                     var entry = result.feed.entries[i];
                     var link = result.feed.entries[i].link;
                     var tooltip = result.feed.entries[i].content; 
                     var div = $("<div>").addClass("newsEntry").attr('data-url', link ).attr('data-tooltip', tooltip);
                     div.text(result.feed.entries[i].title);
                     $(container).find('.portlet-content').append(div);
                     div.tooltipster ({
                         theme: 'tooltipster-light' ,
                         contentAsHTML : true,
                         maxWidth : 500,
                         maxHeight : 500,
                         content: $(div).attr('data-tooltip')
                     });

                    div.click(function(e){
                        openLink(e);
                    });    
                 }
             }else{
                 bootbox.alert("Invalid Feed URL");
             }
         $( ".sortable" ).sortable({
             stop: function(event, ui) {
                updatePositions();
             }
         });
         });
     }
     
     function openLink(e){
        var ele =  $(e.target);
        alert(ele.attr('data-url'));
        window.open(ele.attr('data-url'), '_black');
     }
     
     function getPortletByAttr(ittr){
         var parent = $("[data-url='"+ittr+"']").addClass("portlet ui-widget ui-widget-content ui-helper-clearfix ui-corner-all");
         var closeBtn = $("<div>").addClass('btn btn-info btn-xs portlet-toggle').text("X").attr("data-url", ittr);
         closeBtn.click(function(e){removeRSSEntry(e);});
         var headerDiv = $('<div>').addClass("portlet-header ui-widget-header ui-corner-all");
         var header = $('<div>').addClass('headerText');
         headerDiv.append(header);
         headerDiv.append(closeBtn);
         parent.append(headerDiv);
         parent.append($('<div>').addClass('portlet-content'));
         return parent;
     }

     google.setOnLoadCallback(processAllFeeds());
     
     function updatePositions(){
        updateDataStore($(".sortable").children().map(function(){return $(this).attr("data-url");}).get());
     }
     
     function updateDataStore(list){
        $.cookie('NewsFeedList', list);
         console.log(list);
     }
     
     function retriveFromDataStore(){
        return $.cookie('NewsFeedList');
     }
     
     function removeRSSEntry(e){
        var ele =  $(e.target);
        var callback = function(url){
            return function(result){
                  if(result){
                    console.log(" 00 "+url);
                    removeEntry(url); 
                  }
            };
        }; 
        bootbox.confirm("Are you sure you want to delete "+ele.attr("data-url"), callback(ele.attr('data-url')));
     }
     
     function removeEntry(url){ 
        console.log(url); 
        feeds.splice(feeds.indexOf(url), 1);
        updateDataStore(feeds);
        $("[data-url='"+url+"']").remove();
     }
         
     $("#addFeed").click(function(){
            bootbox.prompt("Enter NEWS feed/RSS URL", function(result) {                
              if (result !== null) {          
                    initializeFeed(result);                   
              }
            });
     });
 });