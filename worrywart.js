// Each click toggles between the values, which are the children of the element
// Values are numbered 0..n in code.
Tangle.classes.Enum = {
    initialize: function (element, options, tangle, variable) {
        element.addEvent("click", function (event) {
            var n = element.getChildren().length;
            var cur_state = tangle.getValue(variable);
            tangle.setValue(variable, (cur_state + 1) % n);
        });
    },

    update: function (element, value) {
        element.getChildren().each( function (child, index) {
            child.style.display = (index != value) ? "none" : "inline";
        });
    }
};

// TODO:
// - chance of losing your job
// - airline deaths per trip
// - robbery/mugging
// - burglary
// - do you have children under 12? if so
//   - your death affects their livelihood
//   - drowning
//   - their death (just overall mortality)

// Death rate data, in deaths per billion passenger-miles
// Data from Ian Savage, "Comparing the fatality risks in United States
// transportation across modes and over time", Research in Transportation
// Economics (2013), vol 43, p. 9-22.
// http://faculty.wcas.northwestern.edu/~ipsavage/436.pdf
var travel_rates = {
    "car": 7.28,
    "motorcycle": 212.57,
    "bus": 0.11,
    "subway": 0.24,
    // Pedestrian data from NHTSA, "National Pedestrian Crash Report" (2008).
    // http://www-nrd.nhtsa.dot.gov/Pubs/810968.pdf
    // 1 per 70 million miles walked
    "pedestrian": (1 / 70) * 1000
};

// Turn deaths per billion into micromorts (deaths per million)
function dpb_to_morts(dpb) {
    return dpb / 1000;
}

function miles_to_morts(rate, miles) {
    var miles_per_year = 52 * miles;
    return dpb_to_morts(miles_per_year * rate);
}

// Fire deaths per million. Gender: 0 = male, 1 = female
// Data from FEMA, "Fire death and injury rates (2004-2013)"
// https://www.usfa.fema.gov/downloads/xls/statistics/death_injury_data_sets.xlsx
var fire_rates = {
    "breaks": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
               55, 60, 65, 70, 75, 80, 85],
    "male": [9.0, 5.7, 2.9, 4.0, 7.6, 7.0, 7.2, 8.9, 9.7, 14.2, 17.4,
             22.8, 24.5, 22.6, 28.1, 38.7, 58.8, 57.4],
    "female": [7.4, 4.2, 2.4, 2.5, 2.6, 3.6, 3.5, 4.6, 5.5, 7.0, 7.7,
               11.7, 13.4, 13.5, 18.7, 28.9, 28.6, 29.9],
    "scale": 1
};

// All-cause mortality per 100,000, 2013. Data from CDC's "Health, United
// States, 2014", table 23. http://www.cdc.gov/nchs/hus/contents2014.htm#023
var mortality_rates = {
    "breaks": [0, 1, 5, 15, 25, 35, 45, 55, 65, 75, 85],
    "male": [650.5, 28.6, 14.6, 92.6, 145.4, 213.8, 500.7,
             1088.4, 2186.0, 5474.2, 14911.6],
    "female": [536.1, 22.4, 11.2, 35.6, 66.0, 130.5, 314.1,
               647.4, 1464.6, 4029.1, 13021.6],
    "scale": 10
};

// Cancer deaths per 100,000, 2013. Data from CDC's "Health, United States,
// 2014", table 26. http://www.cdc.gov/nchs/hus/contents2014.htm#026
var cancer_rates = {
    "breaks": [0, 1, 5, 15, 25, 35, 45, 55, 65, 75, 85],
    "male": [1.5, 2.2, 2.2, 3.8, 8.6, 24.0, 331.3, 726.2, 1414.5, 2272.6],
    "female": [1.8, 1.9, 2.1, 3.0, 8.6, 32.1, 104.6, 248.1, 520.8, 933.3, 1310.1],
    "scale": 10
};

// Heart disease deaths per 100,000, 2013. Data from CDC's "Health, United
// States, 2014", table 24. http://www.cdc.gov/nchs/hus/contents2014.htm#024
var heart_rates = {
    "breaks": [0, 1, 5, 15, 25, 35, 56, 55, 68, 75, 85],
    "male": [8.7, 1.2, 0.4, 2.8, 10.2, 35.5, 115.1, 267.3, 530.9, 1382.4, 4564.2],
    "female": [6.9, 0.9, 0.4, 1.5, 4.9, 15.7, 46.6, 107.5, 266.8, 879.8, 3732.9],
    "scale": 10
};

// Stroke deaths per 100,000, 2013. Data from CDC's "Health, United States,
// 2014", table 25. http://www.cdc.gov/nchs/hus/contents2014.htm#025
var stroke_rates = {
    "breaks": [0, 1, 5, 15, 25, 35, 45, 55, 65, 75, 85],
    "male": [3.0, 0.3, 0.2, 0.4, 1.3, 4.7, 14.2, 35.1, 85.0, 277.9, 808.4],
    "female": [2.5, 0.3, 0.2, 0.3, 1.1, 3.7, 10.6, 23.1, 64.8, 262.1, 955.8],
    "scale": 10
};

// Drug poisoning deaths per 100,000, 2013. Data from CDC's "Health, United
// States, 2014", table 30. http://www.cdc.gov/nchs/hus/contents2014.htm#030
var overdose_rates = {
    "breaks": [0, 15, 25, 35, 45, 55, 65, 75, 85],
    "male": [0.2, 11.7, 28.6, 28.1, 31.5, 22.7, 6.9, 3.7, 5.9],
    "female": [0.2, 4.8, 13.0, 18.0, 23.6, 15.9, 5.9, 3.4, 3.5],
    "scale": 10
};

// Homicides per 100,000, 2013. Data from CDC's "Health, United States, 2014",
// table 32. http://www.cdc.gov/nchs/hus/contents2014.htm#032
var homicide_rates = {
    "breaks": [0, 1, 5, 15, 20, 25, 35, 45, 55, 65, 75, 85],
    "male": [8.7, 2.3, 0.8, 11.4, 21.6, 16.4, 10.1, 6.9, 4.3, 2.9, 2.5, 2.9],
    "female": [6.9, 1.9, 0.5, 2.3, 3.4, 3.3, 2.9, 2.3, 1.7, 1.4, 1.8, 2.0],
    "scale": 10
};

// Suicides per 100,000, 2013. Data from CDC's "Health, United States, 2014",
// table 33. http://www.cdc.gov/nchs/hus/contents2014.htm#033
var suicide_rates = {
    "breaks": [0, 5, 15, 20, 25, 35, 45, 55, 65, 75, 85],
    "male": [0, 1.2, 12.4, 21.9, 23.4, 24.8, 29.6, 28.3, 26.0, 34.7, 48.5],
    "female": [0, 0.7, 3.9, 5.2, 6.1, 7.6, 10.0, 8.7, 5.4, 3.9, 3.3],
    "scale": 10
};

// Rape rates per 1,000, 2014. Data from NCVS; see R/ subfolder.
var stranger_rape_rates = {
    "breaks": [0, 12, 15, 18, 21, 25, 35, 50, 65],
    "male": ["?", "?", "?", "?", 0.07, 0.24, 0.12],
    "female": ["?", 0.74, "?", 3.04, 0.62, 0.26, 0.04, 0.1],
    "scale": 1000
};
// Includes partners, relatives, acquaintances
var acquaintance_rape_rates = {
    "breaks": [0, 12, 15, 18, 21, 25, 35, 50, 65],
    "male": [0.61, "?", "?", 0.58, "?", "?", "?", "?"],
    "female": ["?", 0.75, 2.4, 3.76, 3.47, 1.64, 0.39, "?"],
    "scale": 1000
};

function death_rate(death_rates, age, gender) {
    var rates = (gender == 0) ? death_rates.male : death_rates.female;
    
    for (var i = 0; i < rates.length - 1; i++) {
        if (death_rates.breaks[i + 1] > age) {
            if (rates[i] == "?") return -1;
            return rates[i] * death_rates.scale;
        }
    }

    if (rates[rates.length - 1] == "?") return -1;
    return rates[rates.length - 1] * death_rates.scale;
}

window.addEvent('domready', function () {
    var model = {
        initialize: function () {
            this.gender = 0;
            this.age = 40;

            // Average miles driven per year is 13,476, or about 250 per week.
            // https://www.fhwa.dot.gov/ohim/onh00/bar8.htm
            this.carMiles = 250;
            this.motorcycleMiles = 0;
            this.pedestrianMiles = 5;
            this.busMiles = 0;
            this.subwayMiles = 0;

            this.children = 0;
            this.flights = 0;
        },
        update: function () {
            this.carMorts = miles_to_morts(travel_rates.car,
                                           this.carMiles);
            this.motorcycleMorts = miles_to_morts(travel_rates.motorcycle,
                                                  this.motorcycleMiles);
            this.busMorts = miles_to_morts(travel_rates.bus,
                                           this.busMiles);
            this.subwayMorts = miles_to_morts(travel_rates.subway,
                                              this.subwayMiles);
            this.pedestrianMorts = miles_to_morts(travel_rates.pedestrian,
                                                  this.pedestrianMiles);

            this.mortalityMorts = death_rate(mortality_rates, this.age, this.gender);
            this.fireMorts = death_rate(fire_rates, this.age, this.gender);
            this.homicideMorts = death_rate(homicide_rates, this.age, this.gender);
            this.heartMorts = death_rate(heart_rates, this.age, this.gender);
            this.suicideMorts = death_rate(suicide_rates, this.age, this.gender);
            this.cancerMorts = death_rate(cancer_rates, this.age, this.gender);
            this.overdoseMorts = death_rate(overdose_rates, this.age, this.gender);
            this.strokeMorts = death_rate(stroke_rates, this.age, this.gender);

            this.strangerRapeMorts = death_rate(stranger_rape_rates, this.age, this.gender);
            this.acqRapeMorts = death_rate(acquaintance_rape_rates, this.age, this.gender);

            // 80 deaths between 2004 and 2013, population roughly 315m,
            // over 10 years.
            this.terrorMorts = 80 / 315000000 / 10;
        }
    };

    var tangle = new Tangle(document.getElementById("worrywart"), model);
});
