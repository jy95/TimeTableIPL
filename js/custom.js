const IA_RESTRICTION = "IA";
const MICROSOFT_RESTRICTION = "MIC";
const UNITY_RESTRICTION = "UN";
const SAP_RESTRICTION = "SAP";
const WEB_RESTRICTION = "WEB";
const SERIE1 = "I1";
const SERIE2 = "I2";

$(function() {
    var timetable = populateData();

    $(':checkbox').on("change",function() {
        var params = [];

        $.each( $(":checkbox:checked"), function( key , value){
            // accessible course
            params.push($(this).val());
            CreateTimeTable(params,timetable);
        });


    });

});

function populateData() {

    // container for data
    var item = [];

    // list of courses (possibly to be modified for some reasons (ie : serie schedule)

    var IA = new Course("I310B IA",2,"A017",IA_RESTRICTION);
    var InterIntranet = new Course("I303A Inter-Intranet",2,"B11");
    var LaboReseau = new Course("I303B Labo réseaux",2,"A017");
    var AdmUnixEx = new Course("I302B Adm Unix (ex)",2,"A019");
    var SAP1 = new Course("I312A SAP",2,"A017",SAP_RESTRICTION);

    var DEATh = new Course("I301B DAE (th)",1,"B23");
    var Partern = new Course("I301A Pattern",2,"A017",SERIE1);
    var DEAEx = new Course("I301B DAE (ex)",2,"A019",SERIE2);
    var Anglais = new Course("I305A Anglais 3",2,"B23",SERIE2);
    var AdminUnixTh = new Course("I302A Adm Unix (th)",2,"AudB");

    var BigData = new Course("I304A Big Data",2,"B11");
    var Windows = new Course("I302C Windows",2,"A019" , SERIE2);
    var SAP2 = new Course("I312B SAP",2,"A017",SAP_RESTRICTION);

    var RestServices = new Course("I313A REST services",2,"A017",WEB_RESTRICTION);
    var WebCloud = new Course("I313B Web Cloud",2,"A017",WEB_RESTRICTION);
    var Droit = new Course("I304C Droit déonto",2,"B11");

    var MIC1 = new Course("I311A Outils MIC",2,"A017",MICROSOFT_RESTRICTION);
    var MIC2 = new Course("I311B Outils MIC",2,"A017",MICROSOFT_RESTRICTION);
    var Unity = new Course("I314A Unity",4,"A017",UNITY_RESTRICTION);

    // Modified courses object;

    var Windows2 = cloneObject(Windows);
    Windows2.physicLocation = "A017";
    Windows2.restriction = SERIE1;

    var IA2 = cloneObject(IA);
    IA2.name = "I310A IA";

    var Anglais2 = cloneObject(Anglais);
    Anglais2.restriction = SERIE1;

    var Partern2 = cloneObject(Partern);
    Partern2.restriction = SERIE2;
    Partern2.physicLocation = "A019";

    var DEAEx2 = cloneObject(DEAEx);
    DEAEx2.restriction = SERIE1;
    DEAEx2.physicLocation = "A019";

    // populate each Day

    var Monday = {
        hour_08_30 : [ IA ],
        hour_10_45 : [ InterIntranet ],
        hour_13_45 : [ LaboReseau , AdmUnixEx ],
        hour_17_00 : [ SAP1 ]
    };
    var Tuesday = {
        hour_09_30 : [ DEATh ],
        hour_10_45 : [ Partern , DEAEx ],
        hour_13_45 : [ DEAEx2 , Anglais ],
        hour_17_00 : [ AdminUnixTh ]
    };
    var Wednesday = {
        hour_08_30 : [IA2 , Anglais2],
        hour_10_45 : [ BigData ],
        hour_13_45 : [ Partern2 ],
        hour_16_00 : [ Windows ],
        hour_17_00 : [ SAP2 ]
    };

    var Thursday = {
        hour_08_30 : [ RestServices ],
        hour_10_45 : [ WebCloud ],
        hour_13_45 : [ Droit ],
        hour_16_00 : [ Windows2 ]
    };

    var Friday = {
        hour_08_30 : [ MIC1 ],
        hour_10_45 : [ MIC2 ],
        hour_13_15 : [ Unity ]
    };

    item.push(Monday);
    item.push(Tuesday);
    item.push(Wednesday);
    item.push(Thursday);
    item.push(Friday);

    // return object

    return item;
};


function Course(name, duration, physicLocation, restriction) {
    this.name = name;
    this.duration = duration;
    this.physicLocation = physicLocation;
    if ( restriction == undefined ) {
        this.restriction = "";
    } else {
        this.restriction = restriction;
    }
};


function cloneObject(obj) {
    return  jQuery.extend(true, {}, obj);
};

function findAccessibleCourse(obj,params) {
    var toReturn;

    // Iteration
    $.each(obj, function( key , value){
        // accessible course
        if ( value.restriction == "" || jQuery.inArray(value.restriction, params) != -1 ) {
            toReturn = value;
            return false;
        }
    });
    return toReturn;
};

function graphicalTimeFix(course, hour){
    //debugger;
    if (jQuery.inArray(hour, ["08_30", "09_30"] ) != -1 ) {
        return course.duration + 1;
    }

    if (jQuery.inArray(hour, ["13_15", "17_00" , "16_00"] ) != -1 ) {
        return course.duration + 2;
    }

    return course.duration;
}

function CreateTimeTable(params, courses) {

    $(".Timetable__room").parent("tr:not(.Timetable__time)").find("td").remove();

    var departureHours = [ "08_30", "09_30","10_30","10_45","12_45","13_15","13_45","15_45","16_00", "17_00","17_15","18_00","19_00"];
    var propertyName = "hour_";

    $.each( courses, function( key, value ) {
        for ( var index = 0 ; index < departureHours.length ; index++) {

            if (index > departureHours.length ) {
                return false;
            }

            var stringBuilder = "<td colspan=\"1\"></td>";

            var testName = propertyName.concat(departureHours[index]);

                // Found a possible course for this hour
            if (value.hasOwnProperty(testName)) {
                var chosenCourse = findAccessibleCourse(value[testName],params);

                if (chosenCourse != undefined) {

                    // Dammit :) Work to do XD

                    var time = graphicalTimeFix(chosenCourse, departureHours[index]);

                    stringBuilder = "<td colspan=\"" + time + "\"> <div class=\"Allocation\">" +
                        "<span class=\"Allocation__title\">" + chosenCourse.name +
                        "</span><span class=\"Allocation__tutor\">" + chosenCourse.physicLocation + "</span> </div> </td>";

                    index = index + time -1;

                }
            }
            $(".Timetable__room").parent("tr:not(.Timetable__time)").eq(key).append(stringBuilder);

        }
    });

};
