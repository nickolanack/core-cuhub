return function(viewer, element, parentModule){
var isLoaded=false;



var activeDayEl=null;

var todayStr = (new Date()).toISOString().split('T')[0];

if(!application.getNamedValue("selectedDay")){
    application.setNamedValue("selectedDay", todayStr);
    application.setNamedValue("dateFilter", {dates:[todayStr]});
}
var renderList=function(dates){
                var listView=viewer.getChildView('content',0);
                 if(listView){
                     
                    var dateList=[];
                    Object.keys(dates).forEach(function(key){
                        dateList.push({"date":key,"events":dates[key]})
                    })
                     dateList.sort(function(a,b){
                         return a.date>b.date?1:-1;
                     });
                     listView.redraw(null, dateList);
                 }
            };
            
            
var setSelectedDay=function(day, el){
    
            application.setNamedValue("selectedDay", day);
            application.setNamedValue("dateFilter", {dates:[day]});
            
            if(activeDayEl){
                activeDayEl.removeClass("active");
            }
            activeDayEl=el;
            el.addClass("active");
}

var redrawSiblingList=function(){
    var start=new Date(application.getNamedValue("selectedDay"))
    var range=[start, new Date(start.valueOf()+(1000*3600*24))];
   
};

(new CalendarModule({
    data:function(range, callback){
        
        EventList.SharedInstance(function(list){
            
            var data={};
            list.getAllEvents().forEach(function(e){
                
                if(e.hasEventDate()){
                    var d=e.getEventDateStr();
                    if(!data[d]){
                        data[d]=[];
                    }
                    data[d].push(e);
                }else if(e.hasDate()){
                    var d=e.getDateStr();
                    if(!data[d]){
                        data[d]=[];
                    }
                    data[d].push(e);
                }
            })
            callback(data);
        })
    },
    events:{
        selectDay:function(day, el){
            console.log('Select day:'+day);
            
            var controller=application.getNamedValue('navigationController');
        
        
            setSelectedDay(day, el);
            
            var view=controller.getCurrentView()
            if(view.view=="Calendar"){
               controller.navigateTo("Date", "Main"); 
               return;
            }
            
            redrawSiblingList();
            
            
            
            
            
        }
    },
    dayElFormatter:function(el, day){
        
        if(application.getNamedValue("selectedDay")===day){
    
                setSelectedDay(day, el);   
                redrawSiblingList();
        }
        
        
    },
    eventDataFormatter:function(data, dayEl){
                 var el=dayEl.appendChild(new Element('span',{"class":'events'}))
                 var renderDataItem=function(d){
                       var dataEl=el.appendChild(new Element('span',{"class":"event-data","data-label":d.getName()})); 
                       dataEl.addClass("calendar-item-"+(d.getType().split('.').pop()))
                    }

                
                if(data.length){
                    data.forEach(function(str){
                        renderDataItem(str);
                    })
                    
                }
                
                
                
                
                
               
                
                
            }
            
})).load(null, element, null);


viewer.addEvent('load:once',function(){
   isLoaded=true; 
});

}